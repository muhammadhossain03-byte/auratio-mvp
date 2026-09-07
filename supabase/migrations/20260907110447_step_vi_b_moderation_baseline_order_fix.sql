-- Auratio Step VI-B — deterministic latest-prior Human baseline ordering.
create or replace function private.human_moderation_context(
  p_request_id uuid,
  p_final_score smallint
)
returns table(
  moderation_required boolean,
  moderation_reason text,
  baseline_score smallint,
  baseline_version_id uuid
)
language plpgsql
stable
set search_path = public, private
as $$
declare
  v_user_id uuid;
  v_track_id text;
  v_baseline_score smallint;
  v_baseline_version uuid;
begin
  select er.user_id, s.track_id
    into v_user_id, v_track_id
  from public.evaluation_requests er
  join public.submissions s on s.id = er.submission_id
  where er.id = p_request_id and er.mode = 'human';

  if v_user_id is null then
    raise exception 'Human evaluation request not found';
  end if;

  select ev.final_score, ev.id
    into v_baseline_score, v_baseline_version
  from public.evaluation_requests er2
  join public.submissions s2 on s2.id = er2.submission_id
  join public.evaluation_versions ev on ev.request_id = er2.id
  left join lateral (
    select max(al.id) as approval_audit_id
    from public.audit_log al
    where al.request_id = er2.id
      and al.action = 'evaluation_request.status_changed'
      and al.metadata->>'to' = 'approved'
  ) aa on true
  where er2.user_id = v_user_id
    and s2.track_id = v_track_id
    and er2.mode = 'human'
    and er2.status = 'approved'
    and ev.status = 'approved'
    and er2.id <> p_request_id
  order by ev.approved_at desc, aa.approval_audit_id desc nulls last,
           s2.submitted_at desc, ev.version_number desc, ev.id desc
  limit 1;

  if v_baseline_version is null then
    return query select true, 'first_human_in_track'::text, null::smallint, null::uuid;
  elsif abs(p_final_score::integer - v_baseline_score::integer) > 15 then
    return query select true, 'score_anomaly_gt_15'::text, v_baseline_score, v_baseline_version;
  else
    return query select false, 'baseline_within_15'::text, v_baseline_score, v_baseline_version;
  end if;
end;
$$;
revoke execute on function private.human_moderation_context(uuid, smallint) from public, anon, authenticated;
