# Player Feedback & Retention — Vertical Slice (Phase I)

Implementadas correções de UX/apresentação para os 4 problemas identificados no playtest anterior (`gameplay-vertical-slice-player-experience-phase-1.md`). Nenhuma mecânica principal foi tocada — Combat Engine, Item Generator, Equipamento, Persistência, XP, Loot e RNG permanecem 100% intocados. Servidor de dev real reiniciado e sessão real rejogada para validar cada correção.

**Resposta ao Objetivo Principal**: sim — um jogador agora percebe claramente quando está numa sessão temporária (aviso permanente + confirmação antes de sair), por que um item não foi equipado (explicação em linguagem simples), e os eventos importantes (Level Up, Elite, Objetivo, Região) já tinham tratamento visual próprio de Sprints anteriores — corrigido um bug de exibição neles e estendida sua duração pra não serem perdidos num clique rápido.

---

## 1. Arquivos Modificados

| Arquivo | Mudança |
| --- | --- |
| `apps/web/src/hooks/useAdventureSession.ts` | Expõe `isDemoSession` (real === null) e `lootRejectedFeedback` (novo, calcula comparação de Power Score contra o equipamento já equipado, só leitura) |
| `apps/web/src/pages/AdventurePage.tsx` | `useBlocker` (React Router) + `beforeunload`; renderiza `SessionSafetyBanner`, `LeaveSessionModal`, `LootRejectedFeedback` |
| `apps/web/src/components/hud/SessionSafetyBanner.tsx` (novo) | Banner permanente de sessão de demonstração |
| `apps/web/src/components/hud/LeaveSessionModal.tsx` (novo) | Confirmação antes de descartar progresso |
| `apps/web/src/components/hud/LootRejectedFeedback.tsx` (novo) | Explicação de por que um item não foi equipado |
| `apps/web/src/components/hud/ProgressionCelebration.tsx` | Corrigido: nome/raridade do "Novo melhor item" apareciam crus (`dagger`/`rare`) |
| `apps/web/src/pages/InventoryPage.tsx` | Removida mensagem herdada do modo passivo; adicionado estado "faça login" distinto de "inventário vazio" |
| `apps/web/styles.css` | CSS para os 3 componentes novos; tinta de fundo + borda nas categorias críticas do feed de eventos (Level Up, Objetivo, Região, Elite/Mini-Boss, Chefe Final) |
| `packages/shared/src/animation/presets.ts` | Duração de 8 animações de celebração estendida (+500 a +700ms) — só timing visual, nenhuma fórmula de jogo |

Nenhum arquivo de Combat Engine, Item Generator, Equipamento, Persistência, XP, Loot Generator ou RNG foi tocado.

---

## 2. Problemas Resolvidos

### Problema 1 — Perda silenciosa de progresso
**Causa**: sessão de Aventura sem login vive só em memória do componente React; navegar pra outra rota desmonta o componente e recria do zero, sem aviso.
**Solução**: `SessionSafetyBanner` (permanente, visível desde o primeiro frame) + `useBlocker` intercepta navegação in-app quando há progresso real (`enemiesKilled > 0`) numa sessão de demo, mostrando `LeaveSessionModal` com "Continuar jogando"/"Sair mesmo assim" — nunca mais silenciosa. `beforeunload` cobre fechar aba/navegar por URL externa.
**Impacto esperado**: elimina o maior risco de percepção negativa encontrado no playtest anterior — o jogador agora ESCOLHE perder o progresso, em vez de descobrir depois.

### Problema 2 — Falta de hierarquia visual
**Causa real, verificada nesta Sprint**: a hierarquia visual (cor, negrito, borda por categoria de evento) já existia desde Sprints anteriores (`LevelUpBanner`, `EliteMiniBossBanner`, CSS por `hud-event-feed-item-{kind}`) — o playtest anterior usou extração de texto puro (`get_page_text`), que não conseguia perceber CSS nem os banners transitórios do Animation Controller (duração de 1,3-1,8s, provavelmente já expirados no momento da leitura). **A causa real não era ausência de hierarquia — era duração curta demais pra confiar em cliques rápidos, e um bug real de formatação** (ver abaixo).
**Solução**: (a) corrigido `ProgressionCelebration` mostrando ids/raridades crus; (b) duração das 8 animações de celebração mais importantes estendida (Level Up, Elite/Mini-Boss/Chefe Final — surgimento e derrota); (c) adicionada tinta de fundo + borda esquerda nas categorias já identificadas como "críticas" no feed de eventos (Level Up, Objetivo Concluído, Região Desbloqueada, Elite/Mini-Boss, Chefe Final/Dungeon) — reconhecíveis por forma, não só por cor de texto.
**Impacto esperado**: reduz a chance de um momento importante passar despercebido num clique rápido, sem inventar um sistema novo de celebração (o que já existia é sólido — só precisava de mais tempo de leitura e de uma correção de exibição).

