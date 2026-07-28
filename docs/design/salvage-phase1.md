# Salvage — Especificação Inicial (Phase I)

**Status:** 🚧 Preparação — nenhuma funcionalidade de Salvage foi implementada a partir deste documento. Escrito ao final da Sprint "Blacksmith Phase I", que entregou o primeiro consumidor real do lado de DÉBITO do Economy Core (`debitCharacterResourceInTransaction`) e confirmou, na prática, o bloqueio já previsto: **nenhum sistema concede `materials` hoje**. Salvage é a peça que resolve essa lacuna.

Este documento não implementa nada. Define o que significa desmontar um item, quais recursos ele produz, como isso se integra ao Economy Core, o fluxo de transação e os eventos — para que a Sprint futura de Salvage comece direto na implementação.

## 0. O que já existe (herdado de Economy Core + Merchant + Blacksmith, não repetido aqui)

- `ResourceId` já inclui `"materials"` desde Economy Core Phase I — nunca creditado por ninguém até hoje.
- `creditCharacterResourceInTransaction()`/`debitCharacterResourceInTransaction()` — ambos já existem e já têm consumidor real (Merchant credita `gold`, Blacksmith debita `gold`). Salvage seria o primeiro a **creditar `materials`**.
- Padrão de composição de transação atômica (débito/crédito + outra escrita, tudo em uma única `BEGIN`/`COMMIT`) — ADR-0001, provado três vezes (Merchant, Blacksmith).
- `InventoryItem`/`EquippedItem` já expõem `rarity`, `min_level`, `power_score`, `upgrade_level` (Blacksmith Phase I) — o vocabulário de entrada que uma fórmula de "quantos materiais este item vale" precisaria.
- `removeItem()` (`apps/api/src/services/drop.service.ts`, Merchant Phase I) já remove um item da mochila atomicamente — Salvage reaproveita, não duplica.
- Papel do Ferreiro já prevê "reforjas" além de "melhorias" (`docs/design/city-foundation-phase1.md`) — Salvage é o sistema de origem que um dia alimentaria custo-em-materiais para reforjas, se essa mecânica avançar.

## 1. Auditoria — O Bloqueio Real

Diferente de Merchant (Ouro já tinha fluxo natural) e Blacksmith (só precisou expor `power_score`/criar `upgrade_level`), Salvage começa de um vocabulário que **não existe ainda**: não há noção de "quantos materiais um item vale" em lugar nenhum do código. Duas perguntas precisam de resposta antes de qualquer implementação:

1. **Materiais são um recurso único ou vários?** `ResourceId` hoje trata `"materials"` como um único saldo (mesmo modelo simples de `gold`). Se o jogo eventualmente quiser "Ferro", "Couro", "Essência" como recursos distintos, isso é uma mudança de `ResourceId` (`packages/shared/src/economy/types.ts`), não uma decisão de Salvage sozinho — fora de escopo de uma Sprint "Phase I". **Recomendação desta preparação**: Salvage Phase I usa o único `"materials"` já existente, sem fracionar por tipo. Fracionar fica para quando Crafting (próximo item do roadmap) provar que precisa de tipos distintos.
2. **Todo item pode ser desmontado, ou só os procedurais (com `power_score`)?** Mesma pergunta que Blacksmith já respondeu para "melhoria": itens do catálogo fixo (`power_score: null`) não têm um "valor de forja" natural. **Recomendação**: mesma regra de elegibilidade do Blacksmith — só itens com `power_score` não-nulo podem ser desmontados nesta fase.

**Nenhum bloqueio de schema além disso** — `character_resources`/`resource_transactions` (Economy Core Phase I) já suportam `materials` sem qualquer alteração; a única coisa que falta é um caminho de código que credite esse `ResourceId`.

## 2. Desmontagem de Equipamento (Salvage)

**O que significa "desmontar" um item, concretamente**: remover um item da mochila (equipado ou não — diferente de Blacksmith, não há razão para restringir Salvage a itens equipados, já que desmontar um item é, por definição, abrir mão dele) em troca de uma quantidade de `materials`, calculada a partir de `rarity`/`upgrade_level`/`power_score`.

Uma função pura `calculateSalvageYield(item)` (`packages/shared/src/equipment/`, mesmo diretório de `upgrade.ts` — mesma disciplina: só rarity/upgrade_level/power_score como entrada, sem I/O) decide quantos materiais o item rende. Itens já melhorados pelo Ferreiro (`upgrade_level > 0`) deveriam render mais materiais que a base — desmontar um item investido não deveria ser estritamente pior que desmontar um item bruto, senão o jogador nunca teria motivo para desmontar um item já melhorado (mesmo cuidado de "nenhum incentivo perverso" já aplicado em Merchant/Blacksmith).

## 3. Regra Econômica (mesma disciplina de Merchant/Blacksmith)

