# Merchant — Especificação e Implementação (Phase I)

**Status:** ✅ Implementado — Sprint "Merchant Phase I" (venda simples de itens). Seções 0-9 abaixo são a especificação original (escrita ao final de "Economy Core Phase I", antes de qualquer código do Mercador existir) — preservadas como registro histórico. Seção 10 documenta o que foi REALMENTE construído, incluindo onde a implementação seguiu a especificação e onde encontrou algo que a especificação não previa.

Este documento define o fluxo completo da primeira Sprint funcional do Mercador — venda de itens da Mochila por Ouro.

## 0. O que já existe (herdado do Economy Core Phase I, não repetido aqui)

- `ResourceLedger` (`packages/shared/src/economy/ledger.ts`): credita/debita, valida saldo, nunca permite negativo, registra toda transação.
- `requestCredit`/`requestDebit` (`packages/shared/src/economy/transactionLayer.ts`): único caminho de mutação, emite `EconomicEvent` (`ResourceGranted`/`ResourceSpent`/`TransactionFailed`).
- `creditCharacterResource`/`debitCharacterResource` (`apps/api/src/services/economy.service.ts`): persistência atômica (`BEGIN`/`COMMIT`/`ROLLBACK`), gold mapeado para `characters.gold`, demais recursos para `character_resources`, toda transação logada em `resource_transactions`.
- Nenhuma rota HTTP pública expõe essas funções ainda (decisão deliberada do Economy Core — sem consumidor real até agora). O Mercador é o primeiro consumidor real.

## 1. Fluxo de Venda de Itens

```
Jogador clica "Vender" num item da Mochila (Mercador)
     ↓
Frontend chama uma nova rota (ex.: POST /api/merchant/sell)
     ↓
Rota valida: item pertence ao personagem? não está equipado (ou permite vender equipado, decisão de UX a tomar nesta Sprint)?
     ↓
Rota calcula o preço de venda (regra de precificação — Seção "Decisões em aberto")
     ↓
Rota chama creditCharacterResource(characterId, "gold", preco, "merchant:sell", `item:${itemId}`)
     ↓
Se sucesso: remove o item de character_items (ou marca como vendido — decisão de schema desta Sprint)
     ↓
Resposta ao frontend: novo saldo de Ouro + confirmação
     ↓
Mochila atualiza (item sai da lista, saldo de Ouro no HUD atualiza)
     ↓
Cidade pode refletir a venda na próxima mensagem contextual (opcional, ver Seção 6)
```

## 2. Validação de Transações

Antes de chamar `creditCharacterResource`, a rota precisa confirmar (nesta ordem, falhando cedo):

1. **Autenticação**: mesmo padrão de todas as rotas existentes (`requireAuth(ctx)`).
2. **Posse do item**: o `character_item_id` pertence ao `characterId` autenticado — nunca confiar em um id vindo do cliente sem essa checagem (mesma disciplina já usada em `routes/items.ts` para equipar/desequipar).
3. **Item vendável**: existe hoje (decisão de gameplay a tomar) se um item equipado pode ser vendido diretamente, ou se precisa ser desequipado primeiro. Recomendação: exigir desequipar primeiro — reaproveita a rota `unequip` já existente, evita uma segunda lógica de "desequipar ao vender" duplicada.
4. **Preço > 0**: um item com preço calculado como 0 (ou negativo, se a fórmula permitir) deve ser rejeitado ANTES de chamar o Ledger — o Ledger já rejeita `amount <= 0`, mas a rota deveria dar um erro claro ("este item não pode ser vendido") em vez de deixar a rejeição genérica do Ledger vazar pro jogador.

A validação de SALDO (no caso de venda, não há saldo do jogador a validar — só a existência do item) já é responsabilidade do Ledger; a rota não precisa reimplementá-la.

## 3. Integração com o Ledger