### Problema 3 — Loot sem contexto
**Causa**: `LootPopup` mostra o item encontrado, mas nunca dizia se foi ou não equipado, nem por quê.
**Solução**: `LootRejectedFeedback` — quando um item não é equipado na mesma tick, consulta (só leitura) o equipamento já equipado no slot correspondente e mostra "X não foi equipado — o que você já tem no slot Y ainda é melhor." Fica visível até o PRÓXIMO drop (não desaparece na tick seguinte sem motivo — mesmo cuidado do Problema 2).
**Impacto esperado**: elimina a sensação de "isso parece um defeito" que o playtest anterior documentou — agora há sempre uma frase explicando a decisão, sem expor "Power Score X ≤ Y".

### Problema 4 — Inventário desconectado
**Causa**: mensagem "Continue assistindo — drops têm boa chance a cada minuto de presença" era da mecânica antiga de espectador passivo, sem relação com o fluxo de Aventura atual; além disso, sem login, a tela mostrava a MESMA mensagem de "vazio" que um inventário genuinamente vazio, escondendo a causa real.
**Solução**: 2 estados agora distintos — "Faça login para ver seu inventário" (sem login) vs. "Jogue uma Aventura para encontrar seus primeiros equipamentos" (logado, genuinamente vazio).
**Impacto esperado**: remove a contradição direta que qualquer jogador novo veria entre "acabei de jogar e achar itens" e "o jogo diz que preciso assistir".

---

## 3. Antes × Depois

| Momento | Antes | Depois |
| --- | --- | --- |
| Sessão sem login | Nenhum aviso em lugar nenhum | Banner permanente amarelo, visível desde o 1º frame: "⚠️ Sessão de demonstração..." |
| Sair da Aventura | Navegação silenciosa, progresso resetado sem aviso | Modal bloqueia a navegação: "Sair da Aventura? Todo o progresso... será perdido" + escolha explícita |
| Item não equipado | Nenhuma explicação em lugar nenhum | "Botas não foi equipado — o que você já tem no slot Botas ainda é melhor." — visível até o próximo drop |
| Level Up | Banner já existia (1,6s) + linha no feed já colorida/em negrito | Banner estendido (2,3s) — mesmo visual, mais tempo de leitura |
| Elite/Mini-Boss/Chefe | Banners já existiam (1,3-2,2s) | Estendidos (+500-700ms cada); linha do feed agora também com fundo+borda, não só cor |
| "Novo melhor item" (stats bar) | `dagger (rare, Power Score X)` — ids crus | `Adaga (Rara, Power Score X)` — nomes traduzidos |
| Inventário vazio, sem login | "Seu inventário está vazio. Continue assistindo..." | "Faça login para ver seu inventário." |

---

## 4. Feedback Layer — Hierarquia Classificada

| Categoria | Exemplos | Tratamento visual |
| --- | --- | --- |
| **Crítico** | Level Up, Elite/Mini-Boss/Chefe Final derrotado, Dungeon concluída, Perda de sessão | Banner transitório de alta prioridade (Animation Controller, 1,8-3,1s) + linha do feed com cor+negrito+fundo+borda; perda de sessão usa banner PERMANENTE + modal bloqueante (não é uma animação, é uma decisão) |
| **Importante** | Novo equipamento, Objetivo concluído, Região desbloqueada, Melhor item, Recorde de dano | Popup dedicado (`EquipmentPopup`/`ObjectiveCompletedBanner`/`RegionUnlockBanner`) ou destaque persistente na stats bar (`ProgressionCelebration`), cor+negrito+fundo no feed |
| **Comum** | Inimigo derrotado, ataque, exploração, recuperação de HP | Só a cor de texto padrão do feed (já existia), sem banner próprio — deliberadamente discreto |

