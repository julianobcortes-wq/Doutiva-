import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { studioMe } from "@/lib/studio.functions";
import { BookOpen, GraduationCap, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/library")({
  head: () => ({
    meta: [
      { title: "Biblioteca — Doutiva" },
      {
        name: "description",
        content: "Atalhos para Universidade e Biblioteca Científica Doutiva.",
      },
    ],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  const { data: me } = useQuery({
    queryKey: ["studio-me"],
    queryFn: () => studioMe(),
    staleTime: 60_000,
  });
  const faculty = !!me?.isAdmin;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 pb-28">
      <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Acervo</span>
      <h1 className="mt-3 font-serif text-4xl">Biblioteca Doutiva</h1>
      <p className="mt-3 text-muted-foreground">
        A base científica (PubMed, ClinicalTrials, PDFs) vive no Estúdio. Alunos estudam as aulas
        ancoradas nessa evidência na Universidade.
      </p>

      <div className="mt-8 grid gap-3">
        <Link
          to="/academy"
          className="flex items-start gap-4 rounded-sm border border-border/60 bg-card p-5 transition hover:border-gold/40"
        >
          <GraduationCap className="mt-0.5 h-5 w-5 text-gold" />
          <span>
            <span className="block font-serif text-xl">Universidade</span>
            <span className="text-sm text-muted-foreground">
              Trilhas publicadas com monografia, slides e caso clínico.
            </span>
          </span>
        </Link>

        {faculty ? (
          <Link
            to="/editor/biblioteca"
            className="flex items-start gap-4 rounded-sm border border-border/60 bg-card p-5 transition hover:border-gold/40"
          >
            <BookOpen className="mt-0.5 h-5 w-5 text-gold" />
            <span>
              <span className="block font-serif text-xl">Biblioteca Científica</span>
              <span className="text-sm text-muted-foreground">
                Buscar, importar e ancorar fontes para geração de aulas.
              </span>
            </span>
          </Link>
        ) : (
          <div className="flex items-start gap-4 rounded-sm border border-border/60 bg-card p-5">
            <Bookmark className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <span>
              <span className="block font-serif text-xl">Fontes nas aulas</span>
              <span className="text-sm text-muted-foreground">
                No Tutor IA de cada aula, as respostas citam o acervo científico com [S#].
              </span>
              <Button asChild variant="outline" size="sm" className="mt-3 rounded-sm">
                <Link to="/academy">Abrir uma aula</Link>
              </Button>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
