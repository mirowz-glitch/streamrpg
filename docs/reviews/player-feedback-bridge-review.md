# Player Feedback Bridge Review (UI-001)

**Status: ✅ UI-001 eliminado.** Nenhuma regra de gameplay, Combat Model,
Boss, Economy, EventBus ou World Design foi alterada. Nenhum sistema
novo foi criado, nenhum componente de frontend foi criado — só a camada
de apresentação passou a refletir o que a Engine já fazia.

---

## 1. Auditoria do fluxo (antes desta Sprint)

```
Engine (XPSystemV2/WelcomeRewardSystem/DropSystem)
   ↓ (real, correto)
EventBus (xp.granted, level.up, drop.granted)
   ↓ (real, correto)
Repository (SQLiteCharacterRepository/SQLiteItemRepository)
   ↓ (real, correto)
Banco (characters.xp/level, character_items)
   ↓ (real, correto)
API — ✗ QUEBRAVA AQUI: applyPing() sempre retornava
      xp_gained=0, leveled_up=false, drop=null, hardcoded,
      independente do que a Engine já tinha gravado no banco
   ↓
Frontend (CharacterPage já tinha `.level-up`/`.drop-alert` prontos)
   ↓
Tela — nunca renderizava, porque o dado que chegava já vinha vazio
```

A informação nunca se perdia por falta de dado — o banco sempre esteve
correto (confirmado em auditorias anteriores). Ela era **descartada
deliberadamente na API**, no momento de montar a resposta do ping.

---

## 2. Implementação (menor diff possível)

Dois arquivos alterados, nenhum novo criado:

- `apps/api/src/services/drop.service.ts` — uma palavra (`export`) na
  função `mapInventoryRow`, para reaproveitar o mesmo mapeamento de item
  já usado pelo Inventário, sem duplicar lógica.
- `apps/api/src/services/xp.service.ts` — nova função
  `computePingFeedback(characterId, currentXp)`, chamada nos três pontos
  de retorno de `applyPing()` (cooldown, offline, sucesso). Sem
  WebSocket, sem SSE, sem Event Bridge novo — usa exatamente a
  arquitetura já existente (leitura direta do banco na própria camada de
  serviço que já monta o `PingResponse`).

**Mecanismo:** um checkpoint em memória do processo (`Map<characterId,
{xp, lastItemId}>`) guarda o último estado já mostrado a cada
personagem. A cada ping, o estado **atual** do banco (que a Engine já
pode ter alterado, de forma assíncrona, desde o ping anterior) é
comparado contra esse checkpoint — a diferença é o que se reporta. O
primeiro contato de um personagem nesta execução do processo semeia o
checkpoint silenciosamente (mesmo princípio já usado pelo
`SessionManager` para "primeira vez vista"), evitando um "salto" falso
de XP/level/item acumulado.

