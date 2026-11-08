/**
 * Doutiva — curso flagship: Medicamentos Manipulados Injetáveis com Critério.
 * Foco: prescritor BR, farmácia magistral estéril, ANVISA/CFM, Purus com conduta.
 * Distinto de soroterapia/drip: aqui o núcleo é o MEDICAMENTO manipulado injetável
 * (SC/IM/IV terapêutico), qualidade, quando usar e quando recusar.
 */

export const AUDIENCE_MANIPULADOS = `Público: endocrinologistas, nutrólogos, clínicos e médicos de longevidade
que prescrevem ou pretendem prescrever medicamentos manipulados injetáveis no Brasil.

Tom Doutiva (inegociável):
- Independência de farmácia/indústria; critérios objetivos, nunca folder.
- Separar com clareza: registrado · off-label · manipulado legítimo · irregular/proibido.
- ANVISA (RDCs de manipulação estéril), CFM, rastreabilidade, TCLE, prontuário defensável.
- Qualificar prescritor sério (Purus ganha na conduta, não no marketing).
- Nunca endossar research-peptide, GH anti-aging cosmético, ou manipulado sem justificativa clínica.`;

export const MANIPULADOS_COURSE = {
  slug: "manipulados-injetaveis-criterio",
  title: "Medicamentos Manipulados Injetáveis com Critério",
  subtitle: "Do laudo da farmácia à receita defensável — sem atalho ilegal",
  category: "Terapêutica",
  level: "Avançado",
  description:
    "Curso flagship Doutiva para o prescritor de manipulados injetáveis: microbiologia e farmacotécnica, formulário prático das classes mais comuns (indicação + via + administração), incretinas e hormônios com critério, zona cinzenta, farmácia estéril, ANVISA/CFM e protocolo ético — com tabelas de bolso e casos brasileiros. Porta clínica para conduta Purus.",
  instructor_name: "Conselho editorial Doutiva",
  instructor_title: "Farmacologia clínica · Manipulação estéril · Ética prescritiva",
  lessons: [
    {
      position: 1,
      module_position: 1,
      module_title: "Módulo 1 · Território e risco",
      topic: "O mapa do manipulado injetável no Brasil: magistral, indústria e zona cinzenta",
      extra:
        "Definir manipulação estéril vs especialidade farmacêutica industrial. Quem pode manipular o quê. Demanda real (desabastecimento, dose individualizada, formas não comercializadas) vs atalho de preço/hype. Tabela: registrado / off-label / manipulado legítimo / irregular. Papel do médico na cadeia de responsabilidade compartilhada.",
    },
    {
      position: 2,
      module_position: 1,
      module_title: "Módulo 1 · Território e risco",
      topic: "Microbiologia e qualidade que o prescritor precisa cobrar: endotoxina, particulado, esterilidade",
      extra:
        "Contaminação, endotoxina, particulado, validação de processo, sala limpa (ISO), testes de esterilidade. Casos históricos de surtos ligados a compounding (lições sem alarmismo). Checklist do que exigir em laudo/CQ antes de confiar no frasco. Red flags de farmácia.",
    },
    {
      position: 3,
      module_position: 2,
      module_title: "Módulo 2 · Farmacotécnica do prescritor",
      topic: "Osmolaridade, pH, veículo, estabilidade e compatibilidade — ler o rótulo como clínico",
      extra:
        "Conceitos práticos: osmolaridade, pH, veículos (água, óleo, solventes), fotossensibilidade, prazo de uso após reconstituição, armazenamento (cadeia de frio). O que NÃO misturar. Como interpretar certificado de análise / boletim técnico. Tabela comparativa de vias SC vs IM vs IV para manipulados.",
    },
    {
      position: 4,
      module_position: 2,
      module_title: "Módulo 2 · Farmacotécnica do prescritor",
      topic: "Receita, justificativa clínica, lote e rastreio: o mínimo defensável no prontuário",
      extra:
        "Elementos obrigatórios da prescrição de manipulado injetável. Justificativa clínica e CID quando couber. TCLE específico. Registro de lote, validade, farmácia, orientação de uso. Modelo de prontuário defensável. O que auditoria/CFM costuma olhar.",
    },
    {
      position: 5,
      module_position: 3,
      module_title: "Módulo 3 · Classes com critério",
      topic: "Incretinas manipuladas (semaglutida/tirzepatida): quando faz sentido e quando é atalho perigoso",
      extra:
        "Contexto BR: acesso, desabastecimento, custo. Diferença entre produto industrial registrado e manipulado. Riscos de dose, pureza, imunogenicidade, inconsistência lote a lote. Critérios objetivos para considerar manipulado (e quando recusar). Titulação, monitoramento, documentação. Alternativas éticas. Nunca promover manipulado como ‘igual ao original’.",
    },
    {
      position: 6,
      module_position: 3,
      module_title: "Módulo 3 · Classes com critério",
      topic: "Hormônios injetáveis manipulados: testosterona, estradiol e limites éticos da individualização",
      extra:
        "Quando a magistral individualiza dose/forma com respaldo vs quando vira estética sem critério (CFM). Monitoramento laboratorial, hematócrito, PSA, risco trombótico. Formas oleosas vs aquosas. Interação com implantes. Tabela de red flags. Documentação e recusa fundamentada.",
    },
    {
      position: 7,
      module_position: 4,
      module_title: "Módulo 4 · Zona cinzenta",
      topic: "Peptídeos research-only e secretagogos: o que é proibido, o que é especulação, o que documentar na recusa",
      extra:
        "BPC-157, TB-500, GHK-Cu parenteral, CJC/ipamorelin, MK-677 e afins: evidência, status regulatório, WADA, CFM. Script de recusa ética. Alternativas baseadas em evidência. Como o paciente chega com frasco ‘research’ — condução sem humilhar, com firmeza.",
    },
    {
      position: 8,
      module_position: 4,
      module_title: "Módulo 4 · Zona cinzenta",
      topic: "Vitaminas, aminoácidos e ‘cocktails’ injetáveis: deficiência documentada vs wellness",
      extra:
        "Vitamina D IM, B12, ferro (quando IV/IM indicado), complexo B, aminoácidos. Separar deficiência laboratorial de moda. Riscos de megadose e misturas. Relação com o curso de soroterapia (complementar, não repetir drip-bar). Checklist: lab → indicação → via → farmácia.",
    },
    {
      position: 9,
      module_position: 5,
      module_title: "Módulo 5 · Farmácia, segurança e regulatório",
      topic: "Como escolher farmácia de manipulação estéril: critérios objetivos sem citar marca",
      extra:
        "Checklist: alvará, responsabilidade técnica, área estéril, testes de esterilidade/endotoxina, rastreabilidade, prazo de resposta a desvio, farmacovigilância, contrato/qualidade. Perguntas que o médico deve fazer. Red flags (preço milagroso, sem laudo, delivery sem cadeia de frio, marketing agressivo ao prescritor).",
    },
    {
      position: 10,
      module_position: 5,
      module_title: "Módulo 5 · Farmácia, segurança e regulatório",
      topic: "Eventos adversos, recall e emergência: anafilaxia, infecção, extravasamento, inconsistência de dose",
      extra:
        "Protocolo de resposta a EA: suspender, estabilizar, notificar, documentar, informar paciente e farmácia, ANVISA quando couber. Kit de emergência no consultório que aplica injetáveis. Recall de lote — fluxo prático. Caso: reação + lote suspeito.",
    },
    {
      position: 11,
      module_position: 6,
      module_title: "Módulo 6 · Protocolo integrado",
      topic: "Regulatório BR em profundidade: ANVISA, CFM, publicidade e o que derruba CRM",
      extra:
        "Marcos regulatórios de manipulação estéril (RDCs relevantes em linguagem clínica). Publicidade de manipulados e redes sociais. Responsabilidade solidária. Limites éticos de indicação. Tabela: condutas que expõem o CRM. Como a Doutiva posiciona Purus: qualidade + critério, nunca empurrão.",
    },
    {
      position: 12,
      module_position: 6,
      module_title: "Módulo 6 · Protocolo integrado",
      topic: "Caso integrado: do pedido de ‘igual Ozempic mais barato’ ao protocolo ético em 90 dias",
      extra:
        "Vinheta densa: paciente com obesidade, orçamento limitado, traz anúncio de tirzepatida manipulada; médico monta caminho ético (avaliação, opções industriais/acesso, critérios para manipulado se houver, farmácia, TCLE, follow-up). Clinical_case com 4 vias — só 1 correta. Quick_ref final do curso (checklist de bolso do prescritor de manipulados).",
    },
    {
      position: 13,
      module_position: 7,
      module_title: "Módulo 7 · Formulário prático",
      topic: "Painel das formulações injetáveis mais comuns no consultório BR",
      extra: `TABELA-MESTRA obrigatória (markdown) com colunas: substância | forma/concentração típica manipulada | para que se usa (indicação clínica legítima) | via (SC/IM/IV) | frequência usual | o que NÃO fazer.
Cobrir no mínimo: semaglutida, tirzepatida, testosterona cipionato/enantato, estradiol (valerato/cipionato), progesterona oleosa, cianocobalamina (B12), colecalciferol IM (vit D), tiamina, complexo B, gluconato de cálcio (contexto), ferro sacarato/isomaltosídeo quando IV/IM indicado.
Para cada linha: contraste com produto industrial registrado quando existir. Tom: formulário de bolso do prescritor — números realistas BR, sem inventar marca.`,
    },
    {
      position: 14,
      module_position: 7,
      module_title: "Módulo 7 · Formulário prático",
      topic: "Incretinas na bancada: concentração, reconstituição e administração SC passo a passo",
      extra: `Foco operacional semaglutida e tirzepatida manipuladas:
- Concentrações comuns pedidas à magistral (ex.: mcg/mL ou mg/mL) e como converter dose prescrita → volume a aspirar.
- Reconstituição / diluente / estabilidade após preparo / cadeia de frio / prazo de uso.
- Técnica SC: locais (abdômen, coxa, braço), rotação, ângulo, agulha, o que ensinar ao paciente.
- Esquema de titulação típico (industrial como referência ética) e como espelhar com manipulado sem “pulo de dose”.
- Checklist pré-aplicação e erros clássicos (volume errado, troca de frasco, dose semanal vs diária).
Tabelas densas + flow de administração. Caso: paciente confunde mL com mg.`,
    },
    {
      position: 15,
      module_position: 7,
      module_title: "Módulo 7 · Formulário prático",
      topic: "Hormônios oleosos e aquosos: via, local de aplicação, intervalo e monitoramento",
      extra: `Formulário prático:
- Testosterona cipionato/enantato (óleo): doses típicas, IM (glúteo/vasto lateral), intervalo (ex. semanal/quinzenal), aspiração, volume máximo por sítio.
- Estradiol valerato/cipionato e progesterona oleosa: indicações legítimas vs estética sem critério; vias e intervalos.
- Cuidados com óleo: nódulo, infecção, embolia oleosa (raro), rotação de sítio.
- Monitoramento: hematócrito, lipídios, PSA/quando couber, sintomas, labs de eixo.
Tabela: hormônio | veículo | via | local | intervalo | labs de seguimento | red flags.
Caso: pedido de “ciclo” sem hipogonadismo documentado — recusa + alternativa.`,
    },
    {
      position: 16,
      module_position: 7,
      module_title: "Módulo 7 · Formulário prático",
      topic: "Vitaminas e minerais injetáveis: indicação, dose, via e técnica — guia de bolso",
      extra: `Formulário operacional:
- B12 (cianocobalamina/metilcobalamina): quando IM/SC faz sentido (deficiência documentada, má absorção); esquemas de ataque e manutenção; técnica IM.
- Vitamina D3 IM: quando considerar vs VO; dose de ataque; intervalo; monitorar 25OHD/cálcio.
- Complexo B / tiamina: contextos (alcoolismo, reposição), vias.
- Ferro IV/IM: só com indicação laboratorial; vias preferenciais; riscos (anafilactoide); quando encaminhar ambiente adequado.
Quick_ref final do Módulo 7: uma página “o que prescrevo / para quê / como aplico / o que monitoro”.
Caso: paciente pede “soro de vitamina” sem lab — condução correta.`,
    },
  ],
};
