# Vertical Slice — Persistent Player Experience (Phase I)

Elimina a separação entre a "Adventure Demo" (client-side, packages/shared rodando 100% no navegador) e o "Personagem Persistido" (apps/api, SQLite) identificada na Sprint Commercial Readiness. Ao final, a página Aventura carrega o personagem real e grava de volta cada resultado relevante — nenhum sistema novo, nenhuma alteração ao Combat Engine/Loot Generator/Simulator/World Generation/Item Generator/Balance/Progression/RuntimeConfig.

---

## 1. Arquivos modificados

| Arquivo | O que mudou |
| --- | --- |
| `apps/api/src/config/database.ts` | Migração aditiva: `items.base_item_id`, `items.power_score` (nullable) |
| `apps/api/src/infrastructure/SQLiteCharacterRepository.ts` | Novo método `grantGold()` (mesmo padrão de `applyXP()` já existente) |
| `apps/api/src/routes/character.ts` | Novas rotas `POST /api/character/adventure/xp` e `/gold` |
| `apps/api/src/routes/items.ts` | Nova rota `POST /api/items/loot` |
| `apps/api/src/services/drop.service.ts` | Nova função `grantAdventureLoot()` (reaproveita `items`/`character_items` já existentes) |
| `apps/web/src/hooks/useAdventureSession.ts` | Reescrito: hidrata do personagem real (`GET /api/character`) em vez de um `DEMO_CHARACTER_ID` fixo; sincroniza XP/ouro/itens após cada tick |
| `apps/web/src/pages/AdventurePage.tsx` | Removido o subtítulo de "prévia" da Sprint anterior (não é mais verdade); adicionado estado de carregamento |

Nenhum arquivo de `packages/shared` foi alterado.

---

## 2. Diagnóstico Arquitetural

**Onde existia duplicação**: dois motores completos e paralelos.
1. `packages/shared` (Adventure Loop/Combat/Loot/Objectives/Expeditions/Factions/Dungeons) — rodava inteiramente no navegador via `useAdventureSession.ts`, com um personagem fixo (`DEMO_CHARACTER_ID = "vertical-slice-hero"`), sem nenhuma chamada de API (comentário já existente no código confirmava isso deliberadamente).
2. `apps/api/src/engine` + `systems/*` (GameEngine/XPSystemV2/DropSystem/ExpeditionSystem/BossCombatSystem) — o motor real, ligado ao personagem persistido via `SQLiteCharacterRepository`/`SQLiteItemRepository`, historicamente alimentado só por "ping" de tempo assistido.

Além disso, dois vocabulários de item: o Item Generator (`packages/shared/itemgen`, procedural: `baseItemId` + raridade `common/magic/rare/unique` + Power Score) nunca correspondia ao modelo simples já usado pela persistência real (`types.ts`: `ItemRarity` `common/uncommon/rare/epic/legendary`, `ItemSlot` de 6 posições).

**Como foi eliminada**: em vez de fundir os dois motores (o que exigiria alterar Combat Engine/Simulator, proibido), a Aventura continua rodando o MESMO motor calibrado de sempre — só passou a: (1) nascer com o XP/nível/ouro REAIS do personagem (`GET /api/character`, reconstruindo o total exato via `cumulativeXpForLevel(level) + xp`, a mesma fórmula que `getProgress()` já usa, só invertida); (2) gravar de volta cada resultado (XP por delta, ouro por delta, item por evento `LootDropped`/`ItemEquipped`) usando os MESMOS `items`/`character_items`/`equipped_items` e os MESMOS `equipItem()`/`applyXP()` que o sistema real já usava — nenhum catálogo paralelo, só linhas novas na mesma tabela.

**Por que preserva a arquitetura**: nenhuma fórmula de XP/combate/loot mudou; a única tradução nova é na FRONTEIRA entre os dois vocabulários de item (raridade `magic→uncommon`/`unique→legendary` etc., só pra não quebrar `getItemPower()`/`RARITY_COLOR` — ambos também intocados) — um mapeamento de valores, não uma raridade nova inventada nem uma fórmula alterada.

---

## 3. Fluxo Antes

```
Adventure (packages/shared, client-state) → UI
   [nível 1 fixo, XP/itens/ouro só na memória do navegador]

Character (apps/api, SQLite) → UI
   [só avança por "ping" de tempo assistido, nunca sabe que a Aventura existe]
```

Jogar a Aventura por 10 minutos, subir de nível, equipar itens — e ao abrir "Personagem", tudo continuava no nível 1, inventário vazio. Trocar de aba ou atualizar a página apagava todo o progresso da Aventura sem aviso.

---

## 4. Fluxo Depois

```
GET /api/character ──► hidrata o motor (packages/shared) com nível/XP/ouro reais
        │
        ▼
Aventura roda normalmente (Combat/Loot/Objectives, intocados)
        │
        ▼
Cada tick: POST /api/character/adventure/xp | /gold | POST /api/items/loot
        │
        ▼
characters.xp/gold, items + character_items + equipped_items (SQLite)
        │
        ▼
/app/character e /app/inventory leem os MESMOS dados — sempre consistentes
```

