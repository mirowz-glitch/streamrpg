# Living Combat — Phase I

**Sprint:** 22 — Living Combat Phase I (Unificação definitiva do Combate)
**Status:** Combat Resolver + Combat Snapshot únicos, wireados em `/api/character`, `BossCombatSystem` e Adventure/Idle/Dungeon (client). Substitui os 3 sistemas paralelos encontrados na Fase 1 desta Sprint (e o Fase 1 da Sprint 21) por um único modelo.

## Filosofia

> Nunca existirão dois cálculos de combate. Nunca existirão dois cálculos de atributos. Nunca existirão dois cálculos de equipamentos. O jogo inteiro deve consultar exatamente o mesmo modelo.

Character API, Adventure, Idle, Boss, Dungeon e (futuramente) PvP consultam hoje exatamente o mesmo `CombatSnapshotDTO`, resolvido pelo mesmo Combat Resolver.

## Fase 1 — Auditoria: quatro sistemas, não três

A Sprint 21 já havia documentado três cálculos paralelos (`docs/design/gem-effects-phase1.md`). Esta Sprint encontrou um quarto, criado pela própria Sprint 21:

1. **`getCombatAttributes()`** (`packages/shared/src/items.ts`, wireado via `SQLiteCharacterRepository`) — modelo simples: raridade+slot+damage_type dos itens equipados, sem critical/life/mana/attackSpeed/magic.
2. **`characterbuild/` + `equipment/stats.ts`** (`calculateFinalStats`) — pipeline rico (os 7 stats), mas alimentado por um `Equipment` **local à sessão de Adventure** (kit inicial fixo, `apps/web/src/hooks/useAdventureSession.ts`), nunca hidratado com os Sockets/Gemas/afixos reais do personagem persistido. Consumido por `combat/combatEngine.ts` (`resolveCombat()`) — o motor real de combate 1-contra-1 usado por Adventure **e** Dungeon (Dungeon não tem nenhuma lógica de combate própria; `dungeonController.ts` só encapsula regras de recompensa/conclusão em cima do mesmo `advanceAdventure()`).
3. **`BossCombatSystem.ts`** — `getCombatAttributes()` (item 1) + a constante fixa `CRITICAL_HIT_CHANCE = 0.05`, alimentando `calculateCanonicalDamage()` (fórmula própria, `docs/combat-model/canonical-formula.md`, um modelo de dano-coletivo-contra-HP-compartilhado, arquiteturalmente distinto do 1-contra-1 do item 2 — Boss não ataca personagens, fora de escopo desde a Sprint original de Boss).
4. **`resolvedStats`/`activeGemEffects`** (Sprint 21, `apps/api/src/routes/character.ts`) — um bolt-on que aplicava o Effect Resolver de Gemas em cima do item 1, só para exibição em `/api/character`. Nunca influenciava Adventure/Idle/Boss/Dungeon.

**Decisão desta Sprint**: os itens 2 (a metade "combinação Derived+Equipment→FinalStats") e a base do item 1 (raridade/slot/afixos) convergem num único Combat Resolver, reaproveitado por TODOS os consumidores. O item 4 é aposentado — substituído pelo Snapshot único. O item 3 mantém sua fórmula de dano própria (fora de escopo — nunca pedido pelo brief), mas passa a receber `attackPhysical`/`attackMagic`/`isCritical` do mesmo Snapshot, nunca mais do modelo simples nem de uma constante fixa.

## Fase 2/3 — Combat Resolver e Combat Snapshot

`packages/shared/src/equipment/realEquipmentStats.ts` — `calculateCharacterStatsFromEquippedItems(items: EquippedItem[], activeGemEffects: ActiveGemEffect[]): CharacterStats`. Irmã de `calculateCharacterStats(equipment)` (Equipment-class, pré-existente): mesma base (`getItemPower` por raridade/slot), mesmos afixos (`applyAffixesToStats`/`STAT_LABEL_BUCKET`, agora exportados), mas lendo itens **persistidos reais** em vez do kit de sessão. Acrescenta, pela primeira vez de verdade:
- **Implicit Mods de Base Identity** (Sprint 19, nunca aplicados a um cálculo até agora) — tradução PT→`NumericStatKey` (`IMPLICIT_MOD_LABEL_TO_STAT`), a única deste tipo no projeto.
- **Gem Effects** (Sprint 21) — mapeados 1:1 pro campo de `CharacterStats` correspondente (`magic`→`spellDamage`).

