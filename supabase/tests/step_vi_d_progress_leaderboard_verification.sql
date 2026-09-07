-- Auratio Step VI-D verification. Intended for a migrated disposable/local database.
-- All fixture rows are rolled back. AI/Human lifecycle correctness itself is covered by VI-B/VI-C;
-- this file constructs valid Approved source rows to verify deterministic progress/ALR projections.

do $$
declare
  v_definer boolean;
begin
  if has_function_privilege('anon','public.get_my_progress()','EXECUTE') then
    raise exception 'anon can execute private progress service';
  end if;
  if not has_function_privilege('authenticated','public.get_my_progress()','EXECUTE') then
    raise exception 'authenticated cannot execute private progress service';
  end if;
  if has_function_privilege('anon','public.get_my_approved_history(integer,integer)','EXECUTE') then
    raise exception 'anon can execute Approved history service';
  end if;
  if not has_function_privilege('authenticated','public.get_my_approved_history(integer,integer)','EXECUTE') then
    raise exception 'authenticated cannot execute Approved history service';
  end if;
  if to_regprocedure('public.get_leaderboard(text,public.evaluation_mode,public.leaderboard_period,date,integer)') is not null then
    raise exception 'elevated leaderboard service remains directly exposed';
  end if;
  if has_function_privilege('authenticated','public.svc_get_leaderboard(uuid,text,public.evaluation_mode,public.leaderboard_period,date,integer)','EXECUTE') then
    raise exception 'authenticated can execute service-role leaderboard RPC';
  end if;
  if not has_function_privilege('service_role','public.svc_get_leaderboard(uuid,text,public.evaluation_mode,public.leaderboard_period,date,integer)','EXECUTE') then
    raise exception 'service_role cannot execute leaderboard RPC';
  end if;
  if has_function_privilege('authenticated','private.alr_activity_decay(timestamptz,timestamptz)','EXECUTE') then
    raise exception 'authenticated can execute private decay helper';
  end if;

  select p.prosecdef into v_definer
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname='get_my_progress' and p.pronargs=0;
  if coalesce(v_definer,true) then raise exception 'get_my_progress must be SECURITY INVOKER'; end if;

  select p.prosecdef into v_definer
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname='get_my_approved_history' and p.pronargs=2;
  if coalesce(v_definer,true) then raise exception 'get_my_approved_history must be SECURITY INVOKER'; end if;

  if private.alr_activity_decay(now()-interval '30 days',now()) <> 1.00 then raise exception 'D 0-30 failed'; end if;
  if private.alr_activity_decay(now()-interval '31 days',now()) <> 0.95 then raise exception 'D 31-44 failed'; end if;
  if private.alr_activity_decay(now()-interval '45 days',now()) <> 0.90 then raise exception 'D 45-58 failed'; end if;
  if private.alr_activity_decay(now()-interval '59 days',now()) <> 0.85 then raise exception 'D 59-72 failed'; end if;
  if private.alr_activity_decay(now()-interval '73 days',now()) <> 0.80 then raise exception 'D 73+ failed'; end if;
end $$;

begin;

insert into auth.users(id,email) values
('00000000-0000-4000-8000-000000000401','vi-d-alpha@example.invalid'),
('00000000-0000-4000-8000-000000000402','vi-d-beta@example.invalid'),
('00000000-0000-4000-8000-000000000403','vi-d-gamma@example.invalid'),
('00000000-0000-4000-8000-000000000404','vi-d-progress@example.invalid'),
('00000000-0000-4000-8000-000000000405','vi-d-monthly@example.invalid'),
('00000000-0000-4000-8000-000000000406','vi-d-four@example.invalid'),
('00000000-0000-4000-8000-000000000407','vi-d-best-a@example.invalid'),
('00000000-0000-4000-8000-000000000408','vi-d-best-b@example.invalid'),
('00000000-0000-4000-8000-000000000409','vi-d-qual-a@example.invalid'),
('00000000-0000-4000-8000-000000000410','vi-d-qual-b@example.invalid');

