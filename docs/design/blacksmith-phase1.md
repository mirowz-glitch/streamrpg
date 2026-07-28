# Blacksmith — Especificação Inicial (Phase I)

**Status:** 🚧 Preparação — nenhuma funcionalidade de Ferreiro foi implementada a partir deste documento. Escrito ao final da Sprint "Merchant Phase I", que entregou o primeiro consumidor real do Economy Core (venda/crédito) e provou o padrão de composição de transação atômica (ADR-0001). O Ferreiro é o consumidor natural seguinte — o primeiro a usar o lado de DÉBITO do Economy Core (`debitCharacterResource`, existente desde Economy Core Phase I, nunca chamado por ninguém até hoje).

Este documento não implementa nada. Define reparo, melhoria de equipamento, custos, integração com o Economy Core, fluxo de transações e eventos — para que a Sprint futura do Ferreiro comece direto na implementação.

## 0. O que já existe (herdado de Economy Core + Merchant Phase I, não repetido aqui)

- `debitCharacterResource()`/`creditCharacterResourceInTransaction()`/(uma futura `debitCharacterResourceInTransaction()`, ver Seção 5) — `apps/api/src/services/economy.service.ts`.
- Padrão de composição de transação atômica combinada (débito + outra escrita) — ADR-0001 (`docs/architecture/adr/0001-economy-service-transaction-composition.md`), já provado funcionando pelo Merchant Service.
- `calculateSaleValue()` (`packages/shared/src/economy/saleValue.ts`) — não reutilizável diretamente para custo de forja (é "quanto vale vender", não "quanto custa melhorar"), mas o PADRÃO (função pura, só rarity/min_level, sem I/O) deve ser espelhado por uma função equivalente de custo (Seção 2).
- Papel já comunicado ao jogador desde City Foundation Phase I: `BlacksmithBuilding.tsx` — "Responsável por: melhorias; reforjas; equipamentos." (`docs/design/city-foundation-phase1.md` Seção 3).
- `ResourceId` já inclui `"materials"` (Economy Core Phase I) — mas **nenhum sistema concede materiais hoje** (achado da Fase 1 abaixo).

## 1. Auditoria — Bloqueios Reais Encontrados

Diferente de Merchant Phase I (onde o Ledger de crédito já tinha um fluxo natural — vender item por Ouro), o Ferreiro expõe DUAS lacunas reais que precisam de decisão antes da implementação:

1. **Sem sistema de durabilidade/dano em item**: `InventoryItem` (`packages/shared/src/types.ts`) não tem nenhum campo de "estado" (durabilidade, dano acumulado, uso). "Reparo" (Seção 2) não tem, hoje, nenhum ESTADO real pra reparar — é uma mecânica que precisaria ser inventada do zero, não uma que já existe esperando ser exposta (diferente de Power Score, que existe na coluna `items.power_score` mas não é exposto pela API).
2. **Nenhuma fonte de "materials"**: o `ResourceId` existe desde Economy Core Phase I, mas nenhuma rota/serviço jamais credita `materials` a um personagem — não há Salvage, não há drop de material na Aventura. Se o Ferreiro cobrar em materiais (além de Ouro), a Sprint do Ferreiro precisa OU esperar Salvage existir primeiro, OU (mais provável, dado o roadmap — `docs/roadmap.md` já ordena Salvage depois de Blacksmith) cobrar só em Ouro nesta primeira fase, deixando custo-em-materiais para quando Salvage entregar a fonte.

**Recomendação desta preparação**: Blacksmith Phase I cobra EXCLUSIVAMENTE em Ouro, e implementa MELHORIA (upgrade de Power Score), não REPARO (que exigiria inventar um sistema de durabilidade inteiro, fora de escopo de uma Sprint "Phase I"). Reparo fica para uma Sprint futura, só depois de existir uma razão de jogo real pra ele (nenhuma evidência hoje de que o jogo precisa de durabilidade — mesmo princípio já usado no projeto: "não inventar sistema sem evidência").

## 2. Melhoria de Equipamento (Upgrade)

**O que significa "melhorar" um item, concretamente**: aumentar o Power Score de um item já equipado, em troca de Ouro. Como `power_score` já existe na coluna `items.power_score` (banco) mas não é exposto por `InventoryItem`/`mapInventoryRow` (`apps/api/src/services/drop.service.ts`) — **primeira mudança real que a Sprint do Ferreiro precisa fazer**: expor `power_score` em `InventoryItem` (aditivo, não quebra nenhum consumidor existente, mesmo padrão já usado quando `damage_type`/`uti_bonus` foram expostos numa Sprint anterior).

Uma função pura equivalente a `calculateSaleValue`, ex. `calculateUpgradeCost(item)` (`packages/shared/src/economy/`), decide quanto custa aumentar o Power Score em um incremento fixo (ex.: +5) — mesma disciplina: só rarity/level/power_score como entrada, sem banco/React/API.

## 3. Custos