`characterbuild/finalStats.ts` — extraído `combineFinalStats(derived, equipmentStats, modifiers)`, o núcleo puro que já existia dentro de `calculateFinalStats(build, equipment)`. Agora é a ÚNICA função que soma Derived Attributes + Equipment Stats → Final Stats, reusada tanto pelo path antigo (Equipment-class) quanto pelo novo (itens reais) — "nunca dois cálculos" também na etapa de combinação.

`combat/combatSnapshot.ts` — `CombatSnapshotDTO` (vocabulário do brief: `attack/defense/life/mana/critical/attackSpeed/magic/powerScore/itemScore/derivedStats`), `finalStatsToCombatSnapshot()`/`combatSnapshotToFinalStats()` (tradução exata e reversível pro vocabulário interno `FinalStats`), e `buildCombatSnapshot(characterId, totalXp, equippedItems, activeGemEffects)` — o Combat Resolver completo: Base Attributes reais (mesma classe `"warrior"` hardcoded que o cliente já usava, `CharacterBuild(characterId, "warrior", totalXp)` — não existe seleção de classe real ainda) + `calculateCharacterStatsFromEquippedItems` + `combineFinalStats` + `finalStatsToCombatSnapshot`. `itemScore` (soma de `power_score` dos itens equipados) é um conceito de "itens", não de "atributos" — nunca dobrado dentro de `powerScore`.

## Fase 4/5/6 — Adventure, Idle, Dungeon

`AdventureCharacter.realCombatSnapshot?: CombatSnapshotDTO | null` (novo campo opcional). `toAdventureCombatant()`/`getSessionResult()` (`adventure/session.ts`) usam uma única função interna (`resolveFinalStats`) que prefere `combatSnapshotToFinalStats(character.realCombatSnapshot)` quando presente, caindo no `calculateFinalStats(characterBuild, equipment)` antigo só quando ausente (sessão de demonstração, sem login).

`apps/web/src/hooks/useAdventureSession.ts`: `fetchRealCharacter()` já buscava `/api/character` no boot da sessão — passou a capturar `combatSnapshot` junto e repassar pra `createAdventureCharacter(...)`. A cada `runGlobalTick()` (o tick único do Idle Driver global, que também impulsiona Adventure e Dungeon — não existem dois relógios), um `refreshCombatSnapshot()` fire-and-forget busca `/api/character` de novo e faz uma mutação in-place em `session.character.realCombatSnapshot`. "Idle nunca recalcula, só relê o Snapshot já calculado pelo servidor" — o cliente nunca refaz a conta, só troca de onde ela lê. Esse refresh por-tick também resolve, de graça, o caso de o jogador melhorar um item no Ferreiro ou socketar uma Gema em OUTRA aba enquanto o Idle continua rodando — sem precisar de um mecanismo de invalidação dedicado. Dungeon herda tudo automaticamente (mesmo `AdventureSession`/`Combatant`, nenhum código de Dungeon precisou mudar).

Sessões de demonstração (usuário não autenticado) continuam sem `realCombatSnapshot` — `/api/character` sempre devolveria 401 — e caem no cálculo antigo, sem quebrar.

## Fase 7 — Boss