update public.profiles set display_name=case user_id
  when '00000000-0000-4000-8000-000000000401'::uuid then 'Alpha'
  when '00000000-0000-4000-8000-000000000402'::uuid then 'Beta'
  when '00000000-0000-4000-8000-000000000403'::uuid then 'Gamma'
  when '00000000-0000-4000-8000-000000000404'::uuid then 'Progress User'
  when '00000000-0000-4000-8000-000000000405'::uuid then 'Monthly User'
  when '00000000-0000-4000-8000-000000000406'::uuid then 'Four Scores'
  when '00000000-0000-4000-8000-000000000407'::uuid then 'Best A'
  when '00000000-0000-4000-8000-000000000408'::uuid then 'Best B'
  when '00000000-0000-4000-8000-000000000409'::uuid then 'Qual A'
  when '00000000-0000-4000-8000-000000000410'::uuid then 'Qual B'
  else display_name end
where user_id between '00000000-0000-4000-8000-000000000401'::uuid and '00000000-0000-4000-8000-000000000410'::uuid;

create function pg_temp.add_approved(
  p_user uuid,
  p_track text,
  p_mode public.evaluation_mode,
  p_score integer,
  p_submitted_at timestamptz,
  p_approved_at timestamptz
) returns uuid
language plpgsql
as $$
declare
  v_path text;
  v_duration numeric;
  v_result jsonb;
  v_request uuid;
  v_version uuid;
  v_submission uuid;
  v_remaining integer := p_score;
  v_score integer;
  v_anchor public.anchor_level;
  r record;
begin
  if p_score<0 or p_score>100 then raise exception 'Fixture score out of range'; end if;
  select ((min_duration_seconds+max_duration_seconds)/2.0)::numeric
    into v_duration from public.tracks where id=p_track;
  v_path := p_user::text || '/' || gen_random_uuid()::text || '.mp4';
  insert into storage.objects(bucket_id,name,owner) values('evaluation-videos',v_path,p_user);

  v_result := public.svc_create_evaluation_request(p_user,p_track,p_mode,v_path,v_duration,1000,'video/mp4');
  v_request := (v_result->>'request_id')::uuid;
  v_version := (v_result->>'evaluation_version_id')::uuid;
  v_submission := (v_result->>'submission_id')::uuid;

  for r in
    select c.id,c.max_points
    from public.criteria c
    where c.category in ('universal_delivery','structural_flow')
       or (c.category='track_specialisation' and c.track_id=p_track)
    order by case c.category when 'universal_delivery' then 1 when 'structural_flow' then 2 else 3 end,c.position
  loop
    v_score := least(r.max_points::integer,v_remaining);
    v_remaining := v_remaining-v_score;
    if r.max_points=5 then
      v_anchor := case when v_score<=2 then 'Low' when v_score<=4 then 'Competent' else 'Excellent' end;
    else
      v_anchor := case when v_score<=4 then 'Low' when v_score<=8 then 'Competent' else 'Excellent' end;
    end if;
    insert into public.evaluation_criterion_results(
      evaluation_version_id,criterion_id,anchor,score,primary_timestamp_seconds,
      evidence,strength,weakness,actionable_improvement
    ) values(v_version,r.id,v_anchor,v_score::smallint,1,'Evidence','Strength','Weakness','Improvement');
  end loop;
  if v_remaining<>0 then raise exception 'Fixture score allocation failed'; end if;

  if p_mode='human' then
    update public.evaluation_requests set status='assigned' where id=v_request;
    update public.evaluation_requests set status='accepted' where id=v_request;
    update public.evaluation_requests set status='in_evaluation' where id=v_request;
    update public.evaluation_versions set overall_summary='Fixture summary',status='submitted' where id=v_version;
    update public.evaluation_requests set status='submitted' where id=v_request;
    update public.evaluation_versions set status='approved' where id=v_version;
    update public.evaluation_requests set status='approved' where id=v_request;
  else
    update public.evaluation_versions set overall_summary='Fixture summary',status='approved' where id=v_version;
    update public.evaluation_requests set status='approved' where id=v_request;
  end if;

  update public.submissions set submitted_at=p_submitted_at where id=v_submission;
  update public.evaluation_versions set approved_at=p_approved_at where id=v_version;
  if (select final_score from public.evaluation_versions where id=v_version)<>p_score then
    raise exception 'Fixture final score mismatch';
  end if;
  return v_submission;
