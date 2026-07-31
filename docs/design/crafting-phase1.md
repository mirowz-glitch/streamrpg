# Crafting — Especificação Inicial (Phase I)

**Status:** 🚧 Preparação — nenhuma funcionalidade de Crafting foi implementada a partir deste documento. Escrito ao final da Sprint "Salvage Phase I", que entregou o primeiro sistema a CONCEDER `materials`. Crafting seria o primeiro sistema a **gastar** `materials` — fechando o ciclo econômico que Salvage abriu sozinho.

Este documento não implementa nada. Define o que significa uma receita, o que ela consome/produz, como isso se integra ao Economy Core e ao Equipment Lock, o fluxo de transação e os eventos — para que a Sprint futura de Crafting comece direto na implementação.

## 0. O que já existe (herdado de Economy Core + Merchant + Blacksmith + Salvage + Equipment Lock, não repetido aqui)

- `ResourceId` já inclui `"materials"` — Salvage Phase I é o primeiro (e único, até aqui) sistema que credita esse recurso. Crafting seria o primeiro a debitá-lo.
- `debitCharacterResourceInTransaction()` já existe (Blacksmith Phase I) — Crafting reaproveita diretamente, mesmo padrão de composição de transação (ADR-0001).
- **Criação de item**: `grantAdventureLoot()` (`apps/api/src/services/drop.service.ts`) já cria uma linha nova em `items`+`character_items` a partir de `{baseItemId, name, rarity, slot, powerScore}` — o mesmo mecanismo que a Aventura usa pra gerar loot procedural. Crafting reaproveitaria essa MESMA função pra materializar o item craftado — nenhuma tabela paralela de "itens craftados".
- **Item Generator** (`packages/shared/src/itemgen/`) já sabe gerar `rarity`/`slot`/`power_score` de forma procedural e balanceada (Continuous Affix Scaling, ver `docs/design/item-generation-design-review.md`) — Crafting reaproveitaria esse motor pra decidir os atributos do item craftado, em vez de inventar uma segunda fórmula de geração.
- Equipment Lock (`docs/design/equipment-locking-phase1.md`) já protege qualquer operação que mute um item EXISTENTE — só relevante pra Crafting se uma receita algum dia consumir outro item como ingrediente (Seção 3).

## 1. Auditoria — O Que Falta

Diferente de Salvage (que só precisou de uma função pura + reaproveitar `removeItem`), Crafting precisa de um conceito novo que não existe em lugar nenhum: **uma receita** (o que se gasta, o que se recebe). Três perguntas:

1. **Onde vive uma receita?** Não é estado de jogador — é dado de design (como Enemy Templates, Loot Tables, Encounter Tables). **Recomendação**: `packages/shared/src/crafting/recipes.ts`, catálogo estático (`CraftingRecipe[]`), mesmo padrão de todo catálogo de dados já existente no Engine. Nenhuma tabela nova no banco — receitas não mudam por personagem.
2. **O que uma receita produz?** Um item novo, procedural, via o MESMO caminho que a Aventura já usa (`grantAdventureLoot`, Item Generator). **Recomendação**: cada receita define `slot` + uma faixa de `rarity` (ex.: "sempre rare", ou "commom a rare, com pesos") — a fórmula de `power_score` reaproveita o Item Generator, nunca uma segunda fórmula.
3. **O que uma receita consome?** Só `materials` nesta fase (mesma disciplina de Blacksmith: "não implementar reforging/materiais raros especiais" — receitas simples, uma quantidade fixa de `materials` por craft, sem ingredientes múltiplos ou itens como insumo).

**Nenhum bloqueio de schema** — criação de item e débito de recurso já existem prontos; falta só o código que os une por trás de uma receita.

## 2. Receitas (Recipes)

```ts
interface CraftingRecipe {
  id: string;
  name: string;
  slot: ItemSlot;
  rarity: ItemRarity;       // fixa por receita nesta fase — sem RNG de raridade
  materialsCost: number;    // quanto de `materials` a receita consome
}
```

Uma função pura `craftItem(recipe, context)` (`packages/shared/src/crafting/`, mesma disciplina de `packages/shared/src/equipment/`: sem I/O) decidiria os atributos do item resultante reaproveitando o Item Generator — mas a CRIAÇÃO real (INSERT no banco) continua vivendo em `apps/api` (`grantAdventureLoot`), nunca em `packages/shared`.

## 3. Integração com o Equipment Lock

