# Merchant — Especificação Inicial (Phase I)

**Status:** 🚧 Preparação — nenhuma funcionalidade de Mercador foi implementada a partir deste documento. Escrito ao final da Sprint "Economy Core Phase I", que entregou a infraestrutura real que esta especificação assume como já existente: `ResourceLedger`/`requestCredit`/`requestDebit`/`EconomicEvent` (`packages/shared/src/economy/`) e a persistência atômica (`apps/api/src/services/economy.service.ts`, tabelas `character_resources`/`resource_transactions`, gold ainda em `characters.gold`).

Este documento não implementa nada. Define o fluxo completo da primeira Sprint funcional do Mercador — venda de itens da Mochila por Ouro — para que essa Sprint futura comece direto na implementação.

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

---

*Referências: `docs/design/economy-core-phase1.md` (arquitetura que este documento assume pronta), `docs/architecture/decisions.md` D2/D3/D5/D8 (React nunca decide preço/transação; toda regra de negócio do Mercador vive em `apps/api`, nunca em `packages/shared/src/economy`), `docs/design/backpack-experience-plan.md` e `docs/design/city-foundation-phase1.md` (papéis já documentados do Mercador/Mochila/Cidade).*
