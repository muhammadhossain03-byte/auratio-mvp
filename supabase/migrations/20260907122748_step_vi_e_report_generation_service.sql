-- Auratio Step VI-E — deterministic Approved-only DOCX report generation service boundary.

create type private.report_generation_status as enum ('queued', 'generating', 'failed', 'ready');

create table private.report_generation_claims (
  evaluation_version_id uuid primary key references public.evaluation_versions(id) on delete cascade,
  request_id uuid not null unique references public.evaluation_requests(id) on delete cascade,
  status private.report_generation_status not null default 'queued',
  queued_at timestamptz not null default now(),
  generated_at timestamptz,
  claimed_at timestamptz,
  completed_at timestamptz,
  claim_token uuid,
  last_error text,
  updated_at timestamptz not null default now()
);

revoke all on table private.report_generation_claims from public, anon, authenticated;
grant select, insert, update, delete on table private.report_generation_claims to service_role;

create or replace function private.report_filename(
  p_track_id text,
  p_mode public.evaluation_mode,
  p_submission_id uuid,
  p_version integer
)
returns text
language sql
immutable
set search_path = public, private
as $$
select format(
  'Auratio_%s_%s_Submission-%s_v%s.docx',
  p_track_id,
  case when p_mode='ai' then 'AI' else 'Human' end,
  p_submission_id::text,
  p_version
)
$$;
revoke execute on function private.report_filename(text,public.evaluation_mode,uuid,integer) from public, anon, authenticated;

create or replace function private.report_object_path(
  p_user_id uuid,
  p_request_id uuid,
  p_filename text
)
returns text
language sql
immutable
set search_path = public, private
as $$
select p_user_id::text || '/' || p_request_id::text || '/' || p_filename
$$;
revoke execute on function private.report_object_path(uuid,uuid,text) from public, anon, authenticated;

create or replace function public.queue_approved_report_generation()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_version_id uuid;
begin
  if new.status='approved' and (tg_op='INSERT' or old.status is distinct from new.status) then
    select ev.id into v_version_id
    from public.evaluation_versions ev
    where ev.request_id=new.id and ev.status='approved'
    order by ev.version_number desc
    limit 1;

    if v_version_id is null then
      raise exception 'Approved request requires an Approved evaluator version before report queueing';
    end if;

    insert into private.report_generation_claims(evaluation_version_id,request_id,status)
    values(v_version_id,new.id,'queued')
    on conflict(evaluation_version_id) do nothing;
  end if;
  return new;
end;
$$;
revoke execute on function public.queue_approved_report_generation() from public, anon, authenticated;

create trigger trg_queue_approved_report_generation
  after insert or update of status on public.evaluation_requests
  for each row execute function public.queue_approved_report_generation();

insert into private.report_generation_claims(evaluation_version_id,request_id,status)
select ev.id,er.id,'queued'::private.report_generation_status
from public.evaluation_requests er
join public.evaluation_versions ev on ev.request_id=er.id and ev.status='approved'
left join public.reports r on r.evaluation_version_id=ev.id
where er.status='approved' and r.id is null
on conflict(evaluation_version_id) do nothing;

