# Comparação Antes x Depois — Balance, Pacing & Player Experience Phase I

Mesma metodologia dos dois lados: 1000 Aventuras, 500 Expedições (5 tipos x 100), 100 Dungeons, mesmas seeds.

## Dungeon (100 execuções, foco principal da Sprint)
| Métrica | Antes | Depois | Delta |
| --- | --- | --- | --- |
| Taxa de morte | 68% | 30% | ↓ 38% |
| HP médio | 66.4% | 83.3% | ↑ 16.9% |
| Nível médio alcançado | 16.0 | 24.5 | ↑ 8.4 |
| Alcançou Ruínas Esquecidas (bioma do Chefe) | 41% | 74% | ↑ 33% |
| Chefe Final encontrado (de 100) | 5 | 3 | ↓ 2 |
| Chefe Final derrotado (de 100) | 0 | 0 | = 0 |
| Taxa de conclusão da Dungeon | 0% | 0% | = 0% |
| Checkpoints usados (média) | 22.6 | 45.6 | ↑ 23.0 |
| Recovery recebido dentro da Dungeon (média) | 296.8 | 592.5 | ↑ 295.7 |
| HP ao chegar no checkpoint | 65.8% | 80.6% | ↑ 14.8% |
| Duração média (Dungeons encerradas) | 1750s | 2256s | ↑ 506s |
| Encontros médios (reconstruído) | 80 | 103 | ↑ 23 |
| Recompensa XP da Dungeon (config) | 1500.0 | 2200.0 | ↑ 700.0 |
| Recompensa ouro da Dungeon (config) | 400.0 | 600.0 | ↑ 200.0 |

## Aventuras Gerais (1000 execuções, regiões iniciais)
| Métrica | Antes | Depois | Delta |
| --- | --- | --- | --- |
| Taxa de morte | 2% | 1% | ↓ 1% |
| Eficiência de recuperação | 0.28x | 0.36x | ↑ 0.08x |
| Elite: taxa de vitória | 100% | 100% | ↓ 0% |
| Nível médio alcançado | 4.6 | 4.6 | ↓ 0.0 |

## Expedições (500 execuções, 5 tipos regionais)
| Métrica | Antes | Depois | Delta |
| --- | --- | --- | --- |
| Taxa de morte | 83% | 70% | ↓ 13% |
| HP médio | 67.5% | 83.5% | ↑ 16.0% |
| Elite: taxa de vitória | 88% | 84% | ↓ 4% |
| Mini-Boss: taxa de vitória | 64% | 82% | ↑ 18% |
| Taxa de conclusão de Expedições | 84% | 88% | ↑ 4% |

Nota metodológica: as Expedições regionais (Rota das Colinas/Descida às Minas/Exploração das Ruínas) forçam o personagem a entrar direto na região a partir do nível 1 (mesma metodologia usada em ambos os lados desta comparação) — na prática, um jogador real só inicia essas Expedições depois de alcançar a região naturalmente via Region Unlock (já em nível alto). A taxa de morte de 95-100% nessas 3 Expedições é um artefato da metodologia de simulação, não um bug de balanceamento novo introduzido nesta Sprint — mantido idêntico nos dois lados da comparação.
