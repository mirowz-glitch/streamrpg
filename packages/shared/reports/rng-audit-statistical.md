# Auditoria Estatística do RNG — Engine Audit Phase I

N por medição: 100.000 (exceto item 5, jornadas de 450 ticks)

## Encounter Generator: MiniBoss roll (ruinas-esquecidas, variantChances.miniBoss) — estratégia: consecutive
- n: 100000
- Taxa teórica: 35.0000%
- Taxa observada: 32.2280% (32228 ocorrências)
- Supressão: 7.9%
- Autocorrelação lag-1: -0.0027
- Distância média observada entre ocorrências: 3.1 (teórica: 2.9)
- Maior sequência sem ocorrência: 25 (p99 teórico sob i.i.d.: 24)

## Encounter Generator: MiniBoss roll (ruinas-esquecidas, variantChances.miniBoss) — estratégia: spaced
- n: 100000
- Taxa teórica: 35.0000%
- Taxa observada: 31.6790% (31679 ocorrências)
- Supressão: 9.5%
- Autocorrelação lag-1: -0.0031
- Distância média observada entre ocorrências: 3.2 (teórica: 2.9)
- Maior sequência sem ocorrência: 40 (p99 teórico sob i.i.d.: 24)

## Encounter Generator: Elite roll (bosque-sussurrante, variantChances.elite) — estratégia: consecutive
- n: 100000
- Taxa teórica: 4.0000%
- Taxa observada: 3.7460% (3746 ocorrências)
- Supressão: 6.4%
- Autocorrelação lag-1: 0.0024
- Distância média observada entre ocorrências: 26.7 (teórica: 25.0)
- Maior sequência sem ocorrência: 196 (p99 teórico sob i.i.d.: 203)

## Encounter Generator: Elite roll (bosque-sussurrante, variantChances.elite) — estratégia: spaced
- n: 100000
- Taxa teórica: 4.0000%
- Taxa observada: 3.6790% (3679 ocorrências)
- Supressão: 8.0%
- Autocorrelação lag-1: -0.0043
- Distância média observada entre ocorrências: 27.2 (teórica: 25.0)
- Maior sequência sem ocorrência: 268 (p99 teórico sob i.i.d.: 203)

## World Events: qualquer evento (bosque-sussurrante, ExplorationEventTable.chance) — estratégia: consecutive
- n: 100000
- Taxa teórica: 8.0000%
- Taxa observada: 8.0120% (8012 ocorrências)
- Supressão: -0.1%
- Autocorrelação lag-1: 0.0038
- Distância média observada entre ocorrências: 12.5 (teórica: 12.5)
- Maior sequência sem ocorrência: 117 (p99 teórico sob i.i.d.: 108)

## World Events: qualquer evento (bosque-sussurrante, ExplorationEventTable.chance) — estratégia: spaced
- n: 100000
- Taxa teórica: 8.0000%
- Taxa observada: 8.1480% (8148 ocorrências)
- Supressão: -1.8%
- Autocorrelação lag-1: 0.0008
- Distância média observada entre ocorrências: 12.3 (teórica: 12.5)
- Maior sequência sem ocorrência: 121 (p99 teórico sob i.i.d.: 108)

## Loot Generator: item de raridade rara+ (generateLoot('wolf')) — estratégia: consecutive
- n: 100000
- Taxa teórica: 11.0000%
- Taxa observada: 6.9740% (6974 ocorrências)
- Supressão: 36.6%
- Autocorrelação lag-1: 0.0010
- Distância média observada entre ocorrências: 14.3 (teórica: 9.1)
- Maior sequência sem ocorrência: 117 (p99 teórico sob i.i.d.: 80)

## Loot Generator: item de raridade rara+ (generateLoot('wolf')) — estratégia: spaced
- n: 100000
- Taxa teórica: 11.0000%
- Taxa observada: 7.2660% (7266 ocorrências)
- Supressão: 33.9%
- Autocorrelação lag-1: 0.0009
- Distância média observada entre ocorrências: 13.8 (teórica: 9.1)
- Maior sequência sem ocorrência: 120 (p99 teórico sob i.i.d.: 80)

## Boss: taxa de chegada em 222 jornadas de 450 ticks (>=1 ocorrência) — estratégia: consecutive
- n: 222
- Taxa teórica: 100.0000%
- Taxa observada: 100.0000% (222 ocorrências)
- Supressão: 0.0%

## Boss: taxa de chegada em 222 jornadas de 450 ticks (>=1 ocorrência) — estratégia: spaced
- n: 222
- Taxa teórica: 100.0000%
- Taxa observada: 100.0000% (222 ocorrências)
- Supressão: 0.0%
