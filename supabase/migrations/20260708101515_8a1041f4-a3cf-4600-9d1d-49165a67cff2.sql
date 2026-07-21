GRANT SELECT ON public.i18n_translations TO anon, authenticated;
GRANT ALL ON public.i18n_translations TO service_role;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='i18n_translations_ns_lang_key_uk'
  ) THEN
    CREATE UNIQUE INDEX i18n_translations_ns_lang_key_uk
      ON public.i18n_translations (namespace, language, entry_key);
  END IF;
END $$;