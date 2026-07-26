# Front Door Experience — Vertical Slice Phase I

**Data**: 2026-07-25
**Tipo de Sprint**: implementação (não auditoria) — corrige achados da Sprint anterior ("First 10 Minutes Experience").
**Pergunta principal**: *Um visitante consegue descobrir e iniciar o Vertical Slice sem conhecer URLs internas ou precisar fazer login?*
**Resposta**: **Sim**, confirmado por playtest real, ponta a ponta, a partir de `/`.

---

## 1. Arquivos modificados

| Arquivo | Mudança |
| --- | --- |
| `apps/web/src/components/landing/HeroSection.tsx` | Novo prop `onPlay`; CTA primário "🎮 Jogar Agora"; tagline reescrita; nota explicando o que o login Twitch adiciona. |
| `apps/web/src/components/landing/FinalCTA.tsx` | Mesmo tratamento dual-CTA do Hero; copy reescrita. |
| `apps/web/src/components/landing/HowItWorks.tsx` | 6 passos reescritos: Cidade → Portão Norte → Aventura → Combate → Loot/Nível → Twitch (opcional, por último). |
| `apps/web/src/components/landing/FeatureCard.tsx` | Novo prop opcional `badge`, usado nos 2 destaques que exigem login Twitch. |
| `apps/web/src/pages/LoginPage.tsx` | `FEATURES` reescrito (4 "Jogar Agora" + 2 com badge "Requer login Twitch"); `useNavigate` + `handlePlay()` → `/app/city`; nova seção "O que precisa de login?". |
| `apps/web/src/pages/WorldPage.tsx` | Checagem de `identity` antes do estado de loading — corrige o "Carregando o Reino..." infinito sem login. |
| `apps/web/src/components/city/NorthGateBuilding.tsx` | Novo link real `Ir para a Aventura →` para `/app/adventure`. |
| `apps/web/styles.css` | CSS para os dois CTAs (`.hero-cta-group/primary/secondary/note`), badge de feature (`.feature-card-badge`), seção de clareza de login (`.login-clarity-grid/card`), CTA do Portão Norte (`.north-gate-cta`). |
| `commercial/roadmap/project-valuation-roadmap.md` | Nova seção "0.1" documentando o gargalo de onboarding encontrado e resolvido. |

Nenhuma mecânica, sistema de combate/loot/progressão, OAuth ou arquitetura foi alterada — só apresentação, navegação e mensagens de estado, exatamente como restringido no brief.

---

## 2. Landing Page — o que mudou e por quê

- **Removido** (implicitamente, via reescrita): a moldura de que o único jeito de jogar é "Entrar com Twitch". Esse único CTA existia em dois lugares (Hero e Chamada Final) e não tinha alternativa.
- **Atualizado**: os 6 destaques (`FEATURES`) — antes todos escritos como "algo acontece enquanto você assiste"; agora 4 descrevem o loop ativo real (Combate/Equipamentos/Explore/Chefes, tudo sem conta) e 2 descrevem a camada Twitch (Twitch/Reino), com badge "Requer login Twitch" sempre visível.
- **Adicionado**: CTA primário "🎮 Jogar Agora" (Hero + Chamada Final), seção "O que precisa de login?", e o link real no Portão Norte.
- **Mantido sem alteração** (já eram honestos na auditoria anterior): `WorldSimulationPreview`, `KingdomPreview` e `CharacterPreview`, todos já rotulados "Exemplo ilustrativo" — nenhuma mudança necessária.

Nenhuma informação nova foi inventada: os 6 passos de "Como funciona" e os textos de "O que precisa de login?" descrevem apenas sistemas que já existem e foram confirmados via playtest (seção 4).

---

## 3. Fluxo antes × depois

| Etapa | Antes (Sprint "First 10 Minutes") | Depois (esta Sprint) |
| --- | --- | --- |
| Ação possível na Landing | Só "Entrar com Twitch" (OAuth real) | "🎮 Jogar Agora" (sem login) + "Entrar com Twitch" (opcional) |
| Descoberta da Cidade/Aventura | Nunca mencionada; só alcançável sabendo a URL | CTA leva direto à Cidade; "Como funciona" descreve o caminho até a Aventura |
| Portão Norte | Descrito como "saída para o mundo", sem ação correspondente | Link real `Ir para a Aventura →` |
| `/app/world` sem login | Carregava "Carregando o Reino..." para sempre, sem explicação | Mensagem clara: precisa de login, sugere Cidade/Aventura como alternativa |
| Clareza sobre login | Nunca explicitada — só descoberta clicando em cada item da navegação | Seção dedicada, resposta direta às 5 perguntas do brief |

---

## 4. Jornada do jogador (playtest real, a partir de `/`, sem login)

