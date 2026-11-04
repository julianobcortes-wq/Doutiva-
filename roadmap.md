# Doutiva — Roadmap

## Feito
- [x] Estúdio de Cursos (criar/editar aulas, revisão e publicação com médico revisor)
- [x] Geração em 3 etapas (Claude escreve → GPT estrutura → Claude audita)
- [x] Biblioteca Científica: busca PubMed/PMC e ClinicalTrials.gov, texto completo aberto, PDF/diretriz, aulas ancoradas em [S#]
- [x] Professores de IA (4 personas: socrático, banca, plantão, cético) + Índice de Domínio por sessão

- [x] Fase 1: limpeza das telas antigas, menu enxuto e Caso do Dia
- [x] Caso do Dia roda sobre as aulas publicadas do Estúdio (rotação automática por dia)
- [x] XP, Créditos e Sequência gravados no banco e conferidos de ponta a ponta (1 resposta por dia)

## Robustez (pendente)
- [x] Marketplace: resgate com Créditos (saldo conferido no banco, sem saldo negativo)
- [x] Aula concluída dá +30 XP e +2 Créditos (1x por aula)
- [x] Ranking ligado ao XP real
- [x] acerto do Caso do Dia decidido no servidor

## Próximo (Fundação científica)
- [x] Busca semântica na biblioteca (embeddings) para Tutor IA responder citando fontes
- [x] Tutor IA usando a biblioteca, com citação obrigatória
- [x] Verificação automática de referências (cada [S#] confere com o trecho da fonte)
- [x] Alerta de atualização: novos ECR/diretrizes sobre temas de aulas publicadas

## Experiência do aluno
- [x] Questões por aula + revisão espaçada (/revisao)
- [x] Certificados com carga horária e QR de verificação pública (/verificar)
- [x] Caso do Dia soma XP, Créditos e Sequência de verdade (1x por dia)
- [x] Progresso por trilha e ranking ligados a aulas reais
- [x] Vídeo do mentor por aula
- [x] Telas com conteúdo de exemplo escondidas do menu (Comunidade, Missões, Eventos, Loja, Temporada, Solicitações)

## Corpo docente e qualidade
- [x] Perfis de Médico Mentor com CRM/RQE e permissões próprias no Estúdio
- [x] Histórico de versões e trilha de auditoria de cada aula
- [x] Conselho editorial: fila de revisão com prazos

## Fundação de robustez (este repo)
- [x] Remover demo login com senha no client
- [x] Gabarito clínico server-only + `lesson_case_keys`
- [x] Travar INSERT de `mastery_records` no client
- [x] Nav docente por `has_role` (esconder telas VISUAL_ONLY do menu)
- [x] `.env` ignorado + `.env.example` + `npm test`
- [ ] Aplicar migrations `0013`/`0014` no Supabase live
- [ ] Dump/versionar RLS das tabelas-base (`courses`, `lessons`, `profiles`, …)
- [ ] Citation gate no Tutor (P2)
- [ ] Desacoplar Lovable AI/Vite/OAuth (P3)

## Negócio e conformidade
- [ ] Assinatura/pagamentos (bloqueado: escolha de planos e preços)
- [ ] Verificação de médico no cadastro (CRM) (bloqueado: decisão sobre fonte de verificação)
- [ ] Termos, LGPD e política de uso de IA (bloqueado: revisão jurídica)
- [ ] Credenciamento de educação continuada (bloqueado: decisão institucional)