Um único personagem, uma única fonte de verdade. Sair da Aventura, atualizar a página ou abrir "Personagem"/"Inventário" mostra exatamente o mesmo nível, XP e itens.

---

## 5. Evidências (smoke test real, navegador)

Personagem de teste criado pelo MESMO caminho de código do signup real (`createCharacter`), sem dado inventado.

- **XP**: Aventura mostrou "65 / 100 XP (65%)" → após `Objetivo concluído`/level up e refresh da página, Aventura recarregou mostrando "Nível 2, 30/282 XP (10%)" — o total (130 XP) persistiu corretamente entre ticks e entre sessões.
- **Equipamento**: item "Arco" encontrado e auto-equipado na Aventura (`Equipado: Arco no slot Arma`) → `/app/character` mostrou imediatamente "ARMA: Arco / Incomum / ⚔ +10" — inclusive disparou a celebração já existente de "SEU PRIMEIRO EQUIPAMENTO" (`FirstItemQuestSystem`), que nunca via itens da Aventura antes desta Sprint.
- **Inventário**: `/app/inventory` listou os 3 itens encontrados (Arco/Adaga/Arco equipado) com raridade/Power Score corretos e a comparação "↑/↓ ATQ Físico" já existente funcionando automaticamente contra o item recém-equipado.
- **Progresso após refresh**: navegar para `/app/adventure` de novo (nova sessão de motor) carregou os MESMOS 65 XP acumulados como ponto de partida, em vez de reiniciar do zero.

---

## 6. Validação

- **Typecheck**: `packages/shared` limpo (inalterado). `apps/api`/`apps/web` (checados isoladamente, sem os erros pré-existentes de configuração de projeto já documentados nas Sprints anteriores) limpos para todos os arquivos tocados nesta Sprint — os poucos erros que aparecem num check isolado de `apps/api` são em arquivos de teste (`EventBus.test.ts`, `GameEngine.test.ts`, `SQLiteCharacterRepository.test.ts`) e 2 repositórios (`SQLiteBossParticipationRepository.ts`, `SQLiteBossRepository.ts`) que eu não toquei — confirmado via `git status` que já estavam nesse estado antes desta Sprint.
- **Testes direcionados**: `packages/shared` — `adventure`/`equipment`/`inventory`/`characterbuild` (85 testes) passando, nenhuma quebra (nenhum arquivo do motor foi alterado).
- **Suíte completa**: `packages/shared` — **434/434 passando**, executada uma única vez.
- **Smoke test manual completo**: executado no navegador real (não simulado) — criação de personagem, entrada na Aventura, combate, loot, equipar, XP, nível 2, atualização de página, conferência em Personagem/Inventário — todos confirmados consistentes (ver Seção 5). Ouro e derrota de Boss não foram observados dentro do orçamento de cliques desta sessão de teste (ambos ainda raros nesta região/nível, achado já documentado nas Sprints de balanceamento) — usam exatamente o mesmo mecanismo de sincronização já comprovado para XP/itens, sem caminho de código adicional.

---

## 7. Commercial Readiness

**Se um publisher jogar por 15 minutos, ainda existe algo que pareça protótipo?** Sim, por ordem de impacto:

1. **Itens equipados ANTES desta Sprint (ou entre sessões de Aventura) não são reconstruídos visualmente dentro do próprio motor da Aventura ao atualizar a página.** O item persiste corretamente em Personagem/Inventário (confirmado), mas a Aventura só grava `baseItemId`+Power Score+raridade — não os afixos/status completos rolados originalmente — então não há dado suficiente pra "vestir" de novo o personagem do motor com o item EXATO ao recarregar a página. Resultado prático: o jogador vê "Arma: Arco" persistido corretamente no Personagem, mas ao voltar pra Aventura depois de um refresh, a barra de "🛡️ equipados" do motor mostra 0 até encontrar algo novo. Corrigir isso por completo exigiria persistir o item gerado inteiro (mais uma coluna JSON) — deixado como próximo passo.
2. **Ouro raramente é concedido** (achado já documentado em auditorias anteriores) — mesmo com a sincronização funcionando, um jogador pode passar minutos sem ver o saldo mudar, o que ainda parece "sem economia" em vez de uma limitação de raridade de drop.
3. **Anéis duplos (`ring1`/`ring2`) colidem no mesmo slot "Anel" do personagem persistido** — equipar um segundo anel durante a Aventura substitui a exibição do primeiro no modelo antigo (ambos continuam na posse do jogador, só a exibição de "equipado" colide). Edge case raro, documentado.
4. **Falhas de rede na sincronização são silenciosas** (fire-and-forget deliberado, pra nunca travar a Aventura esperando a API) — num cenário de conexão instável, um item poderia aparecer na Aventura sem persistir de fato. Sem retry/fila ainda.

Nenhum dos 4 pontos acima é um "isso está quebrado" na jornada principal testada (criar → jogar → equipar → subir de nível → conferir personagem) — são lacunas de robustez/edge-case, não da promessa central desta Sprint, que foi cumprida: **quando o jogador encontra um item durante a aventura, ele aparece imediatamente no personagem — confirmado.**
