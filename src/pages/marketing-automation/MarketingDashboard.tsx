/** @doc Marketing Automation dashboard — manage campaigns, accounts, AI-generated posts, and multi-platform publishing. */
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Sparkles,
  Send,
  Trash2,
  Link as LinkIcon,
  ShieldAlert,
  Wifi,
} from "lucide-react";

type PlatformMeta = {
  id: string;
  label: string;
  enabled: boolean;
  requiresApproval: boolean;
  credentialFields: {
    key: string;
    label: string;
    secret: boolean;
    required: boolean;
    help?: string;
  }[];
  limits: {
    perMinute: number;
    perHour: number;
    perDay: number;
    maxLength: number;
    minIntervalSeconds: number;
    supportsMedia: boolean;
  };
  notes?: string;
};

type Campaign = {
  id: string;
  name: string;
  goal: string | null;
  tone: string | null;
  target_audience: string | null;
  languages: string[] | null;
  hashtags: string[] | null;
  ai_model: string | null;
  topics: string[] | null;
  active: boolean;
};

type Account = {
  id: string;
  campaign_id: string | null;
  platform: string;
  handle: string | null;
  display_name: string | null;
  status: string;
  enabled?: boolean;
  last_test_ok?: boolean | null;
  last_test_error?: string | null;
};

type Post = {
  id: string;
  campaign_id: string | null;
  title: string | null;
  content: string;
  status: string;
  platform_variants: Record<string, string>;
  target_platforms: string[] | null;
  scheduled_at: string | null;
  published_at: string | null;
  created_at: string;
};

type PublishLog = {
  id: string;
  post_id: string | null;
  account_id: string | null;
  platform: string;
  success: boolean;
  external_url: string | null;
  error: string | null;
  created_at: string;
};

type QueueItem = {
  id: string;
  post_id: string;
  account_id: string;
  platform: string;
  status: string;
  attempts: number;
  scheduled_at: string;
  next_attempt_at: string;
  last_error: string | null;
  external_url: string | null;
};

const ALL_PLATFORMS = [
  { id: "telegram", label: "Telegram" },
  { id: "bluesky", label: "Bluesky" },
  { id: "mastodon", label: "Mastodon" },
  { id: "devto", label: "Dev.to" },
  { id: "hashnode", label: "Hashnode" },
  { id: "wordpress", label: "WordPress" },
  { id: "ghost", label: "Ghost" },
  { id: "pinterest", label: "Pinterest" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "tiktok", label: "TikTok" },
  { id: "facebook", label: "Facebook" },
  { id: "instagram", label: "Instagram" },
  { id: "threads", label: "Threads" },
  { id: "youtube", label: "YouTube" },
  { id: "twitter", label: "X / Twitter" },
];