1. `/` — Landing carrega. Tagline e CTA já comunicam: mundo vivo, combate, progressão, jogável agora, sem conta.
2. Clique em "🎮 Jogar Agora" → `/app/city`, sem qualquer prompt de login.
3. Cidade: praça central, 12 prédios, expectativa clara ("Escolha um edifício para visitar").
4. Clique em "Portão Norte" → hint "saída da Capital para o mundo" + o novo link "Ir para a Aventura →", agora coerente com o texto.
5. Clique no link → `/app/adventure`. Banner amarelo avisa explicitamente: sessão de demonstração, progresso não salvo, login salva de verdade — nenhuma dúvida sobre o que está em jogo.
6. "Avançar" repetido: Encontros, combate, XP, level up (1→3 em ~15 cliques), 9 itens encontrados, 1 equipado automaticamente, feedback explícito de por que um item (Botas) não foi equipado, objetivo concluído (+40 XP bônus), checkpoint de expedição atingido, cura de HP — todo o loop de recompensa visível e comprensível sem instrução externa.
7. `/app/world` (testado direto, sem login): mensagem clara "Faça login para ver o Mundo", com explicação do que é e sugestão de alternativa — nenhum travamento.

**Dúvidas/pontos de atrito observados nesta rodada**: nenhum bloqueio. Única observação menor: o Portão Norte, sem login, não mostra nenhum painel de "Expedição atual" (o `ExpeditionPanel` renderiza vazio quando `enabled=false`, por design — é um sistema diferente, ligado à persistência via Twitch) — isso é coerente, já que a Aventura de demonstração tem seu próprio painel completo em `/app/adventure`; não foi tratado como problema porque não impede a descoberta nem confunde o CTA (que agora está logo acima, sempre visível).

---

## 5. Impacto comercial

Antes desta Sprint, qualquer publisher, investidor ou playtester externo que abrisse a Landing Page veria um produto "Twitch-companion" passivo — e precisaria de instrução verbal ("ignore o login, vá direto pra /app/adventure") pra experimentar o que já é, de fato, o conteúdo mais forte do projeto (combate, loot, progressão). Isso tornava **qualquer material de apresentação futuro** (trailer, steam page, demo ao vivo) dependente de um roteiro escondido, não da própria interface.

Com o Front Door corrigido, a Landing Page agora vende exatamente o jogo disponível hoje, com um caminho de descoberta natural e sem pré-requisito de conta — pré-condição, não substituto, para os próximos itens do roadmap comercial (Equipment Progression Audit, Visual Polish, Trailer). Ver atualização registrada em `commercial/roadmap/project-valuation-roadmap.md`, seção 0.1.

---

## 6. Comparação direta com "First 10 Minutes Experience" (Sprint anterior)

| Achado da Sprint anterior | Status |
| --- | --- |
| Landing vende só a camada Twitch-passiva; loop ativo (Cidade/Aventura/Combate/Loot) não aparece | **Resolvido** — 4 dos 6 destaques + "Como funciona" agora descrevem o loop ativo |
| Nenhum CTA leva ao jogo sem login | **Resolvido** — "Jogar Agora" em Hero e Chamada Final |
| `/app/world` trava em "Carregando o Reino..." sem explicação, sem login | **Resolvido** — mensagem clara + alternativa sugerida |
| Portão Norte promete "saída para o mundo" sem ação correspondente | **Resolvido** — link real pra `/app/adventure` |
| Login nunca é explicado (mandatório? opcional? pra quê?) | **Resolvido** — seção dedicada "O que precisa de login?" |

**O que permanece, fora do escopo desta Sprint** (não eram achados desta Sprint, continuam como estavam):
- "Deserto de loot" e funil de mortalidade em Picos Congelados (~82%) — gargalos de balanceamento já rastreados no roadmap comercial, não de descoberta/onboarding.
- Ausência de identidade visual própria (100% emoji) — fora do escopo ("NÃO IMPLEMENTAR: balanceamento" cobre parte disso; o resto é o item "Identity" do roadmap comercial).
- `ExpeditionPanel` (sistema de expedição persistente via Twitch) não renderiza nada sem login — comportamento correto por design, não um bug, mas vale documentar caso uma Sprint futura decida dar um estado explícito ali também.

---

## 7. Validação técnica

- `npx tsc -p tsconfig.check.tmp.json` (workaround padrão, config temporário removido depois) — **0 erros** em `apps/web`.
- Servidor de dev reiniciado (bundle web só constrói uma vez no start) antes do playtest, confirmando que as mudanças estavam realmente servidas.
- Playtest completo executado via browser automatizado, começando obrigatoriamente em `/`, cobrindo: Landing → Jogar Agora → Cidade → Portão Norte → Aventura → Combate/Loot/Level Up → `/app/world` sem login.
- Suíte de testes de `packages/shared` não foi re-executada — nenhum arquivo desse pacote foi tocado nesta Sprint (mudança 100% front-end de apresentação/navegação).

---

## 8. Critérios de aprovação — checklist final

- [x] Landing representa corretamente o jogo atual (loop ativo, não só Twitch-passivo).
- [x] Existe um CTA claro para iniciar o Vertical Slice.
- [x] Login deixou de parecer obrigatório para experimentar o jogo.
- [x] Cidade e Aventura são descobertas naturalmente (CTA → Cidade → Portão Norte → Aventura).
- [x] Mundo comunica corretamente estados indisponíveis (sem login).
- [x] Narrativa e navegação permanecem coerentes (Portão Norte agora tem ação real).
