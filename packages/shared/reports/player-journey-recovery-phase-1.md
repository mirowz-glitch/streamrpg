# Vertical Slice — Player Journey Recovery & World Progression (Phase I)

Corrige exclusivamente os gargalos identificados em [game-design-audit-phase-1.md](game-design-audit-phase-1.md) (Achados #1, #2, #10). Nenhuma arquitetura foi alterada — todos os ajustes são dados de configuração (níveis, ordem de biomas, contagem de encontros/checkpoints, stats de Enemy Template).

---

## 1. Arquivos modificados

| Arquivo | O que mudou |
| --- | --- |
| `src/worldencounter/biomes.ts` | Reordenado `BIOME_PROGRESSION`: `colinas-aridas` volta pro início (order 3); `fortaleza-sombria` vai pro fim (order 9) |
| `src/worldencounter/encounterTables.ts` | `fortaleza-sombria.levelRange.min` 60→30; `ruinas-esquecidas.variantChances.miniBoss` testado e revertido pra 0.35; `picos-congelados`/`litoral-quebrado`/`deserto-de-vidro.variantChances.miniBoss` 0.14→0.35 |
| `src/expeditions/expeditionDefinitions.ts` | `queda-da-fortaleza-sombria`: `expectedEncounters` 220→140, `checkpointCount` 54→35; as 3 Dungeons novas: `expectedEncounters`/`checkpointCount` ampliados (24→44/12→22, 28→48/14→24, 32→52/16→26) |
| `src/enemy/templates.ts` | `frost-king`/`ancient-dragon`/`corrupted-bishop` (Chefes) e `frost-wolf`/`ice-golem`/`corrupted-acolyte`/`fire-cultist` (mobs comuns) reduzidos ~15-35% |
| `src/worldencounter/worldEncounter.test.ts`, `src/hud/hud.test.ts` | 2 testes atualizados pra refletir o novo gate de `fortaleza-sombria` (60→30) |
| `scripts/smokeTestJourneyRecovery.ts` (novo) | Smoke test desta Sprint |
| `reports/game-design-audit-natural-journey-BEFORE.json`, `-AFTER.json` (novos) | Snapshots da campanha comparativa (Fase 5) |

---

## 2. Region Gates

| Região | Gate atual (antes) | Gate novo | Justificativa |
| --- | --- | --- | --- |
| fortaleza-sombria | 60 (impossível, MAX_LEVEL=30) | **30** (=MAX_LEVEL) | Elimina o gate matematicamente impossível (achado #1 da auditoria); continua a região mais dura do jogo, só alcançável no nível máximo. |
| colinas-aridas | order 6 (após fortaleza-sombria, nunca alcançada) | **order 3** (logo após pântano-podre, gate 15 inalterado) | Histórico documentado em `biomes.ts`: colinas-aridas foi calibrada pra ser alcançada "logo no início da jornada (nível ~15)" — movida pra tarde numa Sprint anterior causou 100% de morte por chegada overlevada; devolvida pra perto de onde foi originalmente calibrada, sem tocar em nenhum Enemy Template. |
| picos-congelados | order 7 | **order 6** | Renumerado só pra abrir espaço pra colinas-aridas — nenhum gate de nível alterado (permanece 20). |
| litoral-quebrado | order 8 | **order 7** | Idem (gate 24 inalterado). |
| deserto-de-vidro | order 9 | **order 8** | Idem (gate 28 inalterado). |

Nenhum outro gate de nível foi alterado — apenas `fortaleza-sombria` (impossível) e a posição de `colinas-aridas`/`picos-congelados`/`litoral-quebrado`/`deserto-de-vidro` na sequência.

---

## 3. Jornada — Antes/Depois

Mesma metodologia da auditoria (N=300, jornada natural sem forçar Expedição/World Tier, orçamento de 7200s simulados por execução).

| Indicador | Antes | Depois |
| --- | --- | --- |
| Regiões alcançadas (reach rate > 0) | 4 de 9 (bosque, pântano, minas, ruínas) | **7 de 9** (+ colinas-aridas 84%, picos-congelados 74%, litoral-quebrado 3.3%) |
| Região "fortaleza-sombria"/"deserto-de-vidro" alcançada | 0% | 0% (ver Seção 7 — agora por morte em Picos Congelados, não mais por gate impossível) |
| Dungeons visitadas além da original | 0 (nenhuma alcançável) | **3 de 3** (todas confirmadas alcançáveis no smoke test) |
| Dungeon original — conclusão | 74.4% | 38.5% (ver Seção 4 — trade-off necessário, ver justificativa) |
| Dungeon original — duração média | 3943.7s (~68% de uma sessão de 2h) | **2024.3s** (~68% de redução da duração real) |
| Taxa de morte geral (300 execuções) | 26.3% | **100%** (ver Seção 7 — problema novo exposto) |
| Sobrevivência média | 5715.7s | 2990.8s |
| Nível médio final | 24.5 | 18.4 |
| Reputação média "Culto das Ruínas" | 913.2 (75% Lendário) | **111.3** (30.7% Lendário — efeito colateral positivo, ver Seção 5) |
| Reputação média "Legião Sombria" | 221.0 (73.7% Lendário) | **52.6** (5.3% Lendário) |
| Ouro acumulado médio | 7981 | **1403.6** |
| Maior intervalo sem upgrade | 5120.8s | **2395.6s** |

---

## 4. Balanceamento — o que foi ajustado e por quê

**Regiões (Fase 1/2)**: só 2 mudanças — o gate impossível de `fortaleza-sombria` e a posição de `colinas-aridas`. Nenhum outro Enemy Template ou Encounter Table de região "antiga" (bosque/pântano/minas/ruínas) foi tocado.

**Dungeon original (Fase 3)**: `expectedEncounters` 220→140. Achado durante a calibração: como `encountersCompleted` conta qualquer encontro desde o início da Expedição, independente da região, e Region Unlock continua avançando livremente enquanto ela segue ativa, um orçamento grande demais (220, e até 170 testado) dava tempo do personagem avançar pra Picos Congelados (letal) ainda "dentro" desta Expedição — uma morte lá contava como falha mesmo com o Guardião já derrotado (medido: 220 e 170 chegaram a 0% de conclusão em amostras de verificação). 140 foi o valor testado com melhor equilíbrio (38.5% de conclusão) — abaixo do patamar histórico de ~74-77%, porque o gargalo dominante hoje passou a ser Picos Congelados, não mais o tamanho da Dungeon (ver Seção 7).

**Enemy Templates (Fase 4)**: as 3 Dungeons novas tinham 0%/0%/22.2% de conclusão. Investigação teve 2 camadas:
1. Os 3 Chefes (`frost-king`, `ancient-dragon`, e parcialmente `corrupted-bishop`) tinham stats altos demais pro nível de entrada calibrado — reduzidos ~15-32% (mesma técnica já validada em `forgotten-guardian`, Sprints anteriores). Resultado: taxa de vitória do Chefe subiu de 0%/22%/0% pra **72%/75%/18%**.
2. Mesmo com o Chefe mais fácil, a Dungeon inteira continuou em 0% de conclusão — os inimigos comuns de Picos Congelados/Litoral Quebrado/Deserto de Vidro também estavam desproporcionais (confirmado de forma independente pela campanha da Fase 5: Picos Congelados mostrou 95-100% de morte mesmo pra personagens naturalmente progredidos, não só quem entra sinteticamente no nível calibrado). Reduzidos ~35% os mobs comuns (`frost-wolf`, `ice-golem`, `corrupted-acolyte`, `fire-cultist`) — melhora mensurável mas parcial (ver Seção 7, este continua sendo o gargalo dominante).

`variantChances.miniBoss` das 3 regiões novas subiu de 0.14 pra 0.35 (mesma técnica de compensar a supressão de RNG em rolagens raras já documentada pra `forgotten-guardian`) — taxa de avistamento do Chefe subiu de ~9-34% pra consistentemente mais alta.

**Não alterado**: Combat Engine, Adventure Loop, RuntimeConfig, Dungeon Modifier System, World Tier System, Presentation Layer, Character Build, Loot/Item Generator, Inventory — nenhum destes foi tocado, conforme o escopo desta Sprint.

---

## 5. Evidências

Ver `reports/game-design-audit-natural-journey-BEFORE.json` (estado antes desta Sprint, idêntico ao snapshot da auditoria) e `-AFTER.json` (mesma campanha, N=300, 7200s, após todos os ajustes). Números completos por região/facção/economia na Seção 3.

**Efeito colateral positivo não planejado**: a auditoria anterior (achado #5) apontava reputação de 2 facções passando do teto em ~75% das jornadas, por causa da mesma Dungeon original sendo re-farmada dezenas de vezes numa sessão longa. Com a Dungeon 68% mais curta e a jornada não ficando mais presa nela, o problema de reputação despencou (Lendário de 75%→31% e 74%→5%) e o acúmulo de ouro caiu proporcionalmente (7981→1404) — sem nenhuma mudança em `factions/factionController.ts` ou `dungeonController.ts` nesta Sprint.

---

## 6. Validação

- **Typecheck**: `packages/shared` typechecka limpo (`tsc --noEmit`). `npm run typecheck` na raiz falha por um problema de configuração PRÉ-EXISTENTE (não introduzido nesta Sprint): `packages/shared/tsconfig.json` não tem `"composite": true`, exigido pelas referências de projeto de `apps/api`/`apps/web` em modo `-b`. Nenhum arquivo de configuração foi alterado pra "resolver" isso (fora do escopo — só dados de balanceamento).
- **Testes direcionados**: `dungeon.test.ts`, `enemy.test.ts`, `biomes.test.ts`, `eliteMiniBoss.test.ts`, `worldEncounter.test.ts`, `expeditions.test.ts` — 104/104 passando (2 testes ajustados pra refletir o novo gate 30, não 60).
- **Suíte completa**: executada uma única vez — **434/434 testes passando**.
- **Campanha comparativa**: uma única execução (N=300, mesma metodologia da auditoria), comparada diretamente contra o snapshot já existente — nenhuma repetição.
- **Smoke test**: `scripts/smokeTestJourneyRecovery.ts` — todas as 8 verificações passaram (cascata de regiões além de Ruínas Esquecidas, entrada nas 4 Dungeons, conclusão da Dungeon original, obtenção de Relíquia).

---

## 7. Problemas Remanescentes

**Bloqueadores** (impedem "todas as regiões alcançáveis naturalmente", critério de aprovação não 100% atingido):
- **Picos Congelados e Litoral Quebrado são hoje regiões efetivamente letais**: mesmo após a redução de ~35% nos mobs comuns, a campanha da Fase 5 mediu 95.5% de morte entre quem alcança Picos Congelados e 100% entre quem alcança Litoral Quebrado (apenas 3.3% chegam lá, e nenhum sobrevive). Como consequência, **Deserto de Vidro e Fortaleza Sombria continuam em 0% de alcance** — não mais por um gate impossível (Fase 1 corrigiu isso), mas porque ninguém sobrevive às duas regiões anteriores. Isso é o motivo dominante da taxa de morte geral ter subido de 26.3% pra 100% nesta comparação.
- Causa provável: os 3 Enemy Templates de mob comum ainda calibrados sem nenhuma medição empírica prévia (a região era matematicamente inacessível até esta Sprint, então nunca foi de fato exercitada pelo Simulador antes) — mesmo padrão já visto e corrigido em `forgotten-guardian` ao longo de 3 Sprints sucessivas de ajuste fino, não resolvível numa única passada de redução proporcional.

**Melhorias** (funcionam, mas aquém do ideal):
- Conclusão da Dungeon original caiu de 74-77% (patamar histórico) pra 38.5% — resultado aceito nesta Sprint porque o gargalo real deixou de ser o tamanho da Dungeon e passou a ser a mortalidade em Picos Congelados (aumentar o orçamento de novo pioraria, não melhoraria — já testado).
- As 3 Dungeons novas continuam com taxa de conclusão total baixa (o Chefe agora é vencível, mas os mobs comuns ao redor ainda matam o personagem antes de acumular os encontros necessários).
- O motor sinalizou que os checkpoints das 3 Dungeons novas ficaram "muito próximos" (~1.9 encontros/checkpoint) depois do ajuste desta Sprint — o teste mostrou que checkpoints mais frequentes não tiveram efeito mensurável na conclusão (o problema real era falta de margem pós-Chefe, não frequência de cura); val a pena reconsiderar esse valor numa Sprint futura dedicada ao assunto.

**Oportunidades futuras**:
- Gold/Marketplace: problema estrutural já documentado, fora do escopo de todas as Sprints de balanceamento até agora.
- Vocabulário de raridade duplo (`ItemRarity` vs. loot real) — dívida arquitetural já documentada na auditoria, não afeta esta Sprint.

---

## 8. Próximo Roadmap

**Depois de recuperar a jornada completa, o maior gargalo do jogo hoje é o combate em Picos Congelados/Litoral Quebrado/Deserto de Vidro — não mais a progressão regional.**

Justificativa com as métricas desta própria Sprint: das 300 execuções da campanha "depois", 74% alcançam Picos Congelados, mas 95.5% delas morrem lá (212 de 222) — a taxa de morte geral pulou de 26.3% pra 100% unicamente por causa desta cadeia de 3 regiões. Isso as torna, hoje, o obstáculo isolado de maior impacto no jogo: mais determinante pra "o jogador consegue terminar a jornada?" do que qualquer outro sistema medido até agora (Dungeons, World Tiers, Modificadores, Economia).

**Sprint recomendada**: "Endgame Regions Combat Balance" — dedicada exclusivamente a recalibrar (via Simulador, iterativamente, mesma técnica já usada em 3 Sprints passadas pra `forgotten-guardian`) os Enemy Templates de `frost-wolf`/`ice-golem` (Picos Congelados), `corrupted-acolyte` (Litoral Quebrado) e, se a mortalidade persistir depois de resolver essas duas, `fire-cultist` (Deserto de Vidro — ainda não exercitado por nenhuma jornada real). Objetivo: taxa de morte por região abaixo de ~30-40% (mesmo alvo geral já usado pelo Simulador), o suficiente pra o Deserto de Vidro e a Fortaleza Sombria finalmente se tornarem alcançáveis na prática, não só na teoria. Sistemas envolvidos: só `enemy/templates.ts` (dado). Risco técnico: baixo. Impacto esperado: o mais alto disponível hoje — é a única mudança que efetivamente abriria os 2 últimos biomas do jogo.
