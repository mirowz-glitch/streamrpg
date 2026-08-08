# Sockets & Gems Phase II — Build System (Sprint 23)

## Filosofia

A Sprint 20/21 deram às Gemas Sockets e Efeitos numéricos (GemEffect — "quanto aumenta"). Esta Sprint acrescenta GemBehavior — "como muda o gameplay". Os dois conceitos nunca colapsam um no outro, mesmo quando a mesma Gema carrega os dois (ex.: Rubi tem `attack-percent-1` como efeito E `ruby-fire-proc-1` como comportamento — dois números/mecânicas independentes, nunca a mesma coisa com nomes diferentes).

Uma Build é definida por: **Base → Afixos → Esferas → Sockets → Gemas → Combat Snapshot**. Itens continuam sendo a maior fonte de poder bruto; Gemas especializam o estilo de combate sem substituir esse poder.

## Arquitetura

```
packages/shared/src/socket/
  gemBehavior.ts            — tipos: GemBehaviorKind, GemBehavior, GemBehaviorRegistry
  gemBehaviorRegistry.ts    — EXAMPLE_GEM_BEHAVIOR_REGISTRY (6 comportamentos) + getters
  gemBehaviorResolver.ts    — resolveGemBehaviorForGemType / resolveActiveGemBehaviors (puro)
  gemDefinition.ts          — GemDefinition.behaviorId (nova referência independente de effectId)
  gemRegistry.ts            — 6 GemDefinitions linkadas a um behaviorId

packages/shared/src/combat/
  types.ts                  — FutureCombatModifiers.bonusFlatDamage (novo campo aditivo)
  pipeline.ts                — rollDamage() soma bonusFlatDamage após crítico/multiplicador
  combatSnapshot.ts          — CombatSnapshotDTO.activeBehaviors: ActiveBehaviorSummary[]
  behaviorModifiers.ts       — resolveOffensiveBehaviorModifiers/resolveChillChancePercent/
                                resolveDefensiveDamageMultiplier/resolveRegenBonus (puros)

packages/shared/src/adventure/adventureLoop.ts
  — lê session.character.realCombatSnapshot.activeBehaviors, traduz pra
    FutureCombatModifiers nos dois resolveCombat() já existentes
    (ataque do jogador / contra-ataque do inimigo)

packages/shared/src/recovery/recoveryLayer.ts
  — soma resolveRegenBonus() na MESMA fórmula de cura de fim de encontro

apps/api/src/services/combatSnapshot.service.ts
  — resolveAllActiveGemBehaviorsForEquippedItems() (mesmo padrão do Effect Resolver)

apps/api/src/systems/BossCombatSystem.ts
  — bonusFlatDamage somado ao dano canônico; bonusCriticalChance vira
    criticalChanceMultiplier no MESMO check de isCritical

apps/api/src/routes/character.ts + packages/shared/src/types.ts
  — CharacterResponse.activeGemBehaviors = combatSnapshot.activeBehaviors (nunca recalculado)

apps/web/src/pages/CharacterPage.tsx
  — seção "Builds Ativas": 💎 Gema / Efeito / Comportamento, por linha
```

## Os 6 Comportamentos (Fase 4, nada além)

| Gema | Kind | Magnitude | Efeito de gameplay |
|---|---|---|---|
| Rubi | `onHitBonusFireDamage` | +3 | Dano flat somado após crítico/multiplicador, nunca amplificado |
| Safira | `chanceToChill` | 10% | Rolado no MESMO stream de rng do Adventure Loop; reduz o contra-ataque pela metade quando proca |
| Esmeralda | `regenPerTick` | +4 | Somado à cura de fim de encontro da Recovery Layer |
| Topázio | `manaPerTick` | +2 | Persistido no Snapshot; nenhum sistema de gasto de mana existe ainda (honesto, não fingido) |
| Ônix | `bonusCriticalChance` | +3 pontos | `(base + pontos) / base` como `criticalChanceMultiplier`, nunca um valor fixo |
| Ametista | `bonusResistance` | 5% | `damageMultiplier` no atacante quando este personagem é o alvo; combina multiplicativamente com Chill |

## Boss — limite arquitetural honesto

`BossCombatSystem.ts` usa um modelo "dano-por-tick contra HP compartilhado do Boss" — Boss nunca ataca personagens (decisão de escopo desde a Sprint B3, intocada). Isso significa:
- **Rubi e Ônix têm alvo mecânico real** (somados ao dano/crítico do personagem contra o Boss).
- **Safira, Esmeralda e Ametista não têm** — não existe contra-ataque do Boss pra congelar/mitigar, nem um "fim de encontro" pra Esmeralda regenerar. Documentado no topo de `BossCombatSystem.ts`, não implementado como hack.

## Compatibilidade

Merchant/Blacksmith/Salvage/Housing/Real Estate/Legacy/Mythic/Transformation: nenhum arquivo tocado. Verificado ao vivo que um item com 4 Gemas de Behavior socketadas sobrevive a uma melhoria real no Ferreiro (Blacksmith) sem perder nenhum Behavior.

## Fora de escopo (explicitamente não implementado)

Runewords, Links, Gemas Lendárias/Míticas, Gemas que evoluem, balanceamento definitivo, novas Esferas, craft novo, sockets coloridos, PvP.
