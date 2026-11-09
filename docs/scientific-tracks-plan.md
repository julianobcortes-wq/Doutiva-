# Trilha científica Doutiva — expansão e evidência desde o curso zero

Data: 2026-11-09 (America/Sao_Paulo).

## Novos flagships (16 aulas cada)

| Slug | Título |
|------|--------|
| `tireoide-longevidade-criterio` | Tireoide no Consultório de Longevidade |
| `cardiometabolico-prescritor-criterio` | Cardiometabólico do Prescritor |
| `dexa-composicao-operacional` | DEXA e Composição Corporal Operacional |
| `etica-publicidade-prontuario` | Ética, Publicidade e Prontuário Defensável |
| `sono-cortisol-criterio` | Sono, Cortisol e o Mito da Fadiga Adrenal |
| `fertilidade-trt-incretinas` | Fertilidade sob TRT e Incretinas |

## Pipeline

```bash
node --env-file=.env scripts/bootstrap-doutiva-scientific-tracks.mjs
node --env-file=.env --import tsx scripts/deepen-doutiva-scientific-tracks.mjs --course=<slug>
# evidência em toda a clínica (pula Negócios), priorizando aulas fracas:
node --env-file=.env --import tsx scripts/enrich-all-clinical-evidence.mjs --weak-only
```

## Barra científica (inegociável)

- Monografia com seção **Âncoras de evidência**
- Guidelines/trials pelo nome — sem DOI inventado
- Hierarquia A–D explícita; mitos marcados como D
- Freemium inclui os 6 novos flagships clínicos