end;
$$;

-- Alpha has six Approved results; only latest five participate. Latest five are 90,70,80,60,100.
-- Discard 60 -> Sform 85. Complete five-score window average = 80. Old sixth score must be ignored.
select pg_temp.add_approved('00000000-0000-4000-8000-000000000401','informative','ai',0,now()-interval '15 days',now()-interval '15 days');
select pg_temp.add_approved('00000000-0000-4000-8000-000000000401','informative','ai',90,now()-interval '14 days',now()-interval '14 days');
select pg_temp.add_approved('00000000-0000-4000-8000-000000000401','informative','ai',70,now()-interval '13 days',now()-interval '13 days');
select pg_temp.add_approved('00000000-0000-4000-8000-000000000401','informative','ai',80,now()-interval '12 days',now()-interval '12 days');
select pg_temp.add_approved('00000000-0000-4000-8000-000000000401','informative','ai',60,now()-interval '11 days',now()-interval '11 days');
select pg_temp.add_approved('00000000-0000-4000-8000-000000000401','informative','ai',100,now()-interval '10 days',now()-interval '10 days');

-- Beta: 3-score plain average = 85. Same ALR as Alpha but higher full-window average, so Beta wins tie-break 2.
select pg_temp.add_approved('00000000-0000-4000-8000-000000000402','informative','ai',90,now()-interval '12 days',now()-interval '12 days');
select pg_temp.add_approved('00000000-0000-4000-8000-000000000402','informative','ai',85,now()-interval '11 days',now()-interval '11 days');
select pg_temp.add_approved('00000000-0000-4000-8000-000000000402','informative','ai',80,now()-interval '10 days',now()-interval '10 days');

-- Gamma: 3 perfect scores, latest is 31 days old -> D=.95 and ALR 95.
select pg_temp.add_approved('00000000-0000-4000-8000-000000000403','informative','ai',100,now()-interval '33 days',now()-interval '33 days');
select pg_temp.add_approved('00000000-0000-4000-8000-000000000403','informative','ai',100,now()-interval '32 days',now()-interval '32 days');
select pg_temp.add_approved('00000000-0000-4000-8000-000000000403','informative','ai',100,now()-interval '31 days',now()-interval '31 days');

-- Progress User: Track Mastery informative=(80+100)/2=90, extempore=60; Overall=(90+60)/2=75.
select pg_temp.add_approved('00000000-0000-4000-8000-000000000404','informative','ai',80,now()-interval '4 days',now()-interval '4 days');
select pg_temp.add_approved('00000000-0000-4000-8000-000000000404','informative','human',100,now()-interval '3 days',now()-interval '3 days');
select pg_temp.add_approved('00000000-0000-4000-8000-000000000404','extempore','ai',60,now()-interval '2 days',now()-interval '2 days');

-- Monthly User: exactly three current-month submissions count. Previous-month submission is Approved but excluded monthly.
select pg_temp.add_approved('00000000-0000-4000-8000-000000000405','informative','human',70,date_trunc('month',now())+interval '1 day',now()-interval '3 hours');
select pg_temp.add_approved('00000000-0000-4000-8000-000000000405','informative','human',80,date_trunc('month',now())+interval '2 days',now()-interval '2 hours');
select pg_temp.add_approved('00000000-0000-4000-8000-000000000405','informative','human',90,date_trunc('month',now())+interval '3 days',now()-interval '1 hour');
select pg_temp.add_approved('00000000-0000-4000-8000-000000000405','informative','human',100,date_trunc('month',now())-interval '1 day',now());

