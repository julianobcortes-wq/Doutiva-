import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getProtocolDocument } from "@/lib/entitlements.functions";
import { LessonMarkdown } from "@/components/lesson-markdown";

export const Route = createFileRoute("/_authenticated/protocolo/$slug")({
  head: () => ({ meta: [{ title: "Protocolo — Doutiva" }] }),
  component: ProtocolPage,
});

function ProtocolPage() {
  const { slug } = Route.useParams();
  const fetchDoc = useServerFn(getProtocolDocument);
  const { data, error, isLoading } = useQuery({
    queryKey: ["protocol", slug],
    queryFn: () => fetchDoc({ data: { slug } }),
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 pb-28">
      {isLoading && <p className="text-sm text-muted-foreground">Carregando protocolo…</p>}
      {error && <p className="text-sm text-destructive">{(error as Error).message}</p>}
      {data && (
        <>
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Material resgatado
          </span>
          <h1 className="mt-3 font-serif text-4xl">{data.title}</h1>
          <div className="mt-8">
            <LessonMarkdown>{data.body_markdown}</LessonMarkdown>
          </div>
        </>
      )}
    </div>
  );
}
