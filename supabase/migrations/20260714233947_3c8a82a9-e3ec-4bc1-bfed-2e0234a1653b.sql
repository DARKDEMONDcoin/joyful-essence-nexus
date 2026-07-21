ALTER TABLE public.user_memory_entries
  ADD COLUMN IF NOT EXISTS slot_type text,
  ADD COLUMN IF NOT EXISTS slot_key text,
  ADD COLUMN IF NOT EXISTS slot_value jsonb;

CREATE INDEX IF NOT EXISTS idx_user_memory_entries_user_slot
  ON public.user_memory_entries (user_id, slot_type)
  WHERE slot_type IS NOT NULL;

COMMENT ON COLUMN public.user_memory_entries.slot_type IS 'Typed slot: name | profession | project | preference | key_date | fact';
COMMENT ON COLUMN public.user_memory_entries.slot_key   IS 'Optional sub-key inside the slot (e.g. project name, preference topic)';
COMMENT ON COLUMN public.user_memory_entries.slot_value IS 'Structured JSON payload for the slot';