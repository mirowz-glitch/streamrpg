# ADR-0001: Composição de transações no Economy Service

## Contexto

Durante a Fase 1 (Auditoria) da Sprint "Merchant Phase I", ao desenhar o Merchant Service (`apps/api/src/services/merchant.service.ts`), foi identificado um conflito real: uma venda precisa combinar DUAS escritas — creditar Ouro (`economy.service.ts`) e remover o item vendido (`drop.service.ts`) — numa única transação SQL atômica (Fase 4 da Sprint: "caso qualquer etapa falhe, toda a operação deverá ser cancelada").

A função pública existente, `creditCharacterResource()` (Economy Core Phase I), já abre e fecha sua própria transação (`db.exec("BEGIN")`/`COMMIT`/`ROLLBACK`) internamente. SQLite não suporta `BEGIN` aninhado sem `SAVEPOINT` — chamar `creditCharacterResource()` de dentro de uma transação já aberta pelo Merchant Service falharia com um erro de transação aninhada.

## Decisão

`economy.service.ts` foi refatorado para separar o NÚCLEO da lógica (ler saldo → decidir via Ledger → gravar saldo → registrar transação, função privada `performTransaction()`, sem `BEGIN`/`COMMIT` próprios) da CASCA que abre/fecha a transação (`runAtomicTransaction()`, usada pelas funções públicas já existentes `creditCharacterResource()`/`debitCharacterResource()` — comportamento externo idêntico, nenhum teste existente precisou mudar).

Uma nova função pública, `creditCharacterResourceInTransaction()`, expõe o núcleo diretamente — para chamadores (como o Merchant Service) que já gerenciam sua própria transação e precisam combinar este crédito com outra escrita atomicamente.

## Status

Aceito.

## Consequências

**Positivas**: qualquer Sprint futura que precise combinar uma alteração de saldo com outra escrita (Blacksmith: cobrar Ouro + aplicar upgrade; Salvage: creditar materiais + remover múltiplos itens) tem, desde já, o padrão certo pra seguir — usar a variante `*InTransaction`, nunca abrir uma segunda transação aninhada. Nenhuma lógica foi duplicada: o núcleo (`performTransaction`) é a única implementação, usado pelas duas variantes públicas.

**Negativas**: a API de `economy.service.ts` cresce de 2 para 3 funções públicas de escrita (`creditCharacterResource`, `debitCharacterResource`, `creditCharacterResourceInTransaction`) — uma superfície um pouco maior para quem lê o módulo pela primeira vez. Mitigado por documentação explícita no código apontando para este ADR. Uma variante `debitCharacterResourceInTransaction` não foi criada ainda (YAGNI — nenhum chamador precisa dela nesta Sprint); deve ser adicionada seguindo o MESMO padrão quando um chamador real precisar (ex.: uma Sprint futura de compra, que debita Ouro do jogador).

## Referências

- `docs/architecture/rfc-process.md` / `docs/architecture/adr-template.md` (o processo que este ADR segue).
- `apps/api/src/services/economy.service.ts` (implementação).
- `apps/api/src/services/merchant.service.ts` (o primeiro consumidor real de `creditCharacterResourceInTransaction`).
- `docs/design/merchant-phase1.md` Seção 4 (o requisito de atomicidade combinada que motivou esta decisão).
