# Combat Model Runtime Review

**Status: ✅ Fórmula canônica em runtime.** O dano fixo da Sprint B3
(`DAMAGE_PER_CHARACTER_PER_TICK = 50`) deixou de existir. Nenhum schema,
Gameplay Design, Combat Model ou World Design foi alterado.

---

## 1. Auditoria — onde o dano era calculado

Um único ponto, confirmado antes de qualquer edição:

- `BossCombatSystem.ts:57` — `const DAMAGE_PER_CHARACTER_PER_TICK = 50;`
- `BossCombatSystem.ts:153` — `const damage = presentCount * DAMAGE_PER_CHARACTER_PER_TICK;`, dentro
  de `advance()`.

Nenhum outro arquivo do projeto calculava dano de Boss — `BossRewardSystem`
usa dano só indiretamente (via `ticksPresent`, não via um valor de dano
por golpe).

---

## 2. Fórmula implementada

```
Dano_bruto(tipo)        = Base(level) × Equipamento_ATQ(tipo) × Classe_mult(tipo) × Critical
Resistência_efetiva(tipo) = max(0, Resistência(tipo)_alvo − Penetração_atacante(tipo))
Dano_final(tipo)        = max(1, Dano_bruto(tipo) × (1 − Resistência_efetiva(tipo)/100) − Bloqueio_aplicável)
```

Extraída como função pura e exportada (`calculateCanonicalDamage()`),
consumindo `level`, `attackPhysical`, `attackMagic` (de
`characterRepo.getCombatAttributes()`) e `isCritical` (rolado via
`RandomProvider` já existente, injetado no construtor). Termos sem fonte
de dado ainda — tratados como neutros, nunca como exceção ou hack:

| Termo | Fonte | Valor usado | Motivo |
|---|---|---|---|
| `Classe_mult` | nenhuma (Classes ainda Placeholder) | `1` | mesma convenção já documentada desde a Sprint B4/Boss Integration |
| `Penetração` | nenhuma | `0` | nunca teve infraestrutura própria construída |
| `Bloqueio` | nenhuma (sem slot de Escudo) | `0` | Combat Model já registrou isso como dependência em aberto |
| `Resistência(tipo)_alvo` | Boss não tem essa coluna | `0` | exposto como parâmetro da função, não hardcoded, para o harness poder provar a mitigação com um valor hipotético |

`SUS`/`UTI` são carregados e calculados por fórmula própria
(`calculateSusRegen()`, e o valor bruto de UTI) — nenhum dos dois entra
na multiplicação de dano, porque nenhum documento do Combat Model jamais
definiu isso. Boss não ataca personagens nem tem mecânica de
controle/detecção — os dois valores chegam e são calculados
corretamente, sem ter, hoje, nada para fazer com o resultado.

---

## 3. Tipos de ataque — sem mistura implícita

Tipo decidido inteiramente pelo equipamento do atacante: se
`attackMagic > attackPhysical`, o ataque é mágico e usa
`Resistência(mágico)_alvo`; caso contrário, físico e usa
`Resistência(físico)_alvo`. Provado pelo Cenário 5b do harness: um ataque
físico contra um alvo com 90% de resistência **mágica** não sofre nenhuma
redução (`dano=90`, idêntico ao caso sem resistência nenhuma) —
confirma que os dois tipos nunca se misturam.

---

## 4. Compatibilidade (Etapa 4)

- Personagem sem arma (`attackPhysical=0, attackMagic=0`): `Dano_bruto=0`,
  `Dano_final = max(1, 0) = 1` — nunca zero, nunca exceção (Cenário 1).
- `characterRepo.getCombatAttributes()` retornando `null` (personagem não
  encontrado): `continue` no loop, sem interromper os demais personagens
  presentes.
- Erro em qualquer personagem individual: `try/catch` por personagem,
  isolado do restante do tick (mesmo padrão defensivo já usado em todo o
  resto da Engine).

---

## 5. Harness — 8 cenários

Todos os cenários usam `calculateCanonicalDamage()`/`calculateSusRegen()`
diretamente (funções puras) para precisão determinística, mais uma
execução real via `EventBus`/`server.ts`-equivalente para o cenário de
UTI:

