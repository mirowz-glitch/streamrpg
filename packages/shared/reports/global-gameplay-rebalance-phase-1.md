# Global Gameplay Rebalance (Phase I)

Recalibra Combate/Chefes/Dungeons pro novo ritmo de progressão do Continuous Affix Scaling (Sprint anterior). Marca o encerramento da evolução do Item Generator e o início da fase de balanceamento global/produção de conteúdo. Nenhuma mudança em Item Generator, Continuous Affix Scaling, AutoEquip, raridades, Loot Tables, Save System, Inventário ou estrutura de campanhas.

---

## 1. Gameplay Overview

Auditoria completa (N=500 campanhas, jornada natural, mesma metodologia de todas as Sprints anteriores, agora com instrumentação nova de tempo-por-região/Chefes/Dungeons/ritmo de combate) sob o Continuous Affix Scaling já em produção:

- **Nível médio final**: 27,05 (antes do balance pass) — o mais alto já medido nesta série de auditorias (era ~20 antes do Continuous Affix Scaling).
- **Sobrevivência aos 7.200s (2h)**: 0% — como em toda auditoria anterior, ninguém sobrevive ao orçamento completo (esperado, não é um problema novo).
- **Diagnóstico central**: a progressão de equipamento (Sprint anterior) deixou de ser o gargalo — o jogador agora chega genuinamente mais forte a cada região. Isso expôs um desbalanceamento real em Combate/Chefes/Dungeons, que nunca haviam sido recalibrados pra esse novo ritmo.

---

## 2. Region Balance

| Região | Alcance | Mortalidade (antes → depois do balance pass) | Nível de entrada | Power Score de entrada |
| --- | --- | --- | --- | --- |
| Bosque Sussurrante (Tutorial) | 100% | 1,8% → 1,8% | 1 | 302 |
| Pântano Podre (Floresta) | 98,2% | 1,6% → 1,6% | 5 | 516 |
| Colinas Áridas | 96,6% | 1,2% → 1,2% | 15 | 911 |
| Minas Abandonadas (Cavernas) | 95,4% | 0,4% → 0,4% | 15 | 912 |
| Ruínas Esquecidas | 95,0% | 0,2% → 0,4% | 15 | 913 |
| Picos Congelados | 94,8% → 94,6% | **19,6% → 32,6%** | 20 | 1.024 |
| Litoral Quebrado | 76,2% → 63,8% | 5,2% → 6,6% | 24 | 1.133 |
| Deserto de Vidro | 72,2% → 59,6% | 15,5% → 31,2% | 28 | 1.226 |
| Fortaleza Sombria (Endgame) | 61,0% → 41,0% | 100% → 100% (inalterado, intencional) | 30 | 1.286 |

**Resposta à Fase 2 (aumento consistente de dificuldade?)**: sim, na direção de nível/Power Score de entrada (cresce monotonicamente). Mortalidade cresce de forma mais irregular — Picos Congelados e Deserto de Vidro agora concentram o risco real (32,6%/31,2%, bem dentro do critério de ~50% do roadmap comercial), enquanto Litoral Quebrado permanece comparativamente fácil (6,6%). Fortaleza Sombria continua a única região com mortalidade de 100% — documentado em Sprints anteriores como "capstone" intencional, não alterado aqui.

**Achado não corrigido nesta Sprint (ver Seção 7)**: Colinas Áridas e Minas Abandonadas mostram tempo médio de permanência de apenas ~22s (≈1 tick) — muito abaixo de qualquer outra região — sugerindo que são efetivamente "regiões de passagem" sem engajamento real. Não investigado a fundo (risco de tocar em transição de região, adjacente a "estrutura das campanhas", protegida nesta Sprint).

---

## 3. Boss Report

| Chefe | Região | Taxa de vitória (antes) | Depois do 1º ajuste | Depois do 2º ajuste | Encontros (final) |
| --- | --- | --- | --- | --- | --- |
| forgotten-guardian | Ruínas Esquecidas | 100,0% | 100,0% | **99,9%** | 2.016 |
| frost-king | Picos Congelados | 98,7% | 95,2% | **95,5%** | 1.048 |
| corrupted-bishop | Litoral Quebrado | 99,3% | 100,0% | **100,0%** | 93 |
| ancient-dragon | Deserto de Vidro | 94,4% | 87,1% | **88,8%** | 196 |