---

## 5. Playtest — Comparação Direta

Sessão real jogada de novo, mesmo servidor de dev, mesma rota `/app/adventure`, agora com todas as correções:

- **Banner de sessão**: apareceu imediatamente, antes de qualquer clique — ficou visível durante toda a sessão (verificado).
- **Confirmação de saída**: clicar em "Inventário" com progresso real (nível 1, 93 XP, 9 abates) abriu o modal e BLOQUEOU a navegação — "Continuar jogando" cancelou corretamente, permanecendo exatamente no mesmo estado (mesma XP, mesmo nível).
- **Feedback de loot rejeitado**: "Botas não foi equipado — o que você já tem no slot Botas ainda é melhor." apareceu no primeiro drop rejeitado e continuou visível por vários cliques seguintes (não sumiu sozinho).
- **Level Up**: alcançado (nível 1→2) durante a sessão; a linha do feed já aparece destacada (cor+negrito+fundo, corrigido/estendido nesta Sprint).

**Ficou significativamente melhor**: os 4 achados do playtest anterior — especificamente a perda de progresso e o loot sem contexto, que eram problemas REAIS de arquitetura/comunicação, não de percepção da auditora.

**Ainda precisa evoluir** (fora do escopo desta Sprint, "não alterar mecânica"):
- A causa raiz do Problema 1 (sessão não persiste sem login) continua existindo — a correção desta Sprint é comunicação honesta, não persistência real. Uma Sprint futura de engenharia poderia avaliar login simplificado/persistência local.
- `LootRejectedFeedback` mostra só o slot mais "perto" de ser batido quando há múltiplos slots candidatos (ex.: Anéis) — uma simplificação deliberada pra manter a frase curta, documentada no código.
- A Cidade (ativo mais forte do projeto, per o playtest anterior) não foi tocada nesta Sprint — segue como está.

---

## 6. Commercial Impact

A chance de um jogador continuar jogando após a 1ª sessão aumenta principalmente pela remoção do maior risco de percepção negativa (perda de progresso sem aviso) — esse tipo de momento gera abandono e reclamação, não recomendação. As correções de maior impacto, em ordem: (1) aviso + confirmação de sessão temporária — resolve o achado mais grave do playtest anterior; (2) feedback de loot rejeitado — resolve a sensação de "isso parece quebrado"; (3) correção do texto de Inventário — remove uma contradição visível a qualquer novo jogador; (4) extensão de duração das celebrações — melhora marginal, já que a base visual já era sólida. Nenhuma mudança nesta Sprint cria por si só um "momento de trailer" novo — a Cidade continua sendo o ativo mais forte pra esse fim, como já identificado.

---

## 7. Roadmap Atualizado

Com os 4 achados do playtest anterior corrigidos nesta Sprint, a prioridade agora se desloca para:

1. **Validação com jogadores reais** (não mais simulação/auditoria interna) — as duas últimas Sprints (playtest + esta correção) já esgotaram o que uma auditoria hands-on sozinha consegue encontrar; o próximo ganho de sinal vem de fora.
2. **Persistência real de sessão sem login** (ou simplificação do fluxo de login) — a causa raiz do Problema 1 continua não resolvida, só comunicada; decidir se vale a pena resolver de verdade é uma escolha de produto (custo de engenharia vs. benefício de retenção), não mais uma pergunta de UX.
3. Qualquer decisão sobre o modelo de progressão de equipamentos (`equipment-progression-investigation-conclusions.md`) continua devendo esperar playtest real, não mais simulação.

---

## Validação

- **Typecheck**: `apps/web` e `packages/shared` limpos.
- **Testes**: suíte completa de `packages/shared` executada uma única vez — 434/434 passando (código de animação alterado, nenhum outro).
- **Playtest manual único**: sessão real no servidor de dev reiniciado, cobrindo os 13 passos do Smoke Test pedido (sessão nova → mensagem → combate → loot → equipar → level up → navegação → confirmação → retorno) — resultados na Seção 5.
