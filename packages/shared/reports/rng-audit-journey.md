# Auditoria da Jornada — Engine Audit Phase I (Fase 4)

## Parte A — rolagem real vs. reconstrução formal (1 sessão, 545 ticks, seed=1)
- Ticks verificados em ruinas-esquecidas: 448
- MiniBossEncounter REAL (emitido pelo jogo): 0
- MiniBoss RECONSTRUÍDO (rolagem pura, mesma fórmula documentada): 159
- Divergências (rolagem diz X, jogo reporta Y): 159 de 448 (35.5%)
- 1º tick com Inventory 100% cheio: 49

Amostras de preenchimento do Inventory ao longo da sessão (a cada 10 ticks):
| Tick | Ocupado/Capacidade |
| --- | --- |
| 10 | 4/30 |
| 20 | 13/30 |
| 30 | 20/30 |
| 40 | 26/30 |
| 50 | 30/30 |
| 60 | 30/30 |
| 70 | 30/30 |
| 80 | 30/30 |
| 90 | 30/30 |
| 100 | 30/30 |
| 110 | 30/30 |
| 120 | 30/30 |
| 130 | 30/30 |
| 140 | 30/30 |
| 150 | 30/30 |
| 160 | 30/30 |
| 170 | 30/30 |
| 180 | 30/30 |
| 190 | 30/30 |
| 200 | 30/30 |
| 210 | 30/30 |
| 220 | 30/30 |
| 230 | 30/30 |
| 240 | 30/30 |
| 250 | 30/30 |
| 260 | 30/30 |
| 270 | 30/30 |
| 280 | 30/30 |
| 290 | 30/30 |
| 300 | 30/30 |
| 310 | 30/30 |
| 320 | 30/30 |
| 330 | 30/30 |
| 340 | 30/30 |
| 350 | 30/30 |
| 360 | 30/30 |
| 370 | 30/30 |
| 380 | 30/30 |
| 390 | 30/30 |
| 400 | 30/30 |
| 410 | 30/30 |
| 420 | 30/30 |
| 430 | 30/30 |
| 440 | 30/30 |
| 450 | 30/30 |
| 460 | 30/30 |
| 470 | 30/30 |
| 480 | 30/30 |
| 490 | 30/30 |
| 500 | 30/30 |
| 510 | 30/30 |
| 520 | 30/30 |
| 530 | 30/30 |
| 540 | 30/30 |

## Parte B — exposição real em escala (500 Dungeons, Simulador já validado)
- Execuções que alcançaram Ruínas Esquecidas: 398/500
- Ticks médios em Ruínas Esquecidas (só quem alcançou): 404.5
- Chefe Final REALMENTE detectado (evento MiniBossEncounter/FinalBossEncounter): 26/500 (5.20%)
- Chegadas ESPERADAS assumindo rolagem independente por tick (35% de chance, dado a exposição real medida): 394.9/500
- Razão detectado/esperado-pela-rolagem: 6.6%

**Conclusão da Fase 4**: a Parte A mostra que a ROLAGEM (generateEncounter, RNG puro) e o EVENTO REPORTADO PELO JOGO divergem quase totalmente — a rolagem 'acerta' o MiniBoss dezenas de vezes, mas o jogo quase nunca reporta o evento. A Parte B confirma isso em escala. A causa NÃO é o RNG (a rolagem em si está correta, ver Fase 2) — é que o Inventory enche completamente (30/30) por volta da tick 90-100 e permanece cheio pelo resto da sessão (ver tabela acima), e a detecção de MiniBossEncounter/EliteEncounter em presentation/presentationLayer.ts depende EXCLUSIVAMENTE de um novo item aparecer no Inventory/Equipment (`variantKillSlot`) OU do personagem morrer no encontro (`deathEncounterVariant`) — quando o loot do MiniBoss é gerado mas descartado por falta de espaço, NENHUM dos dois sinais dispara, e o evento é perdido mesmo tendo acontecido de verdade.