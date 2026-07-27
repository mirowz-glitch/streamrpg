# Living Character — Fase 1 (Estado Global disponível após o Global Idle System)

**Status:** 🚧 Preparação — nenhuma tela nova foi construída a partir deste documento. Escrito imediatamente após a Sprint "Global Idle System — Architecture Refactor", que moveu o `IdleDriver` e o tick global de dentro de `AdventurePage` para o singleton de módulo de `useAdventureSession.ts`.

Este documento **não substitui** `living-character-implementation-plan.md` (escrito ao final da Sprint "Idle Loop Implementation Phase I") — ele o **atualiza**. Aquele plano recomendava, na Seção 4, elevar o `IdleDriver` pra fora de `AdventurePage` como pré-requisito pro painel "Em Aventura" da tela de Personagem funcionar de verdade. Essa recomendação foi implementada nesta Sprint — mas não só pra Personagem: **qualquer tela** que chame `useAdventureSession()` agora recebe o mesmo estado, ao vivo, incluindo o status do driver. Este documento existe pra listar, campo por campo, o que cada tela pode mostrar agora que antes era impossível ou exigia gambiarra.

Escopo explícito: só disponibilidade de dado e comportamento. Nenhuma cor, layout, componente React específico ou decisão visual — isso é implementação, pertence à Sprint "Living Character" em si.

---

## 1. O que mudou estruturalmente

Antes desta Sprint: `hudState` (a Presentation Layer completa) já sobrevivia à navegação (Adventure Session Persistence, duas Sprints atrás) — mas o *status* do IdleDriver (rodando/pausado) e o *controle* dele (pausar/retomar) só existiam dentro de `AdventurePage`, porque a instância do driver vivia lá. Uma tela de Personagem/Inventário/Cidade não tinha como saber se a exploração estava rodando ou pausada, nem como pausá-la.

Agora, `useAdventureSession()` — o mesmo hook, chamável de qualquer tela — devolve, além de tudo que já devolvia:

```ts
{
  hudState,              // já existia — Presentation Layer completa
  error,
  restart,
  ready,
  isDemoSession,
  lootRejectedFeedback,
  idleStatus,            // NOVO — "running" | "paused" | "stopped"
  pauseIdle,              // NOVO — comando, não é mais exclusivo de AdventurePage
  resumeIdle,             // NOVO
  lastTickOutcome,        // NOVO — eventos/floating numbers do tick mais recente
  msUntilNextTick,        // NOVO — snapshot em ms até o próximo avanço automático
}
```

Toda tela que monta este hook se inscreve automaticamente (`subscribe()`/`unsubscribe()`, ver `useAdventureSession.ts`) pra ser notificada a cada tick global — mesmo sem nunca ter chamado nada além de ler o estado. Isso é o que torna os itens abaixo possíveis sem nenhuma nova rota de API, nenhum polling próprio de tela, nenhuma duplicação de lógica de simulação.

## 2. Estado Global disponível (Fase 4 da Sprint anterior) — de onde vem cada campo

| Campo pedido na Fase 4 | Fonte real | Observação |
| --- | --- | --- |
| Explorando | `idleStatus === "running"` | Já existia como conceito (usado em `AdventurePage`), agora lido de qualquer tela |
| Pausado | `idleStatus === "paused"` | Idem — antes só existia dentro de `AdventurePage` |
| Combatendo | `hudState.sessionStatus === "em-combate"` | Já existia em `HudState`, sempre disponível |
| Último combate | `hudState.lastDamageDealt` / `hudState.lastDamageTaken` (valor) + `hudState.recentEvents` filtrado por `AttackHit`/`EncounterCompleted` (contexto) | Já existia, reaproveitado |
| Último loot | `hudState.recentLoot` (mais recente) ou `hudState.bestItemFound` (melhor já encontrado na sessão) | Já existia |
| Região atual | `hudState.region` (nome, dificuldade, bioma) | Já existia |
| Checkpoint atual | `hudState.expedition?.checkpointsReached` / `.checkpointsTotal` | Só não-nulo com expedição ativa (já era assim) |
| Dungeon atual | `hudState.expedition` com `.finalBoss !== null` | Mesmo critério que `ExpeditionCard`/`FinalBossBanner` já usam |
| Boss atual | `hudState.expedition?.finalBoss` (`bossName`, `encountered`, `defeated`, `healthPercent`) | Já existia |
| Tempo até o próximo avanço | `msUntilNextTick` | **Novo nesta Sprint** — método puro `IdleDriver.msUntilNextTick(now)` (packages/shared), exposto pela primeira vez no hook |

Nenhuma linha desta tabela exige uma nova consulta ao motor, um novo evento de Presentation Layer, ou uma nova Layer — é reaproveitamento total, exatamente como a Sprint exigia ("Nenhuma regra de Combate/XP/Loot/AutoEquip/Dungeon/Boss pode mudar").

