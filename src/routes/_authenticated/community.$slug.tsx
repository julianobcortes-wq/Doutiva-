import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getSpaceBySlug, createPost } from "@/lib/community.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { toast } from "sonner";

const spaceQuery = (slug: string) => ({
  queryKey: ["space", slug],
  queryFn: () => getSpaceBySlug({ data: { slug } }),
});

export const Route = createFileRoute("/_authenticated/community/$slug")({
  head: ({ params }) => ({ meta: [{ title: `${params.slug} — Community` }] }),
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(spaceQuery(params.slug));
    if (!data) throw notFound();
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-6 py-32 text-center">
      <h1 className="font-serif text-4xl">Mesa não encontrada</h1>
      <Button asChild className="mt-6 bg-gold text-primary-foreground hover:bg-gold-soft rounded-sm">
        <Link to="/community">Voltar</Link>
      </Button>
    </div>
  ),
  component: SpacePage,
});

function SpacePage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(spaceQuery(slug));
  const space = data!;
  const qc = useQueryClient();
  const createFn = useServerFn(createPost);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const mut = useMutation({
    mutationFn: createFn,
    onSuccess: () => {
      toast.success("Post publicado");
      setTitle(""); setBody("");
      qc.invalidateQueries({ queryKey: ["space", slug] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao publicar"),
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 pb-24 md:pb-12">
      <Link to="/community" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> Voltar às mesas
      </Link>
      <div className="mt-6 border-b border-border/60 pb-8">
        <span className="text-[10px] uppercase tracking-[0.3em] text-gold">{space.specialty}</span>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl">{space.name}</h1>
        <p className="mt-3 text-muted-foreground">{space.description}</p>
      </div>

      <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <h2 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Discussões</h2>
          <ul className="mt-4 space-y-4">
            {space.posts.length === 0 && (
              <li className="rounded-sm border border-border/60 bg-card p-8 text-center text-sm text-muted-foreground">
                Seja o primeiro a abrir uma discussão nesta mesa.
              </li>
            )}
            {space.posts.map((p) => {
              const initials = (p.author?.display_name ?? "Membro").split(" ").slice(0, 2).map((n) => n[0]).join("");
              return (
                <li key={p.id} className="rounded-sm border border-border/60 bg-card p-6">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-gold to-gold-soft font-serif text-xs text-primary-foreground">
                      {initials || "M"}
                    </div>
                    <div>
                      <div className="text-sm">{p.author?.display_name ?? "Membro Doutiva"}</div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        {new Date(p.created_at).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  </div>
                  <h3 className="mt-4 font-serif text-xl">{p.title}</h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{p.body}</p>
                  <div className="mt-4 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageSquare className="h-3 w-3" /> Responder
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <aside className="rounded-sm border border-border/60 bg-card p-6 h-fit">
          <h3 className="font-serif text-lg">Abrir discussão</h3>
          <p className="mt-1 text-xs text-muted-foreground">Apenas membros desta mesa veem.</p>
          <form
            onSubmit={(e) => { e.preventDefault(); mut.mutate({ data: { spaceId: space.id, title, body } }); }}
            className="mt-4 space-y-3"
          >
            <div>
              <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Título</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required minLength={3} maxLength={160}
                     className="mt-2 h-11 rounded-sm bg-background border-border" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Mensagem</Label>
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} required minLength={3} maxLength={4000} rows={5}
                        className="mt-2 rounded-sm bg-background border-border" />
            </div>
            <Button type="submit" disabled={mut.isPending}
                    className="w-full h-11 rounded-sm bg-gold text-primary-foreground hover:bg-gold-soft">
              {mut.isPending ? "Publicando..." : "Publicar"}
            </Button>
          </form>
        </aside>
      </section>
    </div>
  );
}