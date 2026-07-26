# Equipment Decision Model — Design Review (Phase I)

Sprint exclusivamente investigativa. Nenhum arquivo de `src/` foi alterado — só um script novo (`scripts/equipmentDecisionModelReview.ts`) que chama `generateItem()` e `calculateCharacterStats()` (ambos intocados) repetidamente e compara 5 critérios de decisão, incluindo o atual (`tryAutoEquip()`, também intocado — lido, nunca importado pra execução real).

**Pergunta central**: *o algoritmo de decisão de equipamento está rejeitando upgrades legítimos?* Resposta, com os dados desta Sprint: **sim, mas numa taxa pequena e cirurgicamente localizada (0,85% dos pares testados) — não é a causa do Dead Loot de ~95% já documentado. Esse gargalo maior é do MECANISMO de comparação em si ("só troca se for estritamente melhor"), que aflige IGUALMENTE as 5 fórmulas testadas nesta Sprint, incluindo as 4 alternativas — trocar a fórmula não resolveria o problema principal.**

---

## 1. Fluxo Completo da Decisão (Fase 1)

```
Item Gerado (generateItem(), Item Generator — intocado)
        │
        ▼
tryAutoEquip(character, instanceId, item)  ── adventure/autoEquip.ts
        │
        ▼
candidateSlots = EQUIPMENT_SLOT_DEFINITIONS.filter(slot => slot.acceptsItemSlot === item.baseItem.slot)
        │
        ▼
Para cada slot candidato (ex.: Anéis testam ring1 E ring2, nesta ordem):
    currentlyEquipped = equipment.getEquippedItem(slotId)
    currentPowerScore = currentlyEquipped?.powerScore ?? 0
        │
        ▼
    item.powerScore > currentPowerScore ?
        │                           │
       SIM                         NÃO
        │                           │
        ▼                           ▼
    equipItem() — troca         próximo slot candidato
    (retorna true, para)        (ou descarta, se nenhum aceitar)
```

Nenhuma outra informação entra na decisão: **não** considera dano por segundo, sobrevivência, sinergia com outros itens já equipados, nem raridade diretamente (raridade só entra indiretamente, via `powerScore`).

---

## 2. Fórmula Atual (Fase 2)

`item.powerScore` (`itemgen/powerScore.ts`, calculado UMA vez na geração do item, nunca recalculado):

```
powerScore = (baseDamage médio OU baseDefense × 0,5) + Σ valor(cada mod rolado)
```

**O que entra**: o valor NUMÉRICO BRUTO de cada mod rolado — Physical/Spell/Fire/Cold/Lightning Damage, Vida (Healthy/Vigorous/Massive/of the Bear), Força (Heavy), Attack Speed, Accuracy, Critical Strike Chance, Life Leech — todos somados igualmente, sem nenhuma normalização por tipo.

**O que fica de fora**: qualquer noção de "quanto isso realmente vale em combate". A soma trata 1 ponto de Critical Strike Chance (rolagem T1: 8-10, um stat que multiplica dano criticamente) exatamente como 1 ponto de Vida (rolagem T1: 90-110) ou 1 ponto de Força (rolagem T1: 25-30, um stat que **não alimenta nenhum stat de combate real** — `equipment/stats.ts:STAT_LABEL_BUCKET` deliberadamente não mapeia "Strength" pra nenhum dos 10 stats de personagem, comentário explícito no próprio código). **Força contribui pro Power Score sem contribuir em NADA pra combate real** — o achado mais direto desta Sprint.

Faixas de valor por tipo de mod (T1, o melhor tier, extraídas de `prefixes.ts`/`suffixes.ts`):

| Stat | Faixa T1 | Contribui pra combate real? |
| --- | --- | --- |
| Vida | 90-110 | Sim (vida máxima) |
| Accuracy | 140-170 | Sim (mas fora do que `calculateFinalStats` expõe hoje como stat "importante") |
| Physical/Spell/Fire/Cold Damage | 60-100 | Sim (dano) |
| Lightning Damage | 5-120 | Sim (dano, faixa incomum, quase tão ampla quanto Vida) |
| Força | 25-30 | **Não — dead weight, puro ruído no Power Score** |
| Attack Speed | 15-18 | Sim, mas MULTIPLICATIVO no jogo real (`estimateDps = (attack+spell)×attackSpeed`) — o Power Score soma como se fosse aditivo, subestimando seu real impacto |
| Critical Strike Chance | 8-10 | Sim, mas cada ponto vale desproporcionalmente mais que 1 ponto de Vida — o Power Score não reflete isso |
| Life Leech | 5-6 | Sim, sustentação real — a MENOR faixa numérica de todo o jogo, sistematicamente subvalorizada pelo Power Score |

