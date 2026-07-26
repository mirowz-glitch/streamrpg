# Combat Difficulty Calibration — Midgame & Lategame (Phase I)

Calibra exclusivamente o combate de Picos Congelados, Litoral Quebrado, Deserto de Vidro e Fortaleza Sombria — as 4 regiões identificadas como letais/inacessíveis pela Sprint anterior ([player-journey-recovery-phase-1.md](player-journey-recovery-phase-1.md)). Nenhuma arquitetura foi alterada — apenas Enemy Templates e uma probabilidade de variante (Encounter Table), com toda decisão sustentada por comparação de dados, não por tentativa e erro.

---

## 1. Arquivos modificados

| Arquivo | O que mudou |
| --- | --- |
| `src/enemy/templates.ts` | `frost-king`, `corrupted-bishop`, `ancient-dragon`, `boss` (fortaleza-sombria) e `dark-knight` reduzidos por comparação de densidade de poder contra `forgotten-guardian` (referência já validada) |
| `src/worldencounter/encounterTables.ts` | `variantChances.miniBoss` de `picos-congelados`/`litoral-quebrado`/`deserto-de-vidro` reduzido de 0.35 pra 0.25 |
| `scripts/smokeTestCombatCalibration.ts` (novo) | Smoke test desta Sprint |
| `reports/combat-calibration-BEFORE.json`, `-AFTER.json` (novos) | Snapshots da campanha comparativa (Fase 5) |

Nenhum mob comum (`frost-wolf`, `ice-golem`, `corrupted-acolyte`, `fire-cultist`) foi alterado — ver Fase 2/3 abaixo.

---

## 2. Diagnóstico

Reaproveitado o snapshot já existente da Sprint anterior (`game-design-audit-natural-journey-AFTER.json`, mesma metodologia, N=300) como baseline diagnóstica — nenhuma campanha nova foi necessária pra esta fase.

| Região | Mortalidade (de quem chegou) | Causa predominante | HP médio na região | Encontros médios (seg/22) |
| --- | --- | --- | --- | --- |
| Ruínas Esquecidas (referência, já saudável) | 4.3% | MiniBoss (5) | 68.4% | ~22 |
| Picos Congelados | **95.5%** (212/222) | Normal (52), MiniBoss (69), Boss (59) | 39.7% | ~10 |
| Litoral Quebrado | **100%** (10/10, só 3.3% chegam) | MiniBoss (8/10) | 12.1% | ~5 |
| Deserto de Vidro | não alcançada (0%) | — | — | — |
| Fortaleza Sombria | não alcançada (0%) | — | — | — |

**Diagnóstico dos Encontros (Fase 2)**: `variantChances.elite (0.04) + miniBoss (0.35)` nas 3 regiões novas somava **39% de todos os encontros virando luta contra o inimigo mais forte da região** — contra apenas 5% nas regiões que funcionam bem (bosque/pântano/colinas-áridas, elite 0.04 + miniBoss 0.01). Esse 0.35 tinha sido definido na Sprint anterior só pra compensar a supressão de RNG em rolagens raras (mesmo mecanismo já documentado pra `forgotten-guardian`) — sem considerar que também eleva a EXPOSIÇÃO regular ao inimigo mais perigoso. Combinado com Chefes ainda desproporcionalmente fortes (ver abaixo), isso explica o HP médio catastroficamente baixo (39.7%/12.1%) mesmo fora do combate contra o próprio Chefe.

`fortaleza-sombria` tinha uma composição ainda mais extrema: sua única entry (`enemyTemplateId: "boss"`, peso 100) É o próprio "Chefe Final" — **98% de todos os encontros da região já são, por definição, contra o inimigo mais forte do jogo** (não há mob comum ali). Combinado com o `growth` do template `boss` sendo 4-8x mais íngreme que qualquer outro Boss do jogo (calibrado, por herança histórica, pra um personagem MUITO acima do teto atual de nível 30 — ver comentário em `enemy/templates.ts`), isso tornava a região matematicamente inviável mesmo já sendo alcançável desde a Sprint anterior.

