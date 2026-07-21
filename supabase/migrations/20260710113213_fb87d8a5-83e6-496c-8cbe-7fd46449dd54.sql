
-- 1) telegram_users
CREATE TABLE public.telegram_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id BIGINT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  language_code TEXT,
  referral_code TEXT NOT NULL UNIQUE,
  referred_by BIGINT,
  points INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_telegram_users_referral_code ON public.telegram_users(referral_code);
CREATE INDEX idx_telegram_users_referred_by ON public.telegram_users(referred_by);
CREATE INDEX idx_telegram_users_user_id ON public.telegram_users(user_id);

GRANT SELECT ON public.telegram_users TO authenticated;
GRANT ALL ON public.telegram_users TO service_role;
ALTER TABLE public.telegram_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own telegram profile"
  ON public.telegram_users FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 2) telegram_referrals
CREATE TABLE public.telegram_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_telegram_id BIGINT NOT NULL,
  referred_telegram_id BIGINT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','revoked')),
  reward_referrer INTEGER NOT NULL DEFAULT 500,
  reward_referred INTEGER NOT NULL DEFAULT 250,
  rewarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_telegram_referrals_referrer ON public.telegram_referrals(referrer_telegram_id);
CREATE INDEX idx_telegram_referrals_status ON public.telegram_referrals(status);

GRANT SELECT ON public.telegram_referrals TO authenticated;
GRANT ALL ON public.telegram_referrals TO service_role;
ALTER TABLE public.telegram_referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view referrals tied to their telegram profile"
  ON public.telegram_referrals FOR SELECT TO authenticated
  USING (
    referrer_telegram_id IN (SELECT telegram_id FROM public.telegram_users WHERE user_id = auth.uid())
    OR referred_telegram_id IN (SELECT telegram_id FROM public.telegram_users WHERE user_id = auth.uid())
  );

-- 3) telegram_tasks (public catalog)
CREATE TABLE public.telegram_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  reward_points INTEGER NOT NULL DEFAULT 100,
  action_type TEXT NOT NULL DEFAULT 'manual',
  action_payload JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.telegram_tasks TO authenticated, anon;
GRANT ALL ON public.telegram_tasks TO service_role;
ALTER TABLE public.telegram_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active telegram tasks"
  ON public.telegram_tasks FOR SELECT TO authenticated, anon
  USING (is_active = true);

-- 4) telegram_task_completions
CREATE TABLE public.telegram_task_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id BIGINT NOT NULL,
  task_id UUID NOT NULL REFERENCES public.telegram_tasks(id) ON DELETE CASCADE,
  reward_granted INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(telegram_id, task_id)
);
CREATE INDEX idx_telegram_task_completions_tg ON public.telegram_task_completions(telegram_id);

GRANT SELECT ON public.telegram_task_completions TO authenticated;
GRANT ALL ON public.telegram_task_completions TO service_role;
ALTER TABLE public.telegram_task_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their telegram task completions"
  ON public.telegram_task_completions FOR SELECT TO authenticated
  USING (
    telegram_id IN (SELECT telegram_id FROM public.telegram_users WHERE user_id = auth.uid())
  );

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_telegram_users_updated_at BEFORE UPDATE ON public.telegram_users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_telegram_referrals_updated_at BEFORE UPDATE ON public.telegram_referrals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_telegram_tasks_updated_at BEFORE UPDATE ON public.telegram_tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed default tasks
INSERT INTO public.telegram_tasks (code, title, description, reward_points, action_type, sort_order) VALUES
  ('activate_account', 'فعّل حسابك', 'ابدأ البوت واربط حسابك مع Megsy', 500, 'auto', 1),
  ('invite_first_friend', 'ادعُ أول صديق', 'شارك رابط الإحالة الخاص بك ودع صديق واحد ينضم', 500, 'auto', 2),
  ('invite_three_friends', 'ادعُ 3 أصدقاء', 'أكمل 3 إحالات صحيحة واحصل على مكافأة كبيرة', 2000, 'auto', 3),
  ('daily_checkin', 'تسجيل الحضور اليومي', 'ابعت /checkin يومياً واكسب نقاط', 50, 'manual', 4);
