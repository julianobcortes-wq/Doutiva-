import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { brl, commercialModel, expertApplicationSteps, expertSpaceTypes, valleyFeeCents } from "@/lib/valley-v1";
import { Check } from "lucide-react";

export const Route = createFileRoute("/_authenticated/expert-apply")({
  head: () => ({
    meta: [
      { title: "Abrir espaço como Médico Mentor — Doutiva" },
      { name: "description", content: "Candidate-se para abrir um espaço profissional na Doutiva: credenciais, tipo de espaço e modelo comercial." },
      { property: "og:title", content: "Abrir espaço como Médico Mentor — Doutiva" },
      { property: "og:description", content: "Processo de entrada dos profissionais de saúde na cidade digital." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ExpertApplyPage,
});

function ExpertApplyPage() {
  const [step, setStep] = useState(0);
  const [spaceType, setSpaceType] = useState(expertSpaceTypes[0]);
  const [revenue, setRevenue] = useState(5_000_000);
  const current = expertApplicationSteps[step];
  const fee = valleyFeeCents(revenue);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 pb-28 md:pb-10">
      <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Médico Mentor</span>
      <h1 className="mt-3 font-serif text-4xl md:text-5xl">Abra seu espaço na cidade.</h1>
      <p className="mt-3 text-muted-foreground">
        A Doutiva funciona como um shopping premium: poucos espaços, curadoria rígida e contrato claro.
      </p>

      <div className="mt-8 grid grid-cols-5 gap-2">
        {expertApplicationSteps.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setStep(i)}
            className={`rounded-sm border p-3 text-left text-[10px] uppercase tracking-[0.15em] transition ${
              i === step ? "border-sage/50 bg-sage/5 text-sage"
              : i < step ? "border-border/60 text-muted-foreground" : "border-border/60 text-muted-foreground/60"
            }`}
          >
            {i < step ? <Check className="mb-1 h-3 w-3" /> : <span className="mb-1 block">{i + 1}</span>}
            {s.title}
          </button>
        ))}
      </div>

      <section className="mt-8 rounded-sm border border-border/60 bg-card p-8">
        <h2 className="font-serif text-2xl">{current.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{current.desc}</p>

        {step === 0 && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Nome profissional" placeholder="Dra. Helena Prado" />
            <Field label="Registro (CRM, CRN, CREF...)" placeholder="CRM-SP 000000" />
            <Field label="Especialidade" placeholder="Medicina da longevidade" />
            <Field label="Cidade" placeholder="São Paulo" />
          </div>
        )}

        {step === 1 && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Formação principal" placeholder="Instituição e ano" />
            <Field label="Anos de atuação" placeholder="12" />
            <Field label="Link de portfólio ou currículo" placeholder="https://" />
            <Field label="Documento de comprovação" placeholder="Anexar (PDF)" />
          </div>
        )}

        {step === 2 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {expertSpaceTypes.map((t) => (
              <button
                key={t}
                onClick={() => setSpaceType(t)}
                className={`rounded-full border px-4 py-1.5 text-xs transition ${
                  spaceType === t ? "border-sage/50 bg-sage/10 text-sage" : "border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Serviço principal" placeholder="Avaliação de longevidade" />
            <Field label="Formato" placeholder="Online, presencial ou híbrido" />
            <Field label="Ticket médio" placeholder="R$ 900" />
            <Field label="Capacidade mensal" placeholder="40 atendimentos" />
          </div>
        )}

        {step === 4 && (
          <div className="mt-6">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Taxa de entrada", value: brl(commercialModel.entryFeeCents) },
                { label: "Mensalidade mínima", value: brl(commercialModel.minMonthlyCents) },
                { label: "Participação", value: `${Math.round(commercialModel.revenueShare * 100)}%` },
              ].map((r) => (
                <div key={r.label} className="rounded-sm border border-border/60 p-4">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{r.label}</div>
                  <div className="mt-1 font-serif text-2xl">{r.value}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-sm border border-border/60 p-5">
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Simule seu faturamento mensal na Doutiva
              </label>
              <input
                type="range"
                min={0}
                max={50_000_000}
                step={500_000}
                value={revenue}
                onChange={(e) => setRevenue(Number(e.target.value))}
                className="mt-3 w-full accent-current text-sage"
              />
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Faturamento: {brl(revenue)}</span>
                <span className="font-serif text-xl text-sage">Você paga {brl(fee)}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{commercialModel.note}</p>
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between border-t border-border/60 pt-6">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
            disabled={step === 0}
          >
            Voltar
          </button>
          {step < expertApplicationSteps.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="rounded-sm border border-sage/40 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-sage hover:bg-sage/10"
            >
              Continuar
            </button>
          ) : (
            <Link
              to="/editor"
              className="rounded-sm border border-sage/40 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-sage hover:bg-sage/10"
            >
              Enviar candidatura
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <input
        placeholder={placeholder}
        className="mt-2 w-full rounded-sm border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-sage/50"
      />
    </label>
  );
}
