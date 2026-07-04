# 05. Equipamentos

**Status: 🟠 Rascunho.** Não é capítulo da Bible. Recupera e formaliza a
Missão 4 da Sprint de Gameplay original, agora explicitamente ancorada no
código real existente.

## O que já existe (fato, verificado em código)

`packages/shared/src/items.ts`:

```ts
RARITY_BASE = {
  common: { attack: 5, defense: 3 },
  uncommon: { attack: 10, defense: 6 },
  rare: { attack: 18, defense: 11 },
  epic: { attack: 30, defense: 18 },
  legendary: { attack: 50, defense: 30 },
};

SLOT_DEFENSE_WEIGHT = {
  armor: 1, helmet: 0.7, boots: 0.5, amulet: 0.5, ring: 0.3,
};

getItemPower(rarity, slot) // weapon → attack puro; outros slots → defense ponderado pelo peso do slot
comparePower(newItem, currentItem) // soma attack+defense, compara
```

Isso já diferencia slots por **peso numérico** de defesa (armadura pesa
mais que anel) — mas não por **comportamento**. É usado hoje só no
frontend (`InventoryPage.tsx`, badge "▲ Melhor/▼ Pior"), nunca em
combate. Esta é a lacuna exata que a Missão 4 original identificou.

## Proposta: identidade mecânica por slot, além do número

| Slot | Já existe (peso numérico) | Comportamento proposto (novo) |
|---|---|---|
| Arma (espada) | `attack` puro | Dano direto, alvo único, tipo físico |
| Arma (machado, se vier a existir como sub-tipo) | `attack` puro | Dano em área pequena, tipo físico |
| Arma (lança) | `attack` puro | Age antes na ordem do combate, tipo físico |
| Arma (arco) | `attack` puro | Alcance máximo, nunca sofre retaliação corpo-a-corpo, tipo físico |
| Arma (cajado/grimório, sub-tipo proposto, ver Combat Model) | Não existe | Mesma função de uma arma, mas tipo mágico — sem isso, nenhum personagem consegue causar dano mágico de verdade |
| Armadura (peso 1.0) | `defense` ponderado | Reduz dano recebido — contribui para Resistência (física e/ou mágica, ver Combat Model) |
| Escudo (não existe hoje como slot) | — | Pode anular especificamente um tipo de ataque (ex.: "ataque frontal" de Boss) — corresponde a `Bloqueio` no Combat Model |
| Elmo (peso 0.7) | `defense` ponderado | Resistência a controle (atordoamento) — usa o atributo UTI, não Resistência |
| Botas (peso 0.5) | `defense` ponderado | Proposta: contribui para VEL (capítulo 01), não Resistência — mudança em relação ao código atual, que trata botas como defesa pura |
| Amuleto (peso 0.5) | `defense` ponderado | Habilita build — regeneração (SUS), resistência elemental (via UTI). **Sprint 4:** não afeta mais crítico — ver `docs/combat-model/canonical-formula.md` |
| Anel (peso 0.3) | `defense` ponderado | Mesmo papel de Amuleto, efeito menor |

**Nota de discrepância explícita:** o código hoje trata Botas como puro
slot de defesa (`SLOT_DEFENSE_WEIGHT.boots = 0.5`). Este capítulo propõe
que Botas deveriam contribuir para VEL, não Resistência — isso é uma
mudança de modelo, não uma extensão. Se aceita no futuro, `getItemPower()`
precisaria de um terceiro campo (`speed`, ou similar) além de
`attack`/`defense` — e o Escudo, que este capítulo propõe, não existe como
slot no schema atual de `character_items`/`items` (capítulo 3 da Bible
confirma só 6 slots: `weapon, armor, helmet, boots, amulet, ring`). O
sub-tipo de arma mágica também não existe — sem ele, nenhuma região que
favorece dano mágico (Minas Abandonadas, ver capítulo 07) é realizável
com o item system atual, mesmo depois da resolução matemática do Combat
Model (ver `docs/reviews/gameplay-combat-final-review.md`).

## Por que isso importa mais do que parece

Como o combate é assistido, não jogado, "equipamento muda comportamento" é
o que torna o combate visualmente interessante de assistir — um personagem
com escudo segurando um golpe frontal enquanto um arqueiro ataca de longe
é uma cena, não só uma barra de HP descendo. Sem isso, todo combate
parece idêntico, só com números diferentes.

## Interface com Boss (capítulo 6)

O capítulo 6 já lista "Equipamentos" como termo da fórmula de dano, com a
mesma ressalva de "dependência ainda não modelada". A proposta deste
capítulo (peso numérico já existente + comportamento novo) é exatamente o
que preencheria esse termo — mas a parte comportamental (Escudo anula
ataque frontal, Machado atinge área) exigiria que Boss tivesse mecânicas
que reagem a isso, o que o MVP de Boss não tem (habilidades fixas e
simples, sem tipos de ataque diferenciados). Ou seja: a parte numérica
desta proposta serve ao MVP de Boss hoje; a parte comportamental é
visão pós-MVP.

## Nota de honestidade

Este capítulo propõe uma mudança de modelo em Botas (defesa → velocidade)
e um slot novo (Escudo) que não existe no schema atual — nenhum dos dois
é uma decisão, são propostas que exigiriam alterar `ItemSlot` (capítulo 3
da Bible/`packages/shared/src/types.ts`) se algum dia aceitas. Registrado
aqui como proposta, não como algo já resolvido.