**Ressalva sobre `msUntilNextTick`**: é uma leitura pontual, feita no momento do render — não é um cronômetro vivo. Uma tela que queira mostrar "2.1s até o próximo avanço" contando pra baixo em tempo real precisa do seu próprio intervalo curto local (ex.: 100-250ms) só pra forçar um re-render e reler o valor — a mesma decisão de apresentação que `useAnimationController` já toma pra suas próprias animações. Isso é trabalho da Sprint "Living Character", não deste documento.

## 3. O que cada tela pode mostrar agora (sem nenhuma UI desenhada aqui)

### Personagem (`CharacterPage`)
Já era o alvo original de `living-character-implementation-plan.md`. Agora pode, de fato, mostrar tudo daquele plano — incluindo o item que ficava pendente (Seção 3 daquele documento: "Pausado — Novo pra este painel... Não existe fora de `AdventurePage` ainda"). Isso deixou de ser verdade: `idleStatus` chega aqui do mesmo jeito que chega em `AdventurePage`. A tela também pode oferecer seu próprio botão Pausar/Continuar (`pauseIdle`/`resumeIdle`), sem precisar navegar de volta pra Aventura.

### Inventário (`InventoryPage`)
Pode mostrar um indicador simples de "explorando"/"pausado" (mesmo texto que já existe em `AdventurePage`, `idleStatus`) enquanto o jogador organiza itens — hoje a tela não tem nenhuma pista de que o mundo continua avançando por baixo. Também pode reagir a `lastTickOutcome` para destacar quando um item novo chegou (`LootDropped` no tick mais recente) sem precisar recarregar a página ou navegar de volta.

### Cidade (`CityPage`)
Pode mostrar o mesmo indicador de status (explorando/pausado) e a região atual (`hudState.region.name`) — hoje a Cidade não comunica nada sobre o que está acontecendo na Aventura enquanto o jogador está nela. Não precisa (e não deve, ver Seção 5) duplicar o HUD de combate — só uma pista de que "sua aventura continua" é o suficiente pro princípio de design "o mundo nunca para" ficar visível também aqui.

### Mundo (`WorldPage`)
Mesma disponibilidade de `hudState.region`/`idleStatus`/`msUntilNextTick` que as outras telas. Como `WorldPage` já lida com o estado macro do reino (Kingdom/Faction/World Simulation, sistemas separados e já existentes), o uso mais natural aqui é cruzar `hudState.faction` (persistente, já existia) com o estado global de exploração — ex.: mostrar que o personagem está ativamente ganhando reputação pra uma facção específica agora, não só o valor acumulado.

### Aventura (`AdventurePage`)
Não ganha nada novo em termos de DADO (já tinha acesso a tudo antes, por ser a tela que possuía o driver) — a mudança pra ela é só arquitetural: deixou de ser dona do `IdleDriver`, virou só mais uma observadora que também sabe pausar/retomar. Comportamento visível ao jogador é idêntico ao que já era.

## 4. O que é genuinely novo em relação ao plano anterior

`living-character-implementation-plan.md` Seção 4 apresentava duas opções (A: elevar o driver / B: painel só-leitura, nunca mostra "Pausado") e recomendava A "não é uma mudança de escopo grande". Esta Sprint implementou exatamente a Opção A, mas com um escopo maior do que aquele plano previa: não foi só Personagem que ganhou acesso ao driver — foi **qualquer tela**, porque a elevação aconteceu no mesmo singleton de módulo que já era compartilhado por toda a aplicação (`useAdventureSession.ts`), não um Context Provider escopado só pra uma tela. Isso significa que a Seção 6 daquele plano ("Nunca duplicar a HUD completa da Aventura") continua valendo com a mesma força — a disponibilidade de dado cresceu, a recomendação de composição visual minimalista não mudou.

## 5. O Que NÃO Fazer Nesta Preparação (lembrete de escopo, mesmo princípio do documento anterior)

- Não desenhar nenhuma interface (cores, layout, componente React específico) — pertence à Sprint "Living Character" em si.
- Não duplicar a HUD completa da Aventura em nenhuma tela — cada painel é um resumo, nunca uma cópia.
- Não implementar um cronômetro vivo pra `msUntilNextTick` aqui — só a leitura pontual já está disponível; a decisão de apresentação (intervalo próprio, throttling, etc.) é da próxima Sprint.
- Não tocar Marketplace/Kingdoms/Economia — fora de escopo tanto desta preparação quanto da Sprint anterior.

---

*Referências: [docs/design/idle-experience-redesign.md](idle-experience-redesign.md) Seção 5 (Personagem Vivo); [docs/design/living-character-implementation-plan.md](living-character-implementation-plan.md) (plano original, agora parcialmente superado pela Seção 4 acima); Sprint "Global Idle System — Architecture Refactor" (implementação real do estado global descrito aqui).*