-- Four-score plain average = 85.
select pg_temp.add_approved('00000000-0000-4000-8000-000000000406','informative','ai',70,now()-interval '8 days',now()-interval '8 days');
select pg_temp.add_approved('00000000-0000-4000-8000-000000000406','informative','ai',80,now()-interval '7 days',now()-interval '7 days');
select pg_temp.add_approved('00000000-0000-4000-8000-000000000406','informative','ai',90,now()-interval '6 days',now()-interval '6 days');
select pg_temp.add_approved('00000000-0000-4000-8000-000000000406','informative','ai',100,now()-interval '5 days',now()-interval '5 days');

-- Best-single tie break: same ALR/full-window average 80; Best A has best=90, Best B has best=85.
select pg_temp.add_approved('00000000-0000-4000-8000-000000000407','informative','ai',70,now()-interval '6 days',now()-interval '6 days');
select pg_temp.add_approved('00000000-0000-4000-8000-000000000407','informative','ai',80,now()-interval '5 days',now()-interval '5 days');
select pg_temp.add_approved('00000000-0000-4000-8000-000000000407','informative','ai',90,now()-interval '4 days',now()-interval '4 days');
select pg_temp.add_approved('00000000-0000-4000-8000-000000000408','informative','ai',75,now()-interval '6 days',now()-interval '6 days');
select pg_temp.add_approved('00000000-0000-4000-8000-000000000408','informative','ai',80,now()-interval '5 days',now()-interval '5 days');
select pg_temp.add_approved('00000000-0000-4000-8000-000000000408','informative','ai',85,now()-interval '4 days',now()-interval '4 days');

-- Qualification-time tie break: identical score profile; Qual A reaches the third approval earlier than Qual B.
select pg_temp.add_approved('00000000-0000-4000-8000-000000000409','informative','ai',80,now()-interval '9 days',now()-interval '9 days');
select pg_temp.add_approved('00000000-0000-4000-8000-000000000409','informative','ai',80,now()-interval '8 days',now()-interval '8 days');
select pg_temp.add_approved('00000000-0000-4000-8000-000000000409','informative','ai',80,now()-interval '7 days',now()-interval '7 days');
select pg_temp.add_approved('00000000-0000-4000-8000-000000000410','informative','ai',80,now()-interval '6 days',now()-interval '6 days');
select pg_temp.add_approved('00000000-0000-4000-8000-000000000410','informative','ai',80,now()-interval '5 days',now()-interval '5 days');
select pg_temp.add_approved('00000000-0000-4000-8000-000000000410','informative','ai',80,now()-interval '4 days',now()-interval '4 days');

do $$
declare
  v jsonb;
  v_rows jsonb;
  a jsonb;
  b jsonb;
  g jsonb;
  four jsonb;
  ba jsonb;
  bb jsonb;
  qa jsonb;
  qb jsonb;
  v_monthly jsonb;
  v_progress jsonb;
  v_history jsonb;
