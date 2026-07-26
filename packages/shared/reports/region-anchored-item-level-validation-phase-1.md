# Region-Anchored Item Level — Implementation Validation (Phase I)

Implementada exatamente a mudança especificada (`monsterLevel → getRegionItemLevelAnchor(regionId)`, só no argumento que alimenta o Item Level do loot). Nenhum outro sistema foi tocado. **Resultado: a implementação está correta e funciona exatamente como projetada — mas os Critérios de Aprovação desta Sprint NÃO foram atingidos**, por uma causa raiz nova, precisa e não coberta pelo escopo autorizado: cada Loot Table de monstro já tem seu PRÓPRIO `minLevel`/`maxLevel`, e esse clamp neutraliza o ganho do novo anchor para a maioria dos monstros comuns (que dominam o volume total de drops de qualquer campanha). Reportando com honestidade, como pedido: **não aprovar ainda — recomendação abaixo.**

---

## 1. Arquivos Modificados

| Arquivo | O que mudou |
| --- | --- |
| `src/regions.ts` | Nova função `getRegionItemLevelAnchor(regionId)` — determinística, sem RNG, mapeia a ordem real de progressão (empírica) sobre 1-65 |
| `src/enemy/lootIntegration.ts` | `generateLootForKilledEnemy()` ganha o parâmetro `regionId`; usa `getRegionItemLevelAnchor(regionId)` em vez de `instance.level` nos 3 pontos onde chamava `generateMonsterLoot()`/`generateLoot()` |
| `src/adventure/adventureLoop.ts` | 1 linha — repassa `session.currentRegion` pro novo parâmetro |
| `src/dungeon/dungeonController.ts` | 1 linha — loot garantido do Chefe Final usa `getRegionItemLevelAnchor(session.currentRegion)` em vez de `session.character.characterBuild.level` |
| `src/presentation/presentationLayer.ts` | 1 linha — loot de World Event (Treasure) usa `getRegionItemLevelAnchor(session.currentRegion)` em vez de `playerLevel` (parâmetro agora não utilizado foi removido — 1 chamador atualizado) |
| `src/enemy/enemy.test.ts`, `src/worldencounter/eliteMiniBoss.test.ts` | 4 chamadas de teste atualizadas com o novo parâmetro obrigatório (nenhuma asserção mudou) |

**Nenhum arquivo de**: Combat Engine, XP, `resolveGroupLevel()`/Monster Level, Enemy Templates, RNG, `itemgen/prefixes.ts`/`suffixes.ts` (Affixes/Thresholds/Weights), `powerScore.ts`, ou **Loot Tables** (`lootgen/lootTables.ts`) — foi tocado.

---

## 2. Verificação da Implementação (isolada, fora da campanha completa)

Testado diretamente (`generateLootForKilledEnemy`, sem passar pela campanha), comparando o MESMO monstro/nível, só variando `regionId`:

| Monstro | Loot Table (`minLevel`-`maxLevel`) | Region A (anchor baixo) | Region B (anchor alto) | Diferença |
| --- | --- | --- | --- | --- |
| `wolf` (nv. 8) | 1-14 | bosque-sussurrante (anchor=1): PS médio 9,38 | fortaleza-sombria (anchor=65): PS médio 10,14 | **+8%** |
| `boss` (nv. 30) | 20-80 | bosque-sussurrante (anchor=1, clampado a 20): PS médio 32,66 | fortaleza-sombria (anchor=65): PS médio 55,68 | **+70%** |

**A mudança funciona exatamente como projetada** — o mecanismo (`getRegionItemLevelAnchor` alimentando `rollItemLevel()`) está correto e comprovadamente sensível à região. A diferença de resultado entre os dois monstros acima é a causa raiz do que segue.

---

## 3. Causa Raiz do Resultado Inesperado na Campanha

`rollItemLevel(rng, anchor, table)` (lootgen/generator.ts, **intocado**) sempre fez: `raw = anchor ± table.itemLevelVariance; clamp(raw, table.minLevel, table.maxLevel)`. Antes desta Sprint, `anchor` = nível do monstro (sempre dentro do `levelRange` do PRÓPRIO monstro, então o clamp de `table.minLevel/maxLevel` quase nunca era ativo — era redundante com o range do monstro). Agora que `anchor` vem da REGIÃO (podendo chegar a 65), o clamp de `table.minLevel/maxLevel` — que continua sendo o valor ANTIGO, calibrado pra quando `anchor` era sempre igual ao nível do monstro — passa a ser o fator decisivo:

| Monstro (região) | `maxLevel` da própria Loot Table | Anchor de região correspondente | Anchor é clampado? |
| --- | --- | --- | --- |
| wolf/boar/spider (bosque) | 14 | 1 | Não (mas nunca teria espaço mesmo se fosse maior) |
| goblin/swamp-witch (pântano) | 18 | 9 | Não |
| stone-construct (minas) | 25 | 25 | No limite, sem folga |
| frost-wolf/ice-golem (picos) | 35 | 33 | Quase sem folga |
| corrupted-acolyte (litoral) | 38 | 41 | **Sim — clampado de volta a 38** |
| fire-cultist (deserto) | 42 | 49 | **Sim — clampado de volta a 42** |
| boss/dark-knight (fortaleza, Chefes) | 80 | 65 | Não — única categoria com folga real |

