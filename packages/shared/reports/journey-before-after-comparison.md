# Comparação Antes x Depois — Vertical Slice: Player Journey, Retention & First Hour Experience Phase I

Mesma metodologia dos dois lados: 2000 Aventuras, 1000 Expedições (5 tipos x 200), 300 Dungeons, mesmas seeds.

## Jornada até o Boss (Dungeon, 300 execuções — foco principal da Sprint)
| Métrica | Antes | Depois | Delta |
| --- | --- | --- | --- |
| Tempo até 1º Elite | 392s | 362s | ↓ 31s |
| Tempo até 1ª Expedição concluída | 4840s | 4840s | = 0s |
| Tempo até 1ª Dungeon | 0s | 0s | = 0s |
| Tempo até 1º Boss avistado | 3352s | 2589s | ↓ 764s |
| Taxa de chegada ao Boss | 3% | 2% | ↓ 1% |
| Taxa de vitória contra o Boss | 0% | 0% | = 0% |
| Duração média da jornada (Dungeons encerradas) | 2108s | 1569s | ↓ 539s |
| Encontros médios (reconstruído) | 96 | 71 | ↓ 24 |
| Nível médio alcançado | 23.4 | 23.8 | ↑ 0.4 |
| Taxa de morte (sobrevivência) | 34% | 29% | ↓ 6% |
| Loot: itens encontrados/execução | 22.3 | 22.6 | ↑ 0.3 |
| Loot: raridade média | 0.5 | 0.5 | ↑ 0.0 |
| Alcançou "pantano-podre" | 76% | 96% | ↑ 20% |
| Alcançou "minas-abandonadas" | 76% | 79% | ↑ 4% |
| Alcançou "ruinas-esquecidas" | 70% | 76% | ↑ 6% |
| Alcançou "colinas-aridas" | 83% | 0% | ↓ 83% |

## Retenção simulada (proxy): jornada completa em execuções abertas de 12000s
| Métrica | Antes | Depois | Delta |
| --- | --- | --- | --- |
| Deserto de loot (>=600s sem upgrade) | 90% | 90% | ↓ 0% |
| Maior período sem upgrade (média) | 8037s | 8433s | ↑ 396s |
| Tempo médio em combate (ritmo) | 6725s | 7048s | ↑ 322s |
| Tempo médio em checkpoints (ritmo) | 1900s | 1979s | ↑ 79s |

## Aventuras Gerais (2000 execuções, região inicial única)
| Métrica | Antes | Depois | Delta |
| --- | --- | --- | --- |
| Taxa de morte | 1% | 1% | ↑ 0% |
| Nível médio alcançado | 4.5 | 4.2 | ↓ 0.4 |
| Elite: taxa de vitória | 100% | 100% | ↑ 0% |

Nota metodológica: a métrica 'Aventuras Gerais' do lado 'Antes' usava STARTER_REGION_IDS = [bosque-sussurrante, pântano-podre] (50/50); o lado 'Depois' usa STARTER_REGION_IDS = [bosque-sussurrante] apenas, porque pântano-podre deixou de ser uma região de entrada válida nesta Sprint (seu gate de nível subiu de 1 para 5, ver biomes.ts). Isso muda a composição da amostra 'Aventuras Gerais' nos dois lados — não afeta a comparação da Dungeon acima (o foco real desta Sprint), que usa a mesma metodologia (forceExpeditionId) nos dois lados.
