-- Auratio Step VI-C — AI lifecycle primitives and structured finalisation boundary.

create type private.ai_attempt_status as enum (
  'created',
  'in_flight',
  'succeeded',
  'failed',
  'cancelled',
  'discarded_cancelled'
);

create type private.ai_validation_outcome as enum (
  'pending',
  'valid_usable',
  'valid_unusable',
  'invalid',
  'api_failure',
  'cancelled',
  'late_result_discarded'
);

create table private.ai_evaluation_attempts (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.evaluation_requests(id) on delete restrict,
  evaluation_version_id uuid not null unique references public.evaluation_versions(id) on delete restrict,
  attempt_number smallint not null default 1,
  status private.ai_attempt_status not null default 'created',
  prompt_version text not null default '1.0',
  rubric_version text not null default '1.0',
  output_schema_version text not null default '1.0',
  model_identifier text,
  started_at timestamptz,
  finished_at timestamptz,
  validation_outcome private.ai_validation_outcome not null default 'pending',
  failure_code text,
  failure_reason text,
  output_digest_sha256 text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_attempt_number_one check (attempt_number = 1),
  constraint ai_attempt_versions_nonempty check (
    length(btrim(prompt_version)) > 0
    and length(btrim(rubric_version)) > 0
    and length(btrim(output_schema_version)) > 0
  ),
  constraint ai_attempt_model_nonempty check (model_identifier is null or length(btrim(model_identifier)) > 0),
  constraint ai_attempt_failure_nonempty check (
    failure_code is null or length(btrim(failure_code)) > 0
  ),
  constraint ai_attempt_failure_reason_nonempty check (
    failure_reason is null or length(btrim(failure_reason)) > 0
  ),
  constraint ai_attempt_digest_shape check (
    output_digest_sha256 is null or output_digest_sha256 ~ '^[0-9a-f]{64}$'
  ),
  constraint ai_attempt_state_shape check (
    (status = 'created' and started_at is null and finished_at is null and validation_outcome = 'pending'
      and model_identifier is null and failure_code is null and failure_reason is null)
    or
    (status = 'in_flight' and started_at is not null and finished_at is null and validation_outcome = 'pending'
      and model_identifier is not null and failure_code is null and failure_reason is null)
    or
    (status = 'succeeded' and started_at is not null and finished_at is not null and validation_outcome = 'valid_usable'
      and model_identifier is not null and failure_code is null and failure_reason is null)
    or
    (status = 'failed' and started_at is not null and finished_at is not null
      and validation_outcome in ('valid_unusable','invalid','api_failure')
      and model_identifier is not null and failure_code is not null and failure_reason is not null)
    or
    (status = 'cancelled' and finished_at is not null and validation_outcome = 'cancelled'
      and failure_code is null and failure_reason is null)
    or
    (status = 'discarded_cancelled' and started_at is not null and finished_at is not null
      and validation_outcome = 'late_result_discarded'
      and model_identifier is not null and failure_code is null and failure_reason is null)
  )
);

create index ai_evaluation_attempts_status_idx
  on private.ai_evaluation_attempts(status, created_at);

revoke all on private.ai_evaluation_attempts from public, anon, authenticated;
grant select, insert, update on private.ai_evaluation_attempts to service_role;

create or replace function private.ai_submission_code(p_submission_id uuid)
returns text
language sql
immutable
set search_path = public, private
as $$
select 'SUB-' || upper(p_submission_id::text)
$$;
revoke execute on function private.ai_submission_code(uuid) from public, anon, authenticated;

create or replace function private.ai_json_has_exact_keys(p_obj jsonb, p_keys text[])
returns boolean
language sql
immutable
set search_path = public, private
as $$
select jsonb_typeof(p_obj) = 'object'
   and p_obj ?& p_keys
   and not exists(
     select 1
     from jsonb_object_keys(p_obj) as k(key)
     where not (k.key = any(p_keys))
   )
$$;
revoke execute on function private.ai_json_has_exact_keys(jsonb,text[]) from public, anon, authenticated;

create or replace function private.ai_timestamp_seconds(p_timestamp text)
returns numeric
language plpgsql
immutable
set search_path = public, private
as $$
declare
  v_minutes integer;
  v_seconds integer;
