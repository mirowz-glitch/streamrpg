# Equipment Locking & Concurrency — Phase I

**Status:** ✅ Implementado, testado e validado em navegador. Infraestrutura preventiva — nenhuma funcionalidade nova exposta ao jogador.

## 1. Auditoria — Todos os Pontos de Escrita em Equipamento

Levantamento completo (Fase 1) de cada função/rota que muta `equipped_items`/`character_items`/`items.power_score`/`items.upgrade_level`. Confirmado: **toda mutação de equipamento no projeto passa por exatamente 5 funções em `apps/api/src/services/drop.service.ts`** — nenhum outro arquivo escreve SQL diretamente nessas tabelas.

| Função (drop.service.ts) | Escrita | Chamada por |
|---|---|---|
| `grantAdventureLoot()` | INSERT em `items`+`character_items` | `POST /api/items/loot` (routes/items.ts) |
| `equipItem()` | DELETE+INSERT em `equipped_items` | `POST /api/items/loot` (com `autoEquip:true`), `POST /api/items/equip`, `FirstItemQuestSystem.ts` |
| `unequipItem()` | DELETE em `equipped_items` | `POST /api/items/unequip` |
| `removeItem()` | DELETE em `character_items`+`equipped_items` | `merchant.service.ts::sellItem()` |
| `applyItemUpgrade()` | UPDATE em `items.power_score`/`upgrade_level` | `blacksmith.service.ts::upgradeItem()` |

**Consumidores identificados** (os 4 pedidos na auditoria):
- **AutoEquip**: `POST /api/items/loot` com `autoEquip:true` (disparado por `apps/web/src/hooks/useAdventureSession.ts` a cada loot relevante da Aventura idle) → `grantAdventureLoot()` + `equipItem()`.
- **Merchant**: `merchant.service.ts::sellItem()` → `removeItem()`, dentro de uma transação SQL combinada com o crédito de Ouro (ADR-0001).
- **Blacksmith**: `blacksmith.service.ts::upgradeItem()` → `applyItemUpgrade()`, dentro de uma transação SQL combinada com o débito de Ouro.
- **Drop Service**: a camada compartilhada acima — não é um "consumidor" próprio, é o ponto único de persistência que todos os outros reaproveitam (nenhuma lógica duplicada).
- **Equip Service**: não existe como arquivo separado — `equipItem()`/`unequipItem()` já vivem em `drop.service.ts` e são expostos via `routes/items.ts`.
- **Adventure Rewards**: `FirstItemQuestSystem.ts` (concessão única do item inicial) é o único ponto que usa um caminho de repositório diferente (`SQLiteItemRepository.grantToCharacter()`) antes de chamar o MESMO `equipItem()` — confirmado, nenhuma duplicação de lógica de equipar.

### 1.1 Achado arquitetural (honesto, antes de implementar)

Diferente de Merchant/Blacksmith (onde a auditoria revelou uma lacuna real de schema), esta auditoria revela algo diferente: **hoje, dentro deste processo único, nenhuma operação de escrita pode realmente intercalar no meio de outra.** Dois fatos combinados garantem isso:

1. `node:sqlite`'s `DatabaseSync` é síncrono — nenhuma chamada ao banco cede o event loop.
2. Todas as funções "async" dos repositórios legados (`SQLiteCharacterRepository`, `SQLiteItemRepository`) só envolvem chamadas síncronas — resolvem via microtask, e o Node esvazia toda a fila de microtasks antes de processar a próxima requisição HTTP enfileirada. Ou seja: mesmo uma cadeia de `await`s encadeados (como em `FirstItemQuestSystem.ts`) roda do início ao fim, atomicamente, antes que QUALQUER outra requisição consiga avançar.

**Confirmado empiricamente na Fase 5** (Browser Validation): duas requisições `POST /api/blacksmith/upgrade` disparadas quase simultaneamente contra o MESMO item sempre serializam por completo — uma termina 100% antes da outra sequer começar a mutar o banco. Nunca houve, e não há hoje, uma janela de corrida real.

