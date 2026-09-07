-- Auratio Step VI-C verification. Intended for a migrated disposable/local database.
-- All fixture rows are rolled back.

do $$
begin
  if has_function_privilege('authenticated','public.svc_ai_start_attempt(uuid,text)','EXECUTE') then
    raise exception 'Authenticated role can start AI attempts';
  end if;
  if has_function_privilege('authenticated','public.svc_ai_finalize_result(uuid,jsonb,text)','EXECUTE') then
    raise exception 'Authenticated role can finalize AI results';
  end if;
  if has_function_privilege('authenticated','public.svc_ai_fail_attempt(uuid,text,text,text,text)','EXECUTE') then
    raise exception 'Authenticated role can fail AI attempts';
  end if;
  if has_function_privilege('authenticated','public.svc_ai_admin_cancel(uuid,uuid,text)','EXECUTE') then
    raise exception 'Authenticated role can directly execute AI Admin cancellation RPC';
  end if;
  if not has_function_privilege('service_role','public.svc_ai_start_attempt(uuid,text)','EXECUTE') then
    raise exception 'Service role cannot start AI attempts';
  end if;
  if has_table_privilege('authenticated','private.ai_evaluation_attempts','SELECT') then
    raise exception 'Authenticated role can read private AI provenance';
  end if;
  if (select count(*) from pg_tables where schemaname='public' and rowsecurity) <> 19 then
    raise exception 'Step VI-C unexpectedly changed the 19 public RLS-table foundation';
  end if;
end $$;

begin;

insert into auth.users(id,email) values
('00000000-0000-4000-8000-000000000401','vi-c-user@example.invalid'),
('00000000-0000-4000-8000-000000000402','vi-c-admin@example.invalid');

update public.profiles set role='admin'
where user_id='00000000-0000-4000-8000-000000000402';

insert into storage.objects(bucket_id,name,owner)
select
  'evaluation-videos',
  '00000000-0000-4000-8000-000000000401/track-' || t.id || '.mp4',
  '00000000-0000-4000-8000-000000000401'::uuid
from public.tracks t;

insert into storage.objects(bucket_id,name,owner) values
('evaluation-videos','00000000-0000-4000-8000-000000000401/valid.mp4','00000000-0000-4000-8000-000000000401'),
('evaluation-videos','00000000-0000-4000-8000-000000000401/unusable.mp4','00000000-0000-4000-8000-000000000401'),
('evaluation-videos','00000000-0000-4000-8000-000000000401/duplicate.mp4','00000000-0000-4000-8000-000000000401'),
('evaluation-videos','00000000-0000-4000-8000-000000000401/extra.mp4','00000000-0000-4000-8000-000000000401'),
('evaluation-videos','00000000-0000-4000-8000-000000000401/band.mp4','00000000-0000-4000-8000-000000000401'),
('evaluation-videos','00000000-0000-4000-8000-000000000401/time.mp4','00000000-0000-4000-8000-000000000401'),
('evaluation-videos','00000000-0000-4000-8000-000000000401/cancel.mp4','00000000-0000-4000-8000-000000000401'),
('evaluation-videos','00000000-0000-4000-8000-000000000401/api.mp4','00000000-0000-4000-8000-000000000401');

create function pg_temp.ai_valid_result(
  p_track text,
  p_submission_code text,
  p_timestamp text default '00:01'
)
returns jsonb
language plpgsql
as $$
declare
  v_items jsonb;
