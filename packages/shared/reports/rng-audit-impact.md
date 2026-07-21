# Auditoria de Impacto — Engine Audit Phase I (Fase 5)

Sessão única, seed=1, 545 ticks — mede quantos itens o Loot Generator gera (`enemiesKilled`, cada kill tenta gerar loot) vs. quantos REALMENTE entram no Inventory (`itemsFound`, incrementado só quando `addItem()` tem sucesso).

| Tick | Inimigos mortos (tentativas de loot) | Itens que ENTRARAM no Inventory | Taxa de sucesso | World Events detectados | Inventory |
| --- | --- | --- | --- | --- | --- |
| 50 | 71 | 32 | 45.1% | 2 | 30/30 |
| 100 | 140 | 32 | 22.9% | 5 | 30/30 |
| 200 | 227 | 32 | 14.1% | 18 | 30/30 |
| 300 | 322 | 32 | 9.9% | 23 | 30/30 |
| 400 | 410 | 32 | 7.8% | 35 | 30/30 |
| 500 | 503 | 32 | 6.4% | 42 | 30/30 |

**Leitura**: a taxa de sucesso (itens que realmente entraram no Inventory / tentativas de loot) despenca conforme o Inventory satura — cada abate depois disso ainda GERA loot (Loot Generator continua funcionando normalmente, intocado), mas o item é descartado silenciosamente ao tentar `addItem()`. World Events (que não dependem do mesmo diff de Inventory pra serem detectados) continuam crescendo normalmente — a supressão é específica de loot/variantes, não do RNG em si.