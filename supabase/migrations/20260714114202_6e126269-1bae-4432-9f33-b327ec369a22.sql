create or replace function public.get_integration_secret(
  _names text[] default array[]::text[],
  _all_tokens text[] default array[]::text[],
  _prefer_tokens text[] default array[]::text[],
  _forbidden_tokens text[] default array[]::text[]
)
returns text
language plpgsql
security definer
set search_path = public, vault
as $$
declare
  exact_value text;
  token_value text;
begin
  if coalesce(array_length(_names, 1), 0) > 0 then
    select nullif(trim(ds.decrypted_secret), '') into exact_value
    from vault.decrypted_secrets ds
    where ds.name = any(_names)
      and nullif(trim(ds.decrypted_secret), '') is not null
    order by array_position(_names, ds.name)
    limit 1;

    if exact_value is not null then
      return exact_value;
    end if;
  end if;

  if coalesce(array_length(_all_tokens, 1), 0) > 0 then
    with candidates as (
      select
        ds.name,
        nullif(trim(ds.decrypted_secret), '') as secret_value,
        upper(regexp_replace(ds.name, '[^A-Za-z0-9]+', '_', 'g')) as normalized_name
      from vault.decrypted_secrets ds
      where nullif(trim(ds.decrypted_secret), '') is not null
    ), scored as (
      select
        c.secret_value,
        (
          select count(*)
          from unnest(_prefer_tokens) p
          where c.normalized_name like '%' || upper(p) || '%'
        ) as preference_score,
        c.normalized_name
      from candidates c
      where not exists (
        select 1
        from unnest(_all_tokens) t
        where c.normalized_name not like '%' || upper(t) || '%'
      )
      and not exists (
        select 1
        from unnest(_forbidden_tokens) f
        where c.normalized_name like '%' || upper(f) || '%'
      )
    )
    select secret_value into token_value
    from scored
    order by preference_score desc, normalized_name asc
    limit 1;

    if token_value is not null then
      return token_value;
    end if;
  end if;

  return '';
end;
$$;

revoke all on function public.get_integration_secret(text[], text[], text[], text[]) from public;
revoke all on function public.get_integration_secret(text[], text[], text[], text[]) from anon;
revoke all on function public.get_integration_secret(text[], text[], text[], text[]) from authenticated;
grant execute on function public.get_integration_secret(text[], text[], text[], text[]) to service_role;