begin
  v:=public.svc_get_leaderboard('00000000-0000-4000-8000-000000000401','informative','ai','all_time',null,100);
  v_rows:=v->'rows';
  select value into a from jsonb_array_elements(v_rows) where value->>'display_name'='Alpha';
  select value into b from jsonb_array_elements(v_rows) where value->>'display_name'='Beta';
  select value into g from jsonb_array_elements(v_rows) where value->>'display_name'='Gamma';
  select value into four from jsonb_array_elements(v_rows) where value->>'display_name'='Four Scores';
  select value into ba from jsonb_array_elements(v_rows) where value->>'display_name'='Best A';
  select value into bb from jsonb_array_elements(v_rows) where value->>'display_name'='Best B';
  select value into qa from jsonb_array_elements(v_rows) where value->>'display_name'='Qual A';
  select value into qb from jsonb_array_elements(v_rows) where value->>'display_name'='Qual B';

  if (g->>'activity_decay')::numeric<>0.95 or (g->>'alr')::numeric<>95 then
    raise exception 'All-Time decay failed: %',g;
  end if;
  if (a->>'participation_count')::integer<>6 or (a->>'sform')::numeric<>85 or (a->>'full_window_average')::numeric<>80 then
    raise exception '5+ sliding window failed: %',a;
  end if;
  if (b->>'sform')::numeric<>85 or (b->>'rank')::integer >= (a->>'rank')::integer then
    raise exception 'full-window-average tie break failed: Beta %, Alpha %',b,a;
  end if;
  if (four->>'participation_count')::integer<>4 or (four->>'sform')::numeric<>85 then
    raise exception 'four-score average failed: %',four;
  end if;
  if (ba->>'alr')::numeric<>80 or (bb->>'alr')::numeric<>80 or
     (ba->>'full_window_average')::numeric<>80 or (bb->>'full_window_average')::numeric<>80 or
     (ba->>'rank')::integer >= (bb->>'rank')::integer then
    raise exception 'best-single tie break failed: Best A %, Best B %',ba,bb;
  end if;
  if (qa->>'alr')::numeric<>80 or (qb->>'alr')::numeric<>80 or
     (qa->>'best_single_score')::numeric<>80 or (qb->>'best_single_score')::numeric<>80 or
     (qa->>'rank')::integer >= (qb->>'rank')::integer then
    raise exception 'qualification-time tie break failed: Qual A %, Qual B %',qa,qb;
  end if;

  v:=public.svc_get_leaderboard('00000000-0000-4000-8000-000000000404','informative','ai','all_time',null,100);
  if (v->'current_user'->>'qualified')::boolean or (v->'current_user'->>'participation_count')::integer<>1 or v->'current_user'->'rank' is not null then
    raise exception 'below-3 qualification state failed: %',v->'current_user';
  end if;

  v_monthly:=public.svc_get_leaderboard('00000000-0000-4000-8000-000000000405','informative','human','monthly',current_date,100);
  if (v_monthly->'current_user'->>'participation_count')::integer<>3 or
     (v_monthly->'current_user'->>'activity_decay')::numeric<>1.00 or
     (v_monthly->'current_user'->>'sform')::numeric<>80 then
    raise exception 'Monthly submission-date/D=1.00 rules failed: %',v_monthly;
  end if;

  if exists(
    select 1 from jsonb_array_elements(
      public.svc_get_leaderboard('00000000-0000-4000-8000-000000000405','informative','ai','all_time',null,100)->'rows'
    ) x where x->>'display_name'='Monthly User'
  ) then raise exception 'AI/Human leaderboard mode separation failed'; end if;
end $$;

-- Exercise the private progress/history services under authenticated RLS, not as postgres/service_role.
create temp table vi_d_capture(kind text primary key,payload jsonb);
grant insert,select on vi_d_capture to authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000404',true);
set local role authenticated;
insert into vi_d_capture values('progress',public.get_my_progress());
insert into vi_d_capture values('history',public.get_my_approved_history(2,0));
reset role;

do $$
declare v jsonb;
begin
  select payload into v from vi_d_capture where kind='progress';
  if (v->>'overall_mastery')::numeric<>75 or (v->>'represented_tracks')::integer<>2 or (v->>'approved_evaluations')::integer<>3 then
    raise exception 'private mastery aggregate failed: %',v;
  end if;
  if not exists(select 1 from jsonb_array_elements(v->'tracks') x where x->>'track_id'='informative' and (x->>'track_mastery')::numeric=90 and (x->>'ai_count')::integer=1 and (x->>'human_count')::integer=1) then
    raise exception 'Informative Track Mastery failed: %',v;
  end if;
  if not exists(select 1 from jsonb_array_elements(v->'tracks') x where x->>'track_id'='extempore' and (x->>'track_mastery')::numeric=60) then
    raise exception 'Extempore Track Mastery failed: %',v;
  end if;

  select payload into v from vi_d_capture where kind='history';
  if (v->>'total')::integer<>3 or jsonb_array_length(v->'items')<>2 then
    raise exception 'Approved history pagination failed: %',v;
  end if;
  if exists(select 1 from jsonb_array_elements(v->'items') x where x ? 'evaluator_user_id' or x ? 'email') then
    raise exception 'Approved history leaked restricted identity fields';
  end if;
end $$;

rollback;
