# Player Visibility Review (MVP)

**Status: 🟠 Auditoria — nenhuma regra de gameplay, economia, Combat
Model, Boss, Drop ou XP foi alterada.** Cada afirmação abaixo foi
confirmada em código nesta própria Sprint (incluindo uma busca completa
por qualquer referência a "boss" em `apps/web`, que retornou zero
arquivos — confirmando, e não assumindo, a ausência total de UI de Boss).

---

## 1. Eventos mapeados

Login, Criação do personagem, XP (ganho), Level Up, Gold, Drop, Equipar
item, Boss nasceu, Boss ativado, Boss derrotado/fugiu, Recompensa do
Boss, Ranking mudou, Região descoberta.

---

## 2. Tabela por evento

| Evento | Backend funciona? | Frontend mostra? | Overlay mostra? | Jogador percebe? |
|---|---|---|---|---|
| Login | Sim | Sim — redireciona, `AppNav` reflete sessão | N/A | Sim |
| Criação do personagem | Sim | Não — nenhuma tela própria, acontece dentro do callback OAuth | N/A | Não |
| XP (ganho) | Sim (tick real) | Parcial — `XpBar` mostra o total correto ao carregar/dar refresh, mas `xp_gained` da resposta do ping é sempre `0`; nunca mostra o ganho em si | Parcial — a barra do viewer reflete XP real a cada poll de 5s, mas sem nenhuma notificação de ganho | Muito fraco |
| Level Up | Sim | Não — `leveled_up` sempre `false` na resposta do ping (UI-001), popup morto | Parcial — o número de nível muda silenciosamente no próximo poll, sem destaque | Quase nulo |
| Gold | Sim (síncrono) | **Sim** — `gold_gained` correto na resposta, `refresh()` atualiza o valor exibido | Não — `OverlayViewer` não tem campo `gold` | **Sim** |
| Drop | Sim (com bug de raridade já documentado, não é objeto desta auditoria) | Não na hora (`drop` sempre `null` na resposta do ping) — mas o item aparece corretamente no Inventário se o jogador for conferir | Não | Só se for checar o Inventário por conta própria |
| Equipar item | Sim | **Sim** — mensagem "Item equipado!", lista atualiza, badge de comparação ▲/▼/= | Parcial — `equipped_weapon` aparece no Overlay (só a arma, não os outros slots), sem destaque de "acabou de equipar" | Sim, na própria tela |
| Boss nasceu | Sim (desde Boss Integration) | **Não — zero referência em `apps/web`, confirmado por busca completa** | Não | Não, nunca |
| Boss ativado | Sim | Não | Não | Não, nunca |
| Boss derrotado/fugiu | Sim | Não | Não | Não, nunca |
| Recompensa do Boss | Sim (XP/item real concedido) | Parcial — chega ao total de XP/Inventário, indistinguível de recompensa comum | Não | Não, e mesmo se percebesse não saberia que veio de um Boss |
| Ranking mudou | Sim (corrigido, sem staleness) | Parcial — `RankingPage` busca uma vez ao carregar (`useEffect`), sem polling, sem indicar mudança de posição | Não — Overlay não mostra ranking/posição | Fraco — só o valor absoluto ao visitar |
| Região descoberta | **Não implementado** | — | — | — |

---

## 3. Cadeia completa (onde cada uma quebra)

**XP:**
```
world.tick → XPSystemV2 → xp.granted → Banco (real) → API (real) →
Frontend (XpBar mostra o total ao buscar) →
✗ QUEBRA AQUI: nenhum evento avisa "você ganhou XP agora"
```

**Drop:**
```
xp.granted → DropSystem → drop.granted → Banco (real) →
API /api/items (real, lista correta) →
✗ QUEBRA ANTES DISSO: resposta do ping sempre traz drop=null — o
  jogador não tem nenhum sinal de que precisa ir conferir o Inventário
```

**Boss:**
```
world.tick → BossSpawnSystem/BossCombatSystem/BossRewardSystem →
boss.spawned/boss.defeated/boss.escaped (emitidos corretamente) →
Banco (bosses, boss_rewards — real) →
✗ QUEBRA AQUI: não existe nenhuma rota HTTP que exponha estado de
  Boss — nem API, nem polling, nem componente
```

**Ranking:**
```
channel_rankings (subquery viva, real) → API /api/ranking (real) →
Frontend (RankingPage mostra corretamente ao carregar) →
✗ QUEBRA AQUI: sem polling, sem indicação de mudança — só o retrato
  do momento em que a página foi carregada
```

---

## 4. Classificação

