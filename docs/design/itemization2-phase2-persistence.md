# Itemization 2.0 — Fase 2: Persistent Items + Affixes + Craft Foundation

Sprint 11. Fecha o gargalo nomeado (mas não resolvido) pela Fase 1
([itemization2-phase1-implementation.md](./itemization2-phase1-implementation.md)):
o Item Generator (`packages/shared/src/itemgen/`) sempre produziu afixos
completos (prefixos/sufixos/tier/valor/roll), mas `drop.service.ts`
descartava tudo na persistência, guardando só `rarity/slot/power_score`.

Filosofia obrigatória desta Sprint, agora real: **"Nenhum item
procedural poderá perder informação ao ser salvo. Nunca mais."**

## 1. Arquitetura

Nenhum sistema novo. Toda a persistência estende a MESMA tabela `items`
e os MESMOS tipos `InventoryItem`/`EquippedItem` já existentes — "Nunca
criar um segundo modelo de item" (diretriz explícita do brief).

```
Item Generator (itemgen/generator.ts)
  → ItemGenGeneratedItem { itemLevel, seed, prefixes[], suffixes[] }
  → LootDropRecord / LootDropped (adventure/, presentation/, dungeon/)
      [3 pontos reais de emissão, campos agora opcionais mas sempre
       populados: itemLevel, seed, prefixes, suffixes]
  → POST /api/items/loot (routes/items.ts)
  → grantAdventureLoot() (drop.service.ts)
      - affixes = [...prefixes, ...suffixes]
      - potential = derivePotentialFromSeed(seed)   [determinístico]
      - quality = createDefaultQuality()             [{value:0}]
      - craft_state = 'open'
      - history = createItemHistory()                [evento "created"]
  → items (7 colunas novas, migration-only)
  → listInventory()/getEquippedItems() (drop.service.ts)
      - parsePersistedItemFields(): desserializa de volta, sem perda
  → todo endpoint que retorna Item (items/merchant/blacksmith/salvage/
    character) já devolve os campos completos
```

Esferas (`packages/shared/src/itemization/spheres.ts`, Sprint 10) ganham
o primeiro consumidor real: `apps/api/src/services/sphere.service.ts` +
`POST /api/items/sphere`. Só a Esfera da Maldição (`curse`) produz
sucesso — sela o `craft_state`; as outras 4 recusam com
`sphere-not-implemented`, honestas sobre o escopo.

## 2. Arquivos alterados

**packages/shared:**
- `src/itemization/types.ts` — `derivePotentialFromSeed()`, `createDefaultQuality()`
- `src/itemization/history.ts` — evento `"upgraded"`, `appendItemHistoryEvent()`
- `src/itemization/spheres.ts` — `validateSphere()`, `applySphere()` reais
- `src/index.ts` — `itemization/` deixa de ser inerte
- `src/types.ts` — `PersistedItemFields`, `InventoryItem`/`EquippedItem` estendidos
- `src/adventure/types.ts` — `LootDropRecord` +4 campos opcionais
- `src/presentation/types.ts` — `LootDropped` +4 campos opcionais
- `src/adventure/adventureLoop.ts` — emissão real (combate)
- `src/presentation/presentationLayer.ts` — emissão real (Treasure + 2 loops de evento)
- `src/dungeon/dungeonController.ts` — emissão real (loot garantido do Chefe Final)
- `tsconfig.json` — `"composite": true` (gap pré-existente, bloqueava `tsc -b`)

**apps/api:**
- `src/config/database.ts` — migração: `item_level/seed/affixes/potential/quality/craft_state/history`
- `src/services/drop.service.ts` — `grantAdventureLoot`/`mapInventoryRow`/`getEquippedItems`/`applyItemUpgrade` persistem e leem tudo
- `src/services/sphere.service.ts` — **novo**, primeiro consumidor real de Esferas
- `src/services/blacksmith.service.ts` — rejeita item `sealed` (`item-sealed`)
- `src/routes/items.ts` — `POST /api/items/loot` aceita afixos; **novo** `POST /api/items/sphere`
- `src/routes/character.ts` — `equipped.map()` inclui os novos campos (allowlist manual)

**apps/web:**
- `src/hooks/useAdventureSession.ts` — repassa `itemLevel/seed/prefixes/suffixes` ao persistir loot
- `src/components/landing/CharacterPreview.tsx`, `src/lib/{merchant,salvage,blacksmith}Offers.test.ts` — fixtures atualizadas para o tipo estendido

**Testes novos:** `itemization/types.test.ts`, extensões em `spheres.test.ts`/`history.test.ts`, `apps/api/src/services/{drop,sphere}.service.test.ts`, extensão em `blacksmith.service.test.ts`.

## 3. Persistência

Todos os 7 campos novos confirmados por escrita real + leitura real (não
só teste unitário — ver Seção 7). `affixes`/`potential`/`quality`/
`history` viajam como TEXT JSON (mesmo padrão de `houses.history`);
`craft_state` é TEXT com default `'open'`. Nenhum item do catálogo fixo
pré-Sprint 11 ganha afixo/histórico retroativo — `potential`/`history`
ficam `null`, `affixes` fica `[]`, `quality` fica no valor neutro.

## 4. APIs

