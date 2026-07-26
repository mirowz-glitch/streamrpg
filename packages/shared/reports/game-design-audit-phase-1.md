# Game Design Audit — Player Progression, Economy & Balance Report (Phase I)

**Natureza desta entrega**: auditoria pura. Nenhum arquivo de produção foi alterado. Todas as conclusões abaixo vêm exclusivamente do Simulador existente (`packages/shared/src/simulation/simulator.ts` + `report.ts`) e da leitura do código de produção já existente. Onde o instrumental atual não permite medir algo com confiança, isso é dito explicitamente em vez de inferido.

---

## 1. Metodologia

**Fontes de evidência (nenhuma nova lógica de simulação criada):**

| Fonte | O que fornece | Reaproveitada de |
| --- | --- | --- |
| `scripts/runGameDesignAudit.ts` (novo, só orquestração) | 1 campanha nova: **jornada natural**, N=300, `runSimulatedAdventure({ regionId: "bosque-sussurrante" })`, sem `forceExpeditionId`/`worldTier`, orçamento de 7200s simulados por execução | `runSimulatedAdventure`/`generateBalanceReport` (intocados) |
| `packages/shared/reports/progression-economy-audit-after.md` (já existente, Sprint anterior) | Expedições regionais, 4 Dungeons em WT1, comparação WT1-WT4, distribuição de raridade agregada | Reaproveitado sem re-executar (evita rodada repetida) |
| Leitura direta de código | `biomes.ts`, `regionProgression.ts`, `encounterTables.ts`, `expeditionDefinitions.ts`, `factionController.ts`, `itemgen/types.ts`, `types.ts`, `lootidentity/lootIdentities.ts` | — |

**Por que uma única campanha nova**: as 10 Fases pedidas se dividem em duas categorias — (a) as que já são respondidas por relatórios existentes (Dungeons, World Tiers, distribuição de raridade — Fases 3/4/6/7), e (b) as que exigem uma jornada **não forçada**, começando do zero, para medir o que o jogador realmente experimenta sem ajuda externa (Progressão, Ritmo, Equipamento, Jornada Completa — Fases 1/9/10, e parte da 2/5/8). Uma única campanha de 300 execuções cobre (b) sem repetição.

**Validação desta Sprint**: nenhum `typecheck`, nenhuma suíte de testes, nenhum smoke test, nenhum arquivo de produção alterado — apenas o script de orquestração acima (que só chama funções já existentes) e leitura de código.

**Limitações de instrumentação, declaradas em vez de infligidas por inferência:**
- `CombatStats` (tipo em `simulation/types.ts`) é **agregado**, sem quebra por Enemy Template individual. Não é possível apontar "o Enemy Template X está acima/abaixo da curva" com números — só é possível analisar no nível de **região** (`RegionProgressionBreakdown`, que existe e foi usado).
- Não existe contagem por Relíquia individual — só `rarityCounts.unique` agregado. A análise de Relíquias (Fase 5) é feita **por dedução via a taxa de vitória de cada Boss** (cada Relíquia só cai na morte de um Boss específico — `dungeon/uniqueRelicDefinitions.ts`), não por contagem direta por item.
- Modificadores de Dungeon (`expeditionModifiers.ts`) só existem **combinados**, um conjunto fixo por Dungeon — não há como isolar o efeito de um único modificador nos dados atuais sem alterar produção (proibido nesta Sprint). A Fase 8 reporta o efeito **combinado** por Dungeon, não o de cada modificador isolado.
- A tabela de comparação de World Tiers (Seção 4.3) usa personagem em nível inicial padrão (nível 1) em todos os 4 tiers — não é um personagem já equipado/nivelado enfrentando WT1-4 igualmente preparado. Isso é uma variável de confusão explicitada abaixo, não escondida.

---

## 2. Diagnóstico Geral (ordenado por impacto)

