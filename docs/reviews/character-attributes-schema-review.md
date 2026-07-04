# Character Attributes Schema Review

**Status: ✅ Infraestrutura pronta, com uma exceção deliberada.** Nenhuma
fórmula de combate foi alterada. `BossCombatSystem` não foi tocado.
Nenhum documento de Bible/Gameplay Design/Combat Model/World Design foi
alterado.

---

## 1. Auditoria (Combat Model × banco × Character × Repository × Runtime × Frontend)

| Atributo | Banco (antes) | Banco (depois) | Character (TS) | Repository | Runtime | Frontend |
|---|---|---|---|---|---|---|
| ATQ Físico | derivável, sem tipo | ✅ `items.damage_type` | — (derivado, não armazenado) | ✅ `getCombatAttributes()` | ✅ | ❌ (fora do escopo desta Sprint) |
| ATQ Mágico | ❌ nenhuma arma tinha sub-tipo | ✅ idem | — | ✅ | ✅ | ❌ |
| Resistência Física | ❌ só soma flat | ✅ idem | — | ✅ | ✅ | ❌ |
| Resistência Mágica | ❌ | ✅ idem | — | ✅ | ✅ | ❌ |
| Crítico | ❌ nenhuma constante | ✅ `CRITICAL_HIT_CHANCE` (shared, global) | — (não é atributo por personagem) | — | ✅ | ❌ |
| SUS | ❌ nenhuma coluna | ✅ `characters.sus_base` | ✅ `CharacterSnapshot.susBase` | ✅ | ✅ | ❌ |
| UTI | ❌ nenhuma coluna | ✅ `items.uti_bonus` | — (derivado) | ✅ | ✅ | ❌ |

---

## 2. Schema projetado (menor possível)

Três colunas novas, nenhuma tabela nova:

- `characters.sus_base INTEGER NOT NULL DEFAULT 0` — **armazenado**, não
  derivado. Não há de onde derivar: Combat Model já decidiu que
  equipamento não contribui para SUS no MVP, e Classe (única fonte
  prevista) não existe (capítulo 4 da Bible, ainda Placeholder).
  Placeholder explícito em `0`, nunca implícito.
- `items.damage_type TEXT DEFAULT 'physical'` — **armazenado** por item,
  usado para **derivar** ATQ físico/mágico (armas) e Resistência
  física/mágica (demais slots) em runtime. Uma única coluna serve os dois
  papéis, pelo mesmo motivo conceitual (afinidade elemental do item) —
  evita duplicação.
- `items.uti_bonus INTEGER NOT NULL DEFAULT 0` — **armazenado** por item,
  **somado** (derivado) em runtime entre os itens equipados. Default 0
  para todo o catálogo — nenhuma calibração de balanço foi decidida aqui,
  só a estrutura.

Crítico não ganhou coluna nenhuma — é uma constante global
(`CRITICAL_HIT_CHANCE`, `packages/shared/src/items.ts`), a mesma decisão
já fechada no capítulo 6 da Bible ("pequena chance de crítico", igual
para todos). Dar a Crítico uma coluna por personagem teria contradito
essa decisão, não construído infraestrutura para ela.

---

## 3. Arquivos alterados

- `apps/api/src/config/database.ts` — 3 migrações novas, idempotentes,
  seguindo o padrão já existente (`PRAGMA table_info` antes de
  `ALTER TABLE`).
- `packages/shared/src/types.ts` — `DamageType`, `ItemCatalogEntry` ganhou
  `damage_type?`/`uti_bonus?` opcionais.
- `packages/shared/src/items.ts` — `getCombatAttributes()` (função nova,
  aditiva) e `CRITICAL_HIT_CHANCE` (constante nova). `getItemPower()` e
  `comparePower()`, já usados por `BossCombatSystem` e pelo frontend, não
  foram tocados.
- `apps/api/src/engine/types.ts` — `CharacterSnapshot` ganhou `susBase`;
  novo `CombatAttributesSnapshot`; `CharacterRepository` ganhou o método
  `getCombatAttributes()`.
- `apps/api/src/infrastructure/SQLiteCharacterRepository.ts` —
  `findById()` passou a ler `sus_base`; novo método
  `getCombatAttributes()` implementado.
- `apps/api/src/services/items.service.ts` — `seedItems()` grava as duas
  colunas novas; duas entradas ilustrativas adicionadas ao catálogo
  (`cajado-aprendiz`, arma mágica; `uti_bonus: 2` em `amuleto-presenca`)
  para o schema não ficar inerte — nenhuma das ~30 entradas restantes foi
  alterada.