**Por que implementar o Lock mesmo assim** (motivo desta Sprint, não uma correção de bug):
1. Documenta explicitamente qual item está "em uso" por uma operação crítica, em vez de depender de um invariante implícito que ninguém escreveu (o mesmo raciocínio "síncrono = seguro" já vivia só em comentários espalhados em `economy.service.ts`).
2. Protege qualquer consumidor FUTURO (Salvage, Crafting) que introduza uma escrita genuinamente assíncrona no meio do fluxo (ex.: uma validação externa) — o dia em que isso acontecer, a ausência de um Lock explícito seria uma regressão silenciosa.
3. Dá uma API única e testável que qualquer novo consumidor reaproveita, sem precisar re-derivar esse raciocínio sobre event loop.
4. Limite conhecido, documentado desde já (mesmo texto já usado em `SessionManager.ts`): é um Map em memória, válido só para processo único — se a API escalar para múltiplas réplicas, precisaria virar uma implementação distribuída (Redis) sem mudar a interface pública.

## 2. Arquitetura do Equipment Lock

```
packages/shared/src/equipment/lock.ts   (puro, sem I/O, testável isolado)
  ├─ EquipmentLockManager: Map<characterItemId, {owner, acquiredAt}>
  │    ├─ tryAcquire(id, owner) → boolean
  │    ├─ release(id, owner) → void (só libera se owner bater)
  │    ├─ isLocked(id) → boolean (lock expira sozinho após 5s — segurança
  │    │    contra bug de release esquecido, nunca o mecanismo principal)
  │    └─ withLock(id, owner, fn) → executa fn, SEMPRE libera (try/finally)
  └─ EquipmentLockError

apps/api/src/services/equipmentLock.service.ts
  └─ export const equipmentLock = new EquipmentLockManager()   (singleton
       de processo único — mesmo padrão/mesma ressalva de SessionManager.ts)
```

Fluxo por operação (Fase 2, exatamente como pedido):

```
Operação inicia
  ↓
equipmentLock.withLock(characterItemId, owner, () => {
  ↓
  Validação (posse, elegibilidade, saldo)
  ↓
  Transação (BEGIN)
  ↓
  Persistência (débito/crédito + escrita do item)
  ↓
  COMMIT
})
  ↓
Unlock automático (finally — sucesso ou falha, sempre libera)
```

## 3. Integração (Fase 3) — Nenhuma Regra de Negócio Alterada

- **`blacksmith.service.ts::upgradeItem()`**: todo o corpo (validação → débito → `applyItemUpgrade`) agora roda dentro de `equipmentLock.withLock(characterItemId, "blacksmith:upgrade", ...)`. Novo motivo de falha `"item-locked"`, capturado via `catch (EquipmentLockError)` e convertido no mesmo formato `{success:false, reason}` já usado pelos outros motivos.
- **`merchant.service.ts::sellItem()`**: mesmo padrão, `"merchant:sell"` como owner, novo motivo `"item-locked"`.
- **`drop.service.ts::equipItem()`**: agora recebe um parâmetro opcional `operationOwner` (`"autoequip"` vindo de `routes/items.ts`, `"equip"` por padrão para o clique manual). Além de travar o item recebido durante sua própria execução, **verifica se o item ATUALMENTE equipado no slot de destino está travado** — se estiver (ex.: Blacksmith no meio de um upgrade), lança `EquipmentLockError` e a troca é rejeitada. Este é o guard que resolve, de forma explícita e testável, o cenário descrito no Contexto desta Sprint.
- **`routes/items.ts`**: o call site de AutoEquip agora passa `"autoequip"` como owner — nenhuma outra mudança de rota.

Nenhuma fórmula de custo, nenhuma regra de elegibilidade, nenhuma validação de negócio pré-existente foi alterada — o Lock é uma camada estritamente aditiva ao redor do que já existia.