1. **A progressão regional trava permanentemente na 4ª de 9 regiões, por um gate de nível matematicamente impossível.** `fortaleza-sombria` (5ª região) exige nível mínimo 60 para desbloquear (`encounterTables.ts:321`), mas `MAX_LEVEL = 30`. Como o desbloqueio de região é estritamente sequencial (`getNextBiome`, `regionProgression.ts`), as regiões 6-9 (`colinas-aridas`, `picos-congelados`, `litoral-quebrado`, `deserto-de-vidro`) — 3 das quais têm gates de nível perfeitamente alcançáveis (15, 20, 24, 28) — ficam **inacessíveis por tabela, não por dificuldade**. Confirmado empiricamente: em 300 execuções de 2h simuladas cada, 0 delas alcançou qualquer região além de `ruinas-esquecidas`.
2. **3 das 4 Dungeons novas são efetivamente conteúdo morto.** Fortaleza Congelada (0% conclusão, 0/9 Boss vencido), Covil do Dragão (0% conclusão, 0/34), Catedral Esquecida (22.2%, 2/9) — mesmo já entrando calibradas ao nível de cada uma. Como as Relíquias só caem na morte do Boss, isso também torna 3 das 4 Relíquias Únicas praticamente inobtíveis.
3. **World Tier 4 é um tier não-funcional (0% em tudo).** WT3 já mostra colapso desproporcional de recompensa (XP cai 87% de WT2 pra WT3, taxa de vitória cai só 1 ponto percentual) — sinal de que a queda vem de sessões terminando antes de completar (morte/timeout), não de uma curva de dificuldade suave.
4. **O Chefe Final e o Elite comum são efetivamente sem risco.** Chefe Final: 99.9-99.8% de vitória por encontro (múltiplas campanhas independentes convergem no mesmo número). Elite: 99.0%. Mini-Boss: 99.9%. Nenhum dos três jamais representa ameaça real de morte.
5. **Reputação de facção passa do teto em ~75% das jornadas.** Culto das Ruínas atinge o rank máximo "Lendário" (180 de reputação) com uma média de 913 pontos — mais de 5x o limiar — em 75% das execuções da jornada natural. Legião Sombria: mesmo padrão (74%, 221 de média). O sistema de ranks perde sentido cedo demais.
6. **Ouro sem destino.** Acumula a ~68/min (quase 8000 de saldo médio ao fim de uma jornada de ~1h35 simuladas) sem nenhum sistema de gasto implementado — reconhecido pelo próprio motor de recomendações como gargalo estrutural.
7. **"Deserto de loot" em 90% das jornadas**: ao menos 600s consecutivos sem nenhum upgrade de equipamento; o maior intervalo médio sem upgrade (5120s) equivale a ~90% do tempo médio de sobrevivência de uma sessão inteira.
8. **Um slot de equipamento (`ring2`) está abandonado.** Power Score médio 7.1 contra 13.8-54.8 dos demais slots.
9. **Duas vocabulários de raridade incompatíveis coexistem no código**: o tipo público `ItemRarity` (`types.ts`) declara `common/uncommon/rare/epic/legendary`, mas o gerador de loot que realmente alimenta o jogo (`lootgen`/`lootidentity`, e todo `rarityCounts` medido nesta e em auditorias anteriores) produz `common/magic/rare/unique`. Nenhuma execução, em nenhuma auditoria desta sessão, jamais produziu `uncommon`, `epic` ou `legendary`.
10. **A Dungeon original ("Queda da Fortaleza Sombria") consome sozinha ~68% do orçamento de tempo de uma jornada de 2h**, com 179 encontros médios por execução (o próprio motor sinaliza 40-70 como alvo saudável) — isso é o mecanismo pelo qual o Achado #1 acontece: o jogador fica preso repetindo essa Dungeon em vez de progredir.

---

## 3. Diagnóstico por Sistema

### 3.1 Progressão
Distribuição de nível final é **bimodal**: 221 de 300 execuções (73.7%) atingem o nível 30 (teto), o restante morre espalhado entre níveis 3-22. Não existe um "meio-termo" — ou o personagem domina completamente dentro da única região acessível, ou morre cedo. Nível médio ao **avistar** o Chefe Final: 12.3 (teto da região onde ele vive: 30) — o personagem enfrenta o clímax da Dungeon subdesenvolvido para o próprio conteúdo, e ainda assim vence quase sempre (ver 3.2).