**Nenhum outro arquivo foi tocado** — `BossCombatSystem.ts`,
`docs/gameplay-design/`, `docs/combat-model/`, `docs/world-design/` e o
frontend continuam exatamente como estavam.

---

## 4. Nenhum atributo implícito

`getCombatAttributes(characterId)` (novo método do `CharacterRepository`)
retorna sempre os 7 campos — `level`, `attackPhysical`, `attackMagic`,
`resistancePhysical`, `resistanceMagic`, `susBase`, `utiBonus` — mesmo
quando o personagem não tem nada equipado (todos os campos derivados
ficam `0`, nunca `undefined`/ausente). `CRITICAL_HIT_CHANCE` existe como
constante, sempre acessível, independente de qualquer personagem.

**Achado estrutural, não um bug:** como só existe um slot `weapon`, um
personagem nunca pode ter `attackPhysical` e `attackMagic` simultaneamente
maiores que zero — equipar uma arma mágica automaticamente zera a
contribuição física, e vice-versa. Isso é consequência do schema de itens
já existente (`ItemSlot` tem um único slot de arma), não uma decisão
tomada nesta Sprint, e não impede nada do Combat Model — só descreve como
"ATQ Físico" e "ATQ Mágico" se comportam na prática hoje.

---

## 5. Harness

Harness temporário, banco isolado. Personagem nível 5 com 3 itens
equipados (arma mágica comum, armadura física comum, amuleto incomum com
`uti_bonus=2`).

```
CombatAttributesSnapshot: {
  "characterId": "char-1", "level": 5,
  "attackPhysical": 0, "attackMagic": 5,
  "resistancePhysical": 6, "resistanceMagic": 0,
  "susBase": 0, "utiBonus": 2
}

OK  level: esperado=5 carregado=5
OK  susBase: esperado=0 carregado=0
OK  attackPhysical: esperado=0 carregado=0
OK  attackMagic: esperado=5 carregado=5
OK  resistancePhysical: esperado=6 carregado=6
OK  resistanceMagic: esperado=0 carregado=0
OK  utiBonus: esperado=2 carregado=2

=== RESULTADO: TODOS OS ATRIBUTOS BATEM ===
```

**Nota de honestidade sobre o próprio harness:** a primeira execução
falhou (`resistancePhysical: esperado=3 carregado=6`) — não por erro no
código do sistema, mas porque o valor "esperado", calculado à mão no
harness, esqueceu que o amuleto (slot não-arma, `damage_type` default
`physical`) também contribui para Resistência Física, independente do seu
`uti_bonus` — os dois campos são aditivos, não mutuamente exclusivos.
Corrigido o cálculo esperado (3 da armadura + 3 do amuleto = 6), a
segunda execução bateu em todos os 7 valores. Registrado aqui porque é
exatamente o tipo de coisa que este processo de comparação existe para
capturar — inclusive quando o erro está na expectativa, não no sistema.

---

## 6. Respostas diretas

**Todos os atributos do Combat Model agora possuem fonte de dados?**
Sim, incluindo Crítico (como constante global, não coluna — a fonte
correta dado que já foi decidido não ser um valor por personagem).

**Algum ainda depende de implementação futura?** Sim, um: `sus_base`
está armazenado com um default seguro (`0`), mas continua sem nenhuma
fonte real de valor — só Classes (capítulo 4 da Bible, ainda
Placeholder) poderia um dia escrever um valor diferente de zero ali. Não
é uma lacuna desta Sprint; é a mesma dependência já registrada nas duas
Sprints anteriores, agora com uma coluna real esperando por ela, em vez
de nenhuma.

**O projeto está pronto para substituir o dano fixo pela fórmula
completa?** Sim, para os termos que este schema cobre — `Base(level)`,
`Equipamento_ATQ(físico/mágico)`, `Resistência(físico/mágico)`, `Critical`
(constante) e `UTI` (soma de equipamento) já têm fonte de dado real e
carregável via `CharacterRepository.getCombatAttributes()`. `SUS` também
tem fonte (a coluna), só que hoje sempre resolve para `0` — o que é
correto e não bloqueia a próxima Sprint (a fórmula pode consumir
`susBase=0` normalmente, o mesmo jeito que `Classe_mult` já é consumido
como `1` fixo). Nenhuma peça está ausente a ponto de impedir a próxima
Sprint de trocar a fórmula simplificada do Boss pela canônica.
