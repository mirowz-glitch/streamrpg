# Affix Selection Redesign — Prototype (Phase I)

Sprint experimental: um protótipo de algoritmo de seleção de tier foi implementado atrás de uma interface (`AffixSelectionStrategy`), comparado ao algoritmo atual usando a MESMA metodologia (Monte Carlo por região + campanha completa N=300) das 3 Sprints anteriores (Equipment Progression Audit/Repair, Item Generation Design Review, Item Generation Redesign Validation). Nenhum afixo, tier, threshold, peso, fórmula de Power Score, Combat Engine, Loot Table ou Simulator foi alterado.

**Pergunta central**: *um algoritmo alternativo de seleção produz uma curva de progressão significativamente melhor sem alterar o restante da arquitetura?* Resposta, com os dados desta Sprint: **não — o efeito é real, mas pequeno e inconsistente, e não atinge os critérios de aprovação desta própria Sprint (Dead Loot não caiu). Decisão: C — nenhum dos dois algoritmos é satisfatório para o objetivo de sustentar progressão em campanhas completas.**

---

## 1. Arquivos Modificados

| Arquivo | O que mudou |
| --- | --- |
| `src/itemgen/selectionStrategy.ts` (novo, 182 linhas) | `AffixSelectionStrategy`, `CurrentAffixSelectionStrategy` (baseline, extraído sem mudança de comportamento), `ProgressiveAffixSelectionStrategy` (protótipo), seam de troca (`getDefaultAffixSelectionStrategy`/`setDefaultAffixSelectionStrategy`/`resetDefaultAffixSelectionStrategy`) |
| `src/itemgen/generator.ts` | `rollDistinctMods`/lógica de tier pick antes inline agora delegam à estratégia ativa; `GenerateItemOptions.strategy` (override por chamada); nenhuma outra função tocada |
| `src/itemgen/index.ts` | 1 linha — exporta `selectionStrategy.ts` |
| `scripts/affixSelectionPrototypeComparison.ts` (novo, 373 linhas) | Script de comparação, reaproveita a mesma metodologia/harness dos scripts anteriores |
| `reports/affix-selection-prototype-comparison.json` (novo, gerado) | Dados brutos completos |

Nenhum arquivo de `prefixes.ts`/`suffixes.ts`/`rarities.ts`/`powerScore.ts`/`weights.ts`/`baseItems.ts`, Combat Engine, Loot Generator, Simulator, RuntimeConfig ou Persistência foi tocado.

---

## 2. Arquitetura — Isolamento do Protótipo

`generator.ts` nunca importa `CurrentAffixSelectionStrategy` nem `ProgressiveAffixSelectionStrategy` por nome — ele só chama `strategy.pickMods(...)`/`strategy.pickTier(...)` sobre o que `options.strategy ?? getDefaultAffixSelectionStrategy()` resolver. Dois seams de troca, para dois cenários diferentes:

1. **Override por chamada** (`GenerateItemOptions.strategy`) — usado pelo Monte Carlo isolado desta Sprint; não depende de nenhum estado global.
2. **Default global trocável** (`setDefaultAffixSelectionStrategy`/`resetDefaultAffixSelectionStrategy`) — necessário porque o Loot Generator/Adventure Loop/Dungeon Controller chamam `generateItem()` várias camadas abaixo, sem repassar `options.strategy` (nenhum desses arquivos foi tocado). O script de comparação troca o default antes de cada campanha e restaura logo depois — MESMO padrão "mutar → medir → restaurar" já validado na Sprint "Item Generation Redesign Validation", só que trocando a estratégia em vez dos dados.

Nenhum caller de produção (`lootgen/generator.ts`, `dungeonController.ts`, `adventureLoop.ts`) foi modificado — todos continuam chamando `generateItem(baseItemId, itemLevel, seed)` sem o campo `strategy`, e por isso sempre usam o default (`CurrentAffixSelectionStrategy`, a menos que um script de teste o tenha trocado e restaurado). **Verificado**: suíte completa (434/434) passa sem nenhuma mudança, incluindo os testes de determinismo de `generateItem()` (mesma seed → mesmo item) — confirma que a extração não alterou a ordem/contagem de chamadas de `rng()` no caminho padrão.

