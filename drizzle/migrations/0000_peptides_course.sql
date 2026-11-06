ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS module_title text,
  ADD COLUMN IF NOT EXISTS module_position integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS content text,
  ADD COLUMN IF NOT EXISTS key_points text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS evidence_level text;

INSERT INTO public.courses (slug, title, subtitle, description, instructor_name, instructor_title, level, duration_minutes, featured, category, published)
VALUES ('peptideos-medicina-de-precisao',
 'Peptídeos na Medicina de Precisão',
 'Da farmacologia molecular à prescrição segura no consultório.',
 'A primeira trilha da Doutiva. Cinco módulos que separam evidência de hype: incretinas (GLP-1/GIP) com os grandes ensaios de desfecho, eixo do GH, peptídeos de reparo tecidual, e o enquadramento regulatório e ético brasileiro (ANVISA/CFM). Cada aula traz nível de evidência explícito, referências primárias e casos clínicos.',
 'Corpo Docente Doutiva', 'Endocrinologia · Medicina Baseada em Evidências', 'Avançado', 420, true, 'Biotecnologia', true)
ON CONFLICT DO NOTHING;

WITH c AS (SELECT id FROM public.courses WHERE slug='peptideos-medicina-de-precisao')
INSERT INTO public.lessons (course_id, position, module_position, module_title, title, description, duration_minutes, evidence_level, key_points, refs, content)
SELECT c.id, v.position, v.mp, v.mt, v.title, v.descr, v.dur, v.ev, v.kp, v.refs::jsonb, v.content FROM c, (VALUES
(1,1,'Módulo 1 · Fundamentos','O que é um peptídeo terapêutico','Estrutura, classificação e por que peptídeos ocupam o espaço entre pequenas moléculas e biológicos.',30,'Consenso farmacológico',
 ARRAY['Peptídeos: cadeias de 2–50 aminoácidos; acima disso, em geral, proteínas','Alta seletividade e baixa toxicidade off-target, mas meia-vida curta e baixa biodisponibilidade oral','Mais de 80 peptídeos aprovados mundialmente; incretinas dominam o mercado'],
 '[{"citation":"Muttenthaler M, King GF, Adams DJ, Alewood PF. Trends in peptide drug discovery. Nat Rev Drug Discov. 2021;20(4):309-325.","url":"https://doi.org/10.1038/s41573-020-00135-8"},{"citation":"Wang L, et al. Therapeutic peptides: current applications and future directions. Signal Transduct Target Ther. 2022;7(1):48.","url":"https://doi.org/10.1038/s41392-022-00904-4"}]',
$md$## Por que peptídeos agora

Peptídeos terapêuticos são cadeias curtas de aminoácidos (tipicamente **2 a 50 resíduos**) que mimetizam ou modulam sinalizadores endógenos — hormônios, neurotransmissores, fatores de crescimento. Ocupam um espaço farmacológico único:

| Característica | Pequena molécula | Peptídeo | Anticorpo |
|---|---|---|---|
| Peso molecular | < 500 Da | 500–5.000 Da | ~150.000 Da |
| Seletividade | Variável | Alta | Muito alta |
| Via oral | Geralmente sim | Raramente | Não |
| Meia-vida nativa | Horas | Minutos | Dias–semanas |
| Imunogenicidade | Baixa | Baixa–moderada | Moderada |

## O problema da meia-vida — e como a indústria resolveu

O GLP-1 nativo tem meia-vida de **~2 minutos**, degradado pela DPP-4 e depurado pelo rim. As estratégias que transformaram peptídeos em fármacos semanais:

1. **Substituição de aminoácidos** — ex.: Aib na posição 8 da semaglutida, resistente à DPP-4.
2. **Acilação com ácido graxo** — ligação reversível à albumina (semaglutida, tirzepatida → meia-vida ~1 semana).
3. **Fusão a Fc ou albumina** — dulaglutida, albiglutida.
4. **Peguilação** e **formulações de depósito**.
5. **Absorção oral facilitada** — semaglutida oral com SNAC, que eleva o pH local gástrico.

## Mensagem clínica

O sucesso de um peptídeo depende tanto da **engenharia farmacocinética** quanto do alvo. Ao avaliar qualquer "peptídeo novo", pergunte: *qual é a meia-vida real em humanos, qual a via, e existe ensaio clínico de fase 3?* Essa pergunta sozinha separa a maioria dos produtos de marketing dos fármacos.$md$),

(2,1,'Módulo 1 · Fundamentos','Hierarquia de evidência e o enquadramento regulatório','Aprovado, off-label, manipulado ou experimental: como classificar cada peptídeo antes de prescrever.',35,'Normativo',
 ARRAY['Classifique todo peptídeo em: registrado, off-label, manipulado ou sem registro','Resolução CFM 2.333/2023 veda terapias hormonais com finalidade estética, de ganho de massa ou "antienvelhecimento" sem indicação','FDA (2023) incluiu BPC-157 e outros na Categoria 2 de substâncias para manipulação com risco de segurança'],
 '[{"citation":"Conselho Federal de Medicina. Resolução CFM nº 2.333/2023 — terapias hormonais com finalidade estética e de desempenho.","url":"https://sistemas.cfm.org.br/normas/"},{"citation":"ANVISA. RDC nº 67/2007 — Boas Práticas de Manipulação de Preparações Magistrais e Oficinais.","url":"https://www.gov.br/anvisa"},{"citation":"U.S. FDA. Certain Bulk Drug Substances for Use in Compounding that May Present Significant Safety Risks (Category 2 list), 2023.","url":"https://www.fda.gov/drugs/human-drug-compounding"},{"citation":"World Anti-Doping Agency. Prohibited List — S2: Peptide hormones, growth factors and related substances.","url":"https://www.wada-ama.org/en/prohibited-list"}]',
$md$## As quatro categorias

Antes de qualquer protocolo, o médico precisa saber **em qual categoria** o peptídeo está:

1. **Registrado para a indicação** — ex.: semaglutida e tirzepatida para obesidade/DM2. Máxima segurança jurídica.
2. **Registrado, uso off-label** — permitido, desde que com fundamento científico, registro em prontuário e consentimento informado.
3. **Manipulado** — sujeito à RDC 67/2007; a qualidade depende da farmácia e da procedência do insumo. Manipulação de análogos de GLP-1 tem sido alvo de alertas sanitários por dose, pureza e contaminação.
4. **Sem registro / "research use only"** — BPC-157, TB-500 e afins. **Não há base regulatória para prescrição clínica no Brasil.**

## O que diz o CFM

A **Resolução CFM nº 2.333/2023** proíbe a prescrição de terapias hormonais (incluindo esteroides anabolizantes e derivados) com finalidade estética, de ganho de massa muscular ou de desempenho esportivo, e com promessa de "antienvelhecimento" sem comprovação. Secretagogos de GH usados com essas finalidades entram nessa zona de risco ético.

## Esporte

Todo o grupo S2 da WADA — GH, secretagogos (GHRH, GHRP, grelinomiméticos), fatores de crescimento e BPC-157 — é **proibido em e fora de competição**. Atleta federado = contraindicação prática.

> **Regra Doutiva:** se você não consegue citar o ensaio clínico humano que sustenta a indicação, você está diante de um experimento — e ele precisa ser tratado como tal (ou não ser feito).$md$),

(3,2,'Módulo 2 · Incretinas','Fisiologia de GLP-1 e GIP','Do efeito incretina aos mecanismos centrais de saciedade.',35,'Fisiologia consolidada',
 ARRAY['GLP-1: secreção de insulina glicose-dependente, supressão de glucagon, esvaziamento gástrico lento, saciedade hipotalâmica','GIP: insulinotrópico; em agonismo farmacológico contínuo parece potencializar perda de peso e tolerabilidade','A glicose-dependência explica o baixo risco intrínseco de hipoglicemia em monoterapia'],
 '[{"citation":"Drucker DJ. Mechanisms of Action and Therapeutic Application of Glucagon-like Peptide-1. Cell Metab. 2018;27(4):740-756.","url":"https://doi.org/10.1016/j.cmet.2018.03.001"},{"citation":"Nauck MA, Meier JJ. Incretin hormones: Their role in health and disease. Diabetes Obes Metab. 2018;20 Suppl 1:5-21.","url":"https://doi.org/10.1111/dom.13129"}]',
$md$## O efeito incretina

Glicose oral provoca resposta insulínica **muito maior** que a mesma glicemia por via venosa. Essa diferença — até ~70% da resposta pós-prandial — é mediada por **GLP-1** (células L, íleo/cólon) e **GIP** (células K, duodeno). No DM2, o efeito incretina está reduzido.

## Ações do agonismo de GLP-1R

- **Pâncreas:** ↑ insulina *glicose-dependente*, ↓ glucagon.
- **Estômago:** ↓ esvaziamento gástrico (atenua com o uso crônico — taquifilaxia).
- **SNC:** hipotálamo (núcleo arqueado) e tronco cerebral → ↑ saciedade, ↓ recompensa alimentar.
- **Cardiovascular:** ↓ PA, efeitos anti-inflamatórios e possivelmente antiaterogênicos; ↑ FC de 2–4 bpm.
- **Rim:** natriurese, ↓ albuminúria.

## E o GIP?

Paradoxalmente, tanto agonistas quanto antagonistas de GIPR reduzem peso em modelos. A hipótese mais aceita: o agonismo contínuo *dessensibiliza* o receptor no adipócito e atua no SNC reduzindo náusea. Na prática, a **tirzepatida** (agonista dual GIP/GLP-1) produz perda de peso superior à semaglutida em comparação direta (SURMOUNT-5).

## Pérola clínica

Como a ação insulinotrópica depende da glicose, hipoglicemia é rara — **exceto** quando associada a sulfonilureia ou insulina. Ajuste essas medicações ao iniciar.$md$),

(4,2,'Módulo 2 · Incretinas','Semaglutida e tirzepatida: os ensaios que mudaram a medicina','STEP, SURMOUNT, SELECT, FLOW — números que você precisa saber de cor.',45,'Nível A — ECRs fase 3',
 ARRAY['STEP 1: semaglutida 2,4 mg → −14,9% vs −2,4% placebo em 68 semanas','SURMOUNT-1: tirzepatida 15 mg → −20,9% vs −3,1% em 72 semanas','SELECT: −20% de MACE em obesos com DCV sem diabetes','FLOW: −24% no desfecho renal composto em DM2 com DRC'],
 '[{"citation":"Wilding JPH, et al. Once-Weekly Semaglutide in Adults with Overweight or Obesity (STEP 1). N Engl J Med. 2021;384:989-1002.","url":"https://doi.org/10.1056/NEJMoa2032183"},{"citation":"Jastreboff AM, et al. Tirzepatide Once Weekly for the Treatment of Obesity (SURMOUNT-1). N Engl J Med. 2022;387:205-216.","url":"https://doi.org/10.1056/NEJMoa2206038"},{"citation":"Lincoff AM, et al. Semaglutide and Cardiovascular Outcomes in Obesity without Diabetes (SELECT). N Engl J Med. 2023;389:2221-2232.","url":"https://doi.org/10.1056/NEJMoa2307563"},{"citation":"Perkovic V, et al. Effects of Semaglutide on Chronic Kidney Disease in Patients with Type 2 Diabetes (FLOW). N Engl J Med. 2024;391:109-121.","url":"https://doi.org/10.1056/NEJMoa2403347"},{"citation":"Malhotra A, et al. Tirzepatide for the Treatment of Obstructive Sleep Apnea and Obesity (SURMOUNT-OSA). N Engl J Med. 2024;391:1193-1205.","url":"https://doi.org/10.1056/NEJMoa2404881"},{"citation":"Marso SP, et al. Semaglutide and Cardiovascular Outcomes in Patients with Type 2 Diabetes (SUSTAIN-6). N Engl J Med. 2016;375:1834-1844.","url":"https://doi.org/10.1056/NEJMoa1607141"}]',
$md$## Os números de referência

| Ensaio | Fármaco | População | Desfecho principal |
|---|---|---|---|
| **STEP 1** (2021) | Semaglutida 2,4 mg/sem | IMC ≥30 ou ≥27 + comorbidade, sem DM | −14,9% peso vs −2,4% (68 sem) |
| **SURMOUNT-1** (2022) | Tirzepatida 5/10/15 mg | Idem | −15,0 / −19,5 / −20,9% vs −3,1% (72 sem) |
| **SUSTAIN-6** (2016) | Semaglutida s.c. | DM2 alto risco CV | MACE HR 0,74 |
| **SELECT** (2023) | Semaglutida 2,4 mg | DCV estabelecida, IMC ≥27, **sem DM** | MACE HR 0,80 |
| **FLOW** (2024) | Semaglutida 1 mg | DM2 + DRC | Desfecho renal HR 0,76 |
| **SURMOUNT-OSA** (2024) | Tirzepatida | Apneia moderada-grave + obesidade | ↓ IAH ~ −25 a −29 eventos/h |

## Como ler esses números

- O efeito é **dose-dependente** e com escalonamento a cada 4 semanas para tolerabilidade.
- **SELECT** mudou o paradigma: a obesidade passou a ser tratada como fator de risco cardiovascular modificável por fármaco, independentemente do diabetes. O benefício surgiu cedo, sugerindo mecanismos além da perda de peso.
- Em STEP 1, ~1/3 dos pacientes perdeu ≥20% do peso — magnitude antes vista apenas com cirurgia bariátrica.

## Leitura crítica

Ensaios patrocinados, populações majoritariamente brancas e de países de alta renda, e descontinuação por eventos GI de 4–7%. Extrapolar para sobrepeso leve ou finalidade puramente estética **não** tem respaldo nesses dados.$md$),

(5,2,'Módulo 2 · Incretinas','Segurança, efeitos adversos e massa magra','Pancreatite, tireoide, gastroparesia, sarcopenia e o reganho após a suspensão.',40,'Nível A–B',
 ARRAY['Contraindicação: história pessoal/familiar de carcinoma medular de tireoide ou NEM 2','Até 40% da perda de peso pode ser massa magra — prescreva proteína e treino resistido','Suspensão leva a reganho: STEP 1 extensão recuperou ~2/3 do peso perdido em 1 ano','Atenção perioperatória: risco de conteúdo gástrico residual na anestesia'],
 '[{"citation":"Wilding JPH, et al. Weight regain and cardiometabolic effects after withdrawal of semaglutide: STEP 1 trial extension. Diabetes Obes Metab. 2022;24(8):1553-1564.","url":"https://doi.org/10.1111/dom.14725"},{"citation":"Rubino D, et al. Effect of Continued Weekly Subcutaneous Semaglutide vs Placebo on Weight Loss Maintenance (STEP 4). JAMA. 2021;325(14):1414-1425.","url":"https://doi.org/10.1001/jama.2021.3224"},{"citation":"Sodhi M, et al. Risk of Gastrointestinal Adverse Events Associated With GLP-1 Receptor Agonists for Weight Loss. JAMA. 2023;330(18):1795-1797.","url":"https://doi.org/10.1001/jama.2023.19574"},{"citation":"Bezin J, et al. GLP-1 Receptor Agonists and the Risk of Thyroid Cancer. Diabetes Care. 2023;46(2):384-390.","url":"https://doi.org/10.2337/dc22-1148"},{"citation":"Neeland IJ, Linge J, Birkenfeld AL. Changes in lean body mass with GLP-1-based therapies and mitigation strategies. Diabetes Obes Metab. 2024;26 Suppl 4:16-27.","url":"https://doi.org/10.1111/dom.15728"}]',
$md$## Eventos gastrointestinais

Náusea (20–44%), diarreia, vômitos e constipação — maiores na fase de escalonamento. Manejo: escalonar devagar, refeições menores, evitar gordura, hidratação. Estudos observacionais sugerem ↑ risco de **pancreatite, obstrução intestinal e gastroparesia** vs. bupropiona-naltrexona (Sodhi, JAMA 2023), embora com risco absoluto baixo.

## Tireoide

Tumores de células C em roedores levaram à advertência em bula. Contraindicações formais: **história pessoal ou familiar de carcinoma medular de tireoide ou NEM 2**. Dados franceses (Bezin 2023) sugeriram associação com câncer de tireoide após 1–3 anos de uso; outros estudos escandinavos não confirmaram. Conduta: anamnese dirigida; não há indicação de calcitonina de rotina.

## Massa magra — o tema que o consultório de elite domina

Em análises por DEXA, **25–40%** do peso perdido pode ser massa livre de gordura. Em idosos e sarcopênicos, isso importa:

- Proteína **1,2–1,6 g/kg/dia** de peso ajustado
- Treino resistido ≥2–3x/semana
- Monitorar com bioimpedância/DEXA e força de preensão

## Suspensão

- **STEP 4:** quem trocou para placebo após 20 semanas recuperou ~7% do peso; quem manteve continuou perdendo.
- **Extensão STEP 1:** em 1 ano sem o fármaco, recuperou-se ~2/3 do peso perdido.

> Obesidade é doença crônica. Discuta com o paciente desde a primeira consulta que o tratamento é de longo prazo.

## Perioperatório

Esvaziamento gástrico lento aumenta risco de broncoaspiração. Siga a orientação multissocietária vigente (dieta líquida 24h antes em pacientes de risco; avaliar suspensão individualmente com o anestesista).$md$),

(6,3,'Módulo 3 · Eixo do GH','Secretagogos de GH: tesamorelina, CJC-1295 e ipamorelina','O que é aprovado, o que é extrapolado e como monitorar IGF-1.',40,'Nível A (tesamorelina) · Nível C (demais)',
 ARRAY['Tesamorelina: única GHRH aprovada (FDA) — lipodistrofia abdominal em HIV','CJC-1295 e ipamorelina: dados humanos limitados a farmacodinâmica de fase 1–2','Secretagogos não são GH: preservam pulsatilidade e feedback, mas elevam IGF-1 e glicemia','Uso estético/anti-aging conflita com a Resolução CFM 2.333/2023'],
 '[{"citation":"Falutz J, et al. Metabolic effects of a growth hormone-releasing factor in patients with HIV (tesamorelin). N Engl J Med. 2007;357:2359-2370.","url":"https://doi.org/10.1056/NEJMoa072375"},{"citation":"Teichman SL, et al. Prolonged stimulation of growth hormone and IGF-I secretion by CJC-1295 in healthy adults. J Clin Endocrinol Metab. 2006;91(3):799-805.","url":"https://doi.org/10.1210/jc.2005-1536"},{"citation":"Raun K, et al. Ipamorelin, the first selective growth hormone secretagogue. Eur J Endocrinol. 1998;139(5):552-561.","url":"https://doi.org/10.1530/eje.0.1390552"},{"citation":"Sigalos JT, Pastuszak AW. The Safety and Efficacy of Growth Hormone Secretagogues. Sex Med Rev. 2018;6(1):45-53.","url":"https://doi.org/10.1016/j.sxmr.2017.02.004"}]',
$md$## Duas vias para o mesmo eixo

- **Análogos de GHRH** (tesamorelina, sermorelina, CJC-1295) → receptor de GHRH na hipófise.
- **GHRPs / grelinomiméticos** (ipamorelina, GHRP-2, GHRP-6, hexarelina; MK-677 é oral e não peptídico) → receptor GHS-R1a.

A combinação de ambos tem efeito sinérgico sobre o pico de GH.

## O que a evidência sustenta

| Agente | Melhor evidência | Status |
|---|---|---|
| **Tesamorelina** | ECRs fase 3 — ↓ ~15–18% gordura visceral em HIV | Aprovada (FDA) para lipodistrofia em HIV |
| **CJC-1295 (DAC)** | Fase 1–2: ↑ GH 2–10x e IGF-1 1,5–3x por 6–11 dias | Desenvolvimento descontinuado; sem registro |
| **Ipamorelina** | Pré-clínico + fase 2 (íleo pós-operatório, negativo) | Sem registro |
| **MK-677** | ECRs pequenos: ↑ massa magra, sem ganho funcional; ↑ glicemia | Sem registro |

## Riscos reais

- ↑ glicemia e resistência insulínica (especialmente MK-677)
- Retenção hídrica, artralgia, síndrome do túnel do carpo
- **Teórico, mas relevante:** IGF-1 cronicamente elevado e risco oncológico — contraindicação em neoplasia ativa
- Produtos sem registro: pureza e dose não garantidas

## Se houver indicação formal

Monitorar **IGF-1 ajustado para idade e sexo** (manter dentro do intervalo de referência), glicemia/HbA1c, e reavaliar a cada 3 meses.

> Para fins de "rejuvenescimento" ou desempenho, não há desfecho clínico duro demonstrado — e há vedação ética explícita do CFM.$md$),

(7,4,'Módulo 4 · Reparo tecidual','BPC-157, TB-500 e GHK-Cu: o que é ciência e o que é hype','Leitura crítica da evidência pré-clínica que alimenta as redes sociais.',40,'Nível D — predominantemente pré-clínico',
 ARRAY['BPC-157: centenas de estudos em roedores, praticamente sem ECRs humanos publicados','FDA classificou BPC-157 na Categoria 2 (risco de segurança para manipulação) em 2023','TB-500 é fragmento sintético da timosina β4; evidência humana restrita a uso tópico/oftálmico da molécula completa','GHK-Cu tópico tem a melhor base para pele; uso injetável carece de dados'],
 '[{"citation":"Gwyer D, Wragg NM, Wilson SL. Gastric pentadecapeptide body protection compound BPC 157 and its role in accelerating musculoskeletal soft tissue healing. Cell Tissue Res. 2019;377(2):153-159.","url":"https://doi.org/10.1007/s00441-019-03016-8"},{"citation":"Goldstein AL, Hannappel E, Sosne G, Kleinman HK. Thymosin β4: a multi-functional regenerative peptide. Expert Opin Biol Ther. 2012;12(1):37-51.","url":"https://doi.org/10.1517/14712598.2012.634793"},{"citation":"Pickart L, Margolina A. Regenerative and Protective Actions of the GHK-Cu Peptide in the Light of the New Gene Data. Int J Mol Sci. 2018;19(7):1987.","url":"https://doi.org/10.3390/ijms19071987"},{"citation":"U.S. FDA. Bulk drug substances nominated for compounding — Category 2 (includes BPC-157), 2023.","url":"https://www.fda.gov/drugs/human-drug-compounding"}]',
$md$## Por que esses peptídeos viralizaram

Relatos de recuperação rápida de tendinopatias e lesões esportivas, protocolos difundidos por influenciadores e acesso fácil a frascos "research use only". O médico precisa ser a voz mais bem informada da conversa.

## BPC-157

Pentadecapeptídeo derivado de proteína do suco gástrico. Em roedores: aceleração de cicatrização de tendão, músculo, mucosa GI; efeitos angiogênicos (via VEGFR2) e sobre o óxido nítrico.

**Problemas:**
- A esmagadora maioria dos estudos vem de **um único grupo de pesquisa**.
- Não há ECR humano robusto publicado para lesão musculoesquelética.
- Angiogênese é uma faca de dois gumes em pacientes com neoplasia.
- FDA (2023): **Categoria 2** — não pode ser manipulado nos EUA por preocupações de segurança e imunogenicidade.

## TB-500

Fragmento sintético (região ativa) da **timosina β4**. A Tβ4 completa teve estudos clínicos em úlceras e olho seco/ceratite neurotrófica (tópica). Extrapolar para injeção sistêmica do fragmento não é suportado.

## GHK-Cu

Tripeptídeo ligado ao cobre, presente no plasma, declina com a idade. Evidência razoável em **dermatologia tópica** (colágeno, cicatrização). Injetável: dados escassos.

## Como conversar com o paciente que já usa

1. Sem julgamento — documente produto, dose, procedência.
2. Explique o nível de evidência e o risco de contaminação/dose incorreta.
3. Ofereça alternativas com evidência (fisioterapia, carga progressiva, ortobiológicos estudados).
4. Registre a orientação em prontuário.$md$),

(8,5,'Módulo 5 · Prática clínica','Construindo um protocolo de incretina no consultório','Seleção, escalonamento, metas, exames e seguimento.',40,'Nível A (diretrizes)',
 ARRAY['Indicação farmacológica de obesidade: IMC ≥30, ou ≥27 com comorbidade','Escalonar a cada 4 semanas; não subir dose se houver intolerância','Meta inicial: ≥5% em 12 semanas na dose de manutenção; caso contrário, reavaliar','Seguimento: peso, circunferência, composição corporal, PA, FC, HbA1c, lipídios, função renal'],
 '[{"citation":"Garvey WT, et al. Tirzepatide once weekly for the treatment of obesity in people with type 2 diabetes (SURMOUNT-2). Lancet. 2023;402:613-626.","url":"https://doi.org/10.1016/S0140-6736(23)01200-X"},{"citation":"ABESO/SBEM. Posicionamentos sobre tratamento farmacológico da obesidade (versão vigente).","url":"https://abeso.org.br"},{"citation":"Wilding JPH, et al. STEP 1. N Engl J Med. 2021;384:989-1002.","url":"https://doi.org/10.1056/NEJMoa2032183"}]',
$md$## Checklist da primeira consulta

- [ ] Indicação documentada (IMC + comorbidades; considerar adiposidade visceral)
- [ ] Exclusões: gestação/lactação, CMT/NEM2, pancreatite prévia, gastroparesia grave, retinopatia diabética proliferativa não tratada (semaglutida — SUSTAIN-6)
- [ ] Revisar sulfonilureia/insulina
- [ ] Baseline: peso, circunferência, bioimpedância/DEXA, PA, FC, HbA1c, perfil lipídico, TGO/TGP, creatinina/TFG, amilase/lipase se suspeita clínica
- [ ] Plano nutricional (proteína) e de treino resistido
- [ ] Consentimento informado (efeitos adversos, cronicidade, custo, reganho)

## Escalonamento de referência (bula)

**Semaglutida 2,4 mg:** 0,25 → 0,5 → 1,0 → 1,7 → 2,4 mg semanais, a cada 4 semanas.

**Tirzepatida:** 2,5 → 5 → 7,5 → 10 → 12,5 → 15 mg semanais, a cada 4 semanas; manutenção 5, 10 ou 15 mg.

## Metas e seguimento

- Retorno a cada 4–8 semanas no escalonamento, depois a cada 3 meses.
- **Não responsivo:** < 5% após 12 semanas em dose de manutenção → rever adesão, dose, comorbidades, alternativa.
- Atenção a perda acelerada (> 1,5 kg/sem) e sinais de sarcopenia.

## Erros comuns

- Escalonar rápido demais para "acelerar resultado".
- Ignorar massa magra.
- Prometer tratamento curto.
- Prescrever produto manipulado de procedência incerta quando há opção registrada.$md$),

(9,5,'Módulo 5 · Prática clínica','Casos clínicos integrados','Três casos reais de consultório para treinar raciocínio — discuta com a IA tutora.',45,'Aplicação',
 ARRAY['Caso 1: obesidade + DCV → SELECT sustenta indicação mesmo sem diabetes','Caso 2: atleta pedindo BPC-157 → contraindicação regulatória (WADA) e evidência D','Caso 3: idosa sarcopênica → priorizar preservação de massa magra antes da magnitude de perda'],
 '[{"citation":"Lincoff AM, et al. SELECT. N Engl J Med. 2023;389:2221-2232.","url":"https://doi.org/10.1056/NEJMoa2307563"},{"citation":"World Anti-Doping Agency. Prohibited List — S2.","url":"https://www.wada-ama.org/en/prohibited-list"},{"citation":"Neeland IJ, et al. Diabetes Obes Metab. 2024;26 Suppl 4:16-27.","url":"https://doi.org/10.1111/dom.15728"}]',
$md$## Caso 1 — O executivo pós-infarto

**Homem, 54 anos**, IAM há 14 meses (angioplastia com stent), IMC 33, HbA1c 5,8%, LDL 62 em estatina de alta potência, PA 132/84. Pergunta se "o remédio para emagrecer" faz sentido.

**Perguntas para você:**
1. Qual ensaio sustenta a indicação? Qual a magnitude do benefício?
2. Quais exclusões precisam ser checadas?
3. Como você explicaria ao paciente que é tratamento crônico?

<details><summary>Discussão</summary>

O **SELECT** incluiu exatamente esse perfil (DCV estabelecida, IMC ≥27, sem DM) e mostrou redução de 20% em MACE com semaglutida 2,4 mg. Checar CMT/NEM2, pancreatite, gastroparesia. Benefício CV pareceu precoce e parcialmente independente da perda de peso.
</details>

## Caso 2 — A triatleta e o BPC-157

**Mulher, 31 anos**, triatleta federada, tendinopatia patelar há 5 meses. Viu protocolo de BPC-157 + TB-500 em rede social e quer prescrição.

<details><summary>Discussão</summary>

Duas barreiras: (1) **WADA S2** — proibido; resultado analítico adverso pode encerrar a carreira. (2) Evidência humana praticamente inexistente; produto sem registro. Conduta: carga isométrica/excêntrica progressiva, avaliar fatores de sobrecarga, considerar intervenções com evidência. Documentar a orientação.
</details>

## Caso 3 — A idosa que "quer perder 15 kg"

**Mulher, 72 anos**, IMC 31, DM2, força de preensão reduzida, velocidade de marcha 0,8 m/s.

<details><summary>Discussão</summary>

Obesidade sarcopênica. Incretina pode ser indicada (DM2 + obesidade), mas com meta moderada, escalonamento lento, **proteína 1,2–1,5 g/kg/dia**, treino resistido supervisionado e monitoramento de composição corporal. Sucesso = melhora funcional, não apenas kg.
</details>

---

Use o painel **Tutor IA** ao lado para discutir variações destes casos.$md$)
) AS v(position, mp, mt, title, descr, dur, ev, kp, refs, content);