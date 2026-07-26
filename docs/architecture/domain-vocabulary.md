# Domain Vocabulary — Referência Oficial

Documento gerado pela Sprint **Domain Vocabulary Consolidation (Architecture Phase I)**.

Responde a uma pergunta permanente: **existe exatamente um nome oficial para cada conceito do domínio?**

A resposta é "sim" — mas só depois de separar dois grupos que, à primeira vista, parecem a mesma coisa:

1. **Duplicação real** — o mesmo conceito, dois nomes, zero diferença de significado. Deve ter (e agora tem) um único nome oficial.
2. **Conceitos legitimamente distintos** — nomes parecidos, significados diferentes. Forçar um nome único aqui **mudaria o comportamento do jogo** (rompe regras que esta Sprint foi explicitamente proibida de tocar). Estes ficam documentados como distintos, não unificados.

Confundir os dois grupos é o erro que esta Sprint existe para prevenir.

---

## 1. Consolidado nesta Sprint (duplicação real → nome único)

### 1.1 `ItemSlot` (slot de item persistido)
- **Nome oficial**: `ItemSlot` — `packages/shared/src/types.ts`.
- **Valores**: `weapon | armor | helmet | gloves | boots | belt | amulet | ring` (8 valores).
- **Histórico**: já unificado numa Sprint anterior (Equipment Progression / Persistence Sync Repair) — o Item Generator (`ItemGenSlot`) tinha 8 slots, a persistência só tinha 6; `gloves`/`belt` foram promovidos a slots de primeira classe. O mapeamento `ItemGenSlot -> ItemSlot` (`SLOT_TO_PERSISTED` em `apps/web/src/hooks/useAdventureSession.ts`) é tipado como `Record<ItemGenSlot, ItemSlot>` — exaustivo: um novo `ItemGenSlot` sem entrada correspondente quebra o build.

### 1.2 Rótulos e ordem de exibição de `ItemSlot`
- **Nome oficial**: `SLOT_LABEL` / `SLOT_ORDER` — `apps/web/src/lib/itemSlots.ts` (novo, extraído nesta Sprint).
- **Antes**: as mesmas duas constantes existiam copiadas verbatim em `InventoryPage.tsx` e `EquipmentSlots.tsx` (mesmos valores, mesmo texto em português). `FirstItemCard.tsx` já importava de `InventoryPage.tsx`, evidência de que o padrão de duplicação já incomodava antes desta Sprint.
- **Depois**: um único módulo, mesmo padrão já usado por `RARITY_COLOR`/`RARITY_LABEL` (`apps/web/src/lib/rarity.ts`). Todos os consumidores (`InventoryPage.tsx`, `EquipmentSlots.tsx`, `FirstItemCard.tsx`) importam de `itemSlots.ts`.

### 1.3 Nome de exibição de Região
- **Nome oficial**: `getRegionName()` — `packages/shared/src/regions.ts` (fonte: `REGION_GRAPH`).
- **Antes**: `apps/web/src/lib/regions.ts` (`REGIONS: RegionInfo[]`) tinha o campo `name` como um segundo literal hardcoded, coincidindo texto-a-texto com `REGION_GRAPH` — nada impedia os dois textos de divergir se um fosse editado sem o outro.
- **Depois**: `REGIONS` deriva `name` via `getRegionName(id)`; `description`/`difficulty`/`theme` (conteúdo presentacional só existente ali, não duplicado) continuam locais. Verificado: os 11 nomes batem exatamente com os valores anteriores (nenhuma mudança de texto visível ao jogador).

---

## 2. Deliberadamente distintos (não unificar)

### 2.1 `ItemGenSlot` × `ItemSlot`
`ItemGenSlot` (`packages/shared/src/itemgen/types.ts`) é o vocabulário do Item Generator (o que o item É). `ItemSlot` (types.ts) é o vocabulário de persistência/API (onde o item fica salvo/exibido). Já convergiram para os mesmos 8 valores (ver 1.1), mas continuam **tipos diferentes por camadas diferentes** — o Item Generator não deve importar nada de `apps/api`/persistência, e vice-versa. Unificá-los num só tipo acoplaria o motor procedural ao schema de persistência.

### 2.2 `EquipmentSlotDefinition` (9 sockets, incluindo `ring1`/`ring2`)
`packages/shared/src/equipment/slots.ts` define 9 **sockets de equipamento** (onde no corpo do personagem um item fica), não 9 categorias de item. `ring1` e `ring2` são dois sockets separados que aceitam a mesma categoria (`acceptsItemSlot: "ring"`) — é isso que permite ao personagem usar **dois anéis ao mesmo tempo**. Colapsar `ring1`/`ring2` num único `"ring"` removeria essa mecânica (equipar o 2º anel substituiria a exibição do 1º) — mudança de comportamento, proibida pelo escopo desta Sprint. Nome oficial de "socket de equipamento": `EquipmentSlotDefinition.id`. Nome oficial de "categoria de item": `ItemSlot`/`ItemGenSlot`. São dois conceitos, cada um com seu nome.

