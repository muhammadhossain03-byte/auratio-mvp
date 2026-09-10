-- Auratio Step VII-D5 — autonomous terminal-video cleanup.
--
-- Terminal evaluation transitions already create durable deletion jobs.
-- This migration adds a portable one-minute pg_cron scheduler. The scheduler
-- invokes the video-cleanup Edge Function only when deletion work is due.
--
-- A random cron token is generated inside PostgreSQL and is never committed.
-- The Edge base URL is environment-specific and is configured separately by
-- the service-role-only runtime configuration RPC.

create extension if not exists pg_cron
  with schema extensions;

create extension if not exists pg_net
  with schema extensions;

create table if not exists private.video_cleanup_runtime_config (
  singleton boolean primary key default true
    check (singleton),
  edge_base_url text,
  cron_token uuid not null default gen_random_uuid(),
  updated_at timestamptz not null default now(),
  constraint video_cleanup_runtime_base_url_check
    check (
      edge_base_url is null
      or edge_base_url ~ '^https://[a-z0-9-]+[.]supabase[.]co$'
    )
);

insert into private.video_cleanup_runtime_config(singleton)
values (true)
on conflict (singleton) do nothing;

revoke all on private.video_cleanup_runtime_config
  from public, anon, authenticated;

create or replace function public.svc_configure_video_cleanup_runtime(
  p_edge_base_url text
)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_url text :=
    regexp_replace(
      btrim(coalesce(p_edge_base_url, '')),
      '/+$',
      ''
    );
begin
  if v_url = ''
     or v_url !~ '^https://[a-z0-9-]+[.]supabase[.]co$'
  then
    raise exception
      'Valid Supabase HTTPS project URL required';
  end if;

  update private.video_cleanup_runtime_config
  set edge_base_url = v_url,
      updated_at = now()
  where singleton = true;

  return jsonb_build_object(
    'ok', true,
    'edge_base_url', v_url
  );
end;
$$;

revoke execute on function
  public.svc_configure_video_cleanup_runtime(text)
  from public, anon, authenticated;

grant execute on function
  public.svc_configure_video_cleanup_runtime(text)
  to service_role;

create or replace function public.svc_video_cleanup_cron_token_valid(
  p_token text
)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select exists (
    select 1
    from private.video_cleanup_runtime_config c
    where c.singleton = true
      and c.cron_token::text =
        btrim(coalesce(p_token, ''))
  )
$$;

revoke execute on function
  public.svc_video_cleanup_cron_token_valid(text)
  from public, anon, authenticated;

grant execute on function
  public.svc_video_cleanup_cron_token_valid(text)
  to service_role;

create or replace function private.video_cleanup_cron_tick()
returns void
language plpgsql
security definer
set search_path = public, private, net
as $$
declare
  v_edge_base_url text;
  v_cron_token text;
begin
  select
    c.edge_base_url,
    c.cron_token::text
  into
    v_edge_base_url,
    v_cron_token
  from private.video_cleanup_runtime_config c
  where c.singleton = true;

  if v_edge_base_url is null
     or v_cron_token is null
  then
    return;
  end if;

  if not exists (
    select 1
    from public.video_deletion_jobs j
    join public.submission_videos sv
      on sv.submission_id = j.submission_id
    where j.status in ('pending', 'retry')
      and j.next_attempt_at <= now()
      and (
        j.claim_token is null
        or j.claimed_at <=
          now() - interval '10 minutes'
      )
      and sv.lifecycle_status <> 'deleted'
      and exists (
        select 1
        from public.evaluation_requests er
        where er.submission_id = j.submission_id
          and er.status in (
            'approved',
            'rejected',
            'cancelled'
          )
      )
  ) then
    return;
  end if;

  perform net.http_post(
    url :=
      v_edge_base_url ||
      '/functions/v1/video-cleanup',
    body := jsonb_build_object(
      'limit', 25
    ),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-auratio-cron-token', v_cron_token
    ),
    timeout_milliseconds := 10000
  );
end;
$$;

revoke execute on function
  private.video_cleanup_cron_tick()
  from public, anon, authenticated, service_role;

do $$
begin
  if exists (
    select 1
    from cron.job
    where jobname = 'auratio-video-cleanup'
  ) then
    perform cron.unschedule(
      'auratio-video-cleanup'
    );
  end if;
end;
$$;

select cron.schedule(
  'auratio-video-cleanup',
  '* * * * *',
  'select private.video_cleanup_cron_tick();'
);
