GRANT SELECT, INSERT, UPDATE, DELETE ON public.pipedream_accounts TO authenticated;
GRANT ALL ON public.pipedream_accounts TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pipedream_tool_settings TO authenticated;
GRANT ALL ON public.pipedream_tool_settings TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_connector_state TO authenticated;
GRANT ALL ON public.user_connector_state TO service_role;

GRANT SELECT, DELETE ON public.user_github_connections TO authenticated;
GRANT ALL ON public.user_github_connections TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_supabase_connections TO authenticated;
GRANT ALL ON public.user_supabase_connections TO service_role;

GRANT ALL ON public.github_oauth_states TO service_role;
GRANT SELECT ON public.github_oauth_states TO authenticated;

GRANT ALL ON public.supabase_oauth_states TO service_role;
GRANT SELECT ON public.supabase_oauth_states TO authenticated;

GRANT SELECT ON public.composio_connections TO authenticated;
GRANT ALL ON public.composio_connections TO service_role;

GRANT SELECT ON public.composio_auth_configs TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.composio_auth_configs TO service_role;