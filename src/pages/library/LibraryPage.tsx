/** @doc Library — all images, videos, and files (docs, slides, deep research) generated across the user's conversations, in one place. */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, FileText, ExternalLink, ImageIcon, Film, Files, Presentation, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getUserSafe } from "@/lib/authSafe";
import MobilePushShell from "@/components/layout/MobilePushShell";
import { MobileSidebarButton } from "@/components/shared/MobileSidebarButton";

type MediaItem = {
  id: string;
  url: string;
  type: "image" | "video";
  conversationId: string;
  conversationTitle: string;
  createdAt: string;
};

type FileKind = "document" | "slides" | "research";

type DocItem = {
  id: string;
  artifactId: string;
  title: string;
  docType: string;
  kind: FileKind;
  openHref?: string;
  conversationId: string;
  conversationTitle: string;
  createdAt: string;
};

const MESSAGE_CHUNK_SIZE = 45;
const INITIAL_LIMIT = 5;

type ConversationInfo = {
  title: string;
  mode?: string | null;
};

function pushMedia(
  target: MediaItem[],
  seen: Set<string>,
  item: Omit<MediaItem, "id">,
  idSeed: string,
) {
  if (!item.url || seen.has(item.url)) return;
  seen.add(item.url);
  target.push({ ...item, id: `${idSeed}:${target.length}` });
}

function isExpiredSignedUrl(url: string) {
  try {
    const parsed = new URL(url);
    const expires = parsed.searchParams.get("Expires");
    if (expires && Number(expires) * 1000 < Date.now()) return true;

    const amzDate = parsed.searchParams.get("X-Amz-Date");
    const amzExpires = parsed.searchParams.get("X-Amz-Expires");
    if (amzDate && amzExpires) {
      const match = amzDate.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
      if (match) {
        const [, y, mo, d, h, mi, s] = match;
        const issuedAt = Date.UTC(+y, +mo - 1, +d, +h, +mi, +s);
        if (issuedAt + Number(amzExpires) * 1000 < Date.now()) return true;
      }
    }
  } catch {
    return false;
  }
  return false;
}

function isMediaStudioUrl(url: string) {
  return url.includes("/storage/v1/object/public/media-studio/") ||
    url.includes("/storage/v1/object/sign/media-studio/");
}

function isValidHttpMediaUrl(u: unknown): u is string {
  if (typeof u !== "string" || !u) return false;
  const s = u.trim();
  if (!/^https?:\/\//i.test(s)) return false;
  return isMediaStudioUrl(s) || !isExpiredSignedUrl(s);
}

function isValidGeneratedImageUrl(u: unknown): u is string {
  if (typeof u !== "string" || !u) return false;
  const s = u.trim();
  return /^data:image\//i.test(s) || isValidHttpMediaUrl(s);
}

function getDoneMediaResults(meta: any, type: "image" | "video") {
  return Array.isArray(meta?.mediaResults)
    ? meta.mediaResults.filter(
        (r: any) =>
          r?.type === type &&
          r?.status === "done" &&
          (type === "image" ? isValidGeneratedImageUrl(r?.url) : isValidHttpMediaUrl(r?.url)),
      )
    : [];
}

function getImageStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter(isValidGeneratedImageUrl) : [];
}

function getVideoStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter(isValidHttpMediaUrl) : [];
}

function mediaStudioPathFromUrl(url: string) {
  try {
    const parsed = new URL(url);
    const publicMarker = "/storage/v1/object/public/media-studio/";
    const signedMarker = "/storage/v1/object/sign/media-studio/";
    const marker = parsed.pathname.includes(publicMarker) ? publicMarker : signedMarker;
    const [, path] = parsed.pathname.split(marker);
    return path ? decodeURIComponent(path) : null;
  } catch {
    return null;
  }
}