| Evento | Classificação |
|---|---|
| Login | ✅ Visível |
| Criação do personagem | 🟡 Existe mas invisível |
| XP | 🟡 Existe mas invisível |
| Level Up | 🟡 Existe mas invisível |
| Gold | ✅ Visível |
| Drop | 🟡 Existe mas invisível |
| Equipar item | ✅ Visível |
| Boss nasceu | 🔴 Não implementado (camada de apresentação) |
| Boss ativado | 🔴 Não implementado |
| Boss derrotado/fugiu | 🔴 Não implementado |
| Recompensa do Boss | 🟡 Existe mas invisível (chega, mas indistinguível de recompensa comum) |
| Ranking mudou | 🟡 Existe mas invisível |
| Região descoberta | 🔴 Não implementado |

---

## 5. Ranking de impacto (eventos invisíveis)

1. **Boss** (nasceu/derrotado/recompensa) — maior impacto potencial: é o
   único evento coletivo/social do jogo, hoje 100% perdido.
2. **Level Up** — momento clássico de RPG, completamente mudo.
3. **Drop** — segunda maior fonte de descoberta, sem nenhum aviso.
4. **XP (ganho contínuo)** — sustenta a sensação de progresso constante.
5. **Ranking mudou** — impacto menor, mais "meta" que núcleo do loop.
6. **Criação do personagem** — evento único, baixo impacto recorrente.

**Maior aumento de satisfação pelo menor esforço:** reativar **Level Up +
Drop** (a mesma correção, UI-001). Motivo: os componentes de UI **já
existem no código** (`.level-up`, `.drop-alert` em `CharacterPage.tsx`) —
o único problema é que a resposta do ping nunca carrega os valores reais
já calculados corretamente pela Engine. É literalmente mais barato que
qualquer alternativa desta lista, porque não exige escrever UI nova, só
parar de descartar o dado que já existe.

---

## 6. Quick Wins × Mudanças grandes

**Quick Wins (sem arquitetura nova):**
- Preencher `xp_gained`/`leveled_up`/`drop` reais na resposta do ping —
  reativa dois componentes de UI já existentes.
- Delta de Ranking ("você subiu 2 posições") — comparação local simples
  (guardar a última posição vista), sem mudança de backend.
- Contador/badge de "itens novos não vistos" no Inventário — comparação
  local sobre dados que a API já entrega por completo.
- Pequeno destaque visual (brilho/cor) na `XpBar` do Overlay quando o
  valor muda entre polls.

**Mudanças grandes (exigem arquitetura):**
- Notificação de Boss nasceu/ativo/derrotado em tempo real — exige
  alguma forma de push (SSE/WebSocket) ou, no mínimo, uma rota nova de
  polling dedicada + componente novo (o backend não expõe nada disso
  hoje).
- XP/Level Up/Drop no **instante** em que a Engine concede (não só no
  próximo refresh manual) — exigiria o mesmo tipo de push/Frontend Event
  Bridge.
- Sincronização de estado entre abas/dispositivos do mesmo jogador.

---

## 7. Heatmap de percepção atual

```
Login           ██████████
XP              ██
Gold            ███████
Drop            █
Boss            █
Ranking         ██
Inventário      ███
Overlay         ████████
```

---

## 8. Resposta única

**"Se eu implementar somente os três Quick Wins mais impactantes, quanto
a nota de retenção da review anterior provavelmente subiria?"**

**De 2/10 para aproximadamente 3/10 — um ganho pequeno, não o maior
possível, e isso precisa ser dito com a mesma honestidade da review
anterior.**

Os três Quick Wins mais impactantes identificados aqui (UI-001 real no
ping, delta de Ranking, badge de item novo no Inventário) melhoram
diretamente **Diversão** e **Clareza** dentro de uma sessão já em
andamento — são exatamente os elementos que a review anterior citou como
os "momentos de recompensa" mais mudos (Level Up, Drop, Ranking). Isso
justifica um ganho real, não hipotético, nesses dois critérios.

Mas **Retenção**, como a review anterior definiu, mede especificamente
"motivo para voltar amanhã" — e nenhum dos três Quick Wins cria esse
motivo. Eles tornam a sessão de hoje mais satisfatória; nenhum deles
adiciona um gancho que exista **fora** da sessão (sem streak, sem
notificação externa, sem recompensa diária). O ganho em Retenção que
esses três produziriam é só **indireto**: uma sessão mais satisfatória
aumenta a chance de um espectador virar espectador recorrente por conta
própria (efeito de boca a boca/auto-seleção), mas isso é qualitativamente
diferente de um mecanismo que puxa o jogador de volta.

O maior salto de Retenção, segundo a própria evidência desta auditoria,
viria das "mudanças grandes" (visibilidade real de Boss) — porque Boss é
o único evento social/coletivo do jogo, e eventos sociais são o tipo de
coisa que gera conversa e expectativa entre sessões ("volta amanhã que
pode ter Boss") — mas isso está fora da categoria Quick Win por
definição, e não pode ser contado nesta resposta.