A rota de venda **nunca** chama `ledger.credit()` diretamente — sempre `creditCharacterResource()` (`economy.service.ts`), que já encapsula Ledger + persistência atômica. Isso significa:

- **Origem** (`origin`) da transação: `"merchant:sell"` — permite auditoria futura de "quanto Ouro veio de vendas" separado de "quanto veio de loot de expedição".
- **Destino** (`destination`) da transação: `` `item:${itemId}` `` ou `` `character:${characterId}` `` — a decisão exata (item vendido vs. personagem que vendeu) é uma escolha de granularidade de auditoria, não uma regra de negócio; recomenda-se `` `item:${itemId}` `` por ser mais específico e não perder informação (o characterId já está na linha via `character_id` da tabela).
- Nenhuma lógica de preço, validação de posse, ou remoção do item vive dentro do Ledger — o Ledger só sabe "creditar X de gold para esta origem/destino". Toda regra de Mercador (preço, quem pode vender o quê) vive na rota/serviço do Mercador, nunca dentro de `packages/shared/src/economy/`.

## 4. Persistência

- O saldo de Ouro já persiste corretamente via `creditCharacterResource(characterId, "gold", ...)` — nenhuma mudança de schema necessária para o lado do Ledger.
- **Nova necessidade desta Sprint**: remover (ou marcar como vendido) o item de `character_items` — isso NÃO é responsabilidade do Economy Core, é uma segunda escrita que a rota de venda precisa fazer, na MESMA transação SQL que credita o Ouro (para que "vendeu o item" e "recebeu o Ouro" sejam atômicos — um nunca deveria acontecer sem o outro). Isso significa a rota de venda precisa envolver, na prática, uma transação que abrange DUAS tabelas de domínios diferentes (`character_items` + o crédito de Ouro) — uma extensão do padrão `BEGIN`/`COMMIT`/`ROLLBACK` já usado em `economy.service.ts`, desta vez orquestrada por uma função de serviço do Mercador que CHAMA a lógica de crédito (não duplica).
- Nenhuma migração de schema é necessária para o Ledger em si — `character_resources`/`resource_transactions` já existem desde o Economy Core Phase I.

## 5. Eventos Emitidos

Uma venda bem-sucedida já emite `ResourceGranted` (evento genérico do Economy Core, `resourceId: "gold"`, `origin: "merchant:sell"`) — nenhum evento novo precisa ser criado no Economy Core para isso. Esta Sprint pode, opcionalmente, definir um evento de MAIS ALTO NÍVEL específico do Mercador (ex.: um evento de apresentação "ItemSold" na Presentation Layer, seguindo o mesmo padrão de `LootDropped`/`ItemEquipped`) SE a Living World/Backpack quiserem narrar a venda depois — mas isso é integração visual, fora do escopo desta preparação (ver Seção 6) e da própria Sprint Merchant nesta primeira fase, conforme o Economy Core já estabeleceu ("não integrar com Living World ainda").

## 6. Atualização da Mochila

Depois de uma venda bem-sucedida, a Mochila (`InventoryPage`/`BackpackNarrativePanel`) precisa refletir dois efeitos:

1. **O item vendido desaparece da lista** — consequência direta de `character_items` ter sido alterado; a tela já rebusca a lista via `GET /api/items` (padrão existente, nenhuma mudança de arquitetura).
2. **Nenhuma mudança nas funções puras de `lib/`** (`backpackFinds.ts`/`backpackSignals.ts`) é necessária SÓ por causa da venda — elas já leem a contagem/lista atual; a mudança é só o dado de entrada (menos um item), não a lógica de derivação.

## 7. Atualização da Cidade

`citySuggestions.ts`/`cityWelcome.ts` (City Foundation Phase I) hoje reagem a `RecentFind[]`/`BackpackSignals` — não a transações econômicas. Uma Sprint futura de narrativa (fora do escopo do Merchant Phase I) poderia estender `buildCitySuggestions` para reagir a "acabei de vender algo" — mas isso é opcional e não bloqueia a venda funcionar. Recomendação: NÃO fazer isso na primeira Sprint funcional do Mercador — entregar a transação primeiro, a narrativa depois, mesma sequência disciplinada já usada em todo o RC1 (função primeiro, narrativa como camada separada).