| Cenário | Entrada | Resultado | Esperado |
|---|---|---|---|
| 1. Sem equipamento | ATQ físico=0, mágico=0 | `dano=1` | piso mínimo, sem exceção |
| 2. Arma física | level 5, ATQ físico 18 | `dano=90` | `5×18×1×1=90` |
| 3. Arma mágica | level 5, ATQ mágico 18 | `dano=90, tipo=magico` | mesma matemática, tipo correto |
| 4. Resistência física 50% no alvo | mesmo do Cenário 2 | `dano=45` | metade de 90 |
| 5. Resistência mágica 50% no alvo | mesmo do Cenário 3 | `dano=45` | metade de 90 |
| 5b. Ataque físico × resistência mágica alta | físico 18, resistência mágica 90 no alvo | `dano=90` | resistência do tipo errado não se aplica |
| 6. Crítico | mesmo do Cenário 2, `isCritical=true` | `dano=180` | 2× o normal |
| 7. SUS=0 | `calculateSusRegen(0)` | `0`, sem exceção | confirmado |
| 8. UTI≠0 (integração real via EventBus) | personagem com amuleto `uti_bonus=2` | `utiBonus=2` carregado e logado | confirmado, sem interferir no dano |

Todos os 8 passaram na execução real do harness.

---

## 6. Antes × Depois

Mesmo personagem (level 5, cajado mágico equipado — `ATQ mágico = 5`,
raridade comum), mesmo Boss (tier 1, 500 HP), 1 tick, 1 presente:

```
--- ANTES (fórmula fixa, Sprint B3) ---
Dano antigo aplicado ao Boss: 50 (fixo, independente de level/equipamento)

--- DEPOIS (fórmula canônica, esta Sprint) ---
Dano novo aplicado ao Boss: 25 (5 × 5 × 1 × 1 — level e ATQ mágico reais)
```

**Diferença:** o dano deixou de ser uma constante igual para qualquer
personagem e passou a refletir o `level` e o equipamento real de quem
está presente. Um personagem de nível mais alto ou com item mais raro
agora causa mais dano; antes, um personagem recém-criado sem nenhum
equipamento causava exatamente o mesmo dano que um personagem
endgame — essa é, precisamente, a lacuna que toda a sequência de Sprints
(Character Runtime Integration → Character Attributes Schema → esta)
existiu para fechar.

---

## 7. Performance

- **Nenhuma consulta SQL nova.** `characterRepo.getCombatAttributes()`
  faz exatamente as mesmas duas consultas (personagem + itens equipados
  via JOIN) que a Sprint Character Runtime Integration já fazia através
  de `findById()` + `getEquippedItems()` separadamente — consolidadas
  numa única chamada de método, mesmo custo de banco.
- **Nenhuma leitura duplicada.** O resultado de `getCombatAttributes()` é
  lido uma vez por personagem por tick e reaproveitado tanto para o log
  quanto para o cálculo de dano — antes desta Sprint, a mesma leitura já
  existia só para o log; agora ela também alimenta o dano, no mesmo lugar,
  sem chamada extra.
- **`repo.applyDamage()`** continua sendo chamado no máximo uma vez por
  Boss por tick (agora com o dano somado de todos os personagens
  presentes, em vez de `presentCount × constante`) — mesmo número de
  escritas.

---

## 8. Respostas diretas

**A fórmula canônica agora é utilizada em runtime?** Sim —
`calculateCanonicalDamage()`, chamada por `BossCombatSystem.advance()`
uma vez por personagem presente por tick, substituindo integralmente
`DAMAGE_PER_CHARACTER_PER_TICK`.

**Existe algum trecho utilizando a fórmula antiga?** Não. A constante
`DAMAGE_PER_CHARACTER_PER_TICK` foi removida do arquivo — não existe mais
em lugar nenhum do código real (só numa cópia isolada, temporária, criada
exclusivamente para o comparativo da seção 6 deste harness, nunca
commitada).

**O Boss agora utiliza exatamente o Combat Model definido na
documentação?** Sim, para os termos que têm fonte de dado real hoje
(`Base(level)`, `Equipamento_ATQ` físico/mágico, `Resistência` tipada,
`Critical`). Os termos sem fonte de dado (`Classe_mult`, `Penetração`,
`Bloqueio`, `Resistência` do próprio Boss) são tratados exatamente como o
Combat Model e as Sprints anteriores já previam para essa situação —
neutros, documentados, não como decisão nova desta Sprint.