`apps/api/src/services/combatSnapshot.service.ts` (novo) — `getCombatSnapshotForCharacter(characterId)` (usado por `/api/character`) e `resolveAllActiveGemEffectsForEquippedItems()` (extraído do laço que antes vivia inline em `character.ts`, agora reusado por `BossCombatSystem` também). `BossCombatSystem.advance()` troca `getCombatAttributes()`+`CRITICAL_HIT_CHANCE` fixo por `getCombatSnapshotForCharacter(characterId)`: `isCritical = rng.next() < snapshot.critical/100` (nunca mais um valor fixo), `attackPhysical`/`attackMagic` vêm de `snapshot.attack`/`snapshot.magic`. `level` continua vindo de `getCombatAttributes()` (fora do vocabulário de 7 stats do Snapshot — mesmo resíduo legítimo que `/api/character` mantém para `sus`/`uti`) — a fórmula canônica de dano em si (`docs/combat-model/canonical-formula.md`) não mudou, só a origem de seus inputs de ataque/crítico.

## Fase 8 — Character API unificada

`GET /api/character` devolve `combatSnapshot: CombatSnapshotDTO` — o MESMO objeto que `BossCombatSystem`/Adventure/Idle/Dungeon agora consultam (via `buildCombatSnapshot`, chamado com os mesmos itens equipados/efeitos de Gema). O campo legado `combat` (`CharacterCombatSummary`, usado pela UI existente) é preservado na FORMA (não quebra `CharacterPage.tsx`), mas suas VALORES agora vêm do Snapshot: `attack_physical←snapshot.attack`, `attack_magic←snapshot.magic`, `resistance_physical←snapshot.defense`. `resistance_magic` fica sempre `0` — simplificação honesta e documentada: o modelo antigo separava física/mágica por peça de armadura; o Snapshot unificado (um único `armor`) não reproduz esse split, e nenhum consumidor real (Adventure/Dungeon/Boss) jamais teve esse split também. `sus`/`uti` continuam vindo do resíduo legítimo de `getCombatAttributes()`. `resolvedStats`/`activeGemEffects` (Sprint 21) foram removidos — nunca eram consumidos por nenhuma UI, e mantê-los ao lado de `combatSnapshot` violaria "nunca duas versões".

## Fase 9 — Economia

> A partir desta Sprint, toda evolução do personagem produz impacto imediato no combate real: trocar uma arma, encaixar uma Gema, melhorar um item no Ferreiro, aplicar uma Esfera, revelar um Item Mítico, altera instantaneamente o desempenho do personagem na Adventure, no Idle, nas Dungeons e nos Bosses — porque todos compartilham exatamente o mesmo `CombatSnapshotDTO`, recalculado a cada leitura, nunca persistido.

Isso é verdade **por construção**, não por uma sincronização adicionada: `buildCombatSnapshot()` sempre lê os itens equipados/efeitos de Gema atuais do banco no momento da chamada — não existe cache de servidor pra invalidar. O único lag possível é o de PROPAGAÇÃO cliente (Adventure/Idle só reveem o Snapshot no próximo tick, via `refreshCombatSnapshot`, Fase 4/5/6) — nunca um lag de cálculo desatualizado no servidor.

## O que isso NÃO habilita ainda

Por restrição explícita do brief: Novas Gemas, Novos Bosses, PvP, Runewords, Links, Novas Esferas, Balanceamento definitivo, Conteúdo novo. Guild/Kingdom/Treasury/Trade Routes/Housing/Real Estate/Player Presence/World Presence/Economia/Craft/Transformation/Mythic — nenhum tocado.

## Ver também

- `packages/shared/src/combat/combatSnapshot.ts` — `CombatSnapshotDTO`/`finalStatsToCombatSnapshot`/`combatSnapshotToFinalStats`/`buildCombatSnapshot` (novos).
- `packages/shared/src/equipment/realEquipmentStats.ts` — `calculateCharacterStatsFromEquippedItems` (novo).
- `apps/api/src/services/combatSnapshot.service.ts` — `getCombatSnapshotForCharacter`/`resolveAllActiveGemEffectsForEquippedItems` (novos).
- `docs/design/gem-effects-phase1.md` — a Fase 1 original (3 sistemas), agora superada por este documento.
- `docs/combat-model/canonical-formula.md` — a fórmula de dano do Boss, intocada nesta Sprint (só seus inputs mudaram de fonte).
