/* Optional admin helpers (safe no-ops if run multiple times) */
create or replace function public.admin_avg_health_score()
returns table(value numeric)
language plpgsql stable as $$
begin
  return query
  select coalesce(avg(r.confidence), 0)::numeric as value 
  from public.reports r
  where r.confidence is not null;
  
  exception when others then
    return query select 0::numeric as value;
end;
$$;

create or replace function public.admin_high_risk_count()
returns table(value bigint)
language plpgsql stable as $$
begin
  return query
  select count(distinct user_id) as value
  from public.reports r
  where lower(r."condition") in ('neuropathy','high-risk','risk');
  
  exception when others then
    return query select 0::bigint as value;
end;
$$;