8 dos 9 slots de equipamento (tudo exceto Arma) só podem rolar Força ou Vida (nenhum outro mod tem `requiredTags: []` — todos os outros exigem `"weapon"`) — ou seja, pra Elmo/Peitoral/Luvas/Botas/Anéis/Amuleto/Cinto, o Power Score É, na prática, "Vida real + Força-que-não-serve-pra-nada", misturados sem distinção.

---

## 3. Falsos Negativos (Fase 3)

32.000 pares testados (4.000 por slot × 8 slots), Item Level 1-65 (mesma escala do Region-Anchored Item Level). Um "Falso Negativo" = o comparador atual REJEITA, mas pelo menos 1 das 4 alternativas (DPS-aware, Sobrevivência, Atributo Dominante, Ponderado) ACEITARIA.

**273 de 32.000 pares (0,85%)** são Falsos Negativos.

### Por atributo dominante na diferença

| Atributo | Casos | % dos Falsos Negativos |
| --- | --- | --- |
| Vida | 172 | 63% |
| Attack (dano físico) | 67 | 25% |
| Accuracy | 30 | 11% |
| Attack Speed | 2 | 1% |
| Critical | 2 | 1% |

### Por slot

| Slot | Falsos Negativos | % do total do slot (4.000 pares) |
| --- | --- | --- |
| **Arma** | **144** | **3,6%** |
| Elmo | 16 | 0,4% |
| Peitoral | 20 | 0,5% |
| Luvas | 16 | 0,4% |
| Botas | 20 | 0,5% |
| Anel | 20 | 0,5% |
| Amuleto | 16 | 0,4% |
| Cinto | 21 | 0,5% |

**Arma concentra 53% de todos os Falsos Negativos, numa taxa 7-9x maior que qualquer slot de armadura/acessório.** Casos de exemplo (ver `reports/equipment-decision-model-review.json`): uma arma com Power Score 126 (rica em Vida) vence uma com Power Score 28 (rica em Accuracy) na comparação atual — mas a segunda tem MUITO mais Accuracy real, que o Power Score simplesmente não pesa o suficiente.

---

## 4. Estatísticas (Fase 4/6/7)

### Taxa de aceitação por comparador e por slot (dos mesmos 32.000 pares)

| Slot | Atual (Power Score) | DPS-aware | Sobrevivência | Atributo Dominante | Ponderado |
| --- | --- | --- | --- | --- | --- |
| Arma | 29,3% | 20,4% | 15,2% | 27,8% | 27,9% |
| Elmo/Peitoral/Luvas/Botas/Anel/Amuleto/Cinto (média) | ~25,8% | 0%* | ~21,2% | ~21,2% | ~21,2% |

*DPS-aware não se aplica a slots sem stats ofensivos (nenhum item nesses slots rola dano/velocidade/crítico) — resultado esperado, não um defeito.

**Para os 7 slots de armadura/acessório, o comparador Atual aceita ~4,6pp MAIS do que os 3 comparadores baseados em stats reais** (que concordam entre si quase perfeitamente, ~21,2-21,4%) — o Power Score aceita itens que os stats reais não aceitariam, exatamente porque Força infla o score sem entregar defesa real. **Este é o padrão oposto ao de Arma**: em armadura, o Power Score é "generoso demais" (falso positivo); em Arma, é seletivo da forma errada (falso negativo).

### Running Maximum do próprio comparador (Fase 5)

Mesma sequência de Armas geradas por região, 5 comparadores, medindo taxa de aceitação contra o melhor já visto:

| Região | Atual | DPS-aware | Sobrevivência | Atributo Dominante | Ponderado |
| --- | --- | --- | --- | --- | --- |
| Bosque Sussurrante | 100% | 100% | 10,5% | 100% | 100% |
| Pântano Podre | 0% | 0% | 0% | 0% | 0% |
| Colinas Áridas | 0,50% | 0,40% | 1,10% | 0,93% | 1,03% |
| Picos Congelados | 0,07% | 0% | 0% | 0,20% | 0,13% |
| Fortaleza Sombria | 0% | 0% | 0,47% | 0% | 0,03% |

**Todas as 5 fórmulas colapsam pra <2% já na 3ª região e permanecem lá — o padrão é o MESMO, comparador-independente.** Isso responde diretamente a Fase 5: sim, o próprio critério de comparação cria um "running maximum" (matematicamente inevitável em qualquer regra "só substitui se estritamente melhor" — Rényi 1962, já citado nas Sprints anteriores) — mas esse running maximum **não depende de qual fórmula é usada**. Trocar Power Score por qualquer uma das 4 alternativas não mudaria essa dinâmica.

### Opportunity Cost (Fase 7)

