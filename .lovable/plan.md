# Doutiva: o clube dos médicos que aprendem jogando

## A ideia (nem 8 nem 80)
Não é um "curso online com pontinhos" nem uma cidade virtual confusa. É uma **comunidade médica de elite** onde o médico entra por prazer (casos, colegas, status, oportunidades) e **é treinado sem perceber**: cada interação vira prática medida pelos Professores de IA.

Três camadas, tudo conectado:

```text
COMUNIDADE (por que ele entra)   -> casos do dia, discussões, mentores, eventos, ranking
TREINO INVISÍVEL (o que ele ganha) -> caso de 2 min, desafio no WhatsApp, sabatina, domínio por tema
NEGÓCIO (como a Doutiva cresce)  -> assinatura, cursos pagos, marketplace médico
```

## Diferenciais (o que ninguém no mercado tem junto)
1. **Caso do Dia**: um caso clínico curto no feed. O médico responde, vê como os colegas responderam e recebe correção do Professor de IA. Parece rede social, é treino.
2. **Treino pelos canais que ele já usa**: desafio diário pelo WhatsApp e e-mail (1 pergunta, 1 minuto). A resposta conta para o Domínio e para o ranking. *(WhatsApp precisa de conta oficial do WhatsApp Business; é uma etapa posterior.)*
3. **Domínio visível como status**: selo por tema ("Domínio em Incretinas 82") no perfil, nos comentários e no ranking. É reputação entre colegas, não nota de prova.
4. **Revisão espaçada automática**: o sistema lembra o que ele errou e devolve depois como caso novo, sem chamar de "revisão".
5. **Ligas e temporadas**: competição saudável por especialidade, com DoutCoins trocáveis no marketplace.

## Estrutura final do menu
```text
COMUNIDADE   Feed (Caso do Dia + discussões) | Mentores | Eventos | Ranking e Ligas
APRENDER     Cursos | Professores de IA | Meu Domínio
MARKETPLACE  Cursos e mentorias pagos | Produtos e serviços para médicos | DoutCoins
CONTA        Meu plano e cobrança | Conquistas e certificados | Configurações
CRIAR (admin/mentor) Estúdio de Cursos | Biblioteca Científica | Painel admin
```

## O que sai (sem vínculo com o propósito)
Cidade, mapa, espaços virtuais, inventário, concierge, ventures, ferramentas genéricas, afiliados, "premier", jornadas e rotas do projeto antigo, o estúdio antigo. Loja + marketplace viram **um só Marketplace**. Carteira + LifeCoin viram **DoutCoins**. Billing + plano viram **Meu plano**.

## Etapas
1. **Limpeza e reorganização** do menu e das páginas (acima), com textos e visual Doutiva.
2. **Feed da comunidade com Caso do Dia** respondido e corrigido pela IA, com Domínio atualizado.
3. **Cobrança real**: assinatura mensal/anual e venda de cursos (provedor de pagamento a definir com você: preços e planos).
4. **Marketplace real**: mentores e parceiros cadastram produtos; compra com dinheiro ou DoutCoins.
5. **Canais externos**: desafio diário por e-mail primeiro; WhatsApp depois.

Esta aprovação executa a **etapa 1** e prepara as demais; cada etapa seguinte é validada com você.

## Detalhes técnicos
- Apagar rotas: city, map, space, spaces.$slug, inventory, concierge, ventures(+$slug), tools(+$slug), affiliates, premier, journeys, route, studio, season (vira ligas no ranking), library antiga.
- Unir store + marketplace em /marketplace; wallet + lifecoin em /doutcoins; billing + plan em /plano; achievements + certifications em /conquistas.
- Manter community, events, mentors, ranking, inbox, notifications, settings, help, admin, onboarding.
- Limpar app-shell, dashboard, index e src/lib/valley.ts de links mortos; dashboard vira o Feed.
- Sem mudança de banco na etapa 1. Validar com build e Playwright em todas as rotas restantes.