create or replace function public.svc_prepare_report_generation(
  p_actor_user_id uuid,
  p_request_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, private, storage
as $$
declare
  v_request public.evaluation_requests%rowtype;
  v_version public.evaluation_versions%rowtype;
  v_submission public.submissions%rowtype;
  v_profile public.profiles%rowtype;
  v_track public.tracks%rowtype;
  v_video public.submission_videos%rowtype;
  v_claim private.report_generation_claims%rowtype;
  v_existing public.reports%rowtype;
  v_actor_role public.app_role;
  v_filename text;
  v_object_path text;
  v_criteria jsonb;
  v_criterion_count integer;
  v_token uuid;
  v_state text;
  v_existing_object boolean;
begin
  select * into v_request from public.evaluation_requests where id=p_request_id;
  if v_request.id is null or v_request.status<>'approved' then
    raise exception 'Official report requires an Approved evaluation request';
  end if;

  if p_actor_user_id is not null then
    select p.role into v_actor_role
    from public.profiles p
    where p.user_id=p_actor_user_id and p.account_status='active';
    if v_actor_role is null then raise exception 'Active account required'; end if;
    if p_actor_user_id<>v_request.user_id and v_actor_role not in ('admin','super_admin') then
      raise exception 'Not authorized for this report';
    end if;
  end if;

  select * into v_version
  from public.evaluation_versions
  where request_id=p_request_id and status='approved'
  order by version_number desc
  limit 1;
  if v_version.id is null then raise exception 'Approved evaluator version not found'; end if;

  select * into v_existing from public.reports where evaluation_version_id=v_version.id;
  if v_existing.id is not null then
    return jsonb_build_object(
      'state','ready',
      'report',jsonb_build_object(
        'id',v_existing.id,
        'request_id',v_existing.request_id,
        'evaluation_version_id',v_existing.evaluation_version_id,
        'bucket_name',v_existing.bucket_name,
        'object_path',v_existing.object_path,
        'filename',v_existing.filename,
        'size_bytes',v_existing.size_bytes,
        'generated_at',v_existing.generated_at
      )
    );
  end if;

  select * into v_submission from public.submissions where id=v_request.submission_id;
  select * into v_profile from public.profiles where user_id=v_request.user_id;
  select * into v_track from public.tracks where id=v_submission.track_id;
  select * into v_video from public.submission_videos where submission_id=v_submission.id;

  if v_profile.user_id is null or v_track.id is null or v_video.submission_id is null then
    raise exception 'Required report metadata is incomplete';
  end if;
  if nullif(btrim(v_profile.display_name),'') is null then raise exception 'Display name is required for report'; end if;
  if v_version.universal_score is null or v_version.structural_score is null or v_version.track_score is null or v_version.final_score is null then
    raise exception 'Approved report requires complete score totals';
  end if;
  if nullif(btrim(v_version.overall_summary),'') is null then raise exception 'Approved report requires Overall Summary'; end if;

  select count(*)::integer,
         jsonb_agg(
           jsonb_build_object(
             'criterion_id',cr.criterion_id,
             'criterion_name',c.name,
             'category',c.category::text,
             'position',c.position,
             'anchor',cr.anchor::text,
             'score',cr.score,
             'max_points',c.max_points,
             'primary_timestamp_seconds',cr.primary_timestamp_seconds,
             'evidence',cr.evidence,
             'strength',cr.strength,
             'weakness',cr.weakness,
             'actionable_improvement',cr.actionable_improvement
           )
           order by
             case c.category
               when 'universal_delivery'::public.criterion_category then 1
               when 'structural_flow'::public.criterion_category then 2
               else 3
             end,
             c.position,
             c.id
         )
  into v_criterion_count,v_criteria
  from public.evaluation_criterion_results cr
  join public.criteria c on c.id=cr.criterion_id
  where cr.evaluation_version_id=v_version.id;

  if v_criterion_count<>16 then raise exception 'Official report requires exactly 16 criterion results'; end if;
  if exists(
    select 1
    from public.evaluation_criterion_results cr
    join public.criteria c on c.id=cr.criterion_id
    where cr.evaluation_version_id=v_version.id
      and (
        nullif(btrim(cr.evidence),'') is null or
        nullif(btrim(cr.strength),'') is null or
        nullif(btrim(cr.weakness),'') is null or
        nullif(btrim(cr.actionable_improvement),'') is null or
        cr.primary_timestamp_seconds<0 or
        cr.primary_timestamp_seconds>v_video.duration_seconds or
        (c.category='track_specialisation' and c.track_id<>v_track.id) or
        (c.category<>'track_specialisation' and c.track_id is not null)
      )
  ) then raise exception 'Criterion result is invalid for official report'; end if;

  insert into private.report_generation_claims(evaluation_version_id,request_id,status)
  values(v_version.id,p_request_id,'queued')
  on conflict(evaluation_version_id) do nothing;

  select * into v_claim
  from private.report_generation_claims
  where evaluation_version_id=v_version.id
  for update;

  if v_claim.status='generating' and v_claim.claimed_at>now()-interval '5 minutes' then
    return jsonb_build_object('state','in_progress');
  end if;

  v_filename := private.report_filename(v_track.id,v_request.mode,v_submission.id,v_version.version_number);
  v_object_path := private.report_object_path(v_request.user_id,p_request_id,v_filename);
  v_token := gen_random_uuid();

  update private.report_generation_claims
  set status='generating',
      claim_token=v_token,
      claimed_at=now(),
      generated_at=coalesce(generated_at,now()),
      last_error=null,
      updated_at=now()
  where evaluation_version_id=v_version.id
  returning * into v_claim;

  select exists(
    select 1 from storage.objects o
    where o.bucket_id='evaluation-reports' and o.name=v_object_path and coalesce(o.is_delete_marker,false)=false
  ) into v_existing_object;

  v_state := case when v_existing_object then 'register_existing' else 'generate' end;

  return jsonb_build_object(
    'state',v_state,
    'claim_token',v_token,
    'bucket_name','evaluation-reports',
    'object_path',v_object_path,
    'filename',v_filename,
    'payload',jsonb_build_object(
      'brand_name','Auratio',
      'brand_tagline','Where Greats Orate',
      'document_title','Evaluation Report',
      'speaker_display_name',v_profile.display_name,
      'track_id',v_track.id,
      'track_name',v_track.name,
      'mode',v_request.mode::text,
      'mode_label',case when v_request.mode='ai' then 'AI Evaluation' else 'Human Evaluation' end,
      'submission_id',v_submission.id,
      'submission_date',v_submission.submitted_at,
      'report_generation_date',v_claim.generated_at,
      'duration_seconds',v_video.duration_seconds,
      'universal_score',v_version.universal_score,
      'structural_score',v_version.structural_score,
      'track_score',v_version.track_score,
      'final_score',v_version.final_score,
      'overall_summary',v_version.overall_summary,
      'criteria',v_criteria
    )
  );
end;
$$;
revoke execute on function public.svc_prepare_report_generation(uuid,uuid) from public, anon, authenticated;
grant execute on function public.svc_prepare_report_generation(uuid,uuid) to service_role;

create or replace function public.svc_complete_report_generation(
  p_claim_token uuid,
  p_size_bytes bigint
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, private, storage
as $$
declare
  v_claim private.report_generation_claims%rowtype;
  v_request public.evaluation_requests%rowtype;
  v_version public.evaluation_versions%rowtype;
  v_submission public.submissions%rowtype;
  v_filename text;
  v_object_path text;
  v_report public.reports%rowtype;
  v_size_bytes bigint;
begin
  select * into v_claim
  from private.report_generation_claims
  where claim_token=p_claim_token and status='generating'
  for update;
  if v_claim.evaluation_version_id is null then raise exception 'Active report-generation claim not found'; end if;

  select * into v_request from public.evaluation_requests where id=v_claim.request_id;
  select * into v_version from public.evaluation_versions where id=v_claim.evaluation_version_id;
  select * into v_submission from public.submissions where id=v_request.submission_id;
  if v_request.status<>'approved' or v_version.status<>'approved' then
    raise exception 'Report completion requires Approved request/version';
  end if;

  v_filename := private.report_filename(v_submission.track_id,v_request.mode,v_submission.id,v_version.version_number);
  v_object_path := private.report_object_path(v_request.user_id,v_request.id,v_filename);

  select coalesce(p_size_bytes, nullif(o.metadata->>'size','')::bigint) into v_size_bytes
  from storage.objects o
  where o.bucket_id='evaluation-reports' and o.name=v_object_path and coalesce(o.is_delete_marker,false)=false
  limit 1;
  if v_size_bytes is null or v_size_bytes<=0 then raise exception 'Uploaded DOCX Storage object not found or has invalid size'; end if;

  insert into public.reports(
    request_id,evaluation_version_id,bucket_name,object_path,filename,size_bytes,generated_at
  )
  values(
    v_request.id,v_version.id,'evaluation-reports',v_object_path,v_filename,v_size_bytes,v_claim.generated_at
  )
  on conflict(evaluation_version_id) do nothing;

  select * into v_report from public.reports where evaluation_version_id=v_version.id;
  if v_report.id is null then raise exception 'Report metadata registration failed'; end if;

  update private.report_generation_claims
  set status='ready',claim_token=null,completed_at=coalesce(completed_at,now()),last_error=null,updated_at=now()
  where evaluation_version_id=v_version.id;

  insert into public.audit_log(actor_user_id,action,entity_type,entity_id,request_id,metadata)
  values(
    null,'report.generated','report',v_report.id::text,v_request.id,
    jsonb_build_object('evaluation_version_id',v_version.id,'filename',v_report.filename,'size_bytes',v_report.size_bytes)
  );

  return jsonb_build_object(
    'state','ready',
    'report',jsonb_build_object(
      'id',v_report.id,
      'request_id',v_report.request_id,
      'evaluation_version_id',v_report.evaluation_version_id,
      'bucket_name',v_report.bucket_name,
      'object_path',v_report.object_path,
      'filename',v_report.filename,
      'size_bytes',v_report.size_bytes,
      'generated_at',v_report.generated_at
    )
  );
end;
$$;
revoke execute on function public.svc_complete_report_generation(uuid,bigint) from public, anon, authenticated;
grant execute on function public.svc_complete_report_generation(uuid,bigint) to service_role;

create or replace function public.svc_fail_report_generation(
  p_claim_token uuid,
  p_error text
)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_claim private.report_generation_claims%rowtype;
  v_error text := left(btrim(coalesce(p_error,'')),1000);
begin
  select * into v_claim
  from private.report_generation_claims
  where claim_token=p_claim_token and status='generating'
  for update;
  if v_claim.evaluation_version_id is null then return; end if;

  update private.report_generation_claims
  set status='failed',claim_token=null,last_error=coalesce(nullif(v_error,''),'report_generation_failed'),updated_at=now()
  where evaluation_version_id=v_claim.evaluation_version_id;

  insert into public.audit_log(actor_user_id,action,entity_type,entity_id,request_id,metadata)
  values(
    null,'report.generation_failed','evaluation_version',v_claim.evaluation_version_id::text,v_claim.request_id,
    jsonb_build_object('error',coalesce(nullif(v_error,''),'report_generation_failed'))
  );
end;
$$;
revoke execute on function public.svc_fail_report_generation(uuid,text) from public, anon, authenticated;
grant execute on function public.svc_fail_report_generation(uuid,text) to service_role;