begin
  if coalesce(p_timestamp,'') !~ '^[0-9]{2}:[0-5][0-9]$' then
    raise exception 'Invalid primary timestamp format';
  end if;
  v_minutes := split_part(p_timestamp, ':', 1)::integer;
  v_seconds := split_part(p_timestamp, ':', 2)::integer;
  return (v_minutes * 60 + v_seconds)::numeric;
end;
$$;
revoke execute on function private.ai_timestamp_seconds(text) from public, anon, authenticated;

create or replace function private.ai_expected_rubric(p_request_id uuid)
returns jsonb
language sql
stable
set search_path = public, private
as $$
with request_track as (
  select s.track_id
  from public.evaluation_requests er
  join public.submissions s on s.id = er.submission_id
  where er.id = p_request_id and er.mode = 'ai'
), selected as (
  select c.id, c.name, c.category, c.max_points, c.position, c.track_id,
         case c.category
           when 'universal_delivery'::public.criterion_category then 1
           when 'structural_flow'::public.criterion_category then 2
           else 3
         end as category_order
  from public.criteria c
  cross join request_track rt
  where c.category in ('universal_delivery','structural_flow')
     or (c.category = 'track_specialisation' and c.track_id = rt.track_id)
), anchor_json as (
  select s.id,
         jsonb_agg(
           jsonb_build_object(
             'anchor', a.anchor::text,
             'description', a.description,
             'min_score', a.min_score,
             'max_score', a.max_score
           )
           order by case a.anchor::text when 'Low' then 1 when 'Competent' then 2 else 3 end
         ) as anchors
  from selected s
  join public.criterion_anchors a on a.criterion_id = s.id
  group by s.id
)
select coalesce(
  jsonb_agg(
    jsonb_build_object(
      'criterion_id', s.id,
      'name', s.name,
      'category', s.category::text,
      'max_points', s.max_points,
      'anchors', aj.anchors
    )
    order by s.category_order, s.position, s.id
  ),
  '[]'::jsonb
)
from selected s
join anchor_json aj on aj.id = s.id
$$;
revoke execute on function private.ai_expected_rubric(uuid) from public, anon, authenticated;

create or replace function private.create_ai_attempt_for_version()
returns trigger
language plpgsql
security definer
set search_path = public, private, auth
as $$
declare
  v_mode public.evaluation_mode;
  v_actor uuid := private.audit_actor_user_id();
begin
  select er.mode into v_mode
  from public.evaluation_requests er
  where er.id = new.request_id;

  if v_mode = 'ai'::public.evaluation_mode then
    if new.version_number <> 1 then
      raise exception 'AI evaluation permits exactly one evaluator version';
    end if;

    insert into private.ai_evaluation_attempts(request_id, evaluation_version_id)
    values(new.request_id, new.id);

    insert into public.audit_log(actor_user_id, action, entity_type, entity_id, request_id, metadata)
    values(
      v_actor,
      'ai.attempt.created',
      'ai_evaluation_attempt',
      new.id::text,
      new.request_id,
      jsonb_build_object(
        'evaluation_version_id', new.id,
        'attempt_number', 1,
        'prompt_version', '1.0',
        'rubric_version', '1.0',
        'output_schema_version', '1.0'
      )
    );
  end if;

  return new;
end;
$$;
revoke execute on function private.create_ai_attempt_for_version() from public, anon, authenticated;

drop trigger if exists evaluation_versions_create_ai_attempt on public.evaluation_versions;
create trigger evaluation_versions_create_ai_attempt
after insert on public.evaluation_versions
for each row execute function private.create_ai_attempt_for_version();

-- Backfill any pre-existing AI version, preserving the one-attempt invariant.
insert into private.ai_evaluation_attempts(request_id, evaluation_version_id)
select ev.request_id, ev.id
from public.evaluation_versions ev
join public.evaluation_requests er on er.id = ev.request_id
where er.mode = 'ai'
  and ev.version_number = 1
  and not exists(
    select 1 from private.ai_evaluation_attempts a where a.request_id = ev.request_id
  );