## 8. Critérios de Rollback

- Se `creditCharacterResource` retornar `result !== "success"` (nunca deveria acontecer numa venda com preço > 0 e sem contenção de saldo, mas defensivamente): a rota NÃO remove o item de `character_items` — a remoção só acontece DEPOIS de confirmar sucesso do crédito, dentro da mesma transação SQL.
- Se a remoção do item falhar por algum motivo (erro de banco inesperado) DEPOIS do crédito já ter sido decidido: como ambas as escritas (crédito + remoção) devem estar na MESMA transação SQL (`BEGIN`/`COMMIT`/`ROLLBACK`), uma falha na segunda desfaz a primeira automaticamente — nenhum estado "Ouro creditado mas item ainda na mochila" (ou o inverso) deveria ser possível.
- Critério de aceitação para a Sprint Merchant: um teste que força um erro na escrita de `character_items` (ex.: item_id inválido) e confirma que o saldo de Ouro NÃO mudou — provando que a transação combinada é genuinamente atômica, não só "duas escritas sequenciais que parecem atômicas".

## 9. Decisões em Aberto (para a Sprint Merchant decidir, não esta preparação)

- **Fórmula de preço de venda**: baseada em Power Score? Raridade? Uma tabela fixa por slot? Não é uma decisão de arquitetura — é uma decisão de Economia/Balance, fora do escopo arquitetural do Economy Core e desta preparação.
- **Vender item equipado**: permitir diretamente ou exigir desequipar primeiro (recomendação acima: exigir desequipar).
- **"Vender tudo" em lote**: se a primeira versão do Mercador oferece só venda unitária ou também em lote — afeta se a transação combinada (Seção 4) precisa suportar N itens numa única chamada atômica ou só 1.

## 10. Implementação Realizada

### 10.1 Fluxo definitivo (o que a Seção 1 previu, confirmado na prática)

```
Player clica "Vender" (MerchantBuilding.tsx)
     ↓
CityPage.handleMerchantSell → POST /api/merchant/sell
     ↓
routes/merchant.ts (autentica, valida shape do body, delega)
     ↓
merchant.service.ts sellItem() — valida posse/existência/não-equipado,
calcula preço (calculateSaleValue), abre BEGIN
     ↓
creditCharacterResourceInTransaction() (economy.service.ts) → Ledger
decide, credita characters.gold, registra resource_transactions
     ↓
removeItem() (drop.service.ts) — remove de character_items
     ↓
COMMIT (ou ROLLBACK se qualquer etapa falhar)
     ↓
Resposta → CityPage chama refreshItems()+refreshCharacter() (reaproveita
useCharacter/estado já existentes, sem recarregar a página)
     ↓
Mochila/Backpack/Merchant/Gold atualizam no mesmo ciclo de render
```

Idêntico ao previsto na Seção 1, com um refinamento real: "Frontend chama uma nova rota" tornou-se, na prática, `CityPage.tsx` chamando a rota (não `MerchantBuilding.tsx` diretamente) — o componente do prédio só recebe `offers`/`onSell` prontos via props, nunca fala com a API sozinho (mesmo padrão de prop-drilling que `citySuggestions`/`cityWelcome` já usavam desde City Foundation Phase I).

### 10.2 Funções criadas