## 4. Testes de Concorrência (Fase 4)

18 testes novos (10 em `packages/shared/src/equipment/lock.test.ts`, puro; 8 em `apps/api/src/services/equipmentLock.service.test.ts`, integração real com SQLite):

- Duas operações concorrentes no mesmo item — a segunda é rejeitada enquanto a primeira segura o lock.
- AutoEquip durante upgrade — `equipItem()` lança `EquipmentLockError` ao tentar substituir um item cujo lock pertence ao Blacksmith; o item original permanece equipado, nenhuma escrita parcial ocorre. Depois de liberado, o mesmo AutoEquip funciona normalmente.
- Tentativa de vender item bloqueado — `sellItem()` retorna `{success:false, reason:"item-locked"}`.
- Desbloqueio após sucesso — confirmado para `upgradeItem()` e `sellItem()`.
- Desbloqueio após falha — confirmado para Ouro insuficiente (Blacksmith) e item inexistente (Merchant): o lock nunca fica preso mesmo quando a operação é rejeitada.
- Expiração de lock obsoleto — segurança adicional testada isoladamente (não é o mecanismo principal).

## 5. Browser Validation (Fase 5)

Fluxo: Adventure (idle ativo, Gold/loot fluindo) → City → Blacksmith → duas requisições `POST /api/blacksmith/upgrade` disparadas quase simultaneamente contra o MESMO item (via `Promise.all`, bypassando a UI para testar o caminho de requisição real) → Inventory/Backpack → Bank → Adventure.

**Resultado**: as duas requisições serializaram completamente (confirmando o achado da Seção 1.1) — a primeira aplicou upgrade_level 0→1 (Poder 15→20, custo 40), a segunda 1→2 (Poder 20→25, custo 55) — nenhuma corrupção, nenhum débito duplicado para o mesmo nível, estado final consistente em todas as telas (Backpack mostrou o mesmo item; Banco mostrou o mesmo saldo da API). Idle nunca parou. Zero erros de console em todo o fluxo.

**Nota metodológica honesta**: como estabelecido na Seção 1.1, o Lock não pode ser genuinamente contendido via interação de navegador hoje — a serialização síncrona do processo já garante isso independentemente do Lock. A prova de que o mecanismo de exclusão mútua FUNCIONA (rejeita uma segunda operação quando uma primeira já segura o lock) vem dos testes automatizados da Fase 4, que forçam a contenção manualmente. O papel da Browser Validation aqui é confirmar **ausência de regressão**: Blacksmith, Merchant, AutoEquip, Backpack e Banco continuam funcionando exatamente como antes, agora com o Lock envolvendo suas seções críticas sem qualquer atrito perceptível ao jogador.

## 6. Compatibilidade

- **RC1**: íntegro.
- **Economy Core**: íntegro — o Ledger nunca soube que um Equipment Lock existe; `requestCredit`/`requestDebit` continuam sendo o único caminho de mutação de recurso.
- **Merchant**: compatível — `sellItem()` ganhou um novo motivo de falha aditivo (`item-locked`), nenhuma regra de venda mudou.
- **Blacksmith**: compatível — mesma observação, `upgradeItem()` ganhou `item-locked`.
- **Engine** (`packages/shared`): permanece isolada — `lock.ts` não importa `node:sqlite`/`react`.
- **React**: nenhuma regra de negócio nova em componente — o Lock vive inteiramente na API.

---

*Referências: `docs/architecture/adr/0001-economy-service-transaction-composition.md` (precedente do padrão de composição de transação, mesmo raciocínio de responsabilidade única aplicado aqui ao Lock); `docs/design/blacksmith-phase1.md`/`docs/design/merchant-phase1.md` (os dois primeiros consumidores reais); `apps/api/src/engine/SessionManager.ts` (precedente do padrão de singleton de processo único com a mesma ressalva de escala).*