export default function MarketingDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [logs, setLogs] = useState<PublishLog[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [platforms, setPlatforms] = useState<PlatformMeta[]>([]);
  const [activeCampaignId, setActiveCampaignId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  const [newCampaign, setNewCampaign] = useState({
    name: "",
    goal: "",
    tone: "professional",
    target_audience: "",
    hashtags: "",
    ai_model: "qwen-max",
  });

  const [newAccount, setNewAccount] = useState({
    platform: "telegram",
    handle: "",
    display_name: "",
    credentials: "{}",
  });

  const [genForm, setGenForm] = useState({
    topic: "",
    language: "ar",
    platforms: [] as string[],
  });

  const activeCampaign = useMemo(
    () => campaigns.find((c) => c.id === activeCampaignId) || null,
    [campaigns, activeCampaignId],
  );

  async function load() {
    setLoading(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) {
      setLoading(false);
      return;
    }
    const [{ data: c }, { data: a }, { data: p }, { data: l }, { data: q }] = await Promise.all([
      supabase.from("marketing_campaigns").select("*").order("created_at", { ascending: false }),
      supabase.from("marketing_accounts").select("*").order("created_at", { ascending: false }),
      supabase
        .from("marketing_posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("marketing_publish_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("marketing_publish_queue")
        .select("*")
        .order("scheduled_at", { ascending: false })
        .limit(50),
    ]);
    setCampaigns((c as Campaign[]) || []);
    setAccounts((a as Account[]) || []);
    setPosts((p as Post[]) || []);
    setLogs((l as PublishLog[]) || []);
    setQueue((q as QueueItem[]) || []);
    if (!activeCampaignId && c && c.length) setActiveCampaignId(c[0].id);
    setLoading(false);
  }

  async function loadPlatforms() {
    try {
      const { data } = await supabase.functions.invoke("marketing-publisher", {
        body: { action: "platforms" },
      });
      if ((data as any)?.platforms) setPlatforms((data as any).platforms);
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    load();
    loadPlatforms();
  }, []);

  async function createCampaign() {
    if (!newCampaign.name.trim()) return toast.error("Enter a campaign name");
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return toast.error("Sign in first");
    const { error, data } = await supabase
      .from("marketing_campaigns")
      .insert({
        user_id: u.user.id,
        name: newCampaign.name.trim(),
        goal: newCampaign.goal || null,
        tone: newCampaign.tone,
        target_audience: newCampaign.target_audience || null,
        hashtags: newCampaign.hashtags
          .split(/[\s,]+/)
          .map((s) => s.trim())
          .filter(Boolean),
        ai_model: newCampaign.ai_model,
      })
      .select("id")
      .single();
    if (error) return toast.error(error.message);
    toast.success("Campaign created");
    setNewCampaign({
      name: "",
      goal: "",
      tone: "professional",
      target_audience: "",
      hashtags: "",
      ai_model: "qwen-max",
    });
    if (data?.id) setActiveCampaignId(data.id);
    load();
  }

  async function deleteCampaign(id: string) {
    if (!confirm("Delete this campaign and all its data?")) return;
    const { error } = await supabase.from("marketing_campaigns").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  }

  async function addAccount() {
    if (!activeCampaignId) return toast.error("Choose a campaign first");
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return;
    let creds: any = {};
    try {
      creds = JSON.parse(newAccount.credentials || "{}");
    } catch {
      return toast.error("Credentials must be valid JSON");
    }
    const { error } = await supabase.from("marketing_accounts").insert({
      user_id: u.user.id,
      campaign_id: activeCampaignId,
      platform: newAccount.platform,
      handle: newAccount.handle || null,
      display_name: newAccount.display_name || null,
      credentials: creds,
    });
    if (error) return toast.error(error.message);
    toast.success("Account connected");
    setNewAccount({ platform: "telegram", handle: "", display_name: "", credentials: "{}" });
    load();
  }

  async function deleteAccount(id: string) {
    await supabase.from("marketing_accounts").delete().eq("id", id);
    load();
  }

  async function testAccount(id: string) {
    setTestingId(id);
    try {
      const { data, error } = await supabase.functions.invoke("marketing-publisher", {
        body: { action: "test-account", account_id: id },
      });
      if (error) throw error;
      if ((data as any)?.ok) toast.success("Connection works ✅");
      else toast.error((data as any)?.error || "Connection test failed");
      load();
    } catch (e: any) {
      toast.error(e?.message || "Failed");
    } finally {
      setTestingId(null);
    }
  }

  async function publishNow(postId: string, accountId: string) {
    setPublishingId(`${postId}:${accountId}`);
    try {
      const { data, error } = await supabase.functions.invoke("marketing-publisher", {
        body: { action: "publish-post", post_id: postId, account_id: accountId },
      });
      if (error) throw error;
      if ((data as any)?.success) {
        toast.success("Published ✅");
        if ((data as any).external_url) window.open((data as any).external_url, "_blank");
      } else {
        toast.error((data as any)?.error || "Publish failed");
      }
      load();
    } catch (e: any) {
      toast.error(e?.message || "Failed");
    } finally {
      setPublishingId(null);
    }
  }

  async function toggleAccountEnabled(acc: Account) {
    await supabase
      .from("marketing_accounts")
      .update({ enabled: !(acc.enabled ?? true) })
      .eq("id", acc.id);
    load();
  }

  async function toggleCampaignActive(c: Campaign) {
    await supabase.from("marketing_campaigns").update({ active: !c.active }).eq("id", c.id);
    load();
  }

  function buildUtmLink(base: string, source: string) {
    try {
      const url = new URL(base);
      url.searchParams.set("utm_source", source);
      url.searchParams.set("utm_medium", "social");
      url.searchParams.set(
        "utm_campaign",
        activeCampaign?.name?.replace(/\s+/g, "_") || "marketing",
      );
      return url.toString();
    } catch {
      return base;
    }
  }

  async function generatePost() {
    if (!activeCampaignId) return toast.error("Choose a campaign");
    if (!genForm.topic.trim()) return toast.error("Enter a post topic");
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("marketing-generate-content", {
        body: {
          campaign_id: activeCampaignId,
          topic: genForm.topic.trim(),
          language: genForm.language,
          platforms: genForm.platforms.length ? genForm.platforms : undefined,
          save: true,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast.success("Post generated ✨");
      setGenForm({ ...genForm, topic: "" });
      load();
    } catch (e: any) {
      toast.error(e?.message || "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  function togglePlatform(p: string) {
    setGenForm((f) => ({
      ...f,
      platforms: f.platforms.includes(p) ? f.platforms.filter((x) => x !== p) : [...f.platforms, p],
    }));
  }

  const campaignAccounts = accounts.filter((a) => a.campaign_id === activeCampaignId);
  const campaignPosts = posts.filter((p) => p.campaign_id === activeCampaignId);

  const selectedMeta = platforms.find((p) => p.id === newAccount.platform);
  const platformOptions = platforms.length
    ? platforms.map((p) => ({ id: p.id, label: p.label + (p.enabled ? "" : " (approval)") }))
    : ALL_PLATFORMS;

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary" /> Marketing Automation
          </h1>
          <p className="text-muted-foreground">Run your campaigns across every platform from one place</p>
        </div>
        {campaigns.length > 0 && (
          <Select value={activeCampaignId} onValueChange={setActiveCampaignId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Choose a campaign" />
            </SelectTrigger>
            <SelectContent>
              {campaigns.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <Card className="border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20">
        <CardContent className="p-3 flex gap-2 items-start text-xs">
          <ShieldAlert className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <p>
            Posts only go to accounts/channels you own and connect yourself via official API/OAuth. The system
            respects each platform's rate limits and ToS, and does not support mass-account abuse or trend manipulation.
            You are responsible for complying with the policies of every platform you publish to.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="generate">Generate content</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="queue">
            Queue (
            {queue.filter((q) => ["queued", "retrying", "publishing"].includes(q.status)).length})
          </TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        {/* CAMPAIGNS */}
        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> New campaign
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-3">
              <Input
                placeholder="Campaign name"
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
              />
              <Input
                placeholder="Goal"
                value={newCampaign.goal}
                onChange={(e) => setNewCampaign({ ...newCampaign, goal: e.target.value })}
              />
              <Input
                placeholder="Target audience"
                value={newCampaign.target_audience}
                onChange={(e) =>
                  setNewCampaign({ ...newCampaign, target_audience: e.target.value })
                }
              />
              <Input
                placeholder="Hashtags (space-separated)"
                value={newCampaign.hashtags}
                onChange={(e) => setNewCampaign({ ...newCampaign, hashtags: e.target.value })}
              />
              <Select
                value={newCampaign.tone}
                onValueChange={(v) => setNewCampaign({ ...newCampaign, tone: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="funny">Funny</SelectItem>
                  <SelectItem value="inspiring">Inspiring</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={newCampaign.ai_model}
                onValueChange={(v) => setNewCampaign({ ...newCampaign, ai_model: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="qwen-max">qwen-max (best quality)</SelectItem>
                  <SelectItem value="qwen-plus">qwen-plus (balanced)</SelectItem>
                  <SelectItem value="qwen-turbo">qwen-turbo (fastest)</SelectItem>
                </SelectContent>
              </Select>
              <Button className="md:col-span-2" onClick={createCampaign}>
                Create
              </Button>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-3">
            {campaigns.map((c) => (
              <Card key={c.id} className={c.id === activeCampaignId ? "border-primary" : ""}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">{c.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => toggleCampaignActive(c)}>
                      {c.active ? "Pause" : "Start"}
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteCampaign(c.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {c.goal && <p className="text-muted-foreground">{c.goal}</p>}
                  <div className="flex flex-wrap gap-1">
                    {(c.hashtags || []).map((h) => (
                      <Badge key={h} variant="secondary">
                        {h}
                      </Badge>
                    ))}
                  </div>
                  <Badge variant={c.active ? "default" : "outline"}>
                    {c.active ? "Active" : "Paused"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
            {!loading && !campaigns.length && (
              <p className="text-muted-foreground">No campaigns yet.</p>
            )}
          </div>
        </TabsContent>

        {/* ACCOUNTS */}
        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" /> Connect new account
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-3">
              <Select
                value={newAccount.platform}
                onValueChange={(v) => {
                  const meta = platforms.find((p) => p.id === v);
                  const tmpl = meta
                    ? Object.fromEntries(meta.credentialFields.map((f) => [f.key, ""]))
                    : {};
                  setNewAccount({
                    ...newAccount,
                    platform: v,
                    credentials: JSON.stringify(tmpl, null, 2),
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {platformOptions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Handle / Username"
                value={newAccount.handle}
                onChange={(e) => setNewAccount({ ...newAccount, handle: e.target.value })}
              />
              <Input
                placeholder="Display name"
                className="md:col-span-2"
                value={newAccount.display_name}
                onChange={(e) => setNewAccount({ ...newAccount, display_name: e.target.value })}
              />
              {selectedMeta && (
                <div className="md:col-span-2 text-xs space-y-1 bg-muted/40 rounded p-2">
                  <p className="font-semibold">Required fields for {selectedMeta.label}:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {selectedMeta.credentialFields.map((f) => (
                      <li key={f.key}>
                        <code>{f.key}</code> — {f.label}
                        {f.required ? " *" : ""}{" "}
                        {f.secret && (
                          <Badge variant="outline" className="ml-1">
                            secret
                          </Badge>
                        )}
                        {f.help && <span className="text-muted-foreground"> ({f.help})</span>}
                      </li>
                    ))}
                  </ul>
                  {!selectedMeta.enabled && (
                    <p className="text-amber-700 dark:text-amber-400">
                      ⚠ Adapter disabled by default — needs platform approval. {selectedMeta.notes}
                    </p>
                  )}
                </div>
              )}
              <Textarea
                placeholder="Credentials (JSON)"
                className="md:col-span-2 font-mono text-xs"
                value={newAccount.credentials}
                onChange={(e) => setNewAccount({ ...newAccount, credentials: e.target.value })}
                rows={6}
              />
              <Button className="md:col-span-2" onClick={addAccount} disabled={!activeCampaignId}>
                Connect account
              </Button>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {campaignAccounts.map((a) => (
              <Card key={a.id}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge>{a.platform}</Badge>
                      <p className="font-semibold mt-2">{a.display_name || a.handle || "—"}</p>
                      {a.handle && <p className="text-xs text-muted-foreground">@{a.handle}</p>}
                      <div className="flex gap-1 mt-1">
                        <Badge
                          variant={a.enabled === false ? "outline" : "default"}
                          className="text-xs"
                        >
                          {a.enabled === false ? "Disabled" : "Enabled"}
                        </Badge>
                        {a.last_test_ok === true && (
                          <Badge variant="secondary" className="text-xs">
                            ✓ Connected
                          </Badge>
                        )}
                        {a.last_test_ok === false && (
                          <Badge variant="destructive" className="text-xs">
                            ✗ Error
                          </Badge>
                        )}
                      </div>
                      {a.last_test_error && (
                        <p className="text-xs text-destructive mt-1">{a.last_test_error}</p>
                      )}
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => deleteAccount(a.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testAccount(a.id)}
                      disabled={testingId === a.id}
                    >
                      {testingId === a.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Wifi className="h-3 w-3 mr-1" />
                      )}
                      Test
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => toggleAccountEnabled(a)}>
                      {a.enabled === false ? "Enable" : "Disable"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {!campaignAccounts.length && (
              <p className="text-muted-foreground">No accounts connected to this campaign.</p>
            )}
          </div>
        </TabsContent>

        {/* GENERATE */}
        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Generate a post with Qwen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Post topic (e.g. Launching a new feature, tip of the day…)"
                value={genForm.topic}
                onChange={(e) => setGenForm({ ...genForm, topic: e.target.value })}
                rows={3}
              />
              <div className="grid md:grid-cols-2 gap-3">
                <Select
                  value={genForm.language}
                  onValueChange={(v) => setGenForm({ ...genForm, language: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">Arabic</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground self-center">
                  Platforms: if you leave this empty, all accounts on the campaign are used.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {ALL_PLATFORMS.map((p) => (
                  <Badge
                    key={p.id}
                    variant={genForm.platforms.includes(p.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => togglePlatform(p.id)}
                  >
                    {p.label}
                  </Badge>
                ))}
              </div>
              <Button
                onClick={generatePost}
                disabled={generating || !activeCampaignId}
                className="w-full"
              >
                {generating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Generate post
              </Button>
              {activeCampaign && (
                <p className="text-xs text-muted-foreground">
                  Model: {activeCampaign.ai_model} · UTM for links:{" "}
                  {buildUtmLink("https://megsyai.com", "platform")}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* POSTS */}
        <TabsContent value="posts" className="space-y-3">
          {campaignPosts.map((p) => (
            <Card key={p.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">{p.title || "Untitled"}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {new Date(p.created_at).toLocaleString("en")}
                  </p>
                </div>
                <Badge
                  variant={
                    p.status === "published"
                      ? "default"
                      : p.status === "failed"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {p.status}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm whitespace-pre-wrap">{p.content}</p>
                {campaignAccounts.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t">
                    {campaignAccounts
                      .filter((a) => a.enabled !== false)
                      .map((a) => {
                        const key = `${p.id}:${a.id}`;
                        return (
                          <Button
                            key={a.id}
                            size="sm"
                            variant="outline"
                            onClick={() => publishNow(p.id, a.id)}
                            disabled={publishingId === key}
                          >
                            {publishingId === key ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                              <Send className="h-3 w-3 mr-1" />
                            )}
                            Publish to {a.platform} {a.handle ? `(@${a.handle})` : ""}
                          </Button>
                        );
                      })}
                  </div>
                )}
                {p.platform_variants && Object.keys(p.platform_variants).length > 0 && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground">
                      Platform variants ({Object.keys(p.platform_variants).length})
                    </summary>
                    <div className="space-y-2 mt-2">
                      {Object.entries(p.platform_variants).map(([plat, text]) => (
                        <div key={plat} className="border rounded p-2">
                          <Badge variant="outline" className="mb-1">
                            {plat}
                          </Badge>
                          <p className="whitespace-pre-wrap">{String(text)}</p>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </CardContent>
            </Card>
          ))}
          {!campaignPosts.length && (
            <p className="text-muted-foreground">
              No posts yet. Generate the first one from the "Generate content" tab.
            </p>
          )}
        </TabsContent>

        {/* QUEUE */}
        <TabsContent value="queue" className="space-y-2">
          {queue.length === 0 && <p className="text-muted-foreground">Queue is empty.</p>}
          {queue.map((q) => (
            <Card key={q.id}>
              <CardContent className="p-3 flex items-center justify-between text-sm">
                <div>
                  <Badge>{q.platform}</Badge>{" "}
                  <Badge
                    variant={
                      q.status === "published"
                        ? "default"
                        : q.status === "failed"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {q.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    Attempts: {q.attempts} · Next:{" "}
                    {new Date(q.next_attempt_at).toLocaleString("ar")}
                  </p>
                  {q.last_error && <p className="text-xs text-destructive">{q.last_error}</p>}
                </div>
                {q.external_url && (
                  <a
                    href={q.external_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs underline"
                  >
                    Open
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* LOGS */}
        <TabsContent value="logs" className="space-y-2">
          {logs.length === 0 && <p className="text-muted-foreground">No publish logs yet.</p>}
          {logs.map((l) => (
            <Card key={l.id}>
              <CardContent className="p-3 flex items-center justify-between text-sm">
                <div>
                  <Badge>{l.platform}</Badge>{" "}
                  <Badge variant={l.success ? "default" : "destructive"}>
                    {l.success ? "Success" : "Failed"}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(l.created_at).toLocaleString("ar")}
                  </p>
                  {l.error && <p className="text-xs text-destructive">{l.error}</p>}
                </div>
                {l.external_url && (
                  <a
                    href={l.external_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs underline"
                  >
                    Open
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
