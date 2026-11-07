# Plano: Aula de Elite Doutiva — Peptídeos na Medicina de Precisão

Objetivo: transformar a aula atual (texto curto) num ambiente de estudo médico de alto padrão, digno de ser mostrado a especialistas.

## 1. Nova tela de aula (4 abas)

1. **Apresentação** — slides clínicos navegáveis (deslizar no celular, tela cheia): mecanismos, gráficos dos ensaios (STEP, SURMOUNT, SELECT, FLOW), fluxogramas de conduta.
2. **Monografia** — texto aprofundado (2.000+ palavras por aula): farmacologia, evidência crítica, protocolo de titulação, monitoramento, segurança jurídica (CFM/ANVISA).
3. **Caso clínico** — paciente real com exames; o médico escolhe a conduta entre 4 opções e recebe justificativa baseada em evidência + DoutCoins.
4. **Guia de bolso** — ficha de consultório (doses, exames, contraindicações, alertas), pronta para imprimir/salvar em PDF.

Tutor IA continua disponível em todas as abas (botão flutuante no celular).

## 2. Conteúdo reescrito com densidade real

As 9 aulas dos 5 módulos serão reescritas:
- M1 Fundamentos: bioquímica dos peptídeos, estabilidade, vias de administração, enquadramento regulatório.
- M2 Incretinas: fisiologia GLP-1/GIP, semaglutida/tirzepatida/retatrutida, ensaios com números, efeitos adversos e massa magra.
- M3 Eixo do GH: tesamorelina (evidência real), CJC-1295/ipamorelina (extrapolação), IGF-1 e risco oncológico.
- M4 Reparo tecidual: BPC-157, TB-500, GHK-Cu — leitura crítica, pureza, FDA Categoria 2, WADA.
- M5 Prática clínica: protocolo de consultório, TCLE, casos integrados.

Cada aula: slides (6–10), monografia, 1 caso interativo, guia de bolso, referências primárias.

## 3. Correções de acabamento
- Títulos longos sem quebras constrangedoras no celular.
- Navegação de módulos em gaveta no celular; barra fixa de próxima aula.
- Selo de nível de evidência e aviso de revisão por especialista.

## Aviso honesto
Doses e frases regulatórias serão escritas com base na literatura, mas devem ser revisadas por um médico especialista antes da apresentação pública.

## Detalhes técnicos
- Novos campos na tabela de aulas: `slides` (jsonb), `clinical_case` (jsonb), `quick_ref` (markdown).
- Componentes novos: slide deck, simulador de caso, guia de bolso; página do curso reorganizada com abas.
- Conteúdo inserido via atualização de dados, aula por aula.
- Ordem: estrutura + componentes → página → conteúdo (módulo a módulo) → verificação no celular e desktop.
