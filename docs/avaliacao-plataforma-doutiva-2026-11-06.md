# Avaliação da plataforma Doutiva — 2026-11-06

Fonte: auditoria de produto na conta `juliano@jubex.com.br` (desktop + mobile), após percorrer Painel, Meus cursos, Peptídeos completo, Caso do Dia, Professores de IA, Revisão, Certificados, Ranking, Marketplace, Mentores, Plano, Estúdio, Biblioteca, Configurações e curso pago.

## Veredito

A Doutiva já tem espinha dorsal rara: loop *lâminas → pontos-chave → caso → revisão*, XP/sequência e conteúdo denso/independente. Ainda se comporta como protótipo polido: IA desligada, tratado ilegível, preços contraditórios e texto interno vazando. **Não abrir para médico pagante esta semana; com acabamento de lançamento, sim.**

## Norte (barra elevada)

| Dimensão | Modelo |
|---|---|
| Produto / conhecimento | AMBOSS |
| Confiança BR | Medway |
| Marca / produção | MasterClass |
| Hábito | Duolingo |

Promessa: **simulador de competência clínica** (preceptor de IA + revisão obrigatória + protocolo aplicável), não Netflix de aulas.

## Críticos (bloqueiam lançamento)

1. IA desligada (Tutor / Professores / Estúdio) — chaves na Vercel.
2. Monografia ilegível no Aprofundar (markdown sem quebras no conteúdo salvo).
3. Preço contraditório (297 vs 197/397/2390) + pagamento inerte.
4. Textos internos vazando (Stripe cortesia, cron/RESEND, raise-bar v1, material·active).
5. Permissões abertas (aluno vê Estúdio / vira Mentor em Configurações).

## Importantes

6. Abas Guia/Tutor do Aprofundar não clicáveis.
7. Matrícula não automática → certificados 0/15.
8. XP inconsistente (toasts vs tela final).
9. Caso do Dia revela resposta antes da pergunta.
10. Professores: temas sem nome do curso.
11. Dados de teste (mentores fictícios, Médico Teste no ranking).
12. Sem rosto docente (nome/CRM/foto).
13. Cosméticos mobile/copy.

## Sprint de lançamento (próxima semana)

**D0–D2 — confiança** ✅ em código/DB (falta env Vercel)
- Env Vercel: `OPENAI_API_KEY`, `AI_GATEWAY_BASE_URL`, `SUPABASE_*` (incl. service role).
- Travar roles (aluno ≠ mentor/admin UI) — settings sem troca de classe; nav aluno sem “Sou Mentor”.
- Remover leaks + unificar oferta = Protocolos R$ 297 (+ anual).
- Reparar monografias (75 tratados normalizados + `normalizeMarkdown` no render).

**D3–D5 — circuito de estudo** ✅ parcial
- Auto-enroll ao abrir aula.
- Aprofundar com tabs reais (Monografia / Guia / Tutor).
- Caso do Dia sem spoiler de “dose correta”.
- Professores: label `Curso · Módulo · Aula`.
- XP: botão sem prometer +30 inconsistente.

**D6–D7 — confiança comercial** (ainda aberto)
- Stripe real ou “em breve” + checkout.
- Docente real (nome/CRM/foto) no reviewed_by.
- Limpar fixtures de teste do ranking/marketplace.
- Nota: conta `juliano@` é **admin** no banco — por isso vê Estúdio; aluno sem `user_roles.admin` não vê.