---

## 3. Balanceamento

**Metodologia**: em vez de cortes percentuais arbitrários (usados, com sucesso parcial, na Sprint anterior), esta Sprint usa uma **referência de densidade de poder já validada**: `forgotten-guardian` (Mini-Boss de Ruínas Esquecidas, ajustado e comprovado por 3 Sprints sucessivas de calibração empírica, hoje com taxa de vitória real de ~95-99%). Densidade = (soma de stats base + growth × (nível de entrada da região − 1)) ÷ nível de entrada — mede o poder EFETIVO no nível em que o personagem realmente encontra o inimigo, não uma média abstrata da faixa.

| Template | Região | Densidade ANTES (efetiva, no nível de entrada) | Densidade DEPOIS | Ajuste |
| --- | --- | --- | --- | --- |
| `forgotten-guardian` (referência) | ruinas-esquecidas | 5.30 (inalterado) | 5.30 | nenhum |
| `frost-king` | picos-congelados | 6.8 (após corte da Sprint anterior) | **5.15** | reduzido, alinhado à referência |
| `corrupted-bishop` | litoral-quebrado | 7.9 | **5.32** | reduzido, alinhado à referência |
| `ancient-dragon` | deserto-de-vidro | 8.6 | **6.19** | reduzido, mantido acima da referência (hierarquia "mais forte dos 3" preservada) |
| `boss` | fortaleza-sombria | **18.2** (no nível 30) | **9.73** | reduzido ~47% — continua o inimigo mais forte do jogo, mas deixa de ser ~3.4x a referência |
| `dark-knight` | fortaleza-sombria | 8.1 | **6.2** | reduzido, entre `ancient-dragon` e `boss` (hierarquia preservada) |

Mobs comuns (`frost-wolf`, `ice-golem`, `corrupted-acolyte`, `fire-cultist`) **não foram alterados**: a mesma análise de densidade já mostrava valores entre 2.96-3.29 no nível de entrada — dentro do intervalo de regiões que já funcionam (skeleton em Ruínas: 2.91). Cortar mais teria sido reduzir a dificuldade sem sustentação nos dados (violaria o princípio "não compensar reduzindo indiscriminadamente").

`variantChances.miniBoss` das 3 regiões novas: 0.35 → **0.25** — ainda bem acima do padrão histórico (0.01) pra compensar a supressão de RNG documentada, mas sem transformar mais de 1 em cada 3 encontros no pior confronto possível da região.

**Não alterado**: Adventure Loop, Combat Engine, Recovery Layer, RuntimeConfig, Loot/Item Generator, Inventory, Presentation Layer, checkpoints/parâmetros de expedição (já ajustados na Sprint anterior, sem nova evidência que justifique mexer de novo).

---

## 4. Comparação — Antes/Depois (mesma metodologia, N=300)

| Região | Mortalidade Antes | Mortalidade Depois | Taxa de Chegada Antes | Taxa de Chegada Depois |
| --- | --- | --- | --- | --- |
| Picos Congelados | 95.5% | **82.0%** | 74.0% | 74.0% (inalterado) |
| Litoral Quebrado | 100% | **37.5%** | 3.3% | **13.3%** |
| Deserto de Vidro | — (nunca alcançada) | **76.0%** | 0% | **8.3%** |
| Fortaleza Sombria | — (nunca alcançada) | **100%** | 0% | **2.0%** |

---

## 5. Evidências

Campanha única (N=300, jornada natural, 7200s, mesma metodologia da Sprint anterior) — ver `reports/combat-calibration-BEFORE.json` (= snapshot da Sprint anterior) e `-AFTER.json`.