Nesta fase (receitas simples, sem ingredientes-item), Crafting **não precisa** do Equipment Lock — não há um item EXISTENTE sendo lido-então-mutado (o item craftado é sempre uma linha NOVA). O Lock só entraria em cena numa fase futura onde uma receita consumisse outro item do jogador como ingrediente (ex.: "funda 2 armas em 1") — aí sim o item consumido precisaria do mesmo `equipmentLock.withLock()` que Blacksmith/Merchant/Salvage já usam, pelo mesmo motivo (proteger contra uma escrita concorrente no MESMO item). **Decisão explícita desta preparação**: fora de escopo até existir uma receita desse tipo.

## 4. Integração com o Economy Core

- **Débito de materials**: `debitCharacterResourceInTransaction()` já existe, já usado por Blacksmith pra `gold` — Crafting seria o primeiro consumidor pra `materials`.
- **Transação combinada**: debitar materials + criar o item precisam ser atômicos (mesmo padrão ADR-0001) — `BEGIN` → debita → `grantAdventureLoot()` → `COMMIT`/`ROLLBACK`.
- **Nenhuma regra de craft vive no Ledger** — o Ledger só sabe debitar `materials`; a regra "qual item uma receita produz" vive no Crafting Service (`apps/api/src/services/crafting.service.ts`, mesma forma de `salvage.service.ts`/`blacksmith.service.ts`).

## 5. Fluxo de Transações

```
Player escolhe uma receita (Oficina de Crafting, prédio a definir — mesmo
achado da Sprint Salvage: pode não existir ainda um prédio/NPC pra isso)
     ↓
Crafting Service: valida saldo de materials >= recipe.materialsCost
     ↓
BEGIN
     ↓
debitCharacterResourceInTransaction(characterId, "materials", recipe.materialsCost, "crafting:craft", recipe.id)
     ↓
Se rejeitado (saldo insuficiente): ROLLBACK, devolve erro claro
     ↓
Se aceito: grantAdventureLoot(characterId, null, { slot: recipe.slot, rarity: recipe.rarity, powerScore: <via Item Generator> })
     ↓
COMMIT
     ↓
Resposta: item craftado + novo saldo de materials
     ↓
Personagem/Mochila atualizam (mesmo padrão de refresh — reaproveitar
refreshCharacter/refreshItems, nunca duplicar estado)
```

## 6. Eventos

Um craft bem-sucedido emite `ResourceSpent` (já existe, `resourceId: "materials"`, `origin: "crafting:craft"`) — nenhum evento novo necessário no Economy Core, mesmo padrão de Blacksmith.

## 7. Persistência

Nenhuma tabela nova — receitas são dado estático (código), o item craftado usa a MESMA tabela `items`/`character_items` que todo item já usa, o débito usa `character_resources`/`resource_transactions` já existentes.

## 8. Decisões em Aberto (para a Sprint Crafting decidir)

- **Onde o jogador crafta**: mesmo achado da Sprint Salvage — provavelmente não existe ainda um prédio/NPC pra Crafting (a Cidade tem Alquimista "em construção", que talvez seja o lar natural — a decidir).
- **Catálogo de receitas inicial**: quantas receitas, quais slots/raridades, quanto cada uma custa em `materials` — decisão de balanceamento, não de arquitetura. Recomenda-se uma curva parecida com `BASE_MATERIALS_BY_RARITY` de Salvage, mas invertida (craftar deveria custar mais materials do que desmontar rende, pelo mesmo motivo de "nenhum incentivo perverso" já aplicado em Merchant/Blacksmith/Salvage).
- **Raridade fixa vs. sorteada por receita**: esta preparação recomenda raridade FIXA por receita (mais simples, mais previsível) — sortearraridade dentro de uma receita é uma decisão de design a confirmar, não um bloqueio técnico.
- **Ingredientes-item (reforging-like)**: explicitamente fora de escopo desta preparação e da própria Sprint Salvage ("não implementar Reforging") — só reconsiderar se o jogo precisar de uma mecânica de "fundir 2 itens em 1", o que traria o Equipment Lock de volta à conversa (Seção 3).

---

*Referências: `docs/design/salvage-phase1.md` Seção 10 (implementação real do Salvage, o precedente direto — primeiro consumidor de crédito de `materials`); `docs/design/blacksmith-phase1.md` (precedente de débito, ADR-0001); `docs/design/equipment-locking-phase1.md` (quando o Lock entraria em cena numa fase futura de ingredientes-item); `docs/design/economy-core-phase1.md` (arquitetura base); `docs/roadmap.md` (ordem Merchant → Blacksmith → Salvage → Crafting).*
