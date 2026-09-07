-- Auratio Step VI-B — shared submission/request creation and audit actor context.

create or replace function private.audit_actor_user_id()
returns uuid
language plpgsql
stable
security definer
set search_path = public, auth, private
as $$
declare
  v_config text;
begin
  v_config := nullif(current_setting('auratio.actor_user_id', true), '');
  if v_config is not null then
    begin
      return v_config::uuid;
    exception when invalid_text_representation then
      null;
    end;
  end if;
  return auth.uid();
end;
$$;
revoke execute on function private.audit_actor_user_id() from public, anon, authenticated;

create or replace function public.audit_request_change()
returns trigger
language plpgsql
security definer
set search_path = public, auth, private
as $$
declare
  v_actor uuid := private.audit_actor_user_id();
begin
  if tg_op = 'INSERT' then
    insert into public.audit_log(actor_user_id, action, entity_type, entity_id, request_id, metadata)
    values(v_actor, 'evaluation_request.created', 'evaluation_request', new.id::text, new.id,
      jsonb_build_object('mode', new.mode, 'status', new.status));
  elsif new.status <> old.status then
    insert into public.audit_log(actor_user_id, action, entity_type, entity_id, request_id, metadata)
    values(v_actor, 'evaluation_request.status_changed', 'evaluation_request', new.id::text, new.id,
      jsonb_build_object('from', old.status, 'to', new.status));
  end if;
  return new;
end;
$$;
revoke execute on function public.audit_request_change() from public, anon, authenticated;

create or replace function public.audit_version_change()
returns trigger
language plpgsql
security definer
set search_path = public, auth, private
as $$
declare
  v_actor uuid := private.audit_actor_user_id();
begin
  if tg_op = 'INSERT' then
    insert into public.audit_log(actor_user_id, action, entity_type, entity_id, request_id, metadata)
    values(v_actor, 'evaluation_version.created', 'evaluation_version', new.id::text, new.request_id,
      jsonb_build_object('version', new.version_number, 'status', new.status));
  elsif new.status <> old.status then
    insert into public.audit_log(actor_user_id, action, entity_type, entity_id, request_id, metadata)
    values(v_actor, 'evaluation_version.status_changed', 'evaluation_version', new.id::text, new.request_id,
      jsonb_build_object('version', new.version_number, 'from', old.status, 'to', new.status));
  end if;
  return new;
end;
$$;
revoke execute on function public.audit_version_change() from public, anon, authenticated;

create or replace function public.audit_assignment_change()
returns trigger
language plpgsql
security definer
set search_path = public, auth, private
as $$
declare
  v_actor uuid := private.audit_actor_user_id();
begin
  insert into public.audit_log(actor_user_id, action, entity_type, entity_id, request_id, metadata)
  values(
    v_actor,
    case when tg_op = 'INSERT' then 'human_assignment.created' else 'human_assignment.updated' end,
    'human_assignment',
    new.id::text,
    new.request_id,
    jsonb_build_object('volunteer_user_id', new.volunteer_user_id, 'status', new.status)
  );
  return new;
end;
$$;
revoke execute on function public.audit_assignment_change() from public, anon, authenticated;

drop policy if exists submissions_insert_own on public.submissions;
drop policy if exists submission_videos_insert_own on public.submission_videos;

create or replace function public.svc_create_evaluation_request(
  p_actor_user_id uuid,
  p_track_id text,
  p_mode public.evaluation_mode,
  p_object_path text,
  p_duration_seconds numeric,
  p_size_bytes bigint default null,
  p_mime_type text default 'video/mp4'
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, private, storage
as $$
declare
  v_role public.app_role;
  v_submission_id uuid;
  v_request_id uuid;
  v_version_id uuid;
  v_object_path text := btrim(coalesce(p_object_path, ''));
begin
  select p.role into v_role
  from public.profiles p
  where p.user_id = p_actor_user_id and p.account_status = 'active';

  if v_role <> 'end_user'::public.app_role then
    raise exception 'Active End User account required';
  end if;
  if not exists(select 1 from public.tracks t where t.id = p_track_id) then
    raise exception 'Unknown track';
  end if;
  if p_mime_type <> 'video/mp4' or lower(v_object_path) not like '%.mp4' then
    raise exception 'Only MP4 video is accepted';
  end if;
  if split_part(v_object_path, '/', 1) <> p_actor_user_id::text then
    raise exception 'Video object path must belong to the authenticated user';
  end if;
  if p_duration_seconds is null or p_duration_seconds <= 0 then
    raise exception 'Positive video duration is required';
  end if;
  if p_size_bytes is not null and p_size_bytes <= 0 then
    raise exception 'Video size must be positive when supplied';
  end if;
  if not exists(
    select 1 from storage.objects o
    where o.bucket_id = 'evaluation-videos' and o.name = v_object_path
  ) then
    raise exception 'Uploaded video object not found';
  end if;
  if exists(
    select 1 from public.evaluation_requests er
    where er.user_id = p_actor_user_id
      and er.status not in ('approved', 'rejected', 'cancelled')
  ) then
    raise exception 'User already has an active evaluation request';
  end if;

  perform set_config('auratio.actor_user_id', p_actor_user_id::text, true);

  insert into public.submissions(user_id, track_id)
  values(p_actor_user_id, p_track_id)
  returning id into v_submission_id;

  insert into public.submission_videos(
    submission_id, bucket_name, object_path, mime_type, duration_seconds, size_bytes
  )
  values(
    v_submission_id, 'evaluation-videos', v_object_path, p_mime_type, p_duration_seconds, p_size_bytes
  );

  insert into public.evaluation_requests(submission_id, user_id, mode, status)
  values(
    v_submission_id,
    p_actor_user_id,
    p_mode,
    case
      when p_mode = 'ai'::public.evaluation_mode then 'processing'::public.evaluation_request_status
      else 'unassigned'::public.evaluation_request_status
    end
  )
  returning id into v_request_id;

  insert into public.evaluation_versions(request_id, version_number, status)
  values(v_request_id, 1, 'draft')
  returning id into v_version_id;

  insert into public.audit_log(actor_user_id, action, entity_type, entity_id, request_id, metadata)
  values(
    p_actor_user_id,
    'submission.registered',
    'submission',
    v_submission_id::text,
    v_request_id,
    jsonb_build_object(
      'track_id', p_track_id,
      'mode', p_mode::text,
      'object_path', v_object_path,
      'duration_seconds', p_duration_seconds
    )
  );

  return jsonb_build_object(
    'ok', true,
    'submission_id', v_submission_id,
    'request_id', v_request_id,
    'evaluation_version_id', v_version_id,
    'status', case when p_mode='ai'::public.evaluation_mode then 'processing' else 'unassigned' end
  );
end;
$$;
revoke execute on function public.svc_create_evaluation_request(
  uuid, text, public.evaluation_mode, text, numeric, bigint, text
) from public, anon, authenticated;
grant execute on function public.svc_create_evaluation_request(
  uuid, text, public.evaluation_mode, text, numeric, bigint, text
) to service_role;