**Resposta à Fase 4 (Chefes continuam representando picos de dificuldade?)**: antes desta Sprint, não — todos os 4 Chefes venciam 94-100% dos encontros. Após o ajuste, frost-king e ancient-dragon voltam a uma faixa defensável (88,8%/95,5%). forgotten-guardian e corrupted-bishop permanecem muito altos (99,9%/100%) mesmo após buff — tratado como **problema residual menor** (Seção 7), não perseguido com uma 3ª rodada de ajuste (princípio "evitar uma nova fase extensa de tuning"). corrupted-bishop tem amostra pequena (93 encontros) — o resultado pode não ser estatisticamente distinguível de ~97-99%.

---

## 4. Dungeon Report

| Dungeon | Chefe | Conclusão (antes) | Depois do 1º ajuste | Depois do 2º ajuste |
| --- | --- | --- | --- | --- |
| Queda da Fortaleza Sombria | forgotten-guardian | 92,8% | 89,5% | 89,3% |
| Fortaleza Congelada | frost-king | 48,4% | 40,4% | 41,5% |
| Catedral Esquecida | corrupted-bishop | **0,0%** (47 tentativas) | **57,5%** | 56,8% |
| Covil do Dragão | ancient-dragon | **0,0%** (124 tentativas) | 0,0% (1º ajuste insuficiente) | **19,4%** |

**Achado central (Fase 5)**: 2 das 4 Dungeons mediam 0% de conclusão **apesar do Chefe ser derrotado em 94-99% dos encontros** — a causa não era o Chefe, era o orçamento de encontros pós-Chefe (48/52, herdado de uma Sprint muito anterior) sendo maior que o tempo real que os personagens passam em Litoral Quebrado/Deserto de Vidro antes de morrer ou seguir de região. Corrigido reduzindo o orçamento (Seção 6). **Resposta à Fase 5 (continua compensando entrar em Dungeons?)**: agora sim para as 4 — nenhuma mais em 0%.

---

## 5. Power Curve

| Nível | Power Score | Vida Máxima | Armadura | DPS-proxy |
| --- | --- | --- | --- | --- |
| 1 | 320 | 162 | 70 | 121 |
| 10 | 802 | 471 | 95 | 651 |
| 20 | 1.031 | 630 | 122 | 873 |
| 25 | 1.182 | 717 | 136 | 1.187 |
| 30 | 1.335 | 801 | 149 | 1.471 |

Crescimento monotônico e suave em todas as 4 métricas, do nível 1 ao 30 — nenhum salto abrupto identificado (Fase 8). Armadura continua a métrica de crescimento mais lento relativo (2,1x do nível 1 ao 30) — mesmo padrão observado desde o Continuous Affix Scaling, não uma regressão desta Sprint (a maior parte da Armadura vem do build/nível base, não do equipamento, pela própria fórmula de `calculateFinalStats`).

---

## 6. Balance Changes

Todas as mudanças são valores numéricos — nenhuma arquitetura, nenhum novo sistema.

| # | Arquivo | Mudança | Justificativa |
| --- | --- | --- | --- |
| 1 | `enemy/templates.ts` — forgotten-guardian | baseStats/growth +10%, depois +25% adicional (~+37,5% total) | Taxa de vitória medida em 100% (2.020 encontros) — buff inicial de +10% não moveu a métrica |
| 2 | `enemy/templates.ts` — frost-king | baseStats/growth +18% | Taxa de vitória 98,7%/99,0% (Chefe/Mini-Boss) |
| 3 | `enemy/templates.ts` — corrupted-bishop | baseStats/growth +18% | Taxa de vitória 99,3%/99,5% |
| 4 | `enemy/templates.ts` — ancient-dragon | baseStats/growth +20% (o maior, preserva hierarquia "mais forte dos 3") | Taxa de vitória 94,4%/96,2% |
| 5 | `expeditions/expeditionDefinitions.ts` — catedral-esquecida | `expectedEncounters` 48→22, `checkpointCount` 24→11 | 0% de conclusão em 47 tentativas apesar de 99,3% de vitória contra o Chefe — orçamento incompatível com o tempo real em Litoral Quebrado (442s) |
| 6 | `expeditions/expeditionDefinitions.ts` — covil-do-dragao | `expectedEncounters` 52→18→10 (2 rodadas), `checkpointCount` 26→9→5 | 0% de conclusão em 124 tentativas apesar de 94,4% de vitória contra o Chefe; 1º ajuste (→18) ainda insuficiente, 2º ajuste (→10) produziu 19,4% de conclusão |

Cada mudança foi medida com uma nova execução completa da auditoria (N=500) antes de prosseguir — nenhuma alteração foi aplicada sem confirmação de efeito.

---

## 7. Remaining Issues

**Críticos**: nenhum. Todos os critérios de aprovação explícitos desta Sprint foram atendidos (todas as regiões avaliadas, todos os Chefes analisados, todas as Dungeons testadas — nenhuma mais em 0%, nenhuma região domina completamente a progressão).

**Médios**:
- forgotten-guardian (99,9%) e corrupted-bishop (100%, N pequeno) continuam com taxa de vitória muito alta mesmo após buff — candidato a uma 3ª rodada de ajuste leve numa Sprint futura dedicada, não perseguido aqui pra evitar uma fase extensa de tuning.
- Colinas Áridas/Minas Abandonadas com tempo de permanência de ~22s — possível "região de passagem" sem engajamento real. Não investigado (risco de tocar em lógica de transição de região).
- Dead Loot ainda ~94-95% a partir da 3ª região especificamente (achado da auditoria de Combat Pacing/Region Rewards desta Sprint) — o Continuous Affix Scaling resolveu o teto estrutural e melhorou o agregado da campanha inteira, mas o padrão região-a-região de "quase nenhum upgrade além das 2 primeiras regiões" persiste, agora por causa do efeito "running maximum" (documentado nas Sprints de Item Generator) — fora do escopo desta Sprint (não pode tocar Loot Tables/Item Generator).

**Futuros** (ver Roadmap, Seção 8): Economia/lojas (bloqueado por decisão arquitetural pendente de Gold), Crafting (avaliar só depois de Economia + confirmação por playtest), progressão de longo prazo, novas regiões/conteúdo de endgame, eventos dinâmicos, polimento visual.

---

## 8. Roadmap Update

`commercial/roadmap/project-valuation-roadmap.md` atualizado:
- **Seção 0.7** (nova): registra oficialmente o encerramento da evolução do Item Generator e o início da fase de balanceamento global/produção, resumindo os achados e correções desta Sprint.
- **Seção 8** (nova): plano macro pós-auditorias — ordem recomendada (Eventos Dinâmicos → Conteúdo de Endgame → Novas Regiões → Progressão de Longo Prazo → Economia → Crafting, com Playtest Externo em paralelo desde já), complexidade e dependências de cada item, incluindo o pré-requisito arquitetural já identificado (split de Gold emissão/ledger) antes de qualquer sistema de loja.

---

## Validação

- **Typecheck**: `packages/shared` limpo (`npx tsc --noEmit -p tsconfig.json`), confirmado após cada rodada de ajuste.
- **Testes direcionados**: `enemy`/`expeditions`/`dungeon`/`worldencounter` — 104 testes passando, nenhum ajuste de teste necessário.
- **Suíte completa**: executada uma vez ao final — **442/442 passando**.
- **Smoke test** (navegador real, personagem via `createCharacter`/`createSession`):
  1. Progressão natural confirmada (nível 1→23 numa única sessão de clique).
  2. Upgrades funcionando (Elmo/Peitoral/Botas/Cinto/Amuleto todos com itens reais).
  3. Chefes acessíveis E representando risco real: "Mini-Boss avistado: Rei Gélido" seguido de morte real do personagem ("Chefe Final avistado... Expedição falhou... Seu personagem morreu") — confirma que frost-king voltou a ser uma ameaça genuína, não mais um evento trivial.
  4. AutoEquip confirmado correto ("Elmo não foi equipado — o que você já tem no slot Elmo ainda é melhor", 3x; "Peitoral não foi equipado...", 1x).
  5. Persistência/save confirmados: `/app/character` mostrou Arma/Armadura(Peitoral)/Botas/Cinto/Amuleto corretos após a sessão.
  6. `git status` confirmado: só `enemy/templates.ts` e `expeditions/expeditionDefinitions.ts` modificados por esta Sprint (as mudanças de `itemgen/` vêm da Sprint anterior, ainda não commitadas) — nenhum arquivo de Item Generator/AutoEquip/Loot Tables/Save System tocado.
- Dados brutos completos em `reports/global-gameplay-rebalance-audit-BEFORE.json`/`-AFTER.json` (N=500, determinístico, reproduzível via `npx tsx scripts/runGlobalGameplayRebalanceAudit.ts`).
