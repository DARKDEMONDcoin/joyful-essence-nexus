
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION public.notify_harmony_on_generation()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  tg_id BIGINT;
  webhook_secret TEXT;
  msg TEXT;
BEGIN
  IF NEW.status <> 'completed' OR (OLD.status IS NOT DISTINCT FROM NEW.status) THEN
    RETURN NEW;
  END IF;
  SELECT telegram_id INTO tg_id FROM public.telegram_users WHERE user_id = NEW.user_id LIMIT 1;
  IF tg_id IS NULL THEN RETURN NEW; END IF;
  SELECT decrypted_secret INTO webhook_secret FROM vault.decrypted_secrets WHERE name = 'TELEGRAM_HARMONY_WEBHOOK_SECRET' LIMIT 1;
  IF webhook_secret IS NULL THEN RETURN NEW; END IF;
  msg := '<b>Your ' || COALESCE(NEW.job_type,'job') || ' is ready</b>' || E'\nOpen Megsy AI to view the result.';
  PERFORM net.http_post(
    url := 'https://ltgampdtawuefwwayncx.supabase.co/functions/v1/telegram-tasks-bot/harmony/notify',
    headers := jsonb_build_object('Content-Type','application/json','x-harmony-secret',webhook_secret),
    body := jsonb_build_object('telegram_id', tg_id, 'text', msg)
  );
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_harmony_generation ON public.generation_jobs;
CREATE TRIGGER trg_notify_harmony_generation
AFTER UPDATE OF status ON public.generation_jobs
FOR EACH ROW EXECUTE FUNCTION public.notify_harmony_on_generation();

CREATE OR REPLACE FUNCTION public.notify_harmony_on_research()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  tg_id BIGINT;
  webhook_secret TEXT;
BEGIN
  IF NEW.status <> 'completed' OR (OLD.status IS NOT DISTINCT FROM NEW.status) THEN
    RETURN NEW;
  END IF;
  SELECT telegram_id INTO tg_id FROM public.telegram_users WHERE user_id = NEW.user_id LIMIT 1;
  IF tg_id IS NULL THEN RETURN NEW; END IF;
  SELECT decrypted_secret INTO webhook_secret FROM vault.decrypted_secrets WHERE name = 'TELEGRAM_HARMONY_WEBHOOK_SECRET' LIMIT 1;
  IF webhook_secret IS NULL THEN RETURN NEW; END IF;
  PERFORM net.http_post(
    url := 'https://ltgampdtawuefwwayncx.supabase.co/functions/v1/telegram-tasks-bot/harmony/notify',
    headers := jsonb_build_object('Content-Type','application/json','x-harmony-secret',webhook_secret),
    body := jsonb_build_object('telegram_id', tg_id, 'text', '<b>Deep Research complete</b>' || E'\nOpen Megsy AI to read the report.')
  );
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_harmony_research ON public.research_jobs;
CREATE TRIGGER trg_notify_harmony_research
AFTER UPDATE OF status ON public.research_jobs
FOR EACH ROW EXECUTE FUNCTION public.notify_harmony_on_research();