- 227 dos 273 Falsos Negativos (83%) tinham "valor real" segundo o comparador Ponderado ou DPS-aware — ou seja, não são só diferenças marginais de arredondamento.
- Magnitude total de Power Score envolvida nesses casos: 3.859 pontos (soma das diferenças absolutas) — uma fração pequena frente ao Power Score total observado em campanhas completas (dezenas de milhares de pontos acumulados em 300 campanhas, Sprints anteriores).

---

## 5. Diagnóstico

**O algoritmo de Auto Equip está PARCIALMENTE correto.**

- Concorda com todas as 4 alternativas testadas em **99,15%** dos casos — não é um comparador aleatório ou gravemente quebrado.
- Tem um defeito REAL, mensurável e explicável: soma valores de mods heterogêneos sem normalização, fazendo Força (que não contribui pra NENHUM stat real) contar igual a Vida/Dano, e subvalorizando Critical/Attack Speed/Life Leech (faixas numéricas pequenas, mas alto impacto real). Isso causa falsos negativos concentrados em Arma (3,6% dos pares) e falsos positivos em armadura/acessório (~4,6pp de aceitação "a mais" que os comparadores baseados em stats reais).
- **Não é a causa do Dead Loot de ~95%** já documentado em 4 Sprints anteriores — esse número vem do mecanismo "só troca se estritamente melhor" em si, que aflige igualmente TODAS as 5 fórmulas testadas (Fase 5).

---

## 6. Recomendação

**B) Pequena alteração.**

Não A (manter sem mudança) — o defeito de Falsos Negativos em Arma (3,6% dos pares, 144 casos concentrados) é real, mensurável, e tem uma causa localizada e simples de descrever (Força como dead weight; Attack Speed/Critical/Life Leech subvalorizados por magnitude numérica pequena).

Não C (redesenho completo) — a Fase 5 já mostrou que TROCAR a fórmula inteira (por qualquer uma das 4 alternativas testadas, incluindo a mais sofisticada, Ponderada) não muda o padrão de running-maximum que domina o Dead Loot real em campanha. Um redesenho completo gastaria esforço arquitetural sem resolver o problema que mais importa.

**Menor intervenção proposta (não implementada nesta Sprint)**: ajustar `calculatePowerScore()` (`itemgen/powerScore.ts`) em 2 pontos cirúrgicos:
1. Excluir o valor de mods com `statLabel === "Strength"` da soma (mesma lista de exclusão que `equipment/stats.ts:STAT_LABEL_BUCKET` já usa pra decidir quais stats são "reais" — reaproveitar a mesma fonte de verdade, não inventar uma nova).
2. Aplicar um multiplicador pequeno e explícito aos `statLabel` de baixa magnitude/alto impacto (Critical Strike Chance, Life Leech, Attack Speed) antes de somar — não uma reformulação, só um fator de escala por tipo, na mesma linha de `calculatePowerScore()`.

Isso eliminaria a maior parte dos 273 Falsos Negativos sem tocar no mecanismo de comparação (`tryAutoEquip()` continua "só troca se estritamente maior"), sem qualquer risco pro Dead Loot geral (que precisaria de uma intervenção estrutural diferente, fora do escopo desta Sprint — ver Seção 7 do relatório "Loot Table Item Level Normalization").

---

## 7. Commercial Impact

O gargalo identificado aqui **reduz a sensação de recompensa numa medida pequena e específica, não na medida geral já documentada**. Um jogador não percebe diretamente "meu Power Score está errado" — percebe "encontrei uma arma que claramente tem mais precisão/velocidade, mas o jogo não trocou automaticamente", um momento de fricção pontual (3,6% das comparações de Arma), não a causa da sensação geral de "a progressão travou" (essa, como as 4 Sprints anteriores já estabeleceram e esta confirma de um 5º ângulo independente, vem do mecanismo de comparação estrita em si, não da fórmula). Corrigir o Power Score (Recomendação B) melhoraria a CONSISTÊNCIA percebida do Auto Equip — menos "por que ele não trocou isso, claramente melhor?" — mas não deve ser vendido como a correção do Dead Loot geral, que já tem outra causa raiz, comprovada 5 vezes por métodos independentes (thresholds, pesos, algoritmo de seleção, origem do Item Level, e agora o comparador em si).

---

## Validação

- **Scripts apenas**: `scripts/equipmentDecisionModelReview.ts`, execução única (~1,5s), determinística, reproduzível.
- **Nenhuma alteração em produção**: confirmado, nenhum arquivo de `src/` tocado.
- **Typecheck**: não necessário (nenhum arquivo de produção alterado).
- Dados brutos completos em `reports/equipment-decision-model-review.json`.
