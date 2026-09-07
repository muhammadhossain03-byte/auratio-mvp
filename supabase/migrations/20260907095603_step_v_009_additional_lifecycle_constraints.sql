create unique index criteria_universal_position_unique_idx on public.criteria(position) where category='universal_delivery';
create unique index criteria_structural_position_unique_idx on public.criteria(position) where category='structural_flow';
create unique index criteria_track_position_unique_idx on public.criteria(track_id,position) where category='track_specialisation';

create or replace function public.prepare_evaluation_version()
returns trigger language plpgsql set search_path=public as $$
declare v_mode public.evaluation_mode; v_request_status public.evaluation_request_status; v_expected int; v_role public.app_role; v_existing int;
begin
  select mode,status into v_mode,v_request_status from public.evaluation_requests where id=new.request_id for update;
  if v_mode is null then raise exception 'Unknown evaluation request %',new.request_id; end if;
  if tg_op='INSERT' then
    if v_request_status in ('approved','rejected','cancelled') then raise exception 'Cannot create evaluator version for terminal request'; end if;
    select count(*),coalesce(max(version_number),0)+1 into v_existing,v_expected from public.evaluation_versions where request_id=new.request_id;
    if new.version_number<>v_expected then raise exception 'Version number must be %, got %',v_expected,new.version_number; end if;
    if v_mode='ai' and v_existing>0 then raise exception 'AI evaluation permits exactly one evaluator attempt/version'; end if;
  end if;
  if v_mode='ai' and new.evaluator_user_id is not null then raise exception 'AI evaluation version has no human evaluator'; end if;
  if v_mode='human' and new.evaluator_user_id is not null then
    select role into v_role from public.profiles where user_id=new.evaluator_user_id and account_status='active';
    if v_role<>'volunteer' then raise exception 'Human evaluator must be an active Volunteer'; end if;
  end if;
  return new;
end;
$$;
revoke execute on function public.prepare_evaluation_version() from public,anon,authenticated;

do $$
begin
  if exists(select 1 from public.criterion_anchors a join public.criteria c on c.id=a.criterion_id where (c.max_points=5 and ((a.anchor='Low' and (a.min_score,a.max_score)<>(0,2)) or (a.anchor='Competent' and (a.min_score,a.max_score)<>(3,4)) or (a.anchor='Excellent' and (a.min_score,a.max_score)<>(5,5)))) or (c.max_points=10 and ((a.anchor='Low' and (a.min_score,a.max_score)<>(0,4)) or (a.anchor='Competent' and (a.min_score,a.max_score)<>(5,8)) or (a.anchor='Excellent' and (a.min_score,a.max_score)<>(9,10))))) then
    raise exception 'Canonical anchor score bands are inconsistent';
  end if;
  if (select count(*) from public.criteria where category='universal_delivery')<>8 then raise exception 'Expected 8 universal criteria'; end if;
  if (select count(*) from public.criteria where category='structural_flow')<>4 then raise exception 'Expected 4 structural criteria'; end if;
  if exists(select 1 from public.tracks t left join public.criteria c on c.track_id=t.id and c.category='track_specialisation' group by t.id having count(c.id)<>4) then raise exception 'Every track must have exactly 4 specialization criteria'; end if;
end $$;
