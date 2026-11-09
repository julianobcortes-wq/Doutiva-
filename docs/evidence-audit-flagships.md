# Auditoria de evidência — flagships Doutiva

Data de referência: 2026-11-09 (America/Sao_Paulo). Escopo: todos os cursos clínicos publicados (exceto Negócios) + 6 novos flagships da trilha científica.

## Veredito

| Trilha | Base científica | Nota |
|--------|-----------------|------|
| Tirzepatida / Incretinas | **Forte** — STEP, SURMOUNT, SELECT, FLOW; âncoras em 10/10 | A |
| Emagrecimento / Obesidade | **Forte** — trials + ABESO/SBEM; âncoras 16/16 | A |
| Peptídeos | **Boa** — hierarquia A–D; âncoras 15/15 | B+ |
| Hormônios / Implantes | **Boa** — guidelines + ops; âncoras 16/16 | B+ |
| Soroterapia | **Boa** — regulatório + âncoras 16/16 | B |
| Manipulados | **Boa** — ANVISA/CFM + formulário; âncoras 16/16 | B |
| **Tireoide (novo)** | Guidelines ATA/ES + mitos desmontados; 16/16 | A− |
| **Cardiometabólico (novo)** | SELECT, TRT/Hct, periop GLP-1; 16/16 | A− |
| **DEXA operacional (novo)** | EWGSOP2 + follow-up; 16/16 | B+ |
| **Ética/Prontuário (novo)** | CFM/LGPD; barra regulatória; 16/16 | A (reg.) |
| **Sono/Cortisol (novo)** | Adrenal fatigue = mito; 16/16 | A− |
| **Fertilidade TRT/incretinas (novo)** | HPG + washout; 16/16 | A− |
| **Longevidade na Medicina (novo)** | Hallmarks, CALERIE/TAME/SELECT, geroscience A–D; 16/16 | A− |
| Sarcopenia / IA | Âncoras completas pós-enrich | B+ |
| Negócios (5) | Gestão/ética — não RCT | B (prática) |

**Conclusão:** a clínica Doutiva agora tem **âncoras de evidência** cobrindo essencialmente 100% das aulas clínicas publicadas. Novos flagships nascem com seção obrigatória `## Âncoras de evidência`. Placeholders `verificar` restantes = honestidade do modelo (sem DOI inventado), não ausência de guideline/trial nomeado.

## O que foi feito nesta onda

1. **6 cursos novos** (96 aulas) via `doutiva-curriculum-scientific-tracks.mjs` + deepen científico.
2. **Enrich desde o curso zero** — `enrich-all-clinical-evidence.mjs --weak-only` (103 aulas) + passes extras Tirzepatida/Soroterapia + gaps pontuais.
3. Freemium, academy e `public-catalog` atualizados; capas em `/public/covers`.

## Critérios

- Monografia densa, nº de refs, DOI/guideline quando certo
- Seção **Âncoras de evidência**
- Contagem de `verificar` (sintoma de incerteza — preferível a inventar)
- Hierarquia A–D explícita em mitos/zona cinzenta

## Limitações honestas

1. Modelos **recusam inventar DOI** → `verificar` pode permanecer no corpo.
2. Formulário operacional ancora em guideline/RDC, não em “RCT de dose magistral”.
3. Negócios médicos não fingem RCT de precificação.

## Pipeline

```bash
node --env-file=.env scripts/bootstrap-doutiva-scientific-tracks.mjs
node --env-file=.env --import tsx scripts/deepen-doutiva-scientific-tracks.mjs --course=<slug>
node --env-file=.env --import tsx scripts/enrich-all-clinical-evidence.mjs --weak-only
node --env-file=.env --import tsx scripts/enrich-lesson-evidence.mjs --course=<slug>
```