Nenhuma fórmula de preço em Ouro aqui — Salvage nunca cobra nem paga Ouro, só concede `materials`. A única invariante a decidir na Sprint futura: `calculateSalvageYield` deveria estar numa faixa consistente com `calculateSaleValue` (não pode ser estritamente melhor "desmontar e nunca poder vender" vs. "vender por Ouro" — mas como são dois recursos diferentes (`gold` vs. `materials`), essa comparação só faz sentido de verdade quando existir um sistema (Crafting) que gasta `materials`; até lá, a régua é mais frouxa que a de Blacksmith.

## 4. Integração com o Economy Core

- **Crédito de materials**: `creditCharacterResourceInTransaction()` já existe, nunca usado para `"materials"` — Salvage é o primeiro consumidor real.
- **Transação combinada**: creditar materials + remover o item precisam ser atômicos (mesmo padrão de Merchant/Blacksmith — ADR-0001). `removeItem()` já existe e já é reaproveitável sem alteração.
- **Nenhuma regra de salvage vive no Ledger** — o Ledger só sabe creditar `materials`; a regra "quantos materiais este item rende" vive no Salvage Service (`apps/api/src/services/salvage.service.ts`, mesma forma de `merchant.service.ts`/`blacksmith.service.ts`).

## 5. Fluxo de Transações

```
Player escolhe "Desmontar" num item da mochila (equipado ou não)
     ↓
Salvage Service: valida posse/elegibilidade do item (power_score != null), calcula rendimento
     ↓
BEGIN
     ↓
creditCharacterResourceInTransaction(characterId, "materials", rendimento, "salvage:dismantle", `item:${itemId}`)
     ↓
removeItem(characterId, characterItemId)
     ↓
COMMIT
     ↓
Resposta: materiais concedidos + novo saldo de materials
     ↓
Personagem/Mochila atualizam (mesmo padrão de refresh — reaproveitar refreshCharacter/refreshItems,
nunca duplicar estado)
```

## 6. Eventos

Uma desmontagem bem-sucedida emite `ResourceGranted` (já existe desde Economy Core Phase I, `resourceId: "materials"`, `origin: "salvage:dismantle"`) — nenhum evento novo necessário no Economy Core. Mesmo padrão de Merchant/Blacksmith.

## 7. Atualização da Mochila

Mesma disciplina de Merchant Phase I: o item desmontado desaparece da mochila (mesmo mecanismo de `removeItem()`, já usado pelo Merchant) — nenhuma mudança de arquitetura. Diferente de Blacksmith (que atualiza um item existente), Salvage remove — o fluxo de atualização de estado é, na prática, mais simples que o do Ferreiro.

## 8. Critérios de Rollback

Idêntico a Merchant/Blacksmith: se o crédito for rejeitado por qualquer razão (nenhuma esperada hoje — crédito de recurso sempre aceita, diferente de débito — mas o Ledger genérico ainda valida quantidade), a remoção do item NUNCA acontece. Se a remoção falhar depois do crédito já decidido, a mesma transação SQL desfaz o crédito.

## 9. Decisões em Aberto (para a Sprint Salvage decidir)

- **Materiais únicos vs. tipados**: adiado (Seção 1) — usar o `ResourceId` `"materials"` único já existente; fracionar por tipo só quando Crafting provar necessidade.
- **Elegibilidade**: só itens com `power_score` não-nulo (mesma regra do Blacksmith) — decisão de design a confirmar, não de arquitetura.
- **Escopo equipado vs. mochila inteira**: ao contrário de Blacksmith (só equipados), a recomendação inicial desta preparação é que Salvage cubra a mochila inteira (equipados e não-equipados) — precisa ser confirmado na Sprint, já que desequipar-para-desmontar seria um atrito artificial sem razão de jogo clara.
- **Fórmula de rendimento**: `calculateSalvageYield(item)` — quanto cada raridade/nível de melhoria rende em materials. Decisão de balanceamento, não de arquitetura.
- **O que fazer com `materials` depois**: Salvage Phase I só CONCEDE materials — nenhum sistema ainda GASTA materials (Crafting, no roadmap, viria depois). Até lá, `materials` acumula sem uso, o que é aceitável para uma Sprint "Phase I" (mesmo princípio já usado no projeto: "não inventar consumidor antes de existir produtor", e agora o inverso também vale).

---

*Referências: `docs/design/blacksmith-phase1.md` Seção 10 (implementação real do Blacksmith, o precedente mais próximo — primeiro consumidor de débito, mesma disciplina de elegibilidade por `power_score`); `docs/design/merchant-phase1.md` (precedente de crédito + remoção de item, `removeItem()` reaproveitável direto); `docs/design/economy-core-phase1.md` (arquitetura base, `ResourceId` inclui `materials` desde o início); `docs/roadmap.md` (ordem Merchant → Blacksmith → Salvage → Crafting).*