- `calculateSaleValue(item)` (`packages/shared/src/economy/saleValue.ts`) — pura, `BASE_VALUE_BY_RARITY` + `min_level * 2`. Único lugar que decide preço.
- `creditCharacterResourceInTransaction()` (`apps/api/src/services/economy.service.ts`) — variante de `creditCharacterResource()` sem `BEGIN`/`COMMIT` próprios, pra ser combinada numa transação externa (ver ADR-0001, achado real da Fase 1: SQLite não aceita `BEGIN` aninhado).
- `removeItem()` (`apps/api/src/services/drop.service.ts`) — remove um item de `character_items`, mesmo sistema de inventário de sempre.
- `sellItem()` (`apps/api/src/services/merchant.service.ts`) — orquestrador único da venda completa.
- `buildMerchantOffers()` (`apps/web/src/lib/merchantOffers.ts`) — deriva a lista de ofertas (item + preview de preço) a partir do inventário, filtrando equipados.

### 10.3 Arquivos alterados (resumo — ver relatório da Sprint para a lista com responsabilidades completas)

`packages/shared/src/economy/{saleValue.ts,index.ts}`; `apps/api/src/{config/database.ts,server.ts,routes/merchant.ts,services/{economy.service.ts,drop.service.ts,merchant.service.ts}}`; `apps/web/src/{lib/merchantOffers.ts,components/city/MerchantBuilding.tsx,pages/CityPage.tsx,styles.css}`; `docs/architecture/adr/{README.md,0001-economy-service-transaction-composition.md}`.

### 10.4 Limitações confirmadas na prática

- **`grantAdventureLoot()` hardcoda `min_level = 1`** para todo item de Aventura (`drop.service.ts`, pré-existente, fora de escopo) — o multiplicador de nível de `calculateSaleValue` nunca varia hoje para itens encontrados jogando; só a raridade influencia o preço na prática. Achado durante a Fase 9 (testes), documentado, não corrigido (fora do escopo desta Sprint).
- **Item procedural vendido deixa uma linha órfã em `items`** (o catálogo) — cada item de Aventura já é uma linha única (`grantAdventureLoot`), e `removeItem()` só apaga `character_items`, nunca `items` (a FK é `ON DELETE RESTRICT`). Dado morto, inofensivo, cresce com o tempo — oportunidade de limpeza futura (job periódico ou `ON DELETE CASCADE` reavaliado), não urgente.
- **`node:sqlite` sem `busy_timeout` causava "database is locked"** sob escrita concorrente real (achado ao rodar a suíte completa de testes, dois processos escrevendo no mesmo arquivo) — corrigido com `PRAGMA busy_timeout = 5000` em `database.ts` (Fase 1/9), uma correção de robustez real, não só de ambiente de teste: o mesmo cenário aconteceria em produção com duas vendas genuinamente simultâneas.

### 10.5 Decisões arquitetônicas tomadas (resolvendo a Seção 9 "Decisões em Aberto")

- **Fórmula de preço**: rarity + min_level (Seção 10.4 acima nota que min_level é hoje sempre 1) — decisão de Economia simples, documentada em `saleValue.ts`, revisável sem tocar arquitetura.
- **Vender item equipado**: bloqueado (`reason: "item-equipped"`) — precisa desequipar primeiro, reaproveitando a rota `unequip` já existente. Confirma a recomendação da Seção 2.
- **Venda em lote**: NÃO implementada — só venda unitária, conforme escopo desta Sprint ("Não implementar: Barganha, Desconto..." e "Somente venda simples").
- **Nested transaction**: registrado formalmente em ADR-0001 (`docs/architecture/adr/0001-economy-service-transaction-composition.md`) — a única decisão desta Sprint que exigiu um ADR novo.

---

*Referências: `docs/design/economy-core-phase1.md` (arquitetura que este documento assume pronta), `docs/architecture/decisions.md` D2/D3/D5/D8 (React nunca decide preço/transação; toda regra de negócio do Mercador vive em `apps/api`, nunca em `packages/shared/src/economy`), `docs/design/backpack-experience-plan.md` e `docs/design/city-foundation-phase1.md` (papéis já documentados do Mercador/Mochila/Cidade), ADR-0001 (composição de transações).*
