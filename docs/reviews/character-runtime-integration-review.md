# Character Runtime Integration Review

**Status: 🟡 Integrado parcialmente — por falta de dado, não por falha de
integração.** Esta Sprint conectou tudo que existe de verdade (Level,
Equipamento) ao `BossCombatSystem`. A maioria dos atributos pedidos na
lista original **não existe em nenhuma coluna ou tabela do banco hoje** —
não foram "perdidos no caminho", nunca foram criados. Nenhuma mecânica,
Repository novo, System novo ou fórmula foi criada para compensar isso.

---

## 1. Fluxo rastreado

```
Banco (characters: id, profile_id, display_name, level, xp, gold,
       total_minutes, primary_channel_id, last_ping_at, is_shadow_banned,
       first_join_reward_at — CONFIRMADO, nenhuma coluna de classe/atributo)
   ↓
CharacterRepository.findById() → CharacterSnapshot {id, displayName,
   level, totalXp, gold} — só isso é lido, porque só isso existe
   ↓
Character (level chega; classe não existe para chegar)
   ↓
Equipamentos (character_items + equipped_items: slug, name, rarity, slot
   — CONFIRMADO, nenhuma coluna de tipo físico/mágico ou valor numérico
   próprio; ATQ/DEF são computados sob demanda por getItemPower(rarity,
   slot), hoje só no frontend)
   ↓
Classe — SE PERDE AQUI, mas não por um bug de integração: não existe
   nenhuma coluna `class` em `characters`, nenhuma tabela `classes`.
   Capítulo 4 da Bible confirma "Nenhuma classe existe hoje" —
   Placeholder.
   ↓
BossCombatSystem — antes desta Sprint, não recebia nenhum dado de
   personagem (só `presentCount`, um número). Agora recebe Level e
   Equipamento reais (log confirmado, seção 6).
```

**Onde a informação se perde, exatamente:** entre "Equipamentos" e
"Classe" no diagrama acima — porque Classe nunca existiu no banco para
começar. Não há um "ponto de perda" entre banco e `BossCombatSystem` para
Level/Equipamento — esses dois chegam integralmente, confirmado por
harness.

---

## 2. Atributo por atributo

| Atributo | Existe no banco? | É carregado? | Chega ao BossCombatSystem? | É utilizado (no dano)? |
|---|---|---|---|---|
| Level | ✅ `characters.level` | ✅ `CharacterRepository.findById()` | ✅ **Novo nesta Sprint** | ❌ (correto — Sprint não altera `advance()`) |
| Classe | ❌ Nenhuma coluna/tabela | ❌ Impossível | ❌ | ❌ |
| Equipamentos | ✅ `character_items`/`equipped_items` (rarity+slot) | ✅ `getEquippedItems()` (já existia, em `drop.service.ts`) | ✅ **Novo nesta Sprint** | ❌ (correto) |
| ATQ Físico | 🟡 Derivável (via `getItemPower()` sobre rarity+slot da arma) | ✅ | ✅ **Novo nesta Sprint**, logado como `atqFisico` | ❌ (correto) |
| ATQ Mágico | ❌ Nenhuma arma tem sub-tipo mágico no schema | ❌ | ✅ logado explicitamente como `0` com o motivo | ❌ |
| Resistência Física | ❌ `getItemPower()` retorna `defense` único, não separado por tipo | ❌ (só existe a soma flat) | ✅ logado como `resistencia` flat, com a ressalva | ❌ |
| Resistência Mágica | ❌ Idem | ❌ | ❌ (mesmo flat acima, sem split) | ❌ |
| Crítico | ❌ Nenhuma fórmula implementada em nenhum System | ❌ | ❌ logado como `N/A` | ❌ |
| SUS | ❌ Existe só como proposta em `docs/combat-model/`, zero código | ❌ | ❌ logado como `N/A` | ❌ |
| UTI | ❌ Idem | ❌ | ❌ logado como `N/A` | ❌ |

---

## 3. Arquivos alterados (só estes dois)

- `apps/api/src/systems/BossCombatSystem.ts` — construtor ganhou
  `characterRepo: CharacterRepository`; novo método privado
  `logCharacterAttributes()`, chamado uma vez por Boss ativo por tick,
  antes de `advance()` (que continua byte-a-byte idêntico).
