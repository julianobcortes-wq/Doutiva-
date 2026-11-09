# Validação científica pesada — autoridade Doutiva

**Para:** lançamento médico (risco reputacional)  
**Quando:** 2026-11-09 (America/Sao_Paulo)  
**Escopo:** 221 aulas clínicas publicadas (Negócios excluídos)

## Veredito em uma frase

Os cursos **têm base** (guidelines/trials nomeados + âncoras), mas a auditoria achou exatamente o tipo de falha que **queima CRM na primeira aula**: DOI errado / inventado / metadado de volume errado. Isso foi **varrido e corrigido** com mapa ouro + scrub mecânico. Ainda falta revisão humana linha a linha antes de vender “autoridade absoluta”.

## O que um médico derruba na hora

| Risco | Achado | Status |
|-------|--------|--------|
| DOI inventado / off-by-digit | Ex.: `NEJMoa2416392` (SURMOUNT-5 real é `…2416394`) | **Corrigido** |
| Paper certo + journal/DOI errados | Baillargeon VTE citado como *Ann Pharmacother* + DOI SAGE falso; real = *Mayo Clin Proc* `10.1016/j.mayocp.2015.05.012` | **Corrigido** |
| Volume/páginas errados com DOI certo | SELECT citado como 388:888–899; real = **389:2221–2232** | **Corrigido** |
| FLOW páginas erradas | Citado 390:712; real = **391:109–121** | **Corrigido** |
| DOI truncado `(23` / `(18` | Lancet/Elsevier cortado no meio | **Removido** |
| Placeholder `verificar` em **citação** | Diferente de “verificar bula/laudo” (linguagem clínica OK) | Monitorar; enrich limpa refs |
| Âncoras de evidência | Cobertura ampla pós-onda científica | Manter |

## O que foi feito nesta validação

1. **Auditoria automatizada** (`scripts/validate-scientific-authority.mjs`)  
   - Extrai DOIs, marca AI-smell, âncoras, densidade de placeholders  
   - Resolve DOI via Crossref (limitação: rate-limit 429 → muitos “inconclusivos”; 404 tratados como críticos)

2. **Confirmação manual (web/publisher)** dos CRITICAL  
   - Baillargeon, SURMOUNT-5, SELECT, FLOW, SURMOUNT-1 conferidos em NEJM/Mayo

3. **Mapa ouro** (`scripts/gold-doi-map.mjs`) — só DOI verificado no publisher:
   - SURMOUNT-1/5, STEP-1/4, SELECT, FLOW  
   - Endocrine Society TRT 2018  
   - Baillargeon VTE 2015  
   - NECC fungal meningitis NEJM  

4. **Scrub de integridade** (`scripts/scrub-citation-integrity.mjs`) em toda a clínica  
   - Substitui landmarks pelo texto/DOI ouro  
   - Remove DOIs banidos/truncados  
   - Log em `docs/citation-scrub-log.json`

## Política editorial (inegociável daqui pra frente)

1. **Nunca inventar DOI.** Sem certeza → cite guideline/trial pelo **nome + autores/ano + URL oficial**, sem DOI.  
2. Landmark incretina/hormônio **só** via `gold-doi-map.mjs`.  
3. Médico revisor humano assina aula CRITICAL (TRT, incretina, soroterapia IV, longevidade farmacológica) antes de campanha.  
4. “Verificar bula/laudo/ANVISA” no texto clínico é **desejável**; “verificar” sozinho em bibliografia é **defeito**.  
5. Re-rodar scrub + validate a cada geração em massa.

## Como revalidar

```bash
node --env-file=.env scripts/scrub-citation-integrity.mjs --dry-run
node --env-file=.env scripts/scrub-citation-integrity.mjs
node --env-file=.env scripts/validate-scientific-authority.mjs
```

## Limite honesto

Esta barreira **impede humilhação por citação clicável falsa**. Não substitui board review de cada monografia (dose, contra-indicação, nuance BR). Para “nunca mais queimar a cara”, o próximo degrau é **revisor médico nominado** nas aulas de maior risco prescritivo.
