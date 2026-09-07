-- Auratio Step VI-F — terminal video deletion worker, retry semantics, and operational audit.

alter table public.video_deletion_jobs
  add column claim_token uuid,
  add column claimed_at timestamptz;

alter table public.video_deletion_jobs
  add constraint video_deletion_job_claim_shape
  check (
    (claim_token is null and claimed_at is null)
    or
    (claim_token is not null and claimed_at is not null and status in ('pending','retry'))
  );

create unique index video_deletion_jobs_claim_token_uidx
  on public.video_deletion_jobs(claim_token)
  where claim_token is not null;

create or replace function public.queue_terminal_video_deletion()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status in ('approved','rejected','cancelled')
     and old.status not in ('approved','rejected','cancelled') then
    update public.submission_videos
    set lifecycle_status='deletion_pending', updated_at=now()
    where submission_id=new.submission_id and lifecycle_status<>'deleted';

    insert into public.video_deletion_jobs(
      submission_id,status,next_attempt_at,last_error,completed_at,claim_token,claimed_at,updated_at
    )
    values(new.submission_id,'pending',now(),null,null,null,null,now())
    on conflict(submission_id) do update
      set status='pending',
          next_attempt_at=now(),
          last_error=null,
          completed_at=null,
          claim_token=null,
          claimed_at=null,
          updated_at=now();
  end if;
  return new;
end;
$$;

revoke execute on function public.queue_terminal_video_deletion() from public, anon, authenticated;

create or replace function public.svc_claim_video_deletion_jobs(
  p_limit integer default 10
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, storage
as $$
declare
  v_limit integer := least(greatest(coalesce(p_limit,10),1),25);
  v_rows jsonb;
begin
  with candidates as (
    select j.submission_id
    from public.video_deletion_jobs j
    join public.submission_videos sv on sv.submission_id=j.submission_id
    where j.status in ('pending','retry')
      and j.next_attempt_at<=now()
      and (j.claim_token is null or j.claimed_at<=now()-interval '10 minutes')
      and sv.lifecycle_status<>'deleted'
      and exists(
        select 1
        from public.evaluation_requests er
        where er.submission_id=j.submission_id
          and er.status in ('approved','rejected','cancelled')
      )
    order by j.next_attempt_at,j.created_at,j.submission_id
    for update of j skip locked
    limit v_limit
  ), claimed as (
    update public.video_deletion_jobs j
    set claim_token=gen_random_uuid(),
        claimed_at=now(),
        last_attempt_at=now(),
        attempt_count=j.attempt_count+1,
        updated_at=now()
    from candidates c
    where j.submission_id=c.submission_id
    returning j.*
  ), pending_video as (
    update public.submission_videos sv
    set lifecycle_status='deletion_pending',updated_at=now()
    from claimed c
    where sv.submission_id=c.submission_id
      and sv.lifecycle_status<>'deleted'
    returning sv.submission_id
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'submission_id',c.submission_id,
        'claim_token',c.claim_token,
        'attempt_count',c.attempt_count,
        'bucket_name',sv.bucket_name,
        'object_path',sv.object_path
      )
      order by c.next_attempt_at,c.created_at,c.submission_id
    ),
    '[]'::jsonb
  )
  into v_rows
  from claimed c
  join public.submission_videos sv on sv.submission_id=c.submission_id;

  return v_rows;
end;
$$;

revoke execute on function public.svc_claim_video_deletion_jobs(integer) from public, anon, authenticated;
grant execute on function public.svc_claim_video_deletion_jobs(integer) to service_role;