create or replace function public.svc_ai_start_attempt(
  p_request_id uuid,
  p_model_identifier text
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, auth
as $$
declare
  v_req public.evaluation_requests%rowtype;
  v_attempt private.ai_evaluation_attempts%rowtype;
  v_submission public.submissions%rowtype;
  v_video public.submission_videos%rowtype;
  v_model text := btrim(coalesce(p_model_identifier,''));
  v_rubric jsonb;
  v_submission_code text;
  v_minutes integer;
  v_seconds integer;
begin
  if v_model = '' then raise exception 'AI model identifier is required'; end if;

  select * into v_req
  from public.evaluation_requests
  where id = p_request_id
  for update;
  if v_req.id is null or v_req.mode <> 'ai' then raise exception 'AI request not found'; end if;
  if v_req.status <> 'processing' then raise exception 'AI request is not Processing'; end if;

  select * into v_attempt
  from private.ai_evaluation_attempts
  where request_id = p_request_id
  for update;
  if v_attempt.id is null then raise exception 'AI attempt record missing'; end if;
  if v_attempt.status <> 'created' then
    raise exception 'AI attempt already started or finished; retry/rerun is not permitted';
  end if;

  select s.* into v_submission
  from public.submissions s
  where s.id = v_req.submission_id;

  select sv.* into v_video
  from public.submission_videos sv
  where sv.submission_id = v_req.submission_id;
  if v_video.submission_id is null then raise exception 'AI video metadata missing'; end if;
  if v_video.lifecycle_status <> 'retained' then raise exception 'AI source video is no longer retained'; end if;

  v_rubric := private.ai_expected_rubric(p_request_id);
  if jsonb_array_length(v_rubric) <> 16 then
    raise exception 'AI runtime rubric must contain exactly 16 criteria';
  end if;

  update private.ai_evaluation_attempts
  set status = 'in_flight',
      model_identifier = v_model,
      started_at = now(),
      updated_at = now()
  where id = v_attempt.id;

  update public.evaluation_versions
  set started_at = coalesce(started_at, now())
  where id = v_attempt.evaluation_version_id and status = 'draft';

  v_submission_code := private.ai_submission_code(v_submission.id);
  v_minutes := floor(v_video.duration_seconds / 60)::integer;
  v_seconds := floor(mod(v_video.duration_seconds, 60))::integer;

  insert into public.audit_log(actor_user_id, action, entity_type, entity_id, request_id, metadata)
  values(
    null,
    'ai.attempt.started',
    'ai_evaluation_attempt',
    v_attempt.id::text,
    p_request_id,
    jsonb_build_object(
      'evaluation_version_id', v_attempt.evaluation_version_id,
      'model_identifier', v_model,
      'prompt_version', v_attempt.prompt_version,
      'rubric_version', v_attempt.rubric_version,
      'output_schema_version', v_attempt.output_schema_version
    )
  );

  return jsonb_build_object(
    'request_id', p_request_id,
    'evaluation_version_id', v_attempt.evaluation_version_id,
    'attempt_id', v_attempt.id,
    'submission_id', v_submission_code,
    'track_slug', v_submission.track_id,
    'duration_seconds', v_video.duration_seconds,
    'duration_mm_ss', lpad(v_minutes::text,2,'0') || ':' || lpad(v_seconds::text,2,'0'),
    'video_bucket', v_video.bucket_name,
    'video_object_path', v_video.object_path,
    'prompt_version', v_attempt.prompt_version,
    'rubric_version', v_attempt.rubric_version,
    'schema_version', v_attempt.output_schema_version,
    'model_identifier', v_model,
    'criteria', v_rubric
  );
end;
$$;
revoke execute on function public.svc_ai_start_attempt(uuid,text) from public, anon, authenticated;
grant execute on function public.svc_ai_start_attempt(uuid,text) to service_role;

create or replace function public.svc_ai_admin_cancel(
  p_actor_user_id uuid,
  p_request_id uuid,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, auth
as $$
declare
  v_actor_role public.app_role;
  v_req public.evaluation_requests%rowtype;
  v_attempt private.ai_evaluation_attempts%rowtype;
  v_reason text := btrim(coalesce(p_reason,''));
begin
  if v_reason = '' then raise exception 'Cancellation reason is required'; end if;

  select role into v_actor_role
  from public.profiles
  where user_id = p_actor_user_id and account_status = 'active';
  if v_actor_role not in ('admin','super_admin') then raise exception 'Admin or Super Admin required'; end if;

  select * into v_req
  from public.evaluation_requests
  where id = p_request_id
  for update;
  if v_req.id is null or v_req.mode <> 'ai' then raise exception 'AI request not found'; end if;
  if v_req.status <> 'processing' then raise exception 'Only Processing AI requests may be cancelled'; end if;

  select * into v_attempt
  from private.ai_evaluation_attempts
  where request_id = p_request_id
  for update;
  if v_attempt.id is null then raise exception 'AI attempt record missing'; end if;
  if v_attempt.status not in ('created','in_flight') then raise exception 'AI attempt is already terminal'; end if;

  perform set_config('auratio.actor_user_id', p_actor_user_id::text, true);

  update private.ai_evaluation_attempts
  set status = 'cancelled',
      validation_outcome = 'cancelled',
      finished_at = now(),
      updated_at = now()
  where id = v_attempt.id;

  update public.evaluation_requests
  set status = 'cancelled'
  where id = p_request_id;

  insert into public.evaluation_admin_actions(
    request_id, evaluation_version_id, action, actor_user_id, reason
  )
  values(
    p_request_id, v_attempt.evaluation_version_id, 'cancel_request', p_actor_user_id, v_reason
  );

  insert into public.audit_log(actor_user_id, action, entity_type, entity_id, request_id, metadata)
  values(
    p_actor_user_id,
    'ai.cancelled',
    'ai_evaluation_attempt',
    v_attempt.id::text,
    p_request_id,
    jsonb_build_object('reason', v_reason, 'attempt_status_before', v_attempt.status::text)
  );

  return jsonb_build_object('ok', true, 'request_id', p_request_id, 'status', 'cancelled');
end;
$$;
revoke execute on function public.svc_ai_admin_cancel(uuid,uuid,text) from public, anon, authenticated;
grant execute on function public.svc_ai_admin_cancel(uuid,uuid,text) to service_role;

create or replace function public.svc_ai_fail_attempt(
  p_request_id uuid,
  p_failure_kind text,
  p_failure_code text,
  p_failure_reason text,
  p_output_digest_sha256 text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, auth
as $$
declare
  v_req public.evaluation_requests%rowtype;
  v_attempt private.ai_evaluation_attempts%rowtype;
  v_kind text := lower(btrim(coalesce(p_failure_kind,'')));
  v_code text := btrim(coalesce(p_failure_code,''));
  v_reason text := btrim(coalesce(p_failure_reason,''));
  v_digest text := case when p_output_digest_sha256 is null then null else lower(btrim(p_output_digest_sha256)) end;
  v_outcome private.ai_validation_outcome;
begin
  if v_kind not in ('api_failure','invalid') then raise exception 'Failure kind must be api_failure or invalid'; end if;
  if v_code = '' or v_reason = '' then raise exception 'Failure code and reason are required'; end if;
  if v_digest is not null and v_digest !~ '^[0-9a-f]{64}$' then raise exception 'Invalid output digest'; end if;

  select * into v_req from public.evaluation_requests where id=p_request_id for update;
  if v_req.id is null or v_req.mode <> 'ai' then raise exception 'AI request not found'; end if;

  select * into v_attempt from private.ai_evaluation_attempts where request_id=p_request_id for update;
  if v_attempt.id is null then raise exception 'AI attempt record missing'; end if;

  if v_req.status = 'cancelled' then
    if v_attempt.status not in ('cancelled','discarded_cancelled') then
      raise exception 'Cancelled AI request has inconsistent attempt state';
    end if;
    if v_attempt.status <> 'discarded_cancelled' then
      update private.ai_evaluation_attempts
      set status='discarded_cancelled', validation_outcome='late_result_discarded',
          finished_at=now(), output_digest_sha256=v_digest, updated_at=now()
      where id=v_attempt.id;
      insert into public.audit_log(actor_user_id,action,entity_type,entity_id,request_id,metadata)
      values(null,'ai.late_failure_discarded','ai_evaluation_attempt',v_attempt.id::text,p_request_id,
        jsonb_build_object('failure_kind',v_kind,'failure_code',v_code));
    end if;
    return jsonb_build_object('ok',true,'ignored',true,'code','cancelled_late_result','status','cancelled');
  end if;

  if v_req.status <> 'processing' then raise exception 'AI request is not Processing'; end if;
  if v_attempt.status <> 'in_flight' then raise exception 'AI attempt is not in flight'; end if;

  v_outcome := case when v_kind='api_failure' then 'api_failure'::private.ai_validation_outcome else 'invalid'::private.ai_validation_outcome end;

  update public.evaluation_versions
  set status='rejected'
  where id=v_attempt.evaluation_version_id and status='draft';

  update public.evaluation_requests
  set status='rejected'
  where id=p_request_id;

  update private.ai_evaluation_attempts
  set status='failed', validation_outcome=v_outcome,
      failure_code=v_code, failure_reason=v_reason,
      output_digest_sha256=v_digest, finished_at=now(), updated_at=now()
  where id=v_attempt.id;

  insert into public.audit_log(actor_user_id,action,entity_type,entity_id,request_id,metadata)
  values(null,'ai.attempt.failed','ai_evaluation_attempt',v_attempt.id::text,p_request_id,
    jsonb_build_object('validation_outcome',v_outcome::text,'failure_code',v_code));

  return jsonb_build_object('ok',false,'request_id',p_request_id,'status','rejected','failure_code',v_code);
end;
$$;
revoke execute on function public.svc_ai_fail_attempt(uuid,text,text,text,text) from public, anon, authenticated;
grant execute on function public.svc_ai_fail_attempt(uuid,text,text,text,text) to service_role;

create or replace function public.svc_ai_finalize_result(
  p_request_id uuid,
  p_result jsonb,
  p_output_digest_sha256 text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, auth
as $$
declare
  v_req public.evaluation_requests%rowtype;
  v_attempt private.ai_evaluation_attempts%rowtype;
  v_submission public.submissions%rowtype;
  v_video public.submission_videos%rowtype;
  v_expected_submission_code text;
  v_digest text := case when p_output_digest_sha256 is null then null else lower(btrim(p_output_digest_sha256)) end;
  v_usable boolean;
  v_item jsonb;
  v_score smallint;
  v_timestamp numeric;
  v_final_score smallint;
  v_error text;
  v_unusable_reason text;
  v_summary text;
  v_expected_count integer;
  v_actual_count integer;
begin
  if v_digest is not null and v_digest !~ '^[0-9a-f]{64}$' then raise exception 'Invalid output digest'; end if;

  select * into v_req from public.evaluation_requests where id=p_request_id for update;
  if v_req.id is null or v_req.mode <> 'ai' then raise exception 'AI request not found'; end if;

  select * into v_attempt from private.ai_evaluation_attempts where request_id=p_request_id for update;
  if v_attempt.id is null then raise exception 'AI attempt record missing'; end if;

  if v_req.status = 'cancelled' then
    if v_attempt.status not in ('cancelled','discarded_cancelled') then
      raise exception 'Cancelled AI request has inconsistent attempt state';
    end if;
    if v_attempt.status <> 'discarded_cancelled' then
      update private.ai_evaluation_attempts
      set status='discarded_cancelled', validation_outcome='late_result_discarded',
          finished_at=now(), output_digest_sha256=v_digest, updated_at=now()
      where id=v_attempt.id;
      insert into public.audit_log(actor_user_id,action,entity_type,entity_id,request_id,metadata)
      values(null,'ai.late_result_discarded','ai_evaluation_attempt',v_attempt.id::text,p_request_id,'{}'::jsonb);
    end if;
    return jsonb_build_object('ok',true,'ignored',true,'code','cancelled_late_result','status','cancelled');
  end if;

  if v_req.status <> 'processing' then raise exception 'AI request is not Processing'; end if;
  if v_attempt.status <> 'in_flight' then raise exception 'AI attempt is not in flight'; end if;

  select * into v_submission from public.submissions where id=v_req.submission_id;
  select * into v_video from public.submission_videos where submission_id=v_req.submission_id;
  v_expected_submission_code := private.ai_submission_code(v_submission.id);

  begin
    if not private.ai_json_has_exact_keys(
      p_result,
      array['schema_version','submission_id','track_slug','evaluation_usable','unusable_reason','criteria','overall_summary']
    ) then raise exception 'AI output top-level keys do not match schema v1.0'; end if;

    if jsonb_typeof(p_result->'schema_version') <> 'string' or p_result->>'schema_version' <> '1.0' then
      raise exception 'AI output schema_version mismatch';
    end if;
    if jsonb_typeof(p_result->'submission_id') <> 'string' or p_result->>'submission_id' <> v_expected_submission_code then
      raise exception 'AI output submission_id mismatch';
    end if;
    if jsonb_typeof(p_result->'track_slug') <> 'string' or p_result->>'track_slug' <> v_submission.track_id then
      raise exception 'AI output track_slug mismatch';
    end if;
    if jsonb_typeof(p_result->'evaluation_usable') <> 'boolean' then
      raise exception 'AI output evaluation_usable must be boolean';
    end if;
    if jsonb_typeof(p_result->'criteria') <> 'array' then
      raise exception 'AI output criteria must be an array';
    end if;

    v_usable := (p_result->>'evaluation_usable')::boolean;

    if not v_usable then
      if jsonb_typeof(p_result->'unusable_reason') <> 'string' then raise exception 'Unusable result requires unusable_reason'; end if;
      v_unusable_reason := btrim(p_result->>'unusable_reason');
      if v_unusable_reason = '' then raise exception 'Unusable result requires non-empty unusable_reason'; end if;
      if jsonb_array_length(p_result->'criteria') <> 0 then raise exception 'Unusable result criteria must be empty'; end if;
      if jsonb_typeof(p_result->'overall_summary') <> 'null' then raise exception 'Unusable result overall_summary must be null'; end if;

      update public.evaluation_versions
      set status='rejected'
      where id=v_attempt.evaluation_version_id and status='draft';
      update public.evaluation_requests set status='rejected' where id=p_request_id;
      update private.ai_evaluation_attempts
      set status='failed', validation_outcome='valid_unusable',
          failure_code='unassessable', failure_reason=v_unusable_reason,
          output_digest_sha256=v_digest, finished_at=now(), updated_at=now()
      where id=v_attempt.id;
      insert into public.audit_log(actor_user_id,action,entity_type,entity_id,request_id,metadata)
      values(null,'ai.result.unassessable','ai_evaluation_attempt',v_attempt.id::text,p_request_id,
        jsonb_build_object('failure_code','unassessable'));

      return jsonb_build_object('ok',false,'request_id',p_request_id,'status','rejected','failure_code','unassessable');
    end if;

    if jsonb_typeof(p_result->'unusable_reason') <> 'null' then raise exception 'Usable result unusable_reason must be null'; end if;
    if jsonb_typeof(p_result->'overall_summary') <> 'string' then raise exception 'Usable result requires Overall Summary'; end if;
    v_summary := btrim(p_result->>'overall_summary');
    if v_summary = '' then raise exception 'Usable result requires non-empty Overall Summary'; end if;
    if jsonb_array_length(p_result->'criteria') <> 16 then raise exception 'Usable result must contain exactly 16 criteria'; end if;

    select count(*) into v_expected_count
    from public.criteria c
    where c.category in ('universal_delivery','structural_flow')
       or (c.category='track_specialisation' and c.track_id=v_submission.track_id);
    if v_expected_count <> 16 then raise exception 'Canonical expected criterion set is not 16'; end if;

    select count(*) into v_actual_count
    from (
      select item->>'criterion_id' as criterion_id
      from jsonb_array_elements(p_result->'criteria') item
      group by item->>'criterion_id'
    ) q;
    if v_actual_count <> 16 then raise exception 'AI output criterion IDs must be unique'; end if;

    if exists(
      select 1
      from public.criteria c
      where (c.category in ('universal_delivery','structural_flow')
             or (c.category='track_specialisation' and c.track_id=v_submission.track_id))
        and not exists(
          select 1 from jsonb_array_elements(p_result->'criteria') item
          where item->>'criterion_id'=c.id
        )
    ) or exists(
      select 1 from jsonb_array_elements(p_result->'criteria') item
      where not exists(
        select 1 from public.criteria c
        where c.id=item->>'criterion_id'
          and (c.category in ('universal_delivery','structural_flow')
               or (c.category='track_specialisation' and c.track_id=v_submission.track_id))
      )
    ) then raise exception 'AI output criterion IDs do not match selected-track expected set'; end if;

    for v_item in select value from jsonb_array_elements(p_result->'criteria')
    loop
      if not private.ai_json_has_exact_keys(
        v_item,
        array['criterion_id','anchor','score','primary_timestamp','evidence','strength','weakness','actionable_improvement']
      ) then raise exception 'AI criterion result contains missing or unexpected fields'; end if;

      if jsonb_typeof(v_item->'criterion_id') <> 'string' or btrim(v_item->>'criterion_id')='' then raise exception 'Invalid criterion_id'; end if;
      if jsonb_typeof(v_item->'anchor') <> 'string' or v_item->>'anchor' not in ('Low','Competent','Excellent') then raise exception 'Invalid criterion anchor'; end if;
      if jsonb_typeof(v_item->'score') <> 'number' or (v_item->>'score') !~ '^-?[0-9]+$' then raise exception 'Criterion score must be an integer'; end if;
      v_score := (v_item->>'score')::smallint;
      if jsonb_typeof(v_item->'primary_timestamp') <> 'string' then raise exception 'Criterion primary_timestamp must be a string'; end if;
      v_timestamp := private.ai_timestamp_seconds(v_item->>'primary_timestamp');

      if jsonb_typeof(v_item->'evidence') <> 'string' or btrim(v_item->>'evidence')='' then raise exception 'Criterion evidence is required'; end if;
      if jsonb_typeof(v_item->'strength') <> 'string' or btrim(v_item->>'strength')='' then raise exception 'Criterion strength is required'; end if;
      if jsonb_typeof(v_item->'weakness') <> 'string' or btrim(v_item->>'weakness')='' then raise exception 'Criterion weakness is required'; end if;
      if jsonb_typeof(v_item->'actionable_improvement') <> 'string' or btrim(v_item->>'actionable_improvement')='' then raise exception 'Criterion actionable_improvement is required'; end if;

      insert into public.evaluation_criterion_results(
        evaluation_version_id, criterion_id, anchor, score, primary_timestamp_seconds,
        evidence, strength, weakness, actionable_improvement
      ) values(
        v_attempt.evaluation_version_id,
        v_item->>'criterion_id',
        (v_item->>'anchor')::public.anchor_level,
        v_score,
        v_timestamp,
        btrim(v_item->>'evidence'),
        btrim(v_item->>'strength'),
        btrim(v_item->>'weakness'),
        btrim(v_item->>'actionable_improvement')
      );
    end loop;

    update public.evaluation_versions
    set overall_summary=v_summary, status='approved'
    where id=v_attempt.evaluation_version_id and status='draft'
    returning final_score into v_final_score;
    if v_final_score is null then raise exception 'AI final score was not derived'; end if;

    update public.evaluation_requests set status='approved' where id=p_request_id;

    update private.ai_evaluation_attempts
    set status='succeeded', validation_outcome='valid_usable',
        output_digest_sha256=v_digest, finished_at=now(), updated_at=now()
    where id=v_attempt.id;

    insert into public.audit_log(actor_user_id,action,entity_type,entity_id,request_id,metadata)
    values(null,'ai.result.approved','ai_evaluation_attempt',v_attempt.id::text,p_request_id,
      jsonb_build_object('evaluation_version_id',v_attempt.evaluation_version_id,'final_score',v_final_score));

    return jsonb_build_object(
      'ok',true,'request_id',p_request_id,'evaluation_version_id',v_attempt.evaluation_version_id,
      'status','approved','final_score',v_final_score
    );

  exception when others then
    v_error := sqlerrm;

    update public.evaluation_versions
    set status='rejected'
    where id=v_attempt.evaluation_version_id and status='draft';
    update public.evaluation_requests set status='rejected' where id=p_request_id;
    update private.ai_evaluation_attempts
    set status='failed', validation_outcome='invalid',
        failure_code='invalid_output', failure_reason=v_error,
        output_digest_sha256=v_digest, finished_at=now(), updated_at=now()
    where id=v_attempt.id;
    insert into public.audit_log(actor_user_id,action,entity_type,entity_id,request_id,metadata)
    values(null,'ai.result.invalid','ai_evaluation_attempt',v_attempt.id::text,p_request_id,
      jsonb_build_object('failure_code','invalid_output'));

    return jsonb_build_object('ok',false,'request_id',p_request_id,'status','rejected','failure_code','invalid_output');
  end;
end;
$$;
revoke execute on function public.svc_ai_finalize_result(uuid,jsonb,text) from public, anon, authenticated;
grant execute on function public.svc_ai_finalize_result(uuid,jsonb,text) to service_role;