---

## 3. Algoritmo Atual (Baseline, Fase 1)

```
Base Item → Item Level → Rarity Roll → prefixCount/suffixCount (por raridade)
  → pickMods (peso efetivo: base × Base Item × raridade × afinidade de tag)
    → para cada mod escolhido: filtrar tiers elegíveis (minItemLevel <= itemLevel)
      → pickTier = pickWeighted(rng, eligibleTiers) — peso ESTÁTICO do tier (4/16/30/50), nunca considera QUÃO acima do próprio limiar o Item Level já está
        → Value Roll = randomInt(tier.min, tier.max)
```

`CurrentAffixSelectionStrategy.pickTier` é literalmente esta linha (`pickWeighted(rng, eligibleTiers)`) — zero reescrita, só extração.

---

## 4. Protótipo (Fase 3)

**Diferença**: só o `pickTier`. Em vez do peso estático do tier, calcula `progresso = clamp((itemLevel - tier.minItemLevel) / spanEntreLimiaresElegíveis, 0, 1)` e pondera `tier.weight × (1 + progresso)`. Um tier recém-desbloqueado (progresso ≈ 0) se comporta como hoje; um tier em que o Item Level já avançou bem além do próprio limiar ganha até o dobro do peso.

**Justificativa**: a Sprint "Item Generation Redesign Validation" (Seção 5) já tinha isolado a causa exata de por que reescalar thresholds sozinho não funciona: "tornar um tier elegível não o torna provável" — o sorteio dentro dos elegíveis continua com pesos estáticos, então o tier pior (peso 50) sempre domina. Este protótipo ataca exatamente essa lacuna, usando **apenas os dados já existentes** (`tier.weight`, `tier.minItemLevel`, `itemLevel`) — nenhum afixo, tier, threshold ou peso novo foi criado, só a fórmula de combinação entre eles.

**Mods/tiers/thresholds/pesos usados como entrada**: idênticos aos do jogo atual (`ITEM_GEN_PREFIXES`/`ITEM_GEN_SUFFIXES`, intocados).

---

## 5. Comparação Estatística (N=300 campanhas + Monte Carlo N=8.000/região, mesma metodologia das Sprints anteriores)

### Dead Loot / Upgrades

| Métrica | Atual | Protótipo | Delta |
| --- | --- | --- | --- |
| Dead Loot Rate | 95,26% | 95,38% | +0,12pp (pior, dentro do ruído) |
| Total de upgrades (300 campanhas) | 1.452 | 1.456 | +0,3% |
| Upgrades/campanha (média) | 4,84 | 4,85 | Cohen's d = 0,007 (desprezível) |
| Nível final médio | 19,97 | 20,56 | +3,0% |

### Progressão por Slot (total em 300 campanhas)

| Slot | Atual | Protótipo |
| --- | --- | --- |
| Arma | 605 | 628 |
| Elmo | 30 | 34 |
| Peitoral | 146 | 147 |
| Luvas | 48 | 44 |
| Botas | 247 | 241 |
| Anel 1 | 164 | 159 |
| Anel 2 | 30 | 27 |
| Amuleto | 20 | 20 |
| Cinto | 162 | 156 |

Sem padrão consistente de melhora — alguns slots sobem, outros caem, magnitude sempre pequena (ruído de simulação, não sinal).

### Power Score, níveis 18-30 (personagem, campanha completa)

| Nível | Atual | Protótipo | Delta |
| --- | --- | --- | --- |
| 20 | 803,8 | 804,0 | +0,03% |
| 25 | 929,4 | 932,2 | +0,30% |
| 28 | 1.001,3 | 1.007,2 | +0,59% |
| 30 | 1.059,4 (n=19) | 1.069,0 (n=21) | +0,90% |