### 2.3 `ItemRarity` (5 tiers) × `ItemGenRarityId` (4 tiers)
`ItemRarity` (persistência/API): `common, uncommon, rare, epic, legendary`. `ItemGenRarityId` (Item Generator): `common, magic, rare, unique`. Cardinalidade diferente **é** a diferença de significado — cada raridade procedural carrega sua própria matemática de drop/afixo. `RARITY_TO_PERSISTED` (`useAdventureSession.ts`) já faz essa tradução na fronteira de persistência, tipado como `Record<ItemGenRarityId, ItemRarity>` (exaustivo). Forçar um nome/enum único mudaria a fórmula de raridade do Item Generator — fora de escopo (itemgen é intocável nesta Sprint).

### 2.4 `CreatureRarity` (bestiário)
`apps/web/src/lib/bestiary.ts` — 5 tiers em português (`comum, incomum, raro, muito-raro, lendaria`), puramente cosmético (o próprio código documenta: nenhuma regra de Combat/Drop lê este campo). Parece um sinônimo de `ItemRarity` por ter a mesma cardinalidade e nomes parecidos, mas é um eixo completamente diferente (flavor de criatura no bestiário, não raridade de item). Mantido separado.

### 2.5 `ExpeditionApproach` × `ExpeditionChoiceOption`
Ambos têm os literais idênticos `"investigate" | "continue"`, mas `ExpeditionChoiceOption` (`apps/web/src/lib/expeditionChoice.ts`) é uma decisão cosmética client-side ("decisão real ou percebida"), deliberadamente desacoplada de `ExpeditionApproach` (shared/API) para que uma feature de UI nunca vire, sem querer, um contrato de backend. A coincidência de valores é acidental; o desacoplamento é intencional.

### 2.6 `EncounterCategory` × `WorldEventCategory` × `ExplorationEventCategory`
Três sistemas genuinamente diferentes que respondem à mesma pergunta em português ("que tipo de coisa está acontecendo?"): encontro de uma expedição (`EncounterCategory`, 8 valores PT), evento diário do reino (`WorldEventCategory`, 9 valores PT) e evento dinâmico de exploração (`ExplorationEventCategory`, 5 valores EN). Cada um já é comentado no código como "sistema completamente diferente e intocado". Não são duplicação — são três sistemas paralelos com nomenclatura por acaso parecida. A mistura PT/EN entre eles é um risco de legibilidade (não de comportamento) a observar numa Sprint futura de UX de código, não nesta.

### 2.7 Espelhamento `apps/api/src/engine/types.ts` × `packages/shared/src/types.ts`
`engine/types.ts` redefine, byte a byte, `EncounterCategory`, `ExpeditionStatus`, `ExpeditionApproach` e `KingdomRoleSlug` em vez de importar de `packages/shared`. Comentário no próprio arquivo explica a razão: `engine/types.ts` não pode depender de nenhum pacote externo (isolamento arquitetural deliberado, provavelmente para permitir o engine rodar/ser testado sem o resto do monorepo). **Isto não é nomenclatura divergente — é um tipo espelhado por decisão de arquitetura.** O risco real não é o nome, é a manutenção manual da sincronia (nada impede as duas definições de divergirem se uma for editada sem a outra); resolver isso significaria mudar a decisão de isolamento do engine, fora do escopo "só nomenclatura" desta Sprint. Registrado aqui como risco de drift conhecido, não como bug.

---

## 3. Regras para futuras contribuições

1. **Antes de criar um novo enum/union parecido com um já existente, procure aqui primeiro.** Se o conceito já existe com outro nome, reaproveite — não crie um terceiro sinônimo.
2. **Se dois tipos parecem duplicados mas representam camadas diferentes** (motor vs persistência, socket vs categoria, sistema A vs sistema B), documente a distinção aqui em vez de forçar unificação. Unificação sem necessidade real é o próprio problema que esta Sprint corrigiu.
3. **Toda tabela de tradução entre vocabulários (`X_TO_Y`) deve ser tipada como `Record<TipoOrigem, TipoDestino>` exaustivo**, nunca `Record<string, string>` — um novo valor no tipo de origem sem tradução correspondente deve quebrar o build, não silenciosamente cair num valor padrão errado (foi exatamente esse tipo de erro silencioso que causou o bug de sincronização Elmo/Peitoral corrigido antes desta Sprint).
4. **Rótulos de exibição (`_LABEL`) e ordens de exibição (`_ORDER`) de um enum compartilhado por múltiplos componentes devem viver em um único módulo** (`apps/web/src/lib/`), nunca copiados por componente.
5. **Nem toda semelhança de nome é duplicação.** Antes de colapsar dois tipos num só, pergunte: unificar isso muda alguma regra de jogo, fórmula de drop, ou mecânica existente? Se a resposta for sim, os dois tipos devem continuar separados e documentados aqui.
