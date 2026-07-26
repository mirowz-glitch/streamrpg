# Vertical Slice RC1 — Build Freeze Audit (Fase 1)

Revisão do estado atual do projeto na baseline congelada (commit `2a5bfc4`, branch `release/vertical-slice-rc1`) em busca de funcionalidades parcialmente implementadas que possam confundir um jogador externo durante o playtest. Cada item é classificado como **Bloqueia RC** ou **Aceitável para RC**.

---

## 1. Higiene de repositório (achado antes de qualquer análise de feature)

Antes de revisar features, a auditoria encontrou um bloqueador de reprodutibilidade em si: o repositório tinha ~190 arquivos modificados/novos nunca commitados (várias Sprints de investigação, UX e conteúdo, algumas anteriores a esta conversa — World Tiers, Unique Relics, Expedition Modifiers), além de artefatos de build (`dist/`, com nomes de arquivo hash-content que nunca ficam estáveis) e bancos SQLite locais (`data/*.db*`) sendo versionados por engano.

**Classificação: bloqueava RC — já resolvido.** Corrigido nesta mesma Sprint: `.gitignore` atualizado (`dist/`, `*.tsbuildinfo`, `data/*.db*`), arquivos de build/DB desvinculados do controle de versão (mantidos em disco), e todo o restante commitado como `2a5bfc4` na branch dedicada `release/vertical-slice-rc1`. Ver [Version Identity](README.md) para os detalhes do commit.

## 2. Funcionalidades parcialmente implementadas — revisão feature a feature

| Achado | Onde | Classificação | Justificativa |
| --- | --- | --- | --- |
| Prédios "Mercador" e "Alquimista" na Cidade mostram "em construção" | `CityPage` / prédios da Praça Central | **Aceitável para RC** | Já rotulados honestamente como indisponíveis — não geram confusão, geram expectativa correta (curiosity driver já validado no Player Retention Loop Sprint) |
| `ExpeditionPanel` (Portão Norte) não renderiza nada quando o jogador não tem login | `apps/web/src/components/ui/ExpeditionPanel.tsx` | **Aceitável para RC** | Por design — é um sistema diferente (Expedição persistente via Twitch), não o loop de Aventura testado no RC. Não bloqueia porque o link "Ir para a Aventura →" (adicionado na Sprint Front Door Experience) já está acima dele e é a ação esperada sem login |
| Mensagem de login da página Crônicas ("Faça login para ver seu Livro.") é mais seca que Inventário/Mundo (que já explicam o que a página mostra e sugerem alternativa) | `apps/web/src/pages/ChroniclePage.tsx` | **Aceitável para RC** | Inconsistência de tom, não uma funcionalidade quebrada ou enganosa — já registrada como achado do Player Retention Loop Sprint, não nova nesta auditoria |
| Ranking global mostra só 1 entrada (dado de ambiente de dev) | `apps/web/src/pages/RankingPage.tsx` | **Aceitável para RC, com nota operacional** | Não é um bug — reflete o estado real do ambiente de teste. Ver [Known Issues](known-issues-rc1.md) para a implicação prática: múltiplos playtesters no mesmo servidor verão os dados uns dos outros no Ranking/Mundo se estiverem logados |
| Ouro sem função de gasto real (Mercador/Alquimista incompletos) | Economia geral | **Aceitável para RC** | Já rastreado no roadmap comercial como item de "o que pode esperar", não um bug — o loop testado (combate/loot/progressão) não depende de gastar ouro |
| `apps/api` falha no typecheck em arquivos de um sistema de Engine em migração (`EventBus.test.ts`, `GameEngine.test.ts`, `SQLiteBossRepository.ts`, `SQLiteBossParticipationRepository.ts`, `SQLiteCharacterRepository.test.ts`) | `apps/api/src/engine/*`, `apps/api/src/infrastructure/SQLiteBoss*` | **Aceitável para RC** | Confirmado via `git diff --cached` que nenhum desses arquivos faz parte do commit de congelamento — já estavam quebrados no commit anterior (`ef7e23a`), não relacionados a nenhuma investigação desta sessão. O servidor roda via `tsx` (sem typecheck bloqueante) e foi verificado funcionando em múltiplos playtests recentes na mesma baseline. Não reaberto — é uma investigação de Engine migration ainda não concluída (ver roadmap de engine), fora do escopo desta Sprint |
| Persistência de equipamento (afixos completos do item procedural) não sobrevive 100% fiel a um refresh dentro da Aventura | `useAdventureSession.ts` / sync com Character real | **Aceitável para RC** | Já documentado (Equipment Progression Repair Phase II) como limitação conhecida, não bug novo — o essencial (item aparece no Personagem/Inventário real) já funciona |
| Picos Congelados com ~82% de mortalidade | Região de dificuldade "Muito Alta" | **Aceitável para RC, com destaque no Known Issues** | Já rastreado como Endgame Funnel Fix no roadmap comercial; reforçado pelo Player Retention Loop Sprint (morte real observada). Não bloqueia porque o rótulo "Muito Alta" já existe na ficha da região — é uma limitação de balanceamento conhecida, não uma funcionalidade quebrada |
| Login real via Twitch OAuth exige conta Twitch real do participante | `LoginPage.tsx` / `handleLogin()` | **Aceitável para RC** | Já comunicado como opcional na Landing (Front Door Experience Sprint) — RC1 é testável integralmente sem essa camada |

## 3. Conclusão da Fase 1

**Nenhum item revisado bloqueia o congelamento da RC.** O único bloqueador real encontrado (higiene de repositório / ausência de um ponto de referência git) já foi resolvido como parte desta mesma Sprint, antes do restante da análise. Todos os demais achados são limitações já conhecidas e já documentadas em Sprints anteriores, nenhuma delas nova, nenhuma capaz de gerar confusão que não seja já explicada na própria interface (placeholders "em construção", avisos de sessão de demonstração, mensagens de login).

Ver [Known Issues](known-issues-rc1.md) para o registro formal de cada item acima na categoria correta (Bug / Limitação Conhecida / Feature Futura).