Cohen's d: nível 20 = 0,009 (desprezível); nível 30 = 0,347 (pequeno-médio, mas amostra muito pequena — 19-21 personagens chegam lá em 300 campanhas). **A FORMA da curva não muda** — cresce na mesma taxa, só ligeiramente deslocada nos níveis mais altos.

### Probabilidade de Upgrade por Região (Monte Carlo isolado, N=8.000)

| Região | Atual (Arma) | Protótipo (Arma) |
| --- | --- | --- |
| Bosque Sussurrante | 100,00% | 100,00% |
| Pântano Podre | 0,01% | 0,00% |
| Colinas/Minas/Ruínas | 0,47% | 0,25% |
| Picos Congelados | 0,03% | 0,15% |
| Litoral Quebrado | 0,00% | 0,00% |
| Deserto de Vidro | 0,00% | 0,01% |
| Fortaleza Sombria | 0,04% | 0,03% |

**O colapso para ~0% a partir da 2ª região permanece idêntico** — o protótipo não resolve (nem atenua de forma perceptível) o efeito "running maximum" já documentado nas 3 Sprints anteriores.

Vida/Armadura/DPS: variação < 1% em todos os níveis testados (não tabelado — mesma ordem de grandeza do Power Score, sem padrão de regressão).

---

## 6. Complexidade

| | Atual (`CurrentAffixSelectionStrategy.pickTier`) | Protótipo (`ProgressiveAffixSelectionStrategy.pickTier` + `computeProgressWeight`) |
| --- | --- | --- |
| Linhas | 1 | ~15 |
| Complexidade ciclomática | 1 | ~4 (1 branch de atalho + `Math.min`/`Math.max` de clamp + ternário de span=0) |
| Legibilidade | Trivial | Exige entender "progresso normalizado pelo span de limiares elegíveis" — não é óbvio à primeira leitura |
| Manutenção | Nenhuma superfície nova | Uma fórmula nova para calibrar/entender se o comportamento parecer errado |
| Extensibilidade | N/A (é o baseline) | A interface `AffixSelectionStrategy` em si é o ganho real de extensibilidade — permite testar uma 3ª/4ª estratégia (ex.: Best-of-N, ou a combinação threshold+peso já cogitada na Sprint anterior) sem tocar `generator.ts` de novo |

O ganho de complexidade do protótipo em si é pequeno (15 linhas, 1 arquivo). O ganho arquitetural real desta Sprint é a **interface** — ela sobrevive independente do resultado deste protótipo específico.

---

## 7. Regressões

**Nenhuma regressão significativa encontrada.**

- Early game (nível 1, onde normalmente só 1 tier está elegível): delta de +0,20% — desprezível, esperado (quando só 1 tier é elegível, o protótipo devolve ele diretamente, sem pesar nada — mesmo caminho do algoritmo atual).
- Power Score máximo observado: 1.093 (atual) vs 1.098 (protótipo) — sem crescimento explosivo.
- Taxa de sobrevivência (campanha completa de 7.200s simulados): 0% em ambos — idêntico, sem regressão (a maioria dos personagens morre antes de completar a janela simulada em ambos os casos, consistente com toda a documentação anterior de mortalidade em Picos Congelados+).
- Nenhuma trivialização, nenhuma perda de identidade de tier, nenhuma distribuição artificialmente inflada — os deltas observados (0,03%–3%) são pequenos demais para qualquer um desses efeitos.
- Suíte completa (434/434) e todos os testes de determinismo de `generateItem()` passam sem alteração no caminho padrão (estratégia atual).

---

## 8. Recomendação

**C — Nenhum dos dois algoritmos é satisfatório.**

Não é A puro ("o atual deve permanecer" sem ressalva) porque o algoritmo atual já tem um defeito estrutural PROVADO por 2 Sprints anteriores (Item Generation Design Review: probabilidade de upgrade cai a 0% exato em 2 das 7 regiões; 44% dos tiers do jogo são matematicamente inacessíveis dentro de `MAX_LEVEL=30`) — "permanecer" não deveria ser lido como "está bom o suficiente".

