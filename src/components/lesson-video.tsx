export function videoEmbedUrl(url: string): { kind: "iframe" | "file"; src: string } | null {
  const u = url.trim();
  if (!/^https:\/\//i.test(u)) return null;
  const yt = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/i);
  if (yt) return { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${yt[1]}` };
  const vm = u.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vm) return { kind: "iframe", src: `https://player.vimeo.com/video/${vm[1]}` };
  if (/\.(mp4|webm|m3u8)(\?|$)/i.test(u)) return { kind: "file", src: u };
  return null;
}

export function LessonVideo({ url, title }: { url: string; title: string }) {
  const v = videoEmbedUrl(url);
  if (!v) return null;
  return (
    <div className="mt-6 aspect-video w-full overflow-hidden rounded-xl border border-border bg-card">
      {v.kind === "iframe" ? (
        <iframe src={v.src} title={`Vídeo do mentor: ${title}`} className="h-full w-full" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen />
      ) : (
        <video src={v.src} controls className="h-full w-full" />
      )}
    </div>
  );
}
