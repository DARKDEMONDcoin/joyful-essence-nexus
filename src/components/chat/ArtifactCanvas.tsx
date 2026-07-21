import { useMemo, useState } from "react";
import { Copy, Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buildProjectPreviewHtml, type ProjectFile } from "@/lib/extractProjectFiles";

type SourceLink = { text: string; url: string };

interface ArtifactCanvasProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
  files: ProjectFile[];
  images?: string[];
  sources?: SourceLink[];
}

function downloadText(name: string, text: string, type = "text/plain;charset=utf-8") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ArtifactCanvas({
  open,
  onOpenChange,
  content,
  files,
  images = [],
  sources = [],
}: ArtifactCanvasProps) {
  const [activeFile, setActiveFile] = useState(files[0]?.path || "");
  const selectedFile = files.find((f) => f.path === activeFile) || files[0];
  const previewHtml = useMemo(() => buildProjectPreviewHtml(files), [files]);
  const defaultTab = files.length ? "preview" : images.length ? "media" : sources.length ? "sources" : "markdown";

  const copy = async (text: string, label = "Copied") => {
    await navigator.clipboard.writeText(text);
    toast.success(label);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[96vw] overflow-hidden p-0 sm:max-w-5xl">
        <div className="flex h-full flex-col">
          <SheetHeader className="border-b border-border/50 px-5 py-4 text-left">
            <SheetTitle>Canvas</SheetTitle>
            <SheetDescription>
              {files.length ? `${files.length} files` : images.length ? `${images.length} media items` : "Assistant artifact"}
            </SheetDescription>
          </SheetHeader>

          <Tabs defaultValue={defaultTab} className="flex min-h-0 flex-1 flex-col">
            <div className="border-b border-border/50 px-4 py-2">
              <TabsList className="h-9">
                {files.length > 0 && <TabsTrigger value="preview">Preview</TabsTrigger>}
                {files.length > 0 && <TabsTrigger value="files">Files</TabsTrigger>}
                {images.length > 0 && <TabsTrigger value="media">Media</TabsTrigger>}
                {sources.length > 0 && <TabsTrigger value="sources">Sources</TabsTrigger>}
                <TabsTrigger value="markdown">Markdown</TabsTrigger>
              </TabsList>
            </div>

            {files.length > 0 && (
              <TabsContent value="preview" className="m-0 min-h-0 flex-1 overflow-auto p-4">
                {previewHtml ? (
                  <iframe
                    title="Canvas preview"
                    sandbox="allow-scripts allow-forms allow-popups allow-modals"
                    srcDoc={previewHtml}
                    className="h-full min-h-[70vh] w-full rounded-md border border-border bg-background"
                  />
                ) : (
                  <pre className="min-h-[70vh] overflow-auto rounded-md border border-border bg-muted/40 p-4 text-sm">
                    <code>{selectedFile?.content || content}</code>
                  </pre>
                )}
              </TabsContent>
            )}

            {files.length > 0 && (
              <TabsContent value="files" className="m-0 grid min-h-0 flex-1 grid-cols-1 overflow-hidden md:grid-cols-[220px_1fr]">
                <div className="overflow-auto border-r border-border/50 p-2">
                  {files.map((file) => (
                    <button
                      key={file.path}
                      type="button"
                      onClick={() => setActiveFile(file.path)}
                      className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${
                        selectedFile?.path === file.path ? "bg-primary/10 text-primary" : "hover:bg-muted"
                      }`}
                    >
                      <span className="block truncate">{file.path}</span>
                    </button>
                  ))}
                </div>
                <div className="flex min-h-0 flex-col">
                  <div className="flex items-center gap-2 border-b border-border/50 px-4 py-2">
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{selectedFile?.path}</span>
                    <Button variant="ghost" size="sm" onClick={() => selectedFile && copy(selectedFile.content)}>
                      <Copy className="h-4 w-4" /> Copy
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => selectedFile && downloadText(selectedFile.path.split("/").pop() || "file.txt", selectedFile.content)}
                    >
                      <Download className="h-4 w-4" /> Download
                    </Button>
                  </div>
                  <pre className="min-h-0 flex-1 overflow-auto bg-muted/30 p-4 text-sm">
                    <code>{selectedFile?.content || ""}</code>
                  </pre>
                </div>
              </TabsContent>
            )}

            {images.length > 0 && (
              <TabsContent value="media" className="m-0 min-h-0 flex-1 overflow-auto p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {images.map((src, i) => (
                    <img key={`${src}-${i}`} src={src} alt="" className="w-full rounded-md border border-border bg-muted object-contain" />
                  ))}
                </div>
              </TabsContent>
            )}

            {sources.length > 0 && (
              <TabsContent value="sources" className="m-0 min-h-0 flex-1 overflow-auto p-4">
                <div className="space-y-2">
                  {sources.map((source, i) => (
                    <a
                      key={`${source.url}-${i}`}
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-md border border-border p-3 text-sm hover:bg-muted"
                    >
                      <span className="min-w-0 flex-1 truncate">{source.text || source.url}</span>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              </TabsContent>
            )}

            <TabsContent value="markdown" className="m-0 min-h-0 flex-1 overflow-auto p-4">
              <div className="mb-3 flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => copy(content)}>
                  <Copy className="h-4 w-4" /> Copy
                </Button>
                <Button variant="ghost" size="sm" onClick={() => downloadText("artifact.md", content, "text/markdown;charset=utf-8")}>
                  <Download className="h-4 w-4" /> Download
                </Button>
              </div>
              <pre className="whitespace-pre-wrap rounded-md border border-border bg-muted/30 p-4 text-sm">
                {content}
              </pre>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}