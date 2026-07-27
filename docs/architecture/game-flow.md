# Fluxo Completo do Jogo — RC1

**Status:** 🟢 Canônico. Descreve o ciclo real do jogador, sistema por sistema, com o que já está implementado e verificado em Browser Validation ao longo do RC1 — não uma aspiração.

## O Ciclo

```
Adventure
     ↓
Living World
     ↓
Backpack
     ↓
City
     ↓
Adventure
```

Este é o mesmo ciclo especificado em `docs/design/idle-experience-redesign.md` Seção 11, agora com cada seta apontando para a implementação real que a realiza.

## Adventure → Living World

A Aventura (`AdventurePage`, sustentada por `useAdventureSession()`) avança sozinha desde o Global Idle System — o `IdleDriver` roda no singleton de módulo, não dentro da página. Cada tick resolve encontros, aplica dano, gera loot, verifica upgrade automático, atualiza expedição/checkpoint.

O jogador não precisa estar na tela de Aventura para isso continuar — é exatamente esse fato que torna "Living World" possível: a tela de Personagem (`CharacterPage`) monta o mesmo hook e mostra, via `AdventureLivePanel`, uma narrativa em prosa do que está acontecendo (`buildJourneySummary`, `adventureJourney.ts`) e um diário classificado por prioridade (`buildAdventureDiaryEntries`, `adventureDiary.ts`) — sem duplicar nenhuma lógica de simulação, só lendo o mesmo `hudState`.

**Ponte real**: `hudState.recentEvents` (últimos 20 `PresentationEvent`) é o dado compartilhado que faz a Aventura "conversar" com a Living World sem nenhuma chamada de API nova — o painel de Personagem só se inscreve (`subscribe()`) no mesmo estado.

## Living World → Backpack

Quando o jogador quer ver de perto um item mencionado no painel de Personagem, ele abre o Inventário (`InventoryPage`). A Mochila (`BackpackNarrativePanel`) também lê `useAdventureSession()` diretamente — mas com uma diferença importante descoberta na auditoria da Sprint "Backpack Experience Phase I": o `InventoryItem` persistido (`GET /api/items`) não carrega região nem a flag de auto-equipar. Por isso, "Encontrados Recentemente" e "Última Jornada" são derivados dos EVENTOS AO VIVO (`recentEvents`), não da lista persistida — a lista persistida continua sendo a fonte de verdade para "o que existe", mas os eventos ao vivo são a fonte de verdade para "o que aconteceu e quando".

**Ponte real**: `buildRecentFinds(events)` (`backpackFinds.ts`) e `buildLastJourneySummary(hudState)` (`backpackJourney.ts`) leem o mesmo `recentEvents` que `adventureJourney.ts`/`adventureDiary.ts` já liam — o mesmo dado, uma segunda lente.

## Backpack → City

Quando a mochila se aproxima do limite (`DEMO_INVENTORY_CAPACITY`, hoje 24), `deriveBackpackSignals(itemCount, recentFindsCount)` (`backpackSignals.ts`) classifica a "plenitude" da mochila (`leve`/`normal`/`cheia`) — esse sinal é o que justifica, em termos de produto, a visita à Cidade (`idle-experience-redesign.md` Seção 7: "a Cidade é a resposta a uma necessidade que nasceu em outro lugar").

**Ponte real**: `CityPage` também monta `useAdventureSession()` (uma única assinatura, reaproveitada via props para os prédios) e busca a contagem de itens (`GET /api/items`) uma vez, alimentando o mesmo `deriveBackpackSignals`/`buildRecentFinds` já usados pela Mochila — nenhuma lógica de sinal foi duplicada entre as duas telas.

## City → Adventure

A Cidade (`buildCityWelcomeLines`, `cityWelcome.ts`; `buildCitySuggestions`, `citySuggestions.ts`) reage ao mesmo estado — "Você acaba de retornar da expedição... o Mercador pode avaliar seus itens" — e o Mercador/Ferreiro (`MerchantBuilding.tsx`/`BlacksmithBuilding.tsx`) hoje só comunicam PAPEL (Fase 8 da Sprint City Foundation: `<p className="city-building-role">Responsável por: ...</p>`), sem transação real — o bloqueio conhecido é a decisão de arquitetura de Ouro (ver `docs/design/gold-architecture-phase1.md`), que o Economy Core resolve a seguir.

Voltar para a Aventura não exige nenhuma ação especial: a exploração nunca pausou durante toda a visita à Cidade, porque o `IdleDriver` continuou rodando no singleton o tempo todo — confirmado em Browser Validation em pelo menos três Sprints (Backpack, City Foundation), sempre com contadores de kills/nível crescendo durante a navegação inteira.

## O que ainda não fecha o ciclo (conhecido, não um bug)

City → Adventure hoje é só "a exploração continua" — não existe ainda nenhuma transação que MODIFICA o que a próxima Aventura encontra (Ouro gasto em upgrade que muda combate, por exemplo). Fechar essa lacuna de verdade é o objetivo do Economy Core e das Sprints de Mercador/Ferreiro que vêm depois dele — ver `docs/roadmap.md`.

---

*Referências: `docs/architecture/overview.md` (camadas), `docs/design/idle-experience-redesign.md` Seção 11 (fluxo original especificado), `docs/design/backpack-experience-plan.md` e `docs/design/city-foundation-phase1.md` (evidência real de Browser Validation para cada ponte).*
