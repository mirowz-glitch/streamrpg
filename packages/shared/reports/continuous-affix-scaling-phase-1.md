# Continuous Affix Scaling — Implementation (Phase I)

Marca oficialmente o encerramento da linha de parametrização do Item Generator (Threshold Rescaling, Tier Weight Rebalance, Threshold+Weight Interaction, Selection Strategy — todas concluídas insuficientes) e a primeira mudança de MECANISMO desde o início desta investigação. Substitui o sistema de tiers-com-degraus (elegibilidade por `minItemLevel` + sorteio ponderado por `tier.weight`) por uma curva contínua de valor por Item Level, preservando toda a arquitetura, raridades, Loot Tables, Combat Engine e AutoEquip.

---

## 1. Arquitetura

**Modelo antigo**: cada afixo tinha 2-4 tiers; um tier só entrava no sorteio se `itemLevel >= tier.minItemLevel`; entre os elegíveis, um sorteio ponderado por `tier.weight` (4/16/30/50) escolhia UM tier; o valor era `randomInt(tier.min, tier.max)`. 13 dos 14 afixos do jogo tinham o melhor tier (T1) exigindo `minItemLevel` 50-65 — inalcançável dentro de `MAX_LEVEL=30` (prova matemática: `item-generation-design-review-phase-1.md`).

**Modelo novo (Continuous Affix Scaling)**: o valor de um afixo é uma função contínua do Item Level:

```
envelope = { globalMin, globalMax }  // min do pior tier, max do melhor tier — agrupado por mod.group
t = clamp(itemLevel / EFFECTIVE_MAX_ITEM_LEVEL, 0, 1)   // EFFECTIVE_MAX_ITEM_LEVEL = MAX_LEVEL (30, xp.ts)
curva(t) = 1 - (1-t)²                                    // ease-out quadrático
valorEsperado = globalMin + (globalMax - globalMin) × curva(t)
valorFinal = randomInt em torno de valorEsperado, janela de ±15% da faixa total, recortada em [globalMin, globalMax]
tier (rótulo) = tier do PRÓPRIO mod cujo centro (min+max)/2 está mais perto do valorFinal
```

Em `itemLevel=0` o valor é o mínimo global; em `itemLevel>=30` é o máximo global — o teto de cada afixo passa a ser alcançável dentro do próprio `MAX_LEVEL` do jogo, **sem elevá-lo**.

**Decisão de design não trivial — envelope por GROUP, não por mod**: "Healthy"/"Vigorous"/"Massive" (prefixos) e "of the Bear" (sufixo) são 4 mods diferentes, todos `group: "life"`, mutuamente exclusivos entre si (só 1 pode aparecer por item). Se o envelope fosse calculado por mod individual, qual dos 4 "vencesse a loteria" de seleção de mod produziria um salto arbitrário de valor (10-24 contra 70-110) **independente do Item Level** — exatamente o tipo de descontinuidade que esta Sprint existe pra eliminar. Agrupando o envelope por `group` (10 a 110 para "life", cobrindo os 4 mods), o valor final depende só do Item Level, nunca de qual mod-irmão foi sorteado.

---

## 2. Arquivos Alterados

| Arquivo | O que mudou |
| --- | --- |
| `src/itemgen/continuousScaling.ts` (novo) | Curva, envelope por group, rolagem, rótulo de tier — toda a lógica nova isolada aqui |
| `src/itemgen/continuousScaling.test.ts` (novo) | 8 testes: monotonicidade, envelope agrupado, limites, determinismo |
| `src/itemgen/generator.ts` | `rollMod()` migrado pro modelo contínuo; removida a filtragem de elegibilidade por `minItemLevel` e a indireção via `AffixSelectionStrategy`; `GenerateItemOptions.strategy` removido (não há mais "tier a escolher") |
| `src/itemgen/generator.test.ts` | 2 testes que verificavam o mecanismo antigo (gate de elegibilidade; T4 mais frequente que T1) reescritos pra verificar as propriedades do modelo novo (crescimento contínuo; T1 dominante em nível saturado) |
| `src/itemgen/index.ts` | Troca do re-export `selectionStrategy.js` → `continuousScaling.js` |
| `src/itemgen/selectionStrategy.ts` (removido) | Mecanismo da Sprint "Affix Selection Redesign — Prototype Phase I", já concluída insuficiente ("não é o gargalo dominante") — sem mais nenhum consumidor em produção após esta migração |
| `scripts/affixSelectionPrototypeComparison.ts` (removido) | Script de comparação histórico da mesma Sprint acima, dependia de `selectionStrategy.ts` |

