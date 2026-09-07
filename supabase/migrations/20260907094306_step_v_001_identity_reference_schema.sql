-- Auratio Step V — Core PostgreSQL schema
-- Authoritative basis: docs/CURRENT.md and Auratio_Step_V_Implementation_Handoff_v1.0.md

create extension if not exists pgcrypto;

-- ----- Enumerations -------------------------------------------------------
create type public.app_role as enum ('end_user', 'volunteer', 'admin', 'super_admin');
create type public.account_status as enum ('active', 'disabled');
create type public.invitation_status as enum ('pending', 'accepted', 'expired', 'revoked');
create type public.criterion_category as enum ('universal_delivery', 'structural_flow', 'track_specialisation');
create type public.anchor_level as enum ('Low', 'Competent', 'Excellent');
create type public.evaluation_mode as enum ('ai', 'human');
create type public.evaluation_request_status as enum (
  'unassigned', 'assigned', 'accepted', 'in_evaluation', 'submitted',
  'pending_moderation', 'reopened', 'processing', 'approved', 'rejected', 'cancelled'
);
create type public.evaluation_version_status as enum ('draft', 'submitted', 'pending_moderation', 'reopened', 'approved', 'rejected');
create type public.assignment_status as enum ('assigned', 'accepted', 'in_evaluation', 'declined', 'returned', 'revoked', 'completed');
create type public.video_lifecycle_status as enum ('retained', 'deletion_pending', 'deletion_failed', 'deleted');
create type public.video_deletion_job_status as enum ('pending', 'retry', 'succeeded');
create type public.admin_action_type as enum (
  'assign', 'reassign', 'cancel_request', 'reject_evaluation', 'approve_evaluation', 'reopen_evaluation'
);
create type public.event_status as enum ('draft', 'published', 'cancelled');
create type public.bd_division as enum ('Barishal', 'Chattogram', 'Dhaka', 'Khulna', 'Mymensingh', 'Rajshahi', 'Rangpur', 'Sylhet');

-- ----- Identity / roles ---------------------------------------------------
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  role public.app_role not null default 'end_user',
  account_status public.account_status not null default 'active',
  is_root_super_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_nonempty check (length(btrim(display_name)) > 0),
  constraint profiles_root_shape check (
    not is_root_super_admin or (role = 'super_admin' and account_status = 'active')
  )
);
create unique index profiles_single_root_idx on public.profiles ((is_root_super_admin)) where is_root_super_admin;
create index profiles_role_status_idx on public.profiles (role, account_status);

create table public.staff_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  target_role public.app_role not null,
  status public.invitation_status not null default 'pending',
  token_hash text not null unique,
  invited_by uuid not null references public.profiles(user_id),
  accepted_by uuid references public.profiles(user_id),
  expires_at timestamptz not null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  constraint staff_invitation_email_normalized check (email = lower(btrim(email)) and position('@' in email) > 1),
  constraint staff_invitation_role check (target_role in ('volunteer', 'admin')),
  constraint staff_invitation_accept_shape check (
    (status = 'accepted' and accepted_by is not null and accepted_at is not null)
    or status <> 'accepted'
  )
);
create unique index staff_invitation_pending_unique_idx
  on public.staff_invitations (lower(email), target_role) where status = 'pending';
create index staff_invitations_status_expiry_idx on public.staff_invitations (status, expires_at);

-- ----- Canonical learning/evaluation reference model ---------------------
create table public.paths (
  id text primary key,
  name text not null unique,
  sort_order smallint not null unique,
  created_at timestamptz not null default now(),
  constraint paths_id_slug check (id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint paths_sort_positive check (sort_order > 0)
);

create table public.tracks (
  id text primary key,
  path_id text not null references public.paths(id) on update cascade,
  name text not null unique,
  min_duration_seconds integer not null,
  max_duration_seconds integer not null,
  sort_order smallint not null,
  created_at timestamptz not null default now(),
  constraint tracks_id_slug check (id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint tracks_duration_valid check (min_duration_seconds > 0 and max_duration_seconds >= min_duration_seconds),
  constraint tracks_sort_positive check (sort_order > 0),
  unique (path_id, sort_order)
);
create index tracks_path_idx on public.tracks (path_id, sort_order);

create table public.user_paths (
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  path_id text not null references public.paths(id) on delete restrict,
  selected_at timestamptz not null default now(),
  primary key (user_id, path_id)
);
create index user_paths_path_idx on public.user_paths (path_id);

create table public.criteria (
  id text primary key,
  name text not null,
  category public.criterion_category not null,
  max_points smallint not null,
  track_id text references public.tracks(id) on update cascade on delete restrict,
  position smallint not null,
  rubric_version text not null default '1.0',
  created_at timestamptz not null default now(),
  constraint criteria_id_shape check (id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint criteria_points check (max_points in (5, 10)),
  constraint criteria_scope_shape check (
    (category = 'track_specialisation' and track_id is not null and max_points = 10 and position between 1 and 4)
    or (category = 'universal_delivery' and track_id is null and max_points = 5 and position between 1 and 8)
    or (category = 'structural_flow' and track_id is null and max_points = 5 and position between 1 and 4)
  ),
  unique (category, track_id, position)
);
create index criteria_track_idx on public.criteria (track_id, position) where track_id is not null;
create index criteria_category_idx on public.criteria (category, position);

create table public.criterion_anchors (
  criterion_id text not null references public.criteria(id) on update cascade on delete cascade,
  anchor public.anchor_level not null,
  description text not null,
  min_score smallint not null,
  max_score smallint not null,
  created_at timestamptz not null default now(),
  primary key (criterion_id, anchor),
  constraint criterion_anchor_description_nonempty check (length(btrim(description)) > 0),
  constraint criterion_anchor_range_order check (min_score >= 0 and max_score >= min_score)
);

-- ----- Submissions / temporary video -------------------------------------
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete restrict,
  track_id text not null references public.tracks(id) on delete restrict,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index submissions_user_date_idx on public.submissions (user_id, submitted_at desc);
create index submissions_track_date_idx on public.submissions (track_id, submitted_at desc);

create table public.submission_videos (
  submission_id uuid primary key references public.submissions(id) on delete cascade,
  bucket_name text not null default 'evaluation-videos',
  object_path text not null unique,
  mime_type text not null default 'video/mp4',
  duration_seconds numeric(9,3) not null,
  size_bytes bigint,
  lifecycle_status public.video_lifecycle_status not null default 'retained',
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint submission_video_path_nonempty check (length(btrim(object_path)) > 0),
  constraint submission_video_mp4 check (mime_type = 'video/mp4' and lower(object_path) like '%.mp4'),
  constraint submission_video_duration_positive check (duration_seconds > 0),
  constraint submission_video_size_positive check (size_bytes is null or size_bytes > 0),
  constraint submission_video_deleted_shape check (
    (lifecycle_status = 'deleted' and deleted_at is not null)
    or (lifecycle_status <> 'deleted' and deleted_at is null)
  )
);
create index submission_videos_lifecycle_idx on public.submission_videos (lifecycle_status);