- `apps/api/src/server.ts` — uma linha alterada:
  `new BossCombatSystem(bossRepository, characterRepository)`, reaproveitando
  o `characterRepository` que já existia para XP/Welcome Reward.

Nenhum outro arquivo foi tocado. Nenhuma interface de Repository foi
estendida (`getEquippedItems` e `getItemPower` já existiam prontos,
só nunca tinham sido chamados a partir de um System de combate).

---

## 4. Implementação (o que foi feito, e o que foi deliberadamente não feito)

`logCharacterAttributes()` carrega, para cada personagem presente no
canal de um Boss ativo: `level` (via `CharacterRepository.findById()`,
método que já existia) e a lista de itens equipados (via
`getEquippedItems()`, que já existia em `services/drop.service.ts`),
somando `attack`/`defense` de cada item via `getItemPower()` (que já
existia em `packages/shared/src/items.ts`, usado até agora só pelo
frontend). Os cinco campos sem fonte de dado (Classe, ATQ Mágico como
valor real, Resistência tipada, Crítico, SUS, UTI) são logados com um
valor explícito indicando ausência (`N/A(...)` ou `0(motivo)`) — nunca
com um número inventado. `advance()` — HP, dano fixo, `boss.defeated`/
`boss.escaped` — não foi alterado em nenhuma linha.

---

## 5. Harness

Harness temporário (não commitado), banco isolado. Personagem nível 10
com uma arma rara (`lamina-ferro`, `RARITY_BASE.rare = {attack: 18,
defense: 11}`, slot `weapon` → só contribui `attack`) equipada.

**Valores calculados de forma independente, direto do banco** (não
reaproveitando o mesmo código do sistema, para a comparação ter valor
real): `level=10`, `atqFisico=18`, `resistencia=0`.

**Log real do `BossCombatSystem` no tick seguinte:**

```
[BossCombatSystem][CharacterAttributes] character=char-1 level=10
classe=N/A(sem coluna em characters) equipamentos=1 atqFisico=18
atqMagico=0(sem sub-tipo de arma mágica no schema)
resistencia=0(flat, ainda não separada física/mágica)
critico=N/A(sem fórmula implementada) sus=N/A(sem fonte de dado)
uti=N/A(sem fonte de dado)
[BossCombatSystem] Boss ... | Dano: 50 (1 presentes) | HP restante: 450
```

**Comparação:** `level` (10=10), `atqFisico` (18=18) e `resistencia`
(0=0) batem exatamente entre o valor calculado independentemente e o
valor recebido pelo `BossCombatSystem`. A linha de dano (`Dano: 50`)
confirma que o cálculo de combate continua inalterado — o personagem
tinha ATQ real de 18, mas o dano aplicado seguiu sendo o fixo de 50,
exatamente como a Sprint pediu.

---

## 6. Respostas diretas

**O fluxo Character → Boss está completo?** Não, e não pode estar sem
violar as regras desta própria Sprint. Level e Equipamento (o que existe)
chegam completos e corretos, confirmado por harness. Classe, tipo de dano
físico/mágico, Resistência tipada, Crítico, SUS e UTI não chegam porque
não existem como dado em nenhum lugar do banco — completá-los exigiria
criar uma coluna/tabela nova (Classe) ou uma decisão de conversão de
unidade (Resistência flat → tipada, já registrada como pendente em
`docs/combat-model/canonical-formula.md`), o que esta Sprint
explicitamente proíbe ("não implementar features novas", "não criar
sistemas").

**Existe algum atributo que ainda não chega ao combate?** Sim, cinco:
Classe, ATQ Mágico (como valor real, não o zero correto), Resistência
Mágica (não existe separação), Crítico, SUS, UTI. Nenhum tem fonte de
dado hoje — não é um problema de integração, é ausência de feature.

**O projeto está pronto para substituir o dano fixo pela fórmula do
Combat Model?** Não integralmente. Está pronto para uma fórmula que use
`Base(level)` (real) e `Equipamento_ATQ` físico (real, hoje sem separação
de tipo). Não está pronto para os termos que dependem de Classe,
Resistência tipada, SUS ou UTI — esses precisam, primeiro, de uma Sprint
de schema (adicionar `class` a `characters`, decidir a conversão de
`SLOT_DEFENSE_WEIGHT` para percentual) antes de qualquer fórmula poder
lê-los. Essa Sprint de schema é trabalho novo, não integração — e não foi
feita aqui por estar fora do escopo definido.