Só Ouro nesta fase (ver Seção 1, bloqueio de materiais). Uma tabela de custo por raridade (espelhando `BASE_VALUE_BY_RARITY` de `saleValue.ts`) é a forma mais simples e consistente — mas DEVE ser mais cara que o valor de venda do mesmo item (senão "vender e comprar de novo" seria mais barato que "melhorar", um incentivo econômico perverso a evitar). Regra concreta a decidir na Sprint: `custo_melhoria > calculateSaleValue(item)` para qualquer raridade/nível, verificável por teste.

## 4. Integração com o Economy Core

- **Débito de Ouro**: `debitCharacterResource()` já existe (Economy Core Phase I), nunca usado — o Ferreiro é o primeiro consumidor real do lado de gasto. Mesmo já validado pelo Ledger (nunca permite saldo negativo, rejeita quantidade inválida).
- **Transação combinada**: debitar Ouro + atualizar `items.power_score` do item melhorado precisam ser atômicos (mesmo padrão do Merchant — ADR-0001). Isso exige criar `debitCharacterResourceInTransaction()` em `economy.service.ts`, espelhando `creditCharacterResourceInTransaction()` exatamente (mesmo `performTransaction()` interno já reutilizável — só falta expor a variante de débito, zero lógica nova).
- **Nenhuma regra de upgrade vive no Ledger** — o Ledger só sabe debitar Ouro; a regra "quanto o Power Score sobe" vive no Blacksmith Service (`apps/api/src/services/blacksmith.service.ts`, mesma forma de `merchant.service.ts`).

## 5. Fluxo de Transações

```
Player clica "Melhorar" num item equipado (Ferreiro)
     ↓
Blacksmith Service: valida posse/estado do item, calcula custo
     ↓
BEGIN
     ↓
debitCharacterResourceInTransaction(characterId, "gold", custo, "blacksmith:upgrade", `item:${itemId}`)
     ↓
Se rejeitado (saldo insuficiente): ROLLBACK, devolve erro claro ("Ouro insuficiente")
     ↓
Se aceito: UPDATE items SET power_score = power_score + incremento WHERE id = ?
     ↓
COMMIT
     ↓
Resposta: novo Power Score + novo saldo de Ouro
     ↓
Personagem/Mochila/Ferreiro atualizam (mesmo padrão de refresh do Merchant — reaproveitar
useCharacter/refreshItems, nunca duplicar estado)
```

## 6. Eventos

Uma melhoria bem-sucedida emite `ResourceSpent` (já existe desde Economy Core Phase I, `resourceId: "gold"`, `origin: "blacksmith:upgrade"`) — nenhum evento novo necessário no Economy Core. Saldo insuficiente emite `TransactionFailed`, mesmo padrão do Merchant.

## 7. Atualização da Mochila e da Cidade

Mesma disciplina do Merchant Phase I Seção 6/7: a Mochila precisa refletir o novo Power Score do item melhorado (rebusca `/api/items`, nenhuma mudança de arquitetura); a Cidade PODE reagir a "acabei de melhorar um item" numa Sprint narrativa futura, mas não é requisito desta fase — função primeiro, narrativa depois.

## 8. Critérios de Rollback

Idêntico ao Merchant Phase I Seção 8: se o débito for rejeitado (saldo insuficiente), a atualização de `power_score` NUNCA acontece (validação antes de mutar). Se a escrita de `power_score` falhar depois do débito já decidido, a mesma transação SQL (`BEGIN`/`COMMIT`/`ROLLBACK`) desfaz o débito — mesmo mecanismo já testado no Merchant (`merchant.service.test.ts`, teste "mecanismo de rollback").

## 9. Decisões em Aberto (para a Sprint Blacksmith decidir)

- **Reparo**: adiado (Seção 1) — precisa de um sistema de durabilidade que não existe. Não é uma decisão de arquitetura desta preparação, é uma decisão de design de jogo ainda sem evidência de necessidade.
- **Materiais como custo adicional**: bloqueado até Salvage existir (Seção 1). Blacksmith Phase I cobra só em Ouro.
- **Limite de melhorias por item**: um item pode ser melhorado infinitamente, ou há um teto (ex.: +50% do Power Score original)? Decisão de balanceamento, não de arquitetura — mas precisa existir alguma resposta antes de expor a mecânica, para evitar inflação de poder sem limite (risco já identificado na cultura deste projeto: "sem explosão de poder").
- **Reforja vs. melhoria incremental**: "reforjar" (rerrolar afixos, como o Item Generator já faz na geração original) é uma mecânica MUITO mais complexa que "aumentar Power Score em +N" — Blacksmith Phase I deveria implementar só o incremento simples; reforja fica para uma Fase II do Ferreiro, se o playtest indicar que só "melhorar" não é suficiente.

---

*Referências: `docs/design/merchant-phase1.md` Seção 10 (implementação real do Merchant, o precedente direto — mesmo padrão de composição de transação, ADR-0001); `docs/design/economy-core-phase1.md` (arquitetura base); `docs/design/gold-architecture-phase1.md` Seção 5 (tabela original que já previa "Ferreiro: Reforjar/upgrade → Ouro + possivelmente materiais"); `docs/design/city-foundation-phase1.md` (papel do Ferreiro já comunicado); `docs/roadmap.md` (ordem Merchant → Blacksmith → Salvage → Crafting).*