begin
  select jsonb_agg(
    jsonb_build_object(
      'criterion_id', c.id,
      'anchor', 'Competent',
      'score', case when c.max_points=5 then 4 else 8 end,
      'primary_timestamp', p_timestamp,
      'evidence', 'Observable evidence',
      'strength', 'One strength',
      'weakness', 'One weakness',
      'actionable_improvement', 'One improvement'
    )
    order by
      case c.category
        when 'universal_delivery' then 1
        when 'structural_flow' then 2
        else 3
      end,
      c.position,
      c.id
  )
  into v_items
  from public.criteria c
  where c.category in ('universal_delivery','structural_flow')
     or (c.category='track_specialisation' and c.track_id=p_track);

  return jsonb_build_object(
    'schema_version','1.0',
    'submission_id',p_submission_code,
    'track_slug',p_track,
    'evaluation_usable',true,
    'unusable_reason',null,
    'criteria',v_items,
    'overall_summary','Valid AI summary'
  );
end;
$$;

do $$
declare
  t record;
  v jsonb;
  v_start jsonb;
  v_request uuid;
  v_path text;
  v_duration numeric;
  v_special integer;
  v_leaked integer;
begin
  -- All 13 tracks must assemble exactly 8 + 4 + selected-track 4, with no unrelated-track leakage.
  for t in select id,min_duration_seconds,max_duration_seconds from public.tracks order by sort_order loop
    v_path := '00000000-0000-4000-8000-000000000401/track-' || t.id || '.mp4';
    v_duration := ((t.min_duration_seconds+t.max_duration_seconds)/2.0)::numeric;

    v := public.svc_create_evaluation_request(
      '00000000-0000-4000-8000-000000000401',t.id,'ai',
      v_path,v_duration,1000,'video/mp4'
    );
    v_request := (v->>'request_id')::uuid;

    if (select count(*) from private.ai_evaluation_attempts where request_id=v_request) <> 1 then
      raise exception 'Track % did not create exactly one AI attempt row',t.id;
    end if;
    if (select count(*) from public.evaluation_versions where request_id=v_request) <> 1 then
      raise exception 'Track % did not create exactly one AI evaluator version',t.id;
    end if;

    v_start := public.svc_ai_start_attempt(v_request,'gemini-test-model');

    if jsonb_array_length(v_start->'criteria') <> 16 then
      raise exception 'Track % runtime rubric count invalid',t.id;
    end if;
    if (v_start->>'submission_id') !~ '^SUB-[A-Z0-9-]+$' then
      raise exception 'Track % runtime submission ID violates output schema pattern',t.id;
    end if;
    if v_start ? 'user_id' or v_start ? 'email' or v_start ? 'display_name'
       or v_start ? 'history' or v_start ? 'leaderboard' or v_start ? 'mastery' then
      raise exception 'Track % leaked identity/history into AI runtime context',t.id;
    end if;

    select count(*) into v_special
    from jsonb_array_elements(v_start->'criteria') x
    where x->>'category'='track_specialisation';
    if v_special <> 4 then raise exception 'Track % specialization count invalid',t.id; end if;

    select count(*) into v_leaked
    from jsonb_array_elements(v_start->'criteria') x
    join public.criteria c on c.id=x->>'criterion_id'
    where c.category='track_specialisation' and c.track_id<>t.id;
    if v_leaked <> 0 then raise exception 'Track % leaked another track rubric',t.id; end if;

    perform public.svc_ai_fail_attempt(
      v_request,'api_failure','test_terminalization','Fixture terminalization',null
    );
  end loop;
end $$;

do $$
declare
  v jsonb;
  v_start jsonb;
  v_result jsonb;
  v_request uuid;
  v_submission_code text;
begin
  -- Valid usable output auto-approves with database-authoritative arithmetic.
  v := public.svc_create_evaluation_request(
    '00000000-0000-4000-8000-000000000401','informative','ai',
    '00000000-0000-4000-8000-000000000401/valid.mp4',300,1000,'video/mp4'
  );
  v_request := (v->>'request_id')::uuid;
  v_start := public.svc_ai_start_attempt(v_request,'gemini-test-model');
  v_submission_code := v_start->>'submission_id';
  v_result := pg_temp.ai_valid_result('informative',v_submission_code);

  v := public.svc_ai_finalize_result(v_request,v_result,repeat('a',64));

  if v->>'status'<>'approved' or (v->>'final_score')::integer<>80 then
    raise exception 'Valid AI output failed approval/arithmetic: %',v;
  end if;
  if (select status from private.ai_evaluation_attempts where request_id=v_request)<>'succeeded' then
    raise exception 'Valid AI attempt did not become succeeded';
  end if;
  if (select validation_outcome from private.ai_evaluation_attempts where request_id=v_request)<>'valid_usable' then
    raise exception 'Valid AI provenance outcome missing';
  end if;