**A maioria dos monstros COMUNS (não-Chefe) já tem seu próprio teto de Loot Table baixo o bastante pra devorar quase todo o ganho do anchor de região.** Só os monstros de Chefe/Mini-Boss/Relíquia (Loot Tables com `maxLevel` 60-80, sempre foram generosas) realmente se beneficiam na íntegra. Como a MAIORIA absoluta dos drops de qualquer campanha vem de monstros comuns (não de Chefes), a estatística agregada da campanha inteira mal se move — mesmo com o mecanismo funcionando perfeitamente na origem.

---

## 4. Comparação Antes → Depois (Campanha Completa, N=300, mesma metodologia)

| Métrica | Antes | Depois | Delta |
| --- | --- | --- | --- |
| Dead Loot Rate | 95,26% | 95,22% | -0,04pp (não caiu de forma significativa) |
| Upgrades/campanha (média) | 4,84 | 4,88 | +0,8% |
| Power Score nível 20 | 803,8 | 806,7 | +0,4% |
| Power Score nível 25 | 929,4 | 933,0 | +0,4% |
| Power Score nível 30 (n≈20) | 1.059,4 | 1.067,4 | +0,8% |
| Cobertura de tiers na campanha real | (não recalculada isoladamente — ver Seção 3) | Mesma ordem de grandeza do "Antes"; monstros comuns continuam presos ao teto da própria Loot Table |

**Nenhuma regressão** (nenhuma métrica piorou de forma significativa), mas **nenhuma melhora significativa também** — os deltas (0,4%-0,8%) estão dentro do ruído de simulação, muito abaixo de qualquer um dos 4 Critérios de Aprovação.

---

## 5. Critérios de Aprovação — Checagem Direta

| Critério | Atingido? |
| --- | --- |
| Dead Loot cair significativamente | **Não** — variação de -0,04pp, ruído |
| Progressão voltar a crescer até o fim | **Não** — Power Score nos níveis 20/25/30 praticamente idêntico ao "Antes" |
| Os 11 tiers tornarem-se efetivamente acessíveis em campanhas completas | **Parcialmente** — tecnicamente acessíveis via loot de Chefe/Mini-Boss/Relíquia (Loot Tables já generosas), mas **não** via a imensa maioria dos drops (monstros comuns, presos ao próprio teto de Loot Table) |
| Nenhuma regressão em combate ou progressão | **Sim** — confirmado, 434/434 testes passam, nenhuma métrica piorou |

**Decisão: NÃO APROVAR nesta forma.** A implementação está correta e fiel à especificação ("menor redesenho possível" — só 1 substituição de parâmetro, nada mais) — mas essa especificação, definida na Sprint de investigação anterior, não previu que o clamp de `minLevel`/`maxLevel` de CADA Loot Table de monstro (um lever ortogonal, nunca antes relevante) se tornaria o novo fator dominante assim que o Item Level deixasse de estar sempre dentro do range nativo do próprio monstro.

---

## 6. Recomendação

**Não expandir o escopo desta Sprint unilateralmente** — alterar `minLevel`/`maxLevel` de Loot Tables está fora de "Alteração permitida: apenas monsterLevel → getRegionItemLevelAnchor(regionId)" desta Sprint, e mexer em Loot Tables é uma categoria de mudança explicitamente controlada nas Sprints anteriores desta série. Duas opções concretas para uma próxima Sprint (não implementadas aqui):

**A — Alargar `maxLevel` das Loot Tables de monstros comuns** para acompanhar o teto de 65 (mesma categoria de mudança "só dados", já usada com sucesso em "Equipment Progression Repair Phase II" pra Loot Tables). Ataca a causa raiz identificada na Seção 3 diretamente.

**B — Reverter esta mudança** e reconsiderar: talvez o Item Level "por região" só faça sentido pra loot de Chefe/Mini-Boss/Relíquia (onde já funciona, Seção 2), mantendo monstros comuns como estão — critério de design, não só técnico.

Ambas exigem uma decisão explícita antes de qualquer implementação — reportando aqui em vez de escolher por conta própria, dado que a primeira toca dado já controlado (Loot Tables) e a segunda é uma escolha de design sobre a experiência pretendida pra loot comum vs. loot de Chefe.

---

## 7. Validação

- **Typecheck**: `packages/shared` limpo (`npx tsc --noEmit -p tsconfig.json`).
- **Testes direcionados**: 4 chamadas de teste atualizadas (novo parâmetro obrigatório); nenhuma asserção alterada.
- **Suíte completa**: executada uma única vez (código compartilhado foi alterado) — **434/434 passando**, nenhuma regressão.
- **Auditoria comparativa**: `scripts/runEquipmentProgressionAudit.ts` (já existente, intocado), executado uma vez, Antes vs Depois na Seção 4.
- **Verificação isolada do mecanismo**: script descartável confirmando que `getRegionItemLevelAnchor` funciona corretamente e produz o efeito esperado quando não neutralizado pelo clamp de Loot Table (Seção 2).
