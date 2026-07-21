import { useState } from "react";
import { Copy, Download, Printer, Check } from "lucide-react";
import { toast } from "sonner";

interface Props {
  title: string;
  markdown: string;
  sources?: string[];
  isRtl?: boolean;
}

const buildFullMarkdown = (title: string, body: string, sources?: string[]) => {
  const lines = [`# ${title}`, "", body.trim(), ""];
  if (sources && sources.length) {
    lines.push("", "## Sources", "");
    sources.forEach((u, i) => lines.push(`${i + 1}. ${u}`));
  }
  return lines.join("\n");
};

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60) || "research";

const ExportToolbar = ({ title, markdown, sources, isRtl }: Props) => {
  const [copied, setCopied] = useState(false);

  const fullMd = () => buildFullMarkdown(title || "Research Report", markdown, sources);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullMd());
      setCopied(true);
      toast.success(isRtl ? "Copied" : "Copied to clipboard");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Copy failed");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([fullMd()], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug(title)}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success(isRtl ? "Downloaded" : "Downloaded .md");
  };

  const handlePrint = () => window.print();

  const btn =
    "inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-3 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur transition hover:bg-accent hover:text-foreground";

  return (
    <div
      className="sticky top-2 z-20 mx-auto mb-4 flex w-fit items-center gap-2 rounded-full border border-border bg-background/70 p-1.5 shadow-sm backdrop-blur print:hidden sm:mb-6"
      aria-label="Export toolbar"
    >
      <button type="button" onClick={handleCopy} className={btn} aria-label="Copy as Markdown">
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        <span>{copied ? "Copied" : "Copy"}</span>
      </button>
      <button type="button" onClick={handleDownload} className={btn} aria-label="Download Markdown">
        <Download className="h-3.5 w-3.5" />
        <span>.md</span>
      </button>
      <button type="button" onClick={handlePrint} className={btn} aria-label="Print or save as PDF">
        <Printer className="h-3.5 w-3.5" />
        <span>PDF</span>
      </button>
    </div>
  );
};

export default ExportToolbar;