end $$;

do $$
declare
  v jsonb;
  v_start jsonb;
  v_request uuid;
  v_result jsonb;
begin
  -- Valid unassessable output rejects with no scored content.
  v := public.svc_create_evaluation_request(
    '00000000-0000-4000-8000-000000000401','news-delivery','ai',
    '00000000-0000-4000-8000-000000000401/unusable.mp4',120,1000,'video/mp4'
  );
  v_request := (v->>'request_id')::uuid;
  v_start := public.svc_ai_start_attempt(v_request,'gemini-test-model');

  v_result := jsonb_build_object(
    'schema_version','1.0',
    'submission_id',v_start->>'submission_id',
    'track_slug','news-delivery',
    'evaluation_usable',false,
    'unusable_reason','Audio is corrupted',
    'criteria','[]'::jsonb,
    'overall_summary',null
  );
  v := public.svc_ai_finalize_result(v_request,v_result,repeat('b',64));

  if v->>'status'<>'rejected' or v->>'failure_code'<>'unassessable' then
    raise exception 'Unassessable branch failed: %',v;
  end if;
  if exists(
    select 1
    from public.evaluation_criterion_results r
    join public.evaluation_versions ev on ev.id=r.evaluation_version_id
    where ev.request_id=v_request
  ) then
    raise exception 'Unassessable output created criterion rows';
  end if;
end $$;

do $$
declare
  v jsonb;
  v_start jsonb;
  v_request uuid;
  v_result jsonb;
  v_items jsonb;
begin
  -- Duplicate/missing expected criterion IDs reject atomically with no partial scored rows.
  v := public.svc_create_evaluation_request(
    '00000000-0000-4000-8000-000000000401','news-delivery','ai',
    '00000000-0000-4000-8000-000000000401/duplicate.mp4',120,1000,'video/mp4'
  );
  v_request := (v->>'request_id')::uuid;
  v_start := public.svc_ai_start_attempt(v_request,'gemini-test-model');
  v_result := pg_temp.ai_valid_result('news-delivery',v_start->>'submission_id');
  v_items := v_result->'criteria';
  v_items := jsonb_set(v_items,'{15}',v_items->0,false);
  v_result := jsonb_set(v_result,'{criteria}',v_items,false);

  v := public.svc_ai_finalize_result(v_request,v_result,repeat('c',64));
  if v->>'status'<>'rejected' or v->>'failure_code'<>'invalid_output' then
    raise exception 'Duplicate criterion validation failed: %',v;
  end if;
  if exists(
    select 1
    from public.evaluation_criterion_results r
    join public.evaluation_versions ev on ev.id=r.evaluation_version_id
    where ev.request_id=v_request
  ) then
    raise exception 'Invalid output left partial criterion rows';
  end if;
end $$;

do $$
declare
  v jsonb;
  v_start jsonb;
  v_request uuid;
  v_result jsonb;
  v_items jsonb;
  v_case text;
  v_path text;
