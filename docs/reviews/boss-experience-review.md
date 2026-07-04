# Boss Experience (MVP) — Review

Sprint de UX/apresentação. Nenhuma regra de jogo foi criada ou alterada —
apenas dados que o backend já possuía passaram a ser visíveis.

## Etapa 1 — Auditoria (antes desta Sprint)

| Dado                     | Backend existe? | API enviava? | Frontend mostrava? |
|---------------------------|:---:|:---:|:---:|
| Boss ativo (sim/não)       | ✅ (`bosses.status`) | ❌ | ❌ |
| Nome do Boss               | ❌ (não existe coluna) | ❌ | ❌ |
| HP atual / HP máximo       | ✅ | ❌ | ❌ |
| Participantes               | ✅ (`boss_participation`) | ❌ | ❌ |
| Tempo restante (`ends_at`) | ✅ | ❌ | ❌ |
| Boss derrotado / fugiu      | ✅ (`status`, `resolved_at`) | ❌ | ❌ |
| Recompensas (XP/Item)       | ✅ (`boss_rewards`) | ❌ | ❌ |

Conclusão da auditoria: **100% do dado necessário já existia** no schema
(Boss Integration + Character Attributes Schema + Combat Model Runtime
sprints). O problema nunca foi falta de dado — era ausência total de
qualquer rota ou componente que o expusesse. O Boss existia matematicamente
e era invisível para todo mundo.

## O que foi construído

- `boss-status.service.ts` (novo, read-only) — deriva um snapshot completo
  do estado do Boss (`BossStateSnapshot`) só com `SELECT`s sobre
  `bosses`/`boss_participation`/`boss_rewards`/`characters`/`items`. Nenhuma
  escrita, nenhuma regra.
- `GET /api/overlay/:channel/boss` — rota pública, mesmo padrão de
  `/api/overlay/:channel/viewers` (CORS aberto, sem cache).
- `useBossState` — hook de polling (5s, mesmo mecanismo já usado pelo
  Overlay), deriva um log de eventos comparando o poll atual com o
  anterior.
- `BossCard` — componente único, usado em `/app/character` (versão
  completa) e `/overlay/:channel` (versão compacta).

## Respostas às perguntas da Sprint

**O Boss agora é perceptível para o jogador?**
Sim. Antes, um Boss podia nascer, ser lutado e derrotado inteiramente nos
logs do servidor — o jogador não tinha absolutamente nenhum sinal disso.
Agora, tanto `/app/character` quanto o overlay de stream mostram
"⚔️ BOSS ATIVO" no momento em que ele existe.

**O jogador entende quando um Boss começa?**
Sim, com uma ressalva. Estado `awaiting` mostra "⚔️ BOSS APARECEU" com a
dica "Aguardando o streamer invocar (ou o tempo acabar)" — honesto sobre o
mecanismo real (invocação manual ou timeout), não inventa um botão de
invocação que não existe nesta Sprint (rota de invocação é HTTP futura,
fora de escopo, conforme o próprio `BossSpawnSystem.invoke()` já
documentava). Estado `active` mostra HP e tempo restante imediatamente.

**O progresso da luta é claro?**
Sim. Barra de HP + `current_hp/max_hp` + percentual + tempo restante,
atualizados a cada poll (5s). Validado ao vivo: HP realmente caiu entre
dois carregamentos de página durante o teste em browser, confirmando que
a barra reflete dano real do `BossCombatSystem`, não um mock.

**A recompensa é percebida?**
Sim, com uma lacuna real que precisa ser registrada: a tela de derrota
mostra XP e item por participante usando exclusivamente
`boss_rewards` (nenhum recálculo no frontend). Porém **Gold nunca aparece**
— porque o Boss não concede Gold no MVP (capítulo 6 da Bible: "Gold fica
fora do MVP"). O mockup original da Sprint listava "XP / Gold / Itens"
como se os três existissem; isso não corresponde à realidade do sistema.
Documentar isso explicitamente aqui em vez de fabricar um valor de Gold é
a mesma disciplina de honestidade já aplicada a "não inventar nome de
Boss".

**Ainda existe algum ponto invisível?**
Sim, três, todos por design desta Sprint e não bugs:
1. **Nome do Boss não existe** — usa-se "Boss do Reino · Tier N" (`tier`,
   campo real) em vez de um nome fabricado como o "Goblin King" do mockup.
2. **Histórico de eventos é efêmero e local à sessão do navegador** — não
   existe uma tabela de log no backend; o hook deriva eventos comparando
   polls consecutivos. Um jogador que abre a página *depois* de um evento
   já não vê esse evento no histórico (confirmado ao vivo: a tela de
   derrota, ao ser carregada pela primeira vez, mostra a recompensa mas não
   mostra "Boss derrotado!" na lista de eventos, porque não havia um poll
   anterior para comparar).
3. **Janela de visibilidade pós-resolução é de 30s** — depois disso, o
   Boss simplesmente desaparece do endpoint (`RECENT_RESOLUTION_WINDOW_SECONDS`),
   mesmo que ninguém tenha "fechado" a tela de vitória. É uma escolha de
   apresentação (não um bug), mas significa que um jogador ausente por mais
   de 30s após a derrota nunca vê a tela de vitória.

## Verificação

- **Typecheck** (`apps/api`, `apps/web`, tsconfig temporário): limpo, sem
  erros nos arquivos tocados.
- **Build** (`npm run build:web`, esbuild): limpo.
- **Harness real** (Etapa 9, DB isolada em scratchpad, ciclo completo via
  EventBus/Systems reais — `BossSpawnSystem`, `BossParticipationSystem`,
  `BossCombatSystem`, `BossRewardSystem` — nenhum mock visual): todos os
  checks passaram — nascimento → ativação → dano por tick → derrota →
  recompensa → visibilidade pós-resolução → desaparecimento após 30s →
  novo Boss no mesmo canal.
- **Browser ao vivo** (`.claude/launch.json`, dados de teste seedados
  direto em `data/streamrpg.db` e removidos ao final): confirmado
  `/app/character` e `/overlay/:channel` renderizando corretamente em
  estado `active` (HP bar, tempo restante, participantes) e em estado
  `defeated` (mensagem de vitória, lista de recompensas na versão completa,
  versão compacta sem lista); confirmado o desaparecimento após a janela
  de 30s.

## Regressão (Etapa 10)

Nenhum arquivo de XP, Gold, Drops, Combat Model, `BossCombatSystem`,
`BossRewardSystem`, `BossSpawnSystem`, Ranking ou Inventário foi alterado
nesta Sprint. As únicas mudanças em arquivos existentes foram estritamente
aditivas:
- `overlay.ts`: uma rota nova (`GET /api/overlay/:channel/boss`), nada
  removido ou alterado nas rotas existentes.
- `types.ts`: interfaces novas (`BossStateSnapshot` e afins), nenhum tipo
  existente modificado.
- `CharacterPage.tsx` / `OverlayPage.tsx`: um import e uma linha de JSX
  (`<BossCard />`) cada, sem tocar em nenhuma lógica de XP/ping/inventário
  já existente.
- `styles.css`: apenas classes novas (`.boss-*`), nenhuma classe existente
  alterada.

XP, Gold, Drops, Combat Model, Ranking e Inventário continuam
byte-a-byte como estavam antes desta Sprint.
