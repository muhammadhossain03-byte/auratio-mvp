create table public.evaluation_requests (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique references public.submissions(id) on delete restrict,
  user_id uuid not null references public.profiles(user_id) on delete restrict,
  mode public.evaluation_mode not null,
  status public.evaluation_request_status not null,
  terminal_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint evaluation_request_mode_status check (
    (mode = 'ai' and status in ('processing', 'approved', 'rejected', 'cancelled'))
    or
    (mode = 'human' and status in ('unassigned', 'assigned', 'accepted', 'in_evaluation', 'submitted', 'pending_moderation', 'reopened', 'approved', 'rejected', 'cancelled'))
  ),
  constraint evaluation_request_terminal_shape check (
    (status in ('approved', 'rejected', 'cancelled') and terminal_at is not null)
    or (status not in ('approved', 'rejected', 'cancelled') and terminal_at is null)
  )
);
create unique index evaluation_requests_one_active_per_user_idx
  on public.evaluation_requests (user_id)
  where status not in ('approved', 'rejected', 'cancelled');
create index evaluation_requests_user_date_idx on public.evaluation_requests (user_id, created_at desc);
create index evaluation_requests_status_idx on public.evaluation_requests (status, created_at);

create table public.evaluation_versions (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.evaluation_requests(id) on delete restrict,
  version_number integer not null,
  status public.evaluation_version_status not null default 'draft',
  evaluator_user_id uuid references public.profiles(user_id) on delete restrict,
  overall_summary text,
  universal_score smallint,
  structural_score smallint,
  track_score smallint,
  final_score smallint,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  submitted_at timestamptz,
  moderated_at timestamptz,
  approved_at timestamptz,
  rejected_at timestamptz,
  unique (request_id, version_number),
  constraint evaluation_version_number_positive check (version_number > 0),
  constraint evaluation_version_summary_nonempty check (overall_summary is null or length(btrim(overall_summary)) > 0),
  constraint evaluation_version_scores_all_or_none check (
    (universal_score is null and structural_score is null and track_score is null and final_score is null)
    or (universal_score is not null and structural_score is not null and track_score is not null and final_score is not null)
  ),
  constraint evaluation_version_score_ranges check (
    universal_score is null or (
      universal_score between 0 and 40 and structural_score between 0 and 20 and track_score between 0 and 40
      and final_score between 0 and 100
      and final_score = universal_score + structural_score + track_score
    )
  ),
  constraint evaluation_version_status_timestamps check (
    (status = 'draft')
    or (status in ('submitted', 'pending_moderation', 'reopened') and submitted_at is not null)
    or (status = 'approved' and submitted_at is not null and approved_at is not null)
    or (status = 'rejected' and rejected_at is not null)
  )
);
create index evaluation_versions_request_idx on public.evaluation_versions (request_id, version_number desc);
create index evaluation_versions_status_idx on public.evaluation_versions (status);

create table public.human_assignments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.evaluation_requests(id) on delete restrict,
  evaluation_version_id uuid not null references public.evaluation_versions(id) on delete restrict,
  volunteer_user_id uuid not null references public.profiles(user_id) on delete restrict,
  status public.assignment_status not null default 'assigned',
  assigned_by uuid not null references public.profiles(user_id) on delete restrict,
  reason text,
  assigned_at timestamptz not null default now(),
  responded_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint human_assignment_reason_nonempty check (reason is null or length(btrim(reason)) > 0),
  constraint human_assignment_end_shape check (
    (status in ('declined', 'returned', 'revoked', 'completed') and ended_at is not null)
    or (status in ('assigned', 'accepted', 'in_evaluation') and ended_at is null)
  )
);
create unique index human_assignments_one_active_request_idx
  on public.human_assignments (request_id)
  where status in ('assigned', 'accepted', 'in_evaluation');
create unique index human_assignments_one_active_version_idx
  on public.human_assignments (evaluation_version_id)
  where status in ('assigned', 'accepted', 'in_evaluation');
create index human_assignments_volunteer_idx on public.human_assignments (volunteer_user_id, assigned_at desc);
create index human_assignments_request_history_idx on public.human_assignments (request_id, assigned_at);