### 3.2 Combate
Elite (99.0% vitória, 2925 encontros), Mini-Boss (99.9%, 16570 encontros) e Chefe Final (99.9%, 7905 encontros) convergem para o mesmo padrão: nenhuma categoria de inimigo especial representa risco de morte. Não há dado por Enemy Template individual (limitação declarada). Causas de morte na jornada natural: Normal 39, Elite 28, Boss 8, Mini-Boss 4 — ironicamente, inimigos **comuns** matam mais que os especiais, sugerindo que o perigo real do jogo vem do atrito de combates normais repetidos, não dos encontros "de risco" desenhados para isso.

### 3.3 Dungeons
| Dungeon | Nível inicial | Conclusão | Boss encontrado/vencido | Win rate | Modificadores |
| --- | --- | --- | --- | --- | --- |
| Queda da Fortaleza Sombria | 1 | 77.0% (natural: 74.4%) | 2993-7905 / 2987-7897 | 99.8-99.9% | nenhum (Dungeon original) |
| Fortaleza Congelada | 25 | 0.0% | 9 / 0 | 0.0% | elite-density, reduced-healing |
| Catedral Esquecida | 28 | 0.0% | 9 / 2 | 22.2% | increased-vitality, worldevents-disabled |
| Covil do Dragão | 30 | 0.0% | 34 / 0 | 0.0% | miniboss-surge, increased-damage, reduced-gold |

A única Dungeon que funciona é a original, sem modificador nenhum. As 3 novas falham mesmo com nível de entrada calibrado — o problema não é "personagem despreparado", é o conteúdo em si (tuning de inimigo, fora do escopo de ajuste desta Sprint).

### 3.4 Loot
Distribuição agregada (natural journey, ~73.4k itens): common 38.3%, magic 38.2%, rare 18.7%, unique 4.8% — consistente com a distribuição já medida em Dungeons (WT1) na Sprint anterior (common 36.7%/magic 38.5%/rare 19.8%/unique 5.1%). Nenhuma raridade "unique" é rara ao ponto de nunca aparecer (3541 unidades em 300 execuções) — pelo contrário, dado o Achado #2, ela está concentrada quase inteiramente na Dungeon original. Achado de arquitetura (não é bug de jogabilidade, é inconsistência de dados): o tipo `ItemRarity` declarado em `types.ts` (`common/uncommon/rare/epic/legendary`) nunca corresponde ao vocabulário real de drop (`common/magic/rare/unique`, `lootgen`/`lootidentity`). Slot mais fraco: `ring2` (Power Score 7.1 vs. 13.8-54.8 dos demais).