begin
  -- Unexpected fields, anchor-score mismatch, and out-of-duration timestamps reject.
  foreach v_case in array array['extra','band','time'] loop
    v_path := '00000000-0000-4000-8000-000000000401/'||v_case||'.mp4';
    v := public.svc_create_evaluation_request(
      '00000000-0000-4000-8000-000000000401','persuasive','ai',
      v_path,300,1000,'video/mp4'
    );
    v_request := (v->>'request_id')::uuid;
    v_start := public.svc_ai_start_attempt(v_request,'gemini-test-model');
    v_result := pg_temp.ai_valid_result('persuasive',v_start->>'submission_id');

    if v_case='extra' then
      v_result := v_result || jsonb_build_object('unexpected_field',true);
    elsif v_case='band' then
      v_items := v_result->'criteria';
      v_items := jsonb_set(v_items,'{0,score}','5'::jsonb,false);
      v_result := jsonb_set(v_result,'{criteria}',v_items,false);
    else
      v_items := v_result->'criteria';
      v_items := jsonb_set(v_items,'{0,primary_timestamp}','"99:59"'::jsonb,false);
      v_result := jsonb_set(v_result,'{criteria}',v_items,false);
    end if;

    v := public.svc_ai_finalize_result(v_request,v_result,null);
    if v->>'status'<>'rejected' or v->>'failure_code'<>'invalid_output' then
      raise exception 'Strict validation case % failed: %',v_case,v;
    end if;
  end loop;
end $$;

do $$
declare
  v jsonb;
  v_start jsonb;
  v_request uuid;
begin
  -- One-attempt/no-retry rule and explicit API-failure path.
  v := public.svc_create_evaluation_request(
    '00000000-0000-4000-8000-000000000401','news-delivery','ai',
    '00000000-0000-4000-8000-000000000401/api.mp4',120,1000,'video/mp4'
  );
  v_request := (v->>'request_id')::uuid;
  v_start := public.svc_ai_start_attempt(v_request,'gemini-test-model');

  begin
    perform public.svc_ai_start_attempt(v_request,'gemini-test-model');
    raise exception 'Second AI attempt start was not blocked';
  exception when others then
    if sqlerrm='Second AI attempt start was not blocked' then raise; end if;
  end;

  v := public.svc_ai_fail_attempt(
    v_request,'api_failure','gemini_api_error','Provider request failed',null
  );
  if v->>'status'<>'rejected' then raise exception 'API failure did not reject'; end if;
  if (select validation_outcome from private.ai_evaluation_attempts where request_id=v_request)<>'api_failure' then
    raise exception 'API failure provenance missing';
  end if;
end $$;

do $$
declare
  v jsonb;
  v_start jsonb;
  v_request uuid;
begin
  -- Admin cancellation during Processing wins over any late model response.
  v := public.svc_create_evaluation_request(
    '00000000-0000-4000-8000-000000000401','news-delivery','ai',
    '00000000-0000-4000-8000-000000000401/cancel.mp4',120,1000,'video/mp4'
  );
  v_request := (v->>'request_id')::uuid;
  v_start := public.svc_ai_start_attempt(v_request,'gemini-test-model');

  perform public.svc_ai_admin_cancel(
    '00000000-0000-4000-8000-000000000402',v_request,'Admin cancelled Processing AI request'
  );

  -- Deliberately malformed structured content must still be ignored after cancellation.
  v := public.svc_ai_finalize_result(v_request,'{}'::jsonb,repeat('d',64));

  if coalesce((v->>'ignored')::boolean,false) is not true or v->>'status'<>'cancelled' then
    raise exception 'Late result cancellation discard failed: %',v;
  end if;
  if (select status from public.evaluation_requests where id=v_request)<>'cancelled' then
    raise exception 'Late result changed Cancelled request';
  end if;
  if (select status from private.ai_evaluation_attempts where request_id=v_request)<>'discarded_cancelled' then
    raise exception 'Late result was not recorded as discarded';
  end if;
  if exists(
    select 1
    from public.evaluation_criterion_results r
    join public.evaluation_versions ev on ev.id=r.evaluation_version_id
    where ev.request_id=v_request
  ) then
    raise exception 'Cancelled late result created criterion rows';
  end if;
end $$;

rollback;

select 'PASS' as step_vi_c_ai_lifecycle_verification;