create table public.evaluation_criterion_results (
  evaluation_version_id uuid not null references public.evaluation_versions(id) on delete cascade,
  criterion_id text not null references public.criteria(id) on delete restrict,
  anchor public.anchor_level not null,
  score smallint not null,
  primary_timestamp_seconds numeric(9,3) not null,
  evidence text not null,
  strength text not null,
  weakness text not null,
  actionable_improvement text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (evaluation_version_id, criterion_id),
  foreign key (criterion_id, anchor) references public.criterion_anchors(criterion_id, anchor),
  constraint criterion_result_timestamp_nonnegative check (primary_timestamp_seconds >= 0),
  constraint criterion_result_evidence_nonempty check (length(btrim(evidence)) > 0),
  constraint criterion_result_strength_nonempty check (length(btrim(strength)) > 0),
  constraint criterion_result_weakness_nonempty check (length(btrim(weakness)) > 0),
  constraint criterion_result_improvement_nonempty check (length(btrim(actionable_improvement)) > 0)
);
create index evaluation_criterion_results_criterion_idx on public.evaluation_criterion_results (criterion_id);

create table public.evaluation_admin_actions (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.evaluation_requests(id) on delete restrict,
  evaluation_version_id uuid references public.evaluation_versions(id) on delete restrict,
  action public.admin_action_type not null,
  actor_user_id uuid not null references public.profiles(user_id) on delete restrict,
  target_volunteer_user_id uuid references public.profiles(user_id) on delete restrict,
  reason text,
  created_at timestamptz not null default now(),
  constraint evaluation_admin_action_reason check (
    (action in ('reassign', 'cancel_request', 'reject_evaluation', 'reopen_evaluation') and reason is not null and length(btrim(reason)) > 0)
    or action in ('assign', 'approve_evaluation')
  )
);
create index evaluation_admin_actions_request_idx on public.evaluation_admin_actions (request_id, created_at desc);

-- ----- Approved report metadata ------------------------------------------
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.evaluation_requests(id) on delete restrict,
  evaluation_version_id uuid not null unique references public.evaluation_versions(id) on delete restrict,
  bucket_name text not null default 'evaluation-reports',
  object_path text not null unique,
  filename text not null,
  size_bytes bigint,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint report_path_nonempty check (length(btrim(object_path)) > 0),
  constraint report_filename_docx check (filename like 'Auratio\_%\_Submission-%\_v%.docx' escape E'\\'),
  constraint report_size_positive check (size_bytes is null or size_bytes > 0)
);
create index reports_request_idx on public.reports (request_id);

-- ----- Video deletion work queue model ----------------------------------
create table public.video_deletion_jobs (
  submission_id uuid primary key references public.submissions(id) on delete cascade,
  status public.video_deletion_job_status not null default 'pending',
  attempt_count integer not null default 0,
  next_attempt_at timestamptz not null default now(),
  last_attempt_at timestamptz,
  last_error text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint video_deletion_attempt_count_nonnegative check (attempt_count >= 0),
  constraint video_deletion_job_complete_shape check (
    (status = 'succeeded' and completed_at is not null)
    or (status <> 'succeeded' and completed_at is null)
  )
);
create index video_deletion_jobs_due_idx on public.video_deletion_jobs (status, next_attempt_at) where status in ('pending', 'retry');

-- ----- Bangladesh event directory ---------------------------------------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  country_code char(2) not null default 'BD',
  division public.bd_division not null,
  city text,
  venue text,
  organizer text,
  registration_url text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  status public.event_status not null default 'draft',
  created_by uuid not null references public.profiles(user_id) on delete restrict,
  updated_by uuid not null references public.profiles(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_title_nonempty check (length(btrim(title)) > 0),
  constraint events_bangladesh_only check (country_code = 'BD'),
  constraint events_end_after_start check (ends_at is null or ends_at >= starts_at),
  constraint events_registration_url_nonempty check (registration_url is null or length(btrim(registration_url)) > 0)
);
create index events_public_discovery_idx on public.events (status, starts_at, division);

create table public.event_paths (
  event_id uuid not null references public.events(id) on delete cascade,
  path_id text not null references public.paths(id) on delete restrict,
  primary key (event_id, path_id)
);
create index event_paths_path_idx on public.event_paths (path_id, event_id);

-- ----- Internal audit -----------------------------------------------------
create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_user_id uuid references public.profiles(user_id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  request_id uuid references public.evaluation_requests(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint audit_action_nonempty check (length(btrim(action)) > 0),
  constraint audit_entity_type_nonempty check (length(btrim(entity_type)) > 0)
);
create index audit_log_request_idx on public.audit_log (request_id, created_at desc);
create index audit_log_entity_idx on public.audit_log (entity_type, entity_id, created_at desc);
