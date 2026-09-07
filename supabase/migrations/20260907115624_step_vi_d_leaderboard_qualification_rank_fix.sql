-- Auratio Step VI-D — qualification-only rank fix.
create or replace function public.get_leaderboard(
  p_track_id text,
  p_mode public.evaluation_mode,
  p_period public.leaderboard_period default 'all_time',
  p_month date default null,
  p_limit integer default 100
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public, auth, private
as $$
declare
  v_actor uuid := auth.uid();
  v_month_start date;
  v_month_end date;
  v_limit integer := least(greatest(coalesce(p_limit,100),1),200);
  v_rows jsonb;
  v_current jsonb;
begin
  if v_actor is null then raise exception 'Authentication required'; end if;
  if not exists(select 1 from public.profiles p where p.user_id=v_actor and p.account_status='active') then
    raise exception 'Active account required';
  end if;
  if not exists(select 1 from public.tracks t where t.id=p_track_id) then
    raise exception 'Unknown track';
  end if;

  if p_period='monthly' then
    v_month_start := date_trunc('month', coalesce(p_month,current_date))::date;
    v_month_end := (v_month_start + interval '1 month')::date;
  end if;

  with scoped as (
    select
      er.user_id,
      p.display_name,
      p.avatar_url,
      s.id as submission_id,
      s.submitted_at,
      ev.approved_at,
      ev.final_score::numeric as final_score
    from public.evaluation_requests er
    join public.submissions s on s.id=er.submission_id
    join public.evaluation_versions ev on ev.request_id=er.id
    join public.profiles p on p.user_id=er.user_id
    where s.track_id=p_track_id
      and er.mode=p_mode
      and er.status='approved'
      and ev.status='approved'
      and p.role='end_user'
      and p.account_status='active'
      and (
        p_period='all_time'
        or (s.submitted_at >= v_month_start::timestamptz and s.submitted_at < v_month_end::timestamptz)
      )
  ), numbered as (
    select
      s.*,
      row_number() over(partition by user_id order by approved_at desc, submission_id desc) as recent_rn,
      row_number() over(partition by user_id order by approved_at asc, submission_id asc) as qualification_rn
    from scoped s
  ), aggregates as (
    select
      user_id,
      min(display_name) as display_name,
      min(avatar_url) as avatar_url,
      count(*)::integer as participation_count,
      max(approved_at) as latest_approved_at,
      max(final_score) as best_single_score,
      max(approved_at) filter(where qualification_rn=3) as qualification_at,
      avg(final_score) filter(where recent_rn<=5) as full_window_average,
      sum(final_score) filter(where recent_rn<=5) as window_sum,
      min(final_score) filter(where recent_rn<=5) as window_min
    from numbered
    group by user_id
  ), scored as (
    select
      a.*,
      case
        when participation_count < 3 then null::numeric
        when participation_count in (3,4) then full_window_average
        else (window_sum-window_min)/4.0
      end as sform,
      case when p_period='monthly' then 1.00::numeric
           else private.alr_activity_decay(latest_approved_at, now()) end as decay
    from aggregates a
  ), rated as (
    select
      s.*,
      case when participation_count>=3 then sform*decay else null::numeric end as alr
    from scored s
  ), qualified as (
    select * from rated where participation_count>=3
  ), ranked as (
    select
      q.*,
      rank() over(
        order by alr desc, full_window_average desc, best_single_score desc, qualification_at asc
      ) as leaderboard_rank
    from qualified q
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'rank', leaderboard_rank,
        'display_name', display_name,
        'avatar_url', avatar_url,
        'alr', round(alr,4),
        'alr_display', round(alr,1),
        'sform', round(sform,4),
        'activity_decay', decay,
        'participation_count', participation_count,
        'full_window_average', round(full_window_average,4),
        'best_single_score', best_single_score,
        'qualification_at', qualification_at,
        'latest_approved_at', latest_approved_at
      ) order by leaderboard_rank, display_name
    ), '[]'::jsonb
  ) into v_rows
  from (
    select * from ranked
    order by leaderboard_rank, display_name
    limit v_limit
  ) q;

  with scoped as (
    select er.user_id,s.id submission_id,s.submitted_at,ev.approved_at,ev.final_score::numeric final_score
    from public.evaluation_requests er
    join public.submissions s on s.id=er.submission_id
    join public.evaluation_versions ev on ev.request_id=er.id
    where s.track_id=p_track_id and er.mode=p_mode and er.status='approved' and ev.status='approved'
      and (p_period='all_time' or (s.submitted_at>=v_month_start::timestamptz and s.submitted_at<v_month_end::timestamptz))
  ), numbered as (
    select s.*,
      row_number() over(partition by user_id order by approved_at desc,submission_id desc) recent_rn,
      row_number() over(partition by user_id order by approved_at asc,submission_id asc) qualification_rn
    from scoped s
  ), aggregates as (
    select user_id,count(*)::integer participation_count,max(approved_at) latest_approved_at,
      max(final_score) best_single_score,max(approved_at) filter(where qualification_rn=3) qualification_at,
      avg(final_score) filter(where recent_rn<=5) full_window_average,
      sum(final_score) filter(where recent_rn<=5) window_sum,
      min(final_score) filter(where recent_rn<=5) window_min
    from numbered group by user_id
  ), scored as (
    select a.*,
      case when participation_count<3 then null::numeric
           when participation_count in (3,4) then full_window_average
           else (window_sum-window_min)/4.0 end sform,
      case when p_period='monthly' then 1.00::numeric else private.alr_activity_decay(latest_approved_at,now()) end decay
    from aggregates a
  ), rated as (
    select s.*,case when participation_count>=3 then sform*decay else null::numeric end alr from scored s
  ), qualified as (
    select * from rated where participation_count>=3
  ), ranked as (
    select q.*,rank() over(order by alr desc,full_window_average desc,best_single_score desc,qualification_at asc) leaderboard_rank
    from qualified q
  )
  select case when r.user_id is null then
      jsonb_build_object('qualified',false,'participation_count',0,'rank',null,'alr',null)
    else jsonb_build_object(
      'qualified',r.participation_count>=3,
      'participation_count',r.participation_count,
      'rank',k.leaderboard_rank,
      'alr',case when r.participation_count>=3 then round(r.alr,4) else null end,
      'alr_display',case when r.participation_count>=3 then round(r.alr,1) else null end,
      'sform',case when r.participation_count>=3 then round(r.sform,4) else null end,
      'activity_decay',case when r.participation_count>=3 then r.decay else null end,
      'qualification_at',r.qualification_at
    ) end
  into v_current
  from (select v_actor as actor_id) a
  left join rated r on r.user_id=a.actor_id
  left join ranked k on k.user_id=a.actor_id;

  return jsonb_build_object(
    'track_id', p_track_id,
    'mode', p_mode,
    'period', p_period,
    'month', case when p_period='monthly' then to_char(v_month_start,'YYYY-MM') else null end,
    'rows', v_rows,
    'current_user', v_current
  );
end;
$$;
revoke execute on function public.get_leaderboard(text,public.evaluation_mode,public.leaderboard_period,date,integer) from public, anon;
grant execute on function public.get_leaderboard(text,public.evaluation_mode,public.leaderboard_period,date,integer) to authenticated;