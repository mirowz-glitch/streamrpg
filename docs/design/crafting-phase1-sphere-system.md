# Crafting Phase I — Sphere System

Sprint 12. Primeiro Crafting real do StreamRPG. Fecha a lacuna deixada
deliberadamente aberta pela Sprint 11
([itemization2-phase2-persistence.md](./itemization2-phase2-persistence.md),
Seção 9): `applySphere()` só sabia selar itens (Maldição) — as outras 4
Esferas recusavam com `sphere-not-implemented`. Agora as 5 têm efeito
real.

Filosofia obrigatória: **crafting nunca é determinístico**, sempre
envolve risco/escolha/economia/escassez — nenhum jogador consegue
fabricar o item perfeito com garantia.

## 1. Arquitetura

Nenhum sistema paralelo. Toda a lógica de crafting reusa o Item
Generator já existente (`packages/shared/src/itemgen/`) — 3 funções
novas exportadas de lá (`isModEligibleForBase`, `rollMod`,
`findEligibleNewMods`) para que Fortuna/Ascensão nunca reimplementem
elegibilidade/exclusão de grupo.

```
Novo domínio: packages/shared/src/crafting/
  types.ts          — SphereStack/SphereInventory/SphereOwnership/
                       SphereDropRecord (placeholder)/SphereConsumptionEvent
  sphereInventory.ts — operações puras (add/consume/query) sobre posse
  sphereCrafting.ts  — os 4 efeitos reais:
    rerollAffixValues()  — Fortuna
    removeRandomAffix()  — Purificação
    addRandomAffix()     — Ascensão (usa findEligibleNewMods do generator)
    increaseQuality()    — Lapidação
  (Maldição continua em itemization/spheres.ts, Sprint 10/11 —
   applySphere() já fazia a transição de craft_state de verdade)

apps/api/src/services/sphere.service.ts — orquestrador único:
  1. checa posse (character_spheres)
  2. valida craft_state (validateSphere — agora aceita as 5)
  3. despacha pro efeito puro certo
  4. recalcula Power Score (Fortuna/Purificação/Ascensão — usa
     calculatePowerScore, o MESMO do Item Generator)
  5. consome 1 unidade + persiste + anexa evento de História —
     tudo numa única transação SQL (ADR-0001)
```

"Crafting nunca determinístico": a entropia de cada uso vem de
`node:crypto`'s `randomInt()`, só na fronteira da API — nunca dentro de
`packages/shared`, que continua determinístico por seed (D1, replay/
sincronização). A mesma função pura (`rollMod`) é usada tanto na
geração quanto no craft; só a fonte da seed muda.

## 2. Arquivos alterados

**packages/shared:** `crafting/{types,sphereInventory,sphereCrafting,index}.ts` (novos), `itemgen/generator.ts` (3 exports novos), `itemization/spheres.ts` (`validateSphere()` aceita as 5 Esferas; `applySphere()` renomeado conceitualmente para "só Maldição"), `src/index.ts` (exporta `crafting/`).

**apps/api:** `src/config/schema.ts` (tabela `character_spheres`), `src/services/sphere.service.ts` (reescrito — orquestrador das 5 Esferas + `getSphereQuantity`/`getSphereInventory`/`grantSphereForTesting`), `src/routes/items.ts` (`POST /api/items/sphere` atualizado + nova `GET /api/items/spheres`), `scripts/qaGrantSpheres.ts` (novo, QA-only).

**Testes novos:** `crafting/sphereInventory.test.ts`, `crafting/sphereCrafting.test.ts`, extensões em `itemization/spheres.test.ts`, reescrita de `apps/api/src/services/sphere.service.test.ts`.

## 3. Esferas implementadas

| Esfera | Efeito real | Nunca muda |
|---|---|---|
| **Fortuna** | Reroleta o `value` de cada afixo existente (mesmo mod, mesmo Item Level) | prefixos/sufixos/tier/seed/history/potential/quality |
| **Purificação** | Remove exatamente 1 afixo sorteado | os demais afixos; item sem nenhum afixo é válido (não "quebrado") |
| **Ascensão** | Adiciona exatamente 1 afixo novo elegível (`findEligibleNewMods`, respeita grupo/exclusão/tags) | afixos já existentes |
| **Lapidação** | Aumenta `quality.value` em 1-3 (teto 20) | afixos, potential |
| **Maldição** | `craft_state -> "sealed"` permanente | tudo — é a única que sela, nenhuma outra sphere funciona depois |

## 4. APIs

- `POST /api/items/sphere` — `{character_item_id, sphereId}` → `{ok, sphereId, detail, item}` (item completo, mesmo shape de sempre) ou `400 {error: reason}`. Motivos de falha: `item-not-found`, `item-sealed`, `item-locked`, `sphere-not-owned`, `no-affix-to-reroll`, `no-affix-to-remove`, `no-eligible-affix`.
- `GET /api/items/spheres` — nova rota, inventário de Esferas do personagem (só leitura).

## 5. Compatibilidade

Blacksmith já rejeitava item `sealed` (Sprint 11) — confirmado que continua rejeitando. Merchant e Salvage confirmados ao vivo continuando a vender/desmontar item selado ou recém-craftado sem nenhuma alteração de código. Housing/Real Estate/Adventure/Idle não têm nenhuma dependência de item — intocados por construção.

## 6. Testes

`packages/shared`: 578/578 (subiu de 556, +22 novos). `apps/api`: 213/218 no full-suite run — os 5 restantes são a race pré-existente e já documentada de `DB_PATH=":memory:"` entre arquivos de teste em paralelo (nenhum deles é um arquivo desta Sprint; `sphere.service.test.ts` roda 14/14 limpo isolado). Typecheck e build limpos (mesmos erros pré-existentes não relacionados de sempre).

## 7. Browser Validation

Servidor real, `scripts/qaGrantSpheres.ts` concedeu 5 de cada Esfera a um personagem real. Todas as 5 aplicadas via `POST /api/items/sphere` real contra o banco de dev: Fortuna rerolou o valor de um afixo vivo; Purificação removeu esse mesmo afixo; Ascensão adicionou um novo afixo ao mesmo item depois; Lapidação subiu Quality de 0 para 2; Maldição selou um item, e o Blacksmith recusou melhorá-lo (`item-sealed`) enquanto Merchant e Salvage continuaram aceitando (venda do item selado e desmonte do item lapidado, ambos com sucesso). Inventário de Esferas confirmado decrementando 5→4 exatamente uma vez por uso. Zero erro de console em `/app/inventory` e `/app/city`.

## 8. Problemas encontrados

Nenhum problema novo. A mesma race pré-existente de `DB_PATH=":memory:"` entre arquivos de teste continua documentada, não é regressão desta Sprint.

## 9. Próxima Sprint

Candidato natural: distribuição real das Esferas (Boss/Dungeon/World Event drop) — o `SphereDropRecord` já documenta o contrato que essa Sprint precisaria satisfazer. Alternativa: Gemas/Sockets, explicitamente fora de escopo desta Sprint.