- **Dungeon original**: conclusão 38.8%→**39.9%**, win rate do Chefe 94.8%→**97.4%** — Dungeon permanece relevante e ligeiramente melhor.
- **3 Dungeons novas**: `dungeon.completionRate` (agregado, inclui a original) subiu de 38.8% pra 39.9%; win rate do Chefe (agregado) 94.8%→97.4%.
- **Sobrevivência geral**: ainda 100% de mortalidade dentro do orçamento de 7200s (idêntico à Sprint anterior) — esperado e aceito: as regiões finais devem continuar desafiadoras (critério de aprovação), a "cura" completa da mortalidade geral não era o objetivo desta Sprint.
- **Relíquias**: `rarityCounts.unique` subiu de 691 pra 735 (mais Chefes sendo derrotados de fato, incluindo os das regiões antes inacessíveis).
- **Nível médio final**: 18.4→19.3 (leve alta, consistente com jornadas um pouco mais longas antes de morrer).
- **Reputação/Economia**: sem mudança relevante (nenhum sistema de facção/economia tocado).
- Nenhuma recomendação automática do motor aponta mais "região nunca alcançada" pra deserto-de-vidro/fortaleza-sombria (as únicas 2 regiões nessa categoria antes desta Sprint) — a recomendação restante é especificamente "fortaleza-sombria com 100% de mortalidade entre quem chega", esperado pra um capstone final.

---

## 6. Validação

- **Typecheck**: `packages/shared` limpo (`tsc --noEmit`). Mesma ressalva pré-existente já documentada na Sprint anterior sobre `apps/api`/`apps/web` (config de projeto, não tocada).
- **Testes direcionados**: `enemy.test.ts`, `biomes.test.ts`, `eliteMiniBoss.test.ts`, `worldEncounter.test.ts`, `dungeon.test.ts` — 85/85 passando, nenhum ajuste de teste necessário.
- **Suíte completa**: executada uma única vez — **434/434 testes passando**.
- **Campanha comparativa**: uma única execução (N=300), mesma metodologia da Sprint anterior.
- **Smoke test**: `scripts/smokeTestCombatCalibration.ts` — todas as verificações passaram (entrada nas 9 regiões, entrada nas 4 Dungeons, derrota de ao menos 1 dos 3 Chefes de região final em condições normais — Rei Gélido e Bispo Corrompido derrotados na seed determinística testada, Dragão Ancião não nesta seed específica, consistente com sua taxa de vitória real ainda mais baixa por design).

---

## 7. Próximo Gargalo

**Com o combate calibrado, o maior limitador agora é Litoral Quebrado/Deserto de Vidro/Fortaleza Sombria ainda serem alcançados por uma fração muito pequena das jornadas (13.3%/8.3%/2.0%) — não mais porque são intransponíveis, mas porque Picos Congelados continua consumindo a maior parte dos personagens antes deles (82% de mortalidade).**

Justificativa com os dados desta própria Sprint: mesmo com a redução de densidade, Picos Congelados ainda mata 82% de quem chega — e como é a PRIMEIRA das 4 regiões finais na sequência, sua mortalidade alta funciona como um filtro que reduz drasticamente quantas jornadas sequer chegam a testar Litoral Quebrado/Deserto de Vidro/Fortaleza Sombria (13.3%/8.3%/2.0% de chegada, um funil claro). Diferente da Sprint anterior (onde o problema era "impossível alcançar"), agora é "possível, mas raro sobreviver o suficiente pra tentar as regiões seguintes".

Duas frentes possíveis pra uma próxima Sprint, ambas sustentáveis pelos mesmos dados: (a) uma nova rodada de calibração focada especificamente em Picos Congelados (a única das 4 regiões ainda acima de 80% de mortalidade, desproporcional às demais já na faixa 37-76%); ou (b) aceitar que Picos Congelados é o "filtro" intencional do late-game (funcionando como um gate de habilidade/equipamento, não um bug) e investir em Equipamento/Loot (achado já documentado na auditoria original: "deserto de loot" em 90% das jornadas) como a alavanca que realmente eleva a taxa de sobrevivência ali. Esta segunda opção reconecta com um gargalo já identificado e nunca endereçado desde a primeira auditoria — candidata natural à próxima Sprint.