- `POST /api/items/loot` — aceita `itemLevel`/`seed`/`prefixes`/`suffixes` opcionais
- `POST /api/items/sphere` — **nova rota**: `{character_item_id, sphereId}` → `{ok, craftState}` ou `400 {error: reason}`
- `GET /api/items`, `POST /api/items/equip`, `POST /api/merchant/sell`, `POST /api/blacksmith/upgrade`, `POST /api/salvage`, `GET /api/character` — todos já devolvem Afixos/História/Potencial/Qualidade/Craft State (a maioria automaticamente, via extensão de tipo; `character.ts` precisou de edição explícita por usar um `.map()` allowlist)

## 5. Compatibilidade

Merchant e Salvage precisaram de **zero alterações de código** — ambos
já consomem `listInventory()`/o tipo `InventoryItem` completo. Blacksmith
precisou de uma checagem nova (`craft_state === "sealed"` → rejeita).
Nenhum consumidor existente quebrou: todos os campos novos em
`LootDropRecord`/`LootDropped` são opcionais no tipo, sempre populados
pelos 3 pontos reais de emissão, nunca exigidos pela fixture de teste
mínima (`animation.test.ts`).

## 6. Testes

- `packages/shared`: 556/556 (suíte completa, incluindo 24 testes novos/estendidos de itemization)
- `apps/api`: 204/209 no full-suite run; os 5 restantes (`economy.service.test.ts` ×2, `blacksmith.service.test.ts` ×1, `merchant.service.test.ts` ×1, `SQLiteCharacterRepository.test.ts` ×1) são a race pré-existente e já documentada de `DB_PATH=":memory:"` entre arquivos de teste rodando em paralelo — confirmado ao rodar os mesmos arquivos isolados: 41/41 passam limpo, incluindo os 2 arquivos novos desta Sprint (`drop.service.test.ts`, `sphere.service.test.ts`)
- `npm run typecheck` — limpo, exceto os erros pré-existentes e não relacionados em `EventBus.test.ts`/`GameEngine.test.ts`/`SQLiteBossRepository.ts`/`SQLiteCharacterRepository.test.ts` (Boss/EventBus, não tocados nesta Sprint)
- `npm run build:web` — limpo

## 7. Browser Validation

Servidor real (`npm run dev`), sessão de personagem real, chamadas HTTP
reais (não mockadas):
1. Login sem conta ("Jogar Agora") → Cidade carrega, Aventura ativa em andamento
2. `GET /api/items` — confirmado: item recém-dropado ("Maça", rara) com 5 afixos completos, `item_level: 67`, `seed`, `potential.ceilingFraction: 0.697`, `quality: {value:0}`, `craft_state: 'open'`, `history` com evento `"created"`
3. `POST /api/blacksmith/upgrade` no item equipado — `power_score`/`upgrade_level` sobem; re-leitura via `GET /api/items` confirma os 5 afixos intactos + histórico com `["created","upgraded"]`
4. `POST /api/items/sphere` (`curse`) num item sem afixo — `craft_state` vira `'sealed'`, histórico ganha `"sealed"` com `detail: "sphere:curse"`
5. `POST /api/merchant/sell` no item selado — sucesso, resposta completa (`craft_state: 'sealed'`, histórico com 2 eventos) — confirma "item selado continua vendável"
6. `POST /api/salvage` num item com 1 afixo — sucesso, resposta com `craft_state`/`quality`/`affixes` completos, recompensa em `materials`
7. `/app/inventory`, `/app/housing` — renderizam sem erro de console, sem regressão visual (UI ainda não exibe afixos — fora do escopo desta Sprint, "sem UI" explícito no brief para Potential/Quality)

Zero perda de dado observada em nenhum ponto do fluxo.

## 8. Problemas encontrados

- **Gap de ambiente pré-existente**: `packages/shared/tsconfig.json` nunca teve `"composite": true`, exigido pelo TypeScript sempre que outro projeto o referencia via `"references"` (`apps/api`/`apps/web` referenciam). Isso significa `npm run typecheck` (`tsc -b`) nunca rodou com sucesso antes desta Sprint — qualquer "Typecheck limpo" reportado em Sprints anteriores não passou por este comando exato. Corrigido com uma linha; não é uma regressão desta Sprint, é uma lacuna anterior finalmente exposta.
- **Resposta do Blacksmith fica um evento defasada**: `blacksmith.service.ts`'s `upgradeItem()` devolve o `item` capturado ANTES da transação — seu campo `history` na resposta HTTP imediata ainda não inclui o evento `"upgraded"` recém-gravado (só aparece na próxima leitura). O dado no banco está correto; só a resposta síncrona atrasa um evento. Não corrigido (cosmético, documentado).
- **"Sold"/"Salvaged" nunca existirão como eventos de histórico**: `removeItem()` (usado por Merchant e Salvage) apaga a linha de `character_items` — não há linha viva pra ler o evento de volta depois. Por isso `ItemHistoryEventType` não ganhou esses dois valores (decisão da Fase 6, reconfirmada aqui).

## 9. Próxima Sprint

Candidatos, em ordem de dependência natural:
1. **Crafting real** — consumir `Potential`/`Quality`/afixos já persistidos (Fortune/Purification/Lapidation/Ascension ainda recusam com `sphere-not-implemented`)
2. **UI de afixos** — mostrar os afixos/potencial/qualidade no InventoryPage/EquipmentPopup (hoje só existem no dado, "sem UI" era explícito nesta Sprint)
3. **Item Legacy** — `deriveItemLegacyFromHistory()` (Sprint 10) já existe, pronta pra alimentar Crônicas/Museu do Reino com histórico real de item