### 3.5 Economia
Ouro: 68.2/min, ~7981 acumulado ao fim de uma jornada natural — sem sistema de gasto (Marketplace inexistente). Reputação: 2 das 4 facções (Culto das Ruínas, Legião Sombria) atingem o rank máximo em ~75% das jornadas com médias de 913 e 221 (limiar "Lendário": 180) — 5x e 1.2x acima do teto, respectivamente. As outras 2 facções têm comportamento saudável: Guardiões da Floresta com distribuição espalhada entre ranks (67 de média), Mercadores Livres quase sempre neutro (6 de média, nunca sobe de fato) — o problema é específico dos gatilhos de Mini-Boss/Chefe Final repetido (ver Achado #5 e nota já registrada em `factionController.ts:29-46` de uma Sprint anterior, que reduziu parcialmente mas não eliminou o problema).

### 3.6 Equipamento
Primeiro upgrade: 138.5s. Depois disso, média de apenas 3.83 upgrades **totais** por jornada inteira (que dura em média 5716s) — upgrades por minuto: 0.067. 90% das jornadas têm ao menos um período de 600s+ sem nenhum upgrade; o maior desses períodos, em média, dura 5121s — ou seja, na jornada média, o personagem passa a **maior parte do tempo total de sobrevivência** sem trocar nenhum equipamento. Slot `weapon` concentra o maior Power Score médio (54.8); `ring2` é o mais fraco (7.1).

### 3.7 Relíquias
Não há contagem direta por Relíquia (limitação declarada), mas a dedução via taxa de vitória de Boss é direta: como cada Relíquia só cai na morte do Boss específico de sua Dungeon (`uniqueRelicDefinitions.ts`), e 3 das 4 Dungeons têm win rate de Boss entre 0% e 22.2% (ver 3.3), **3 das 4 Relíquias Únicas são hoje praticamente inobtíveis**, enquanto a 4ª (Queda da Fortaleza Sombria, 99.8-99.9% de vitória, reencontrada dezenas de vezes por sessão longa) é obtida de forma trivial e repetida.

### 3.8 World Tiers
| World Tier | XP médio | Ouro médio | Reputação média | Win rate | Unique (contagem) |
| --- | --- | --- | --- | --- | --- |
| WT1 | 1144 | 305 | 887.6 | 99.7% | 1665 |
| WT2 | 582 | 155 | 408.4 | 99.5% | 762 |
| WT3 | 76 | 20 | 48.0 | 98.5% | 78 |
| WT4 | 0 | 0 | 0.0 | 0.0% | 3 |

WT4 é hoje um tier morto — 0% de recompensa e vitória. A queda de WT2 para WT3 (XP cai 87%, vitória cai só 1 ponto percentual) não parece uma curva de dificuldade — parece sessões terminando cedo demais (dado que a mesma tabela usa personagem em nível-base fixo em todos os tiers, essa comparação mede "personagem fraco contra dificuldade crescente", não "dificuldade pura" — variável de confusão já registrada na Metodologia).

### 3.9 Dungeon Modifiers
Só observáveis em combinação fixa por Dungeon (limitação declarada). As 3 combinações observadas (elite-density+reduced-healing; increased-vitality+worldevents-disabled; miniboss-surge+increased-damage+reduced-gold) correlacionam-se com win rate de Boss entre 0% e 22.2% — nenhuma delas produz uma Dungeon jogável no estado atual, mas não é possível separar quanto disso vem do modificador versus do tuning base do Enemy Template daquela Dungeon (a mesma limitação do Achado #2).

### 3.10 Jornada Completa (timeline real, medida)
| Tempo (mm:ss) | Marco |
| --- | --- |
| 00:22 | Primeiro combate |
| 00:19* | Primeiro item (*ocorre antes do 1º combate — provável drop de Evento Mundial/exploração, não de kill) |
| 02:19 | Primeiro upgrade de equipamento |
| 03:56 | Primeiro Evento Mundial |
| 09:14 | Primeiro Elite |
| 21:00* | Primeira Dungeon iniciada (média 130.98s — ocorre cedo, dentro do bioma "ruinas-esquecidas") |
| 23:48 | Primeiro Mini-Boss |
| 37:04 | Primeiro Chefe Final avistado |
| 36:42* | Primeiro Chefe Final derrotado (*a rigor ocorre ~22s antes do "avistado" na média agregada — efeito de arredondamento entre execuções onde o Boss é derrotado no primeiro encontro possível) |
| 37:54 | Primeira Expedição concluída |
| — | World Tier 2+: nunca alcançado nesta campanha (World Tier não é oferecido pela progressão natural — é hoje uma escolha de sessão, não um desbloqueio orgânico) |
| — | Regiões 5-9, 2ª-4ª Dungeon: nunca alcançadas (ver Achado #1 e #2) |

A jornada real de hoje é: 37 minutos até o primeiro (e único) Chefe Final, depois **repetição da mesma Dungeon pelo resto da sessão**, sem nunca ver as 5 regiões restantes, as outras 3 Dungeons, World Tier 2+, ou 3 das 4 Relíquias.

---

## 4. Evidências (números brutos por trás de cada conclusão)

**Jornada natural (N=300, bosque-sussurrante, 7200s de orçamento, sem forçar Expedição/World Tier):**
- `survival`: deathRate 26.33% (79/300); causas: Normal 39, Elite 28, Boss 8, MiniBoss 4; averageSeconds 5715.7 de 7200 possíveis.
- `progression`: averageFinalLevel 24.5; levelDistribution com pico de 221/300 no nível 30; xpPerMinute 3838.9; goldPerMinute 68.2; lootPerMinute 0.42.
- `regionProgression` (reachRate): bosque-sussurrante 100%, pantano-podre 97.3%, minas-abandonadas 84.0%, ruinas-esquecidas 78.3%, fortaleza-sombria em diante **0%** em todas as 300 execuções.
- Tempo médio gasto por região: bosque-sussurrante 679s, pantano-podre 1259s, minas-abandonadas **23s** (travessia quase instantânea, 0.79 itens encontrados, 0.01 objetivos), ruinas-esquecidas **4839s** (67% do orçamento total de 7200s).
- Taxa de morte por região: pantano-podre 13.7% (a mais alta; 27 das 40 mortes ali são de inimigos Normais), bosque-sussurrante 2.7%, minas-abandonadas 6.7%, ruinas-esquecidas 6.0%.
- `eliteMiniBoss`: Elite 2897/2925 vitórias (99.04%), Mini-Boss 16558/16570 (99.93%).
- `dungeon`: totalStarted 258, totalCompleted 192 (74.4%), bossEncountered 7905, bossDefeated 7897 (99.90%), averageEncountersCompleted 179.26, averageDurationSeconds 3943.7.
- `bossEncounterProfile`: averageCharacterLevel 12.35 (teto da região: 30), averageBossHpPercentRemainingOnLoss 34.5%.
- `equipmentProgression`: averageSecondsToFirstUpgrade 138.5, averageUpgradeCount 3.83, upgradesPerMinute 0.067, averageLongestGapWithoutUpgradeSeconds 5120.8, lootDesertRate 90%.
- `loot.slotAveragePowerScore`: weapon 54.77, boots 24.05, gloves 20.89, ring1 15.78, belt 13.82, ring2 **7.10**.
- `loot.rarityCounts`: common 28090, magic 28024, rare 13737, unique 3541 (total 73392).
- `factions.perFaction`: Culto das Ruínas averageFinalReputation 913.23 (226/300 em rank Lendário = 75.3%); Legião Sombria 220.97 (221/300 Lendário = 73.7%); Guardiões da Floresta 67.28 (distribuição espalhada, 4/300 Lendário); Mercadores Livres 5.97 (nunca sai de neutro/amigável).
- `worldEvents.perCategory` (frequência por execução): shrine 82.3%, ambush 91.0%, merchant 69.7%, treasure 91.3%, discovery 82.0%.
- `journeyTimeline`: ver tabela da Seção 3.10.
- `recommendations` (geradas automaticamente pelo próprio motor, reproduzidas aqui como evidência adicional): confirmam de forma independente 7 dos 10 achados listados na Seção 2 (regiões nunca alcançadas, Elite/Chefe Final triviais, eventos "ambush"/"treasure" comuns demais, recompensa de Expedição/Chefe Final desproporcional ao total de XP, reputação subindo rápido demais em 2 facções, Dungeon longa demais, ouro sem utilidade, deserto de loot, slot `ring2` abandonado, nível insuficiente ao avistar o Chefe Final).

**Dungeons/World Tiers/Raridade (reaproveitado de `progression-economy-audit-after.md`, Sprint anterior, WT1 salvo exceto onde indicado):** ver tabelas completas nas Seções 3.3, 3.8, 3.4.

**Código-fonte citado diretamente:**
- `encounterTables.ts:321` — `fortaleza-sombria` com `levelRange: { min: 60, max: 80 }`.
- `xp.ts` — `MAX_LEVEL = 30` (nível 60 nunca é matematicamente alcançável).
- `regionProgression.ts:22-38` — `checkRegionUnlock` só considera o **próximo** bioma na sequência (`getNextBiome`), nunca "pula" um gate impossível para tentar o seguinte.
- `expeditionDefinitions.ts:190,204,221` — modificadores de cada Dungeon nova.
- `types.ts:78` — `ItemRarity = "common" | "uncommon" | "rare" | "epic" | "legendary"`.
- `itemgen/types.ts:1-13` — comentário confirma que este é o vocabulário "usado HOJE por DropSystem/InventoryPage/EquipmentSlots", divergente do vocabulário real de `lootgen`/`lootidentity` (`common/magic/rare/unique`).
- `factionController.ts:29-46` — comentário de Sprint anterior já documenta a causa raiz do estouro de reputação (canal duplo: genérico + `FINAL_BOSS_REPUTATION` em `dungeonController.ts`), reduzida parcialmente mas não eliminada.

---

## 5. Recomendações (nenhuma implementada — só descrição de abordagem e severidade)

| # | Problema | Severidade | Causa provável | Abordagem possível (não implementada) |
| --- | --- | --- | --- | --- |
| 1 | Regiões 5-9 inacessíveis (gate nível 60 > MAX_LEVEL 30) | **Crítica** | `fortaleza-sombria` nunca recalibrada para o teto de nível 30 pós-introdução do MAX_LEVEL atual | Reduzir `levelRange.min` de `fortaleza-sombria` para algo alcançável (ex.: 20-25), OU reordenar `BIOME_PROGRESSION` para não depender de um gate inatingível antes das 4 regiões seguintes |
| 2 | 3 de 4 Dungeons novas com 0-22% de conclusão | **Crítica** | Tuning de Enemy Template/Boss das 3 Dungeons novas incompatível com o nível de entrada calibrado | Sessão de balanceamento dedicada a essas 3 Dungeons isoladamente (reduzir vida/dano do Boss ou dos inimigos regulares até uma taxa de vitória saudável, ex.: 40-70%) |
| 3 | World Tier 4 não-funcional; WT3 com colapso de recompensa desproporcional | **Alta** | Possível confusão entre "dificuldade" e "personagem base fraco demais para o tier" (ver limitação de metodologia) | Repetir a comparação de WT com um personagem já nivelado/equipado por tier antes de decidir se é a curva ou o personagem-base que está errado |
| 4 | Chefe Final/Elite/Mini-Boss com ~99% de vitória | **Alta** | Vida/dano desses templates não escala com o nível real do personagem ao encontrá-los | Recalibrar vida/dano do template do Chefe Final (e Elite/Mini-Boss genéricos) usando o nível médio real de encontro (12.3) como referência, não o teto da região (30) |
| 5 | Reputação de 2 facções passa do teto em ~75% das jornadas | **Alta** | Canal duplo de reputação por derrota de Boss/Mini-Boss (genérico em `factionController.ts` + `FINAL_BOSS_REPUTATION` em `dungeonController.ts`) somando repetidamente na mesma Dungeon longa | Consolidar os dois canais em um único ponto de concessão, ou aplicar um teto de reputação por sessão/por tipo de evento |
| 6 | Ouro sem destino de gasto | **Média** (estrutural, não é bug) | Marketplace/loja ainda não implementados | Fora do escopo de ajuste — é uma dependência de roadmap, não um bug de balanceamento |
| 7 | Deserto de loot em 90% das jornadas | **Alta** | Frequência de upgrade muito baixa relativa à duração média de sessão | Revisar taxa de drop de itens equipáveis por slot, ou frequência de upgrade relevante nas Loot Tables regionais |
| 8 | Slot `ring2` abandonado | **Média** | Loot Identity/Tables desse slot com Power Score sistematicamente mais baixo | Revisar os itens definidos para `ring2` nas Loot Tables/Identities regionais |
| 9 | Duas vocabulários de raridade incompatíveis (`ItemRarity` vs. `lootgen`) | **Média** (dívida arquitetural, não afeta jogabilidade hoje) | Sistema antigo (`types.ts`) nunca foi unificado com o sistema de loot real em uso | Decidir qual vocabulário é canônico e migrar o outro, ou documentar formalmente que são dois sistemas paralelos (um deles morto) |
| 10 | Dungeon original consome 68% do orçamento de uma jornada de 2h | **Alta** | 179 encontros médios por execução (alvo do próprio motor: 40-70) | Reduzir o tamanho da Dungeon original (menos encontros necessários para completar) |

---

## 6. Roadmap Priorizado (sprints recomendadas, por impacto esperado na experiência do jogador)

1. **Corrigir o gate de nível impossível de `fortaleza-sombria`** — Objetivo: desbloquear as 5 regiões restantes do jogo. Sistemas envolvidos: `worldencounter/biomes.ts`, `encounterTables.ts`. Risco técnico: baixo (mudança de 1-2 números). Impacto esperado: **o mais alto de todo este roadmap** — hoje 67% do conteúdo regional do jogo (5 de 9 biomas) é matematicamente inacessível.
2. **Balancear as 3 Dungeons novas isoladamente** — Objetivo: elevar taxa de conclusão de 0-22% para 40-70%. Sistemas: `enemy/templates.ts`, `enemy/instance.ts` dos 3 bosses novos. Risco: médio (requer iteração via Simulador). Impacto: alto — libera 3 Dungeons e 3 Relíquias hoje mortas.
3. **Recalibrar vida/dano do Chefe Final/Elite/Mini-Boss para o nível real de encontro** — Objetivo: dar risco de morte genuíno aos encontros de clímax. Sistemas: `enemy/templates.ts`. Risco: baixo-médio. Impacto: alto — afeta a sensação de "conquista" do jogo inteiro.
4. **Consolidar o canal duplo de reputação de Boss/Mini-Boss** — Objetivo: reputação parar de estourar o teto em 75% das sessões. Sistemas: `factions/factionController.ts`, `dungeon/dungeonController.ts`. Risco: baixo. Impacto: médio-alto.
5. **Reduzir o tamanho da Dungeon original (179 → 40-70 encontros)** — Objetivo: liberar tempo de sessão para as regiões/Dungeons seguintes. Sistemas: `dungeon/dungeonDefinitions.ts`/`expeditionDefinitions.ts`. Risco: baixo. Impacto: alto — combinado com o item 1, é o que realmente desbloqueia a "jornada completa".
6. **Revisar taxa de drop de upgrades e o slot `ring2`** — Objetivo: reduzir desertos de loot de 90% das jornadas. Sistemas: `lootgen/lootTables.ts`, `lootidentity/lootIdentities.ts`. Risco: baixo. Impacto: médio.
7. **Investigar o colapso de recompensa WT2→WT3 com personagem corretamente nivelado por tier** — Objetivo: separar "dificuldade real" de "personagem fraco demais". Sistemas: nenhum (só uma nova campanha de medição). Risco: nenhum. Impacto: médio (pré-requisito para decidir se WT3/WT4 precisam de ajuste).
8. **Unificar os dois vocabulários de raridade (`ItemRarity` vs. loot real)** — Objetivo: dívida arquitetural, não afeta jogabilidade hoje. Risco: médio (toca UI). Impacto: baixo a curto prazo, mas cresce quanto mais o sistema antigo for referenciado em código novo.
9. **Marketplace/sistema de gasto de ouro** — já reconhecido como dependência estrutural fora do escopo de balanceamento; roadmap de Economia 1.0 já existente no projeto.

---

## 7. Conclusão Executiva

**O jogo ainda não é divertido na forma como progride hoje — não por falta de conteúdo, mas porque 67% do conteúdo já construído é inacessível.** 5 de 9 regiões, 3 de 4 Dungeons e 3 de 4 Relíquias Únicas nunca aparecem numa jornada real, não por dificuldade, mas por um gate de nível literalmente impossível (60 num jogo com teto 30) e por balanceamento quebrado nas Dungeons novas. O jogador que joga por 2 horas simuladas vive a mesma Dungeon original repetidamente, do minuto 37 em diante, sem nunca ver o resto do jogo.

**A progressão NÃO é saudável**: é bimodal (ou domina completamente aos 30, ou morre cedo) e o único clímax acessível (Chefe Final) é enfrentado subdesenvolvido (nível 12 contra um conteúdo de teto 30) e ainda assim vencido quase sempre (99.9%).

**O endgame não funciona**: World Tier 4 tem 0% de tudo; World Tier 3 já mostra um colapso de recompensa que provavelmente é sessões terminando cedo, não dificuldade de verdade — e nada disso importa porque a progressão regional nem chega perto de precisar de World Tier no percurso natural medido.

**Os 3 maiores gargalos de hoje, em ordem:**
1. O gate de nível impossível de `fortaleza-sombria` (trava 67% do conteúdo regional).
2. As 3 Dungeons novas com 0-22% de conclusão (trava 75% do conteúdo de Dungeon/Relíquia).
3. Chefe Final/Elite/Mini-Boss com ~99% de vitória (o jogo nunca ameaça de verdade o jogador nos momentos desenhados para isso).

**Se apenas uma Sprint pudesse ser feita agora, a de maior ganho de qualidade seria a combinação dos itens #1 e #5 do Roadmap** (corrigir o gate de `fortaleza-sombria` + encolher a Dungeon original) — são as duas mudanças de menor risco técnico (poucos números, nenhuma lógica nova) com o maior efeito possível: sozinhas, elas transformam uma "jornada de 2h presa numa única Dungeon" em uma jornada que finalmente atravessa as 9 regiões que já existem no jogo.
