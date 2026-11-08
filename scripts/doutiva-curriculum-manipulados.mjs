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
    "Curso flagship Doutiva para o prescritor de manipulados injetáveis: microbiologia e farmacotécnica que o médico precisa cobrar, incretinas e hormônios manipulados com critério, zona cinzenta (peptídeos/research), escolha de farmácia estéril, regulatório BR, eventos adversos e protocolo ético completo — com casos brasileiros densos. Porta clínica para conduta Purus.",
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
  ],
};