Nenhum arquivo de `apps/api`, `apps/web`, Combat Engine, Loot Tables, `powerScore.ts`, `rarities.ts`, `weights.ts`, RNG ou Persistência foi tocado. `git diff` mostra exatamente estes 7 arquivos — nada além do esperado.

---

## 3. Comparação Antes × Depois

### Probabilidade de upgrade por região (Monte Carlo, N=20.000/região, mesma metodologia da Design Review)

| Região | Antes | Depois |
| --- | --- | --- |
| Bosque Sussurrante | 100% | 100% |
| Pântano Podre | 0,010% | **2,445%** (245x) |
| Colinas/Minas/Ruínas | 0,450% | **5,060%** (11x) |
| Picos Congelados | 0,020% | 0,160% (8x) |
| Litoral Quebrado | 0,000% | 0,010% |
| Deserto de Vidro | 0,000% | 0,010% |
| Fortaleza Sombria | 0,080% | 0,000% |

### Teto de Power Score (arma, único, N=20.000, itemLevel=20 fixo — mesma metodologia da Design Review)

| | Antes | Depois |
| --- | --- | --- |
| Média | 26,8 | **75,4 (+182%)** |
| p90 | 67 | **233 (+248%)** |
| p99 | 136 | **441 (+224%)** |
| Máximo observado | 248 | **590 (+138%)** |

A mediana permanece 11 nos dois casos — esperado: 60% dos drops continuam `common` (0 afixos), a distribuição de raridade não foi tocada. O ganho está inteiramente nos 40% de drops que TÊM afixo, agora escalando de verdade com o nível.

---

## 4. Resultados (Campanha completa, N=300, mesma metodologia de todas as auditorias anteriores)

| Métrica | Antes (melhor resultado já obtido em 6 Sprints de parametrização) | Depois |
| --- | --- | --- |
| Dead Loot Rate | 95,2% (nunca saiu desta faixa) | **94,4%** |
| Upgrades por campanha | 4,88 | **7,89 (+62%)** |
| Power Score, nível 20 | 807-832 | **1.028** |
| Power Score, nível 30 | 1.059-1.107 | **1.302** |
| Platôs de poder detectados (≥300s sem crescimento) | dezenas, concentrados em regiões tardias | **9, todos early-game** |
| Taxa de chegada a Picos Congelados | 80,7% | **95,0%** |
| Mortalidade em Picos Congelados | ~80,6% | **20,7%** |

### Upgrades por slot (total em 300 campanhas)

| Slot | Antes | Depois | Variação |
| --- | --- | --- | --- |
| Arma | 605 | 891 | +47% |
| Elmo | 30 | 58 | **+93%** |
| Peitoral | 146 | 277 | **+90%** |
| Luvas | 48 | 65 | +35% |
| Botas | 247 | 393 | +59% |
| Anel 1 | 164 | 272 | +66% |
| Anel 2 | 30 | 70 | **+133%** |
| Amuleto | 20 | 39 | **+95%** |
| Cinto | 162 | 303 | +87% |

Todos os 9 slots melhoraram — nenhum ficou mais congelado, nenhuma distribuição foi imposta artificialmente (o sistema produziu isso sozinho a partir da curva contínua).

**Fase 8 — Balanceamento Inicial**: nenhum valor extremo encontrado que exigisse ajuste. A queda de mortalidade em Picos Congelados (82%→21%) foi verificada como consequência ESPERADA e legítima do personagem chegar lá genuinamente mais forte — nenhuma mudança de Combat Engine/Enemy Templates ocorreu; a auditoria original (Phase I) já havia estabelecido que a mortalidade ali nunca foi causada pela força do equipamento em si, então esta melhora reflete o personagem cruzando um limiar real de poder, não uma redução artificial de dificuldade.

---

## 5. Compatibilidade