**Efeito colateral conhecido, aceito por precedente:** o checkpoint é em
memória, não persistido — um reinício do processo (deploy) o zera. Isso
é o mesmo compromisso já aceito e documentado para o `SessionManager`
("correto em processo único... enquanto o projeto rodar em processo
único, este singleton é suficiente e correto"). O efeito prático é que,
logo após um deploy, o próximo ping de cada personagem apenas semeia o
checkpoint de novo, sem notificar — nunca gera um alarme falso.

---

## 3. Componentes reativados (nenhum criado)

`apps/web/src/pages/CharacterPage.tsx` já continha, sem alteração
nenhuma nesta Sprint:

```tsx
{lastPing?.leveled_up ? <p className="level-up">Level up!</p> : null}
{lastPing?.drop?.dropped && lastPing.drop.item ? (
  <p className="drop-alert">Drop: {lastPing.drop.item.name} ({lastPing.drop.item.rarity})</p>
) : null}
```

Nenhuma linha de frontend foi tocada — a reativação é inteiramente
consequência do backend parar de descartar o dado real.

---

## 4. Harness — 5 cenários

Executado contra um banco isolado, usando o caminho "offline" de
`applyPing()` (não exige credenciais reais da Twitch — `isChannelLive()`
retorna `false` sem elas — e esse caminho também computa o feedback,
corrigido nesta Sprint). Entre cada chamada, o XP/item foi alterado
diretamente no banco, simulando exatamente o que a Engine já faz de
forma assíncrona.

| Cenário | Resultado |
|---|---|
| 1 — sem level, sem drop | `xp_gained=20, leveled_up=false, drop=null` — nenhuma mensagem |
| 2 — level | `leveled_up=true` uma vez; ping seguinte sem nova mudança volta a `false` |
| 3 — drop | `drop={item: Espada de Madeira}` uma vez; ping seguinte volta a `null` |
| 4 — level + drop no mesmo tick | as duas aparecem juntas na mesma resposta |
| 5 — "refresh" (novo ping sem mudança) | `xp_gained=0, leveled_up=false, drop=null` — nada reaparece |

Todos os 5 cenários passaram.

**Nota de honestidade sobre o harness:** a simulação de XP (`UPDATE
characters SET xp = xp + ?`) não atualizou também a coluna
`characters.level` — diferente do `SQLiteCharacterRepository.applyXP()`
real, que atualiza os dois juntos. Isso não invalida o teste:
`computePingFeedback()` nunca lê a coluna `level`, só deriva o nível a
partir do `xp` via `getLevel()`, dos dois lados da comparação — o mesmo
caminho que o código real usa. É uma simplificação do harness, não uma
lacuna do que foi implementado.

---

## 5. Regressões (Etapa 6)

- **Inventário:** não tocado — `listInventory`/`equipItem`/`unequipItem`
  seguem exatamente como estavam; confirmado no harness que os itens
  concedidos manualmente aparecem corretamente na contagem real do
  banco.
- **XP:** a concessão em si (`XPSystemV2`, `SQLiteCharacterRepository.applyXP`)
  não foi tocada — só a leitura, para fins de exibição.
- **Gold:** não tocado — confirmado no harness que `gold_gained` seguiu
  em `0` em todas as chamadas (canal nunca esteve live no ambiente do
  harness), consistente com o caminho de concessão de Gold, que não foi
  alterado em nenhuma linha.
- **Ranking:** não tocado.
- **Boss:** nenhum arquivo relacionado a Boss foi sequer aberto nesta
  Sprint.

---

## 6. Respostas diretas

**UI-001 foi eliminado?** Sim — `xp_gained`, `leveled_up` e `drop` agora
refletem o estado real do personagem a cada ping, e os dois componentes
de UI que dependiam deles (`Level up!`, `Drop: Item`) voltam a renderizar
sem nenhuma mudança de frontend.

**A Engine continua sendo a única fonte da verdade?** Sim. Nenhuma linha
desta Sprint concede XP, Level ou Drop — `computePingFeedback()` só lê o
que a Engine (via `EventBus`/`Repository`/banco) já gravou, e relata a
diferença. Se a Engine parasse de rodar, o ping continuaria funcionando
e simplesmente reportaria "nada mudou" — nunca inventando um valor.

**Existe algum evento importante ainda invisível?** Sim — **Boss**
continua inteiramente fora do escopo desta Sprint, por instrução
explícita ("não alterar Boss"). Nascimento, ativação, derrota/fuga e a
própria recompensa do Boss seguem sem nenhuma superfície de apresentação
— o mesmo achado já registrado na Player Visibility Review, ainda não
resolvido, e corretamente fora do critério de sucesso desta Sprint (que
tratava só de XP/Level/Drop).

**Nota sobre documentação:** o capítulo 5 (Progressão) da Game Design
Bible ainda registra "Débito conhecido: feedback de UI (UI-001)" como um
débito em aberto — essa frase ficou desatualizada por esta Sprint, mas
corrigi-la está fora do escopo definido aqui ("atualizar apenas
documentação técnica necessária", e nenhum arquivo de
`docs/technical-design/` trata especificamente deste fluxo). Registrado
aqui para uma atualização futura da Bible, não feito nesta Sprint.