async function resolveLibraryMediaItems(items: MediaItem[]) {
  const cache = new Map<string, string | null>();
  const resolved = await Promise.all(
    items.map(async (item) => {
      if (!isMediaStudioUrl(item.url)) return item;
      const path = mediaStudioPathFromUrl(item.url);
      if (!path) return null;
      if (!cache.has(path)) {
        const { data, error } = await supabase.storage
          .from("media-studio")
          .createSignedUrl(path, 60 * 60 * 24);
        cache.set(path, error ? null : data?.signedUrl || null);
      }
      const signedUrl = cache.get(path);
      return signedUrl ? { ...item, url: signedUrl } : null;
    }),
  );
  return resolved.filter(Boolean) as MediaItem[];
}

function isGeneratedImageMessage(meta: any, conversationMode?: string | null) {
  return (
    conversationMode === "images" ||
    meta?.mode === "images" ||
    meta?.kind === "mediaPlan" ||
    meta?.mediaPlan?.mode === "images"
  );
}

function isGeneratedVideoMessage(meta: any, conversationMode?: string | null) {
  return (
    conversationMode === "videos" ||
    conversationMode === "video" ||
    meta?.mode === "video" ||
    meta?.mediaPlan?.mode === "video"
  );
}

function pushDoc(
  target: DocItem[],
  seen: Set<string>,
  item: Omit<DocItem, "id">,
  idSeed: string,
) {
  if (!item.artifactId || seen.has(item.artifactId)) return;
  seen.add(item.artifactId);
  target.push({ ...item, id: `${idSeed}:${target.length}` });
}

export default function LibraryPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<MediaItem[]>([]);
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAllImages, setShowAllImages] = useState(false);
  const [showAllVideos, setShowAllVideos] = useState(false);
  const [showAllDocs, setShowAllDocs] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const user = await getUserSafe();
      if (!user) {
        if (!cancelled) setLoading(false);
        return;
      }

      const { data: convs } = await supabase
        .from("conversations")
        .select("id, title, mode")
        .eq("user_id", user.id);

      const convIds = (convs || []).map((c: any) => c.id);
      const conversationMap = new Map<string, ConversationInfo>(
        (convs || []).map((c: any) => [
          c.id,
          { title: c.title || "Untitled conversation", mode: c.mode },
        ]),
      );
      if (convIds.length === 0) {
        if (!cancelled) {
          setImages([]);
          setVideos([]);
          setDocs([]);
          setLoading(false);
        }
        return;
      }

      const rows: any[] = [];
      const seenMessageIds = new Set<string>();
      for (let i = 0; i < convIds.length; i += MESSAGE_CHUNK_SIZE) {
        const chunk = convIds.slice(i, i + MESSAGE_CHUNK_SIZE);
        const { data } = await supabase
          .from("messages")
          .select("id, conversation_id, created_at, images, metadata")
          .in("conversation_id", chunk)
          .eq("role", "assistant")
          .order("created_at", { ascending: false })
          .limit(1000);
        for (const row of data || []) {
          if (!seenMessageIds.has(row.id)) {
            seenMessageIds.add(row.id);
            rows.push(row);
          }
        }
      }
      rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      const imgs: MediaItem[] = [];
      const vids: MediaItem[] = [];
      const documents: DocItem[] = [];
      const seenImages = new Set<string>();
      const seenVideos = new Set<string>();
      const seenDocs = new Set<string>();

      for (const r of rows) {
        const conversation = conversationMap.get(r.conversation_id);
        const convTitle = conversation?.title || "Conversation";
        const meta = (r.metadata || {}) as any;

        if (isGeneratedImageMessage(meta, conversation?.mode)) {
          getImageStringArray(r.images).forEach((u, i) => {
            pushMedia(imgs, seenImages, {
              url: u,
              type: "image",
              conversationId: r.conversation_id,
              conversationTitle: convTitle,
              createdAt: r.created_at,
            }, `${r.id}:i:${i}`);
          });
        }

        getDoneMediaResults(meta, "image").forEach((result: any, i: number) => {
          pushMedia(imgs, seenImages, {
            url: result.url,
            type: "image",
            conversationId: r.conversation_id,
            conversationTitle: convTitle,
            createdAt: r.created_at,
          }, `${r.id}:mr-i:${i}`);
        });

        if (isGeneratedVideoMessage(meta, conversation?.mode)) {
          getVideoStringArray(meta.videos).forEach((u, i) => {
            pushMedia(vids, seenVideos, {
              url: u,
              type: "video",
              conversationId: r.conversation_id,
              conversationTitle: convTitle,
              createdAt: r.created_at,
            }, `${r.id}:v:${i}`);
          });
        }
        getDoneMediaResults(meta, "video").forEach((result: any, i: number) => {
          pushMedia(vids, seenVideos, {
            url: result.url,
            type: "video",
            conversationId: r.conversation_id,
            conversationTitle: convTitle,
            createdAt: r.created_at,
          }, `${r.id}:mr-v:${i}`);
        });
        if (isValidHttpMediaUrl(meta.mediaFinalVideoUrl)) {
          pushMedia(vids, seenVideos, {
            url: meta.mediaFinalVideoUrl,
            type: "video",
            conversationId: r.conversation_id,
            conversationTitle: convTitle,
            createdAt: r.created_at,
          }, `${r.id}:vf`);
        }

        if (meta.docsArtifact?.artifactId) {
          pushDoc(documents, seenDocs, {
            artifactId: meta.docsArtifact.artifactId,
            title: meta.docsArtifact.title || "Document",
            docType: meta.docsArtifact.docType || "document",
            kind: "document",
            conversationId: r.conversation_id,
            conversationTitle: convTitle,
            createdAt: r.created_at,
          }, `${r.id}:d`);
        }
        if (meta.slidesDeck) {
          pushDoc(documents, seenDocs, {
            artifactId: `slides:${r.id}`,
            title: meta.slidesDeck.title || "Slides deck",
            docType: "slides",
            kind: "slides",
            conversationId: r.conversation_id,
            conversationTitle: convTitle,
            createdAt: r.created_at,
          }, `${r.id}:slides`);
        }
        if (meta.standardSlides?.url) {
          pushDoc(documents, seenDocs, {
            artifactId: meta.standardSlides.url,
            title: meta.standardSlides.title || "Slides deck",
            docType: "slides",
            kind: "slides",
            openHref: meta.standardSlides.url,
            conversationId: r.conversation_id,
            conversationTitle: convTitle,
            createdAt: r.created_at,
          }, `${r.id}:standard-slides`);
        }
        if (meta.imageSlides?.url) {
          pushDoc(documents, seenDocs, {
            artifactId: meta.imageSlides.url,
            title: meta.imageSlides.title || "Image slides",
            docType: "slides",
            kind: "slides",
            openHref: meta.imageSlides.url,
            conversationId: r.conversation_id,
            conversationTitle: convTitle,
            createdAt: r.created_at,
          }, `${r.id}:image-slides`);
        }
      }

      // Deep research reports live in their own table.
      const { data: reports } = await supabase
        .from("research_reports")
        .select("id, session_key, query, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(200);

      for (const rep of reports || []) {
        const sk: string = rep.session_key || "";
        const convMatch = sk.match(/^conv_([0-9a-f-]{36})_/i);
        const convId = convMatch?.[1] || "";
        const convTitle = (convId && conversationMap.get(convId)?.title) || "Deep research";
        pushDoc(documents, seenDocs, {
          artifactId: `research:${rep.id}`,
          title: rep.query || "Deep research",
          docType: "research",
          kind: "research",
          openHref: `/research/preview/${sk || rep.id}`,
          conversationId: convId,
          conversationTitle: convTitle,
          createdAt: rep.created_at,
        }, `${rep.id}:research`);
      }

      documents.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );


      if (!cancelled) {
        setImages(await resolveLibraryMediaItems(imgs));
        setVideos(await resolveLibraryMediaItems(vids));
        setDocs(documents);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openConversation = (id: string) => navigate(`/chat?c=${id}`);

  return (
    <MobilePushShell
      open={sidebarOpen}
      onOpenChange={setSidebarOpen}
      onNewChat={() => navigate("/")}
      currentMode="chat"
    >
      <div className="min-h-[100dvh] w-full bg-black font-body text-brand-parchment">
        {/* Header */}
        <header className="sticky top-0 z-nav border-b border-white/10 bg-black/95 backdrop-blur-3xl">

          <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-3 px-4 safe-top">
            <MobileSidebarButton onClick={() => setSidebarOpen(true)} />
            <h1 className="text-[17px] font-semibold tracking-tight">Library</h1>

          </div>
        </header>

        {/* Body */}
        <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-4 safe-bottom">
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square animate-pulse rounded-ios-lg bg-surface-2"
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              <Section title="Images" icon={ImageIcon} count={images.length}>
                {images.length > 0 ? (
                  <>
                    <MediaGrid
                      items={showAllImages ? images : images.slice(0, INITIAL_LIMIT)}
                      kind="image"
                      onOpenChat={openConversation}
                    />
                    {images.length > INITIAL_LIMIT && (
                      <ShowMoreButton
                        expanded={showAllImages}
                        remaining={images.length - INITIAL_LIMIT}
                        onToggle={() => setShowAllImages((v) => !v)}
                      />
                    )}
                  </>
                ) : (
                  <InlineEmpty label="No images yet." />
                )}
              </Section>
              <Section title="Videos" icon={Film} count={videos.length}>
                {videos.length > 0 ? (
                  <>
                    <MediaGrid
                      items={showAllVideos ? videos : videos.slice(0, INITIAL_LIMIT)}
                      kind="video"
                      onOpenChat={openConversation}
                    />
                    {videos.length > INITIAL_LIMIT && (
                      <ShowMoreButton
                        expanded={showAllVideos}
                        remaining={videos.length - INITIAL_LIMIT}
                        onToggle={() => setShowAllVideos((v) => !v)}
                      />
                    )}
                  </>
                ) : (
                  <InlineEmpty label="No videos yet." />
                )}
              </Section>
              <Section title="Files" icon={Files} count={docs.length}>
                {docs.length > 0 ? (
                  <>
                    <DocsList
                      items={showAllDocs ? docs : docs.slice(0, INITIAL_LIMIT)}
                      onOpenChat={openConversation}
                    />
                    {docs.length > INITIAL_LIMIT && (
                      <ShowMoreButton
                        expanded={showAllDocs}
                        remaining={docs.length - INITIAL_LIMIT}
                        onToggle={() => setShowAllDocs((v) => !v)}
                      />
                    )}
                  </>
                ) : (
                  <InlineEmpty label="No files yet." />
                )}
              </Section>
            </div>
          )}
        </main>
      </div>
    </MobilePushShell>
  );
}

function InlineEmpty({ label }: { label: string }) {
  return (
    <div className="rounded-ios-lg border border-dashed border-surface-4 bg-surface-2/40 p-6 text-center text-[12px] text-brand-muted">
      {label}
    </div>
  );
}

function ShowMoreButton({
  expanded,
  remaining,
  onToggle,
}: {
  expanded: boolean;
  remaining: number;
  onToggle: () => void;
}) {
  return (
    <div className="mt-3 flex justify-center">
      <button
        onClick={onToggle}
        className="rounded-full border border-surface-4 bg-surface-2 px-4 py-1.5 text-[12px] font-medium text-brand-parchment hover:bg-surface-3 hover:border-brand-action/40 transition"
      >
        {expanded ? "Show less" : `Show ${remaining} more`}
      </button>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  count,
  children,
}: {
  title: string;
  icon: typeof ImageIcon;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2 text-brand-muted">
        <Icon className="h-4 w-4" />
        <h2 className="text-[13px] font-semibold uppercase tracking-wide">{title}</h2>
        {typeof count === "number" && (
          <span className="ml-auto rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-brand-parchment">
            {count}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function MediaGrid({
  items,
  kind,
  onOpenChat,
}: {
  items: MediaItem[];
  kind: "image" | "video";
  onOpenChat: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {items.map((it) => (
        <div
          key={it.id}
          className="group relative overflow-hidden rounded-ios-lg border border-surface-4 bg-surface-2 transition hover:-translate-y-0.5 hover:border-surface-4/80 hover:shadow-lg"
        >
          <div className="relative aspect-square w-full bg-surface-1">
            {kind === "image" ? (
              <img
                src={it.url}
                alt={it.conversationTitle}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <video
                src={it.url}
                className="h-full w-full object-cover"
                muted
                playsInline
                preload="metadata"
                controls
              />
            )}
          </div>
          <div className="flex items-center justify-between gap-2 p-2.5">
            <button
              onClick={() => onOpenChat(it.conversationId)}
              className="min-w-0 flex-1 truncate text-left text-[12px] font-medium text-brand-parchment hover:text-brand-action transition"
              title={it.conversationTitle}
            >
              {it.conversationTitle}
            </button>
            <a
              href={it.url}
              target="_blank"
              rel="noreferrer"
              download
              className="grid h-7 w-7 place-items-center rounded-full bg-surface-3 text-brand-parchment hover:bg-brand-action hover:text-white transition"
              aria-label="Download"
            >
              <Download className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

function DocsList({
  items,
  onOpenChat,
}: {
  items: DocItem[];
  onOpenChat: (id: string) => void;
}) {
  const navigate = useNavigate();
  const iconFor = (kind: FileKind) =>
    kind === "slides" ? Presentation : kind === "research" ? Search : FileText;
  const labelFor = (kind: FileKind) =>
    kind === "slides" ? "Slides" : kind === "research" ? "Deep research" : "Document";
  const openItem = (d: DocItem) => {
    if (d.openHref) {
      if (d.openHref.startsWith("http")) window.open(d.openHref, "_blank", "noreferrer");
      else navigate(d.openHref);
      return;
    }
    if (d.conversationId) onOpenChat(d.conversationId);
  };
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((d) => {
        const Icon = iconFor(d.kind);
        return (
          <div
            key={d.id}
            className="flex items-center gap-3 rounded-ios-lg border border-surface-4 bg-surface-2 p-3 transition hover:-translate-y-0.5 hover:border-surface-4/80 hover:shadow-lg"
          >
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-ios-md bg-surface-3 text-brand-parchment">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <button
                onClick={() => openItem(d)}
                className="block w-full truncate text-left text-sm font-semibold text-brand-parchment hover:text-brand-action transition"
                title={d.title}
              >
                {d.title}
              </button>
              <div className="flex min-w-0 items-center gap-1.5 text-xs text-brand-muted">
                <span className="rounded-full bg-surface-3 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                  {labelFor(d.kind)}
                </span>
                {d.conversationId ? (
                  <button
                    onClick={() => onOpenChat(d.conversationId)}
                    className="min-w-0 flex-1 truncate hover:text-brand-action transition text-left"
                    title={d.conversationTitle}
                  >
                    {d.conversationTitle}
                  </button>
                ) : (
                  <span className="min-w-0 flex-1 truncate">{d.conversationTitle}</span>
                )}
              </div>
            </div>
            <button
              onClick={() => openItem(d)}
              className="grid h-9 w-9 place-items-center rounded-full bg-surface-3 text-brand-parchment hover:bg-brand-action hover:text-white transition"
              aria-label="Open"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