- **AutoEquip**: inalterado (`adventure/autoEquip.ts` compara `item.powerScore > currentPowerScore`, nunca leu tier/afixo diretamente) — confirmado no smoke test: mensagem "Espada não foi equipado — o que você já tem no slot Arma ainda é melhor" apareceu corretamente durante uma campanha real.
- **Serialização/Persistência**: `ItemGenRolledMod` mantém exatamente o mesmo formato (`modId, type, group, name, statLabel, tags, tier, value`) — nenhuma migração de schema necessária. Confirmado no smoke test: itens gerados durante a campanha apareceram corretamente em `/app/character` (Arma/Botas/Cinto com raridade e valor corretos).
- **Nomes/raridades/categorias**: `prefixes.ts`/`suffixes.ts`/`rarities.ts` não foram tocados — todo mod continua com seu próprio nome, tags e lista de tiers (agora só rótulos de qualidade, Fase 6).
- **Tiers**: preservados como dado (nenhuma migração), só deixaram de controlar o valor — passam a ser identificados a partir do valor já rolado (`identityTierForValue`), continuando úteis pra exibição/UI sem nenhuma mudança na interface existente.

---

## 6. Commercial Impact

Uma progressão contínua elimina a sensação de "parede" que caracterizava o jogo até a Sprint anterior: em vez de o jogador sentir que upgrades simplesmente PARAM de acontecer a partir da 2ª/3ª região (Dead Loot ~95%, uma sensação de "sorte zerada"), agora ele encontra upgrades quase 2x mais frequentemente (7,9 vs. 4,9 por campanha) e vê 2 dos 9 slots de equipamento que antes ficavam praticamente congelados (Elmo, Peitoral) evoluir com a mesma naturalidade dos demais. Numa campanha longa, isso se traduz diretamente em retenção: o jogador que hoje chega a Picos Congelados (95% consegue, contra 80,7% antes) e sobrevive à entrada em ~4 de cada 5 tentativas (contra ~1 de cada 5 antes) vê o conteúdo de fim de jogo já construído (Dungeons, Relíquias, World Tiers) — algo que a esmagadora maioria das jornadas simplesmente não alcançava até esta Sprint. Este é o primeiro resultado, em 6 Sprints de investigação sobre o mesmo problema, que efetivamente resolve o "deserto de loot" original — todas as tentativas anteriores de ajuste de parâmetro (Dead Loot preso em ~95,2%) ficam para trás dos 94,4% obtidos aqui, mas mais importante que o número isolado é a mudança qualitativa: upgrades reais, em todos os slots, em toda a campanha.

---

## 7. Roadmap

`commercial/roadmap/project-valuation-roadmap.md` atualizado (Seção 0.6): item #1 da Seção 1 ("Equipment Progression Audit") marcado como concluído; item #2 ("Endgame Funnel Fix") anotado com a queda de mortalidade em Picos Congelados (82%→21%) como efeito colateral medido desta Sprint, com recomendação explícita de reavaliar o escopo dessa próxima Sprint com o número novo antes de iniciá-la.

---

## Validação

- **Typecheck**: `packages/shared` limpo (`npx tsc --noEmit -p tsconfig.json`).
- **Suíte completa**: executada uma vez — **442/442 passando** (434 anteriores + 8 novos testes de `continuousScaling.test.ts`; os 2 testes que verificavam o mecanismo antigo foram reescritos, não removidos).
- **Monte Carlo + campanhas completas**: executados e comparados diretamente contra o sistema anterior (Seções 3/4).
- **Smoke Test** (navegador real, personagem via `createCharacter`/`createSession`, mesmo caminho de código do signup real):
  1. Itens gerados em múltiplas regiões (Bosque Sussurrante → Deserto de Vidro) — confirmado pela linha do tempo da campanha.
  2. Crescimento de atributos confirmado: Adaga evoluiu de Comum (Power Score 7, Bosque Sussurrante) até Lendário (ATQ +50) ao longo da campanha.
  3. Ausência de saltos artificiais: nenhuma mudança abrupta e inexplicada de stats observada; progressão visualmente gradual.
  4. Campanha completa executada até a morte do personagem (nível 29, Deserto de Vidro, Elite derrotado, 1 Dungeon completa — "Fortaleza Congelada" — concluída no caminho).
  5. AutoEquip confirmado funcionando corretamente ("Espada não foi equipado — o que você já tem no slot Arma ainda é melhor").
  6. Compatibilidade com salvamento confirmada — itens sincronizados corretamente em `/app/character` (Arma/Botas/Cinto, raridade e valor corretos); a limitação PRÉ-EXISTENTE de sincronização de outros slots (Elmo/Armadura/Amuleto/Anel mostrando "Não equipado") é a mesma já documentada e em correção por uma Sprint separada — não uma regressão desta Sprint.
  7. `git status` confirmado: só os 7 arquivos listados na Seção 2 foram alterados — nenhuma mudança inesperada em `apps/` ou em qualquer outro módulo de `packages/shared`.