Não é B porque o protótipo, apesar de tecnicamente correto e bem isolado, **não atinge os Critérios de Aprovação desta própria Sprint**: Dead Loot não caiu (ficou estatisticamente igual, levemente pior dentro do ruído), a probabilidade de upgrade por região Monte Carlo continua colapsando para ~0% a partir da 2ª região exatamente como no algoritmo atual, e o único sinal real (Power Score no nível 30) vem de uma amostra pequena (~20 personagens) e representa menos de 1% de diferença.

**Por que o protótipo não resolveu, com dados**: esta Sprint ataca exatamente o "estágio 2" identificado como root cause na Sprint anterior (peso estático de tier dentro dos já elegíveis) — e mesmo assim o Monte Carlo isolado por região mostra que o colapso de probabilidade de upgrade é praticamente idêntico. Isso **triangula, por um terceiro método independente**, a mesma conclusão da Sprint "Item Generation Design Review": o gargalo real não está em COMO os tiers são escolhidos (nem em threshold sozinho, nem em peso sozinho, nem agora em um algoritmo de seleção diferente) — está em `MAX_LEVEL=30` produzir um intervalo de Item Level fundamentalmente estreito demais em relação à escala de 60-65 pra qual os afixos foram desenhados. Nenhuma estratégia de seleção, por mais sofisticada, pode diferenciar tiers de forma significativa quando o próprio intervalo onde eles competem já é apertado.

**Ação recomendada**: não substituir o algoritmo atual por este protótipo. A interface `AffixSelectionStrategy` (o artefato reversível e reutilizável desta Sprint) permanece disponível para uma Sprint futura testar uma abordagem estrutural diferente (ex.: a Alternativa C já cogitada — desacoplar Item Level do nível do personagem por região) sem precisar repetir o trabalho de isolamento arquitetural feito aqui.

---

## 9. Commercial Impact

**Esta Sprint, isoladamente, não melhora a sensação de progressão em campanhas completas** — os números de Dead Loot/upgrade/Power Score são estatisticamente quase idênticos ao estado atual (efeitos de 0,03%-3%, na maioria dos casos menores que o ruído de simulação). Um jogador não perceberia diferença prática. Isso significa que o ganho de retenção/satisfação/percepção de recompensa que uma correção completa do Item Generator poderia trazer **continua indisponível** depois desta Sprint — mas o valor real entregue é diferente do valor de produto: esta Sprint eliminou uma hipótese de correção (mudar SÓ o algoritmo de seleção, mantendo os mesmos dados) com evidência forte e reversível, sem nenhum risco de regressão em produção (o protótipo nunca é usado por nenhum caller real). Isso evita gastar uma Sprint de implementação real numa mudança que os dados já mostram ser insuficiente — e concentra a prioridade de negócio na Alternativa estrutural (Item Level desacoplado do nível do personagem, ou elevar `MAX_LEVEL`), a única categoria de correção que as 3 Sprints de investigação (Design Review, Redesign Validation, esta) ainda não descartaram.

---

## Validação

- **Typecheck**: `packages/shared` limpo (`npx tsc --noEmit -p tsconfig.json`).
- **Testes direcionados**: nenhum teste de `src/` precisou mudar; os testes de determinismo de `itemgen/generator.test.ts` (mesma seed → mesmo item) continuam passando sem alteração, confirmando que a extração da estratégia não mudou o caminho padrão.
- **Suíte completa**: executada uma única vez após o refactor de `generator.ts`/`selectionStrategy.ts` — **434/434 passando**, nenhuma regressão.
- **Auditorias comparativas**: `scripts/affixSelectionPrototypeComparison.ts`, execução única (~10s), determinística, reproduzível.
- Dados brutos completos em `reports/affix-selection-prototype-comparison.json`.
