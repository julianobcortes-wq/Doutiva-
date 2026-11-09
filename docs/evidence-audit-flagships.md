# Auditoria de evidência — flagships Doutiva

Data de referência: 2026-11-09 (America/Sao_Paulo). Escopo: cursos criados/expandidos na onda Purus (Manipulados, Hormônios, Soroterapia, Emagrecimento/Incretinas, Negócios, Peptídeos).

## Veredito

| Trilha | Base científica | Nota |
|--------|-----------------|------|
| Tirzepatida / Incretinas | **Forte** — STEP, SURMOUNT, SELECT, FLOW citados | A |
| Emagrecimento / Obesidade | **Forte/Boa** — trials + ABESO/SBEM/ADA; alguns “verificar” | A− |
| Peptídeos | **Boa** — hierarquia A–D clara; zona cinzenta bem marcada como D | B+ |
| Hormônios / Implantes | **Boa** nas aulas 1–10 (guidelines); formulário 11–16 operacional com poucas refs | B |
| Soroterapia | **Mista** — regulatório/segurança densos; evidência de “Myers/NAD” corretamente cética | B |
| Manipulados | **Mista** — forte em ANVISA/CFM; trials clínicos menos densos no formulário | B− |
| Negócios (5) | **Adequada ao gênero** — gestão/prática, não RCT | B (prática) |

**Conclusão:** não estamos “sem base”. Os eixos com RCT robusto (incretinas/obesidade) estão bem ancorados. Os eixos regulatório-operacionais (manipulados, soroterapia, técnica de hormônio) dependem mais de RDC/CFM/guidelines — isso é correto.

### Enriquecimento aplicado (2026-11-09)

12 aulas-alvo receberam bloco **Âncoras de evidência** + refs depuradas via `scripts/enrich-lesson-evidence.mjs`:

| Curso | Aulas | Pós-enrich (refs / âncoras) |
|-------|-------|------------------------------|
| Hormônios | 12, 14, 16 | 6–9 refs + âncoras |
| Manipulados | 11, 13, 14 | 10–12 refs + âncoras |
| Obesidade | 2, 9, 16 | 10–11 refs + âncoras |
| Soroterapia | 1, 2, 3 | 9–13 refs + âncoras |

Observação: monografias de soroterapia ainda podem citar `verificar` no corpo quando o modelo não confirma DOI — as âncoras/refs oficiais foram priorizadas.

## Critérios usados

- Comprimento da monografia, nº de refs, presença de DOI/PMID/guideline
- Menções a ECR / metanálise / trials nomeados
- Contagem de `verificar` (sintoma de incerteza do modelo)
- Amostra manual de citações (não só métrica)

## Limitações honestas

1. Modelos de geração **recusam inventar DOI** (regra Doutiva) → sobram `verificar` quando a memória do modelo é incompleta.
2. Formulário prático (dose/via/taxa) é **operacional**; evidência âncora deve ser guideline/trial, não “estudo de dose magistral”.
3. Negócios médicos **não devem** fingir RCT de precificação — a barra é outra (ética CFM de publicidade + gestão).

## Lacunas da trilha do médico (próximos flagships)

Ordem sugerida de puxar:

1. **Tireoide no consultório de longevidade** — TSH/T4L/T3, anti-TPO, liotironina com critério, “T3 livre Instagram”
2. **Cardiometabólico do prescritor** — Hct na TRT, lipídios, FA/HAS sob incretina, perioperatório GLP-1
3. **Composição corporal operacional** — DEXA/BIA/protocolo de follow-up (além de sarcopenia)
4. **Ética, publicidade e prontuário defensável** — CFM publicidade, TCLE, redes sociais do médico
5. **Sono / cortisol / “adrenal fatigue”** — desmontar mito com base
6. **Fertilidade sob TRT e incretinas** — lacuna prática frequente no consultório

## Como reauditar

```bash
node --env-file=.env scripts/enrich-lesson-evidence.mjs --course=<slug> --only=1,2
# métricas: ver agent log /tmp/evidence-audit.json (gerado sob demanda)
```
