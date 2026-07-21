CREATE OR REPLACE FUNCTION public.get_integration_secret(
  _names text[],
  _all_tokens text[] DEFAULT ARRAY[]::text[],
  _prefer_tokens text[] DEFAULT ARRAY[]::text[],
  _forbidden_tokens text[] DEFAULT ARRAY[]::text[]
)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
  _value text;
BEGIN
  SELECT NULLIF(trim(ds.decrypted_secret), '')
    INTO _value
  FROM vault.decrypted_secrets ds
  WHERE ds.name = ANY(_names)
    AND NULLIF(trim(ds.decrypted_secret), '') IS NOT NULL
  ORDER BY array_position(_names, ds.name)
  LIMIT 1;

  IF _value IS NOT NULL THEN
    RETURN _value;
  END IF;

  IF COALESCE(array_length(_all_tokens, 1), 0) = 0 THEN
    RETURN '';
  END IF;

  WITH candidates AS (
    SELECT
      ds.name,
      NULLIF(trim(ds.decrypted_secret), '') AS decrypted_secret,
      upper(regexp_replace(ds.name, '[^A-Za-z0-9]+', '_', 'g')) AS normalized_name
    FROM vault.decrypted_secrets ds
  ), filtered AS (
    SELECT
      c.*,
      (
        SELECT count(*)
        FROM unnest(_prefer_tokens) AS p(token)
        WHERE c.normalized_name LIKE '%' || upper(p.token) || '%'
      ) AS prefer_score
    FROM candidates c
    WHERE c.decrypted_secret IS NOT NULL
      AND NOT EXISTS (
        SELECT 1
        FROM unnest(_all_tokens) AS t(token)
        WHERE c.normalized_name NOT LIKE '%' || upper(t.token) || '%'
      )
      AND NOT EXISTS (
        SELECT 1
        FROM unnest(_forbidden_tokens) AS f(token)
        WHERE c.normalized_name LIKE '%' || upper(f.token) || '%'
      )
  )
  SELECT decrypted_secret
    INTO _value
  FROM filtered
  ORDER BY prefer_score DESC, normalized_name ASC
  LIMIT 1;

  RETURN COALESCE(_value, '');
END;
$$;

REVOKE ALL ON FUNCTION public.get_integration_secret(text[], text[], text[], text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_integration_secret(text[], text[], text[], text[]) TO service_role;