create or replace function public.svc_complete_video_deletion(
  p_claim_token uuid,
  p_already_missing boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, storage
as $$
declare
  v_job public.video_deletion_jobs%rowtype;
  v_video public.submission_videos%rowtype;
  v_request_id uuid;
begin
  select * into v_job
  from public.video_deletion_jobs
  where claim_token=p_claim_token
  for update;

  if v_job.submission_id is null then
    raise exception 'Active video-deletion claim not found';
  end if;

  select * into v_video
  from public.submission_videos
  where submission_id=v_job.submission_id
  for update;

  if v_video.submission_id is null then
    raise exception 'Submission video metadata not found';
  end if;

  if exists(
    select 1 from storage.objects o
    where o.bucket_id=v_video.bucket_name
      and o.name=v_video.object_path
      and coalesce(o.is_delete_marker,false)=false
  ) then
    raise exception 'Video Storage object still exists';
  end if;

  select er.id into v_request_id
  from public.evaluation_requests er
  where er.submission_id=v_job.submission_id
    and er.status in ('approved','rejected','cancelled')
  order by er.terminal_at desc nulls last,er.created_at desc
  limit 1;

  if v_request_id is null then
    raise exception 'Terminal evaluation request not found';
  end if;

  update public.submission_videos
  set lifecycle_status='deleted',
      deleted_at=coalesce(deleted_at,now()),
      updated_at=now()
  where submission_id=v_job.submission_id;

  update public.video_deletion_jobs
  set status='succeeded',
      completed_at=coalesce(completed_at,now()),
      next_attempt_at=now(),
      last_error=null,
      claim_token=null,
      claimed_at=null,
      updated_at=now()
  where submission_id=v_job.submission_id;

  insert into public.audit_log(actor_user_id,action,entity_type,entity_id,request_id,metadata)
  values(
    null,
    'video.deleted',
    'submission_video',
    v_job.submission_id::text,
    v_request_id,
    jsonb_build_object(
      'attempt_count',v_job.attempt_count,
      'bucket_name',v_video.bucket_name,
      'object_path',v_video.object_path,
      'already_missing',coalesce(p_already_missing,false)
    )
  );

  return jsonb_build_object(
    'submission_id',v_job.submission_id,
    'status','succeeded',
    'attempt_count',v_job.attempt_count,
    'deleted_at',(select deleted_at from public.submission_videos where submission_id=v_job.submission_id)
  );
end;
$$;

revoke execute on function public.svc_complete_video_deletion(uuid,boolean) from public, anon, authenticated;
grant execute on function public.svc_complete_video_deletion(uuid,boolean) to service_role;

create or replace function public.svc_fail_video_deletion(
  p_claim_token uuid,
  p_error text
)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_job public.video_deletion_jobs%rowtype;
  v_request_id uuid;
  v_error text := left(btrim(coalesce(p_error,'')),1000);
  v_delay interval;
  v_next timestamptz;
begin
  select * into v_job
  from public.video_deletion_jobs
  where claim_token=p_claim_token
  for update;

  if v_job.submission_id is null then
    raise exception 'Active video-deletion claim not found';
  end if;

  v_delay := case
    when v_job.attempt_count<=1 then interval '5 minutes'
    when v_job.attempt_count=2 then interval '15 minutes'
    when v_job.attempt_count=3 then interval '1 hour'
    when v_job.attempt_count=4 then interval '6 hours'
    else interval '24 hours'
  end;
  v_next := now()+v_delay;

  select er.id into v_request_id
  from public.evaluation_requests er
  where er.submission_id=v_job.submission_id
    and er.status in ('approved','rejected','cancelled')
  order by er.terminal_at desc nulls last,er.created_at desc
  limit 1;

  update public.submission_videos
  set lifecycle_status='deletion_failed',updated_at=now()
  where submission_id=v_job.submission_id
    and lifecycle_status<>'deleted';

  update public.video_deletion_jobs
  set status='retry',
      next_attempt_at=v_next,
      last_error=coalesce(nullif(v_error,''),'video_deletion_failed'),
      completed_at=null,
      claim_token=null,
      claimed_at=null,
      updated_at=now()
  where submission_id=v_job.submission_id;

  insert into public.audit_log(actor_user_id,action,entity_type,entity_id,request_id,metadata)
  values(
    null,
    'video.deletion_failed',
    'submission_video',
    v_job.submission_id::text,
    v_request_id,
    jsonb_build_object(
      'attempt_count',v_job.attempt_count,
      'error',coalesce(nullif(v_error,''),'video_deletion_failed'),
      'next_attempt_at',v_next
    )
  );

  return jsonb_build_object(
    'submission_id',v_job.submission_id,
    'status','retry',
    'attempt_count',v_job.attempt_count,
    'next_attempt_at',v_next
  );
end;
$$;

revoke execute on function public.svc_fail_video_deletion(uuid,text) from public, anon, authenticated;
grant execute on function public.svc_fail_video_deletion(uuid,text) to service_role;