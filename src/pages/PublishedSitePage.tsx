/** @doc Public shareable page that renders a Coder-generated project by slug — served at /s/:slug and readable by anyone. */

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PrefetchLink as Link } from "@/components/common/PrefetchLink";
import { supabase } from "@/integrations/supabase/client";

export default function PublishedSitePage() {
  const { slug } = useParams<{ slug: string }>();
  const [html, setHtml] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("Megsy Project");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!slug) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("generated_sites")
        .select("html_compiled, title, is_public")
        .eq("share_slug", slug)
        .eq("is_public", true)
        .maybeSingle();
      if (!alive) return;
      if (error || !data) {
        setError("This project does not exist or is not public.");
      } else {
        setHtml(data.html_compiled as string);
        if (data.title) {
          setTitle(data.title as string);
          document.title = `${data.title} · Megsy`;
        }
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-black text-white/70 text-sm">
        Loading project…
      </div>
    );
  }

  if (error || !html) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-black text-white gap-4 px-6 text-center">
        <h1 className="text-xl font-bold">Unable to display project</h1>
        <p className="text-white/60 text-sm max-w-md">{error}</p>
        <Link
          to="/"
          className="mt-2 rounded-full bg-white text-black px-5 py-2 text-sm font-semibold"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black">
      <iframe
        title={title}
        srcDoc={html}
        sandbox="allow-scripts allow-forms allow-popups allow-modals"
        className="w-full h-full border-0"
      />
      <a
        href="https://megsy.ai"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-2 rounded-full bg-black/80 backdrop-blur px-3 py-1.5 text-[11px] font-semibold text-white border border-white/10 hover:border-white/30"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#5B8DEF] shadow-[0_0_10px_#5B8DEF]" />
        Built with Megsy Coder
      </a>
    </div>
  );
}
