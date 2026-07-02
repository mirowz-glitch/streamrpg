# Live Readiness Review

Checklist operacional da primeira live real. Não é revisão de arquitetura
nem de economia — é a pergunta "estamos prontos pra colocar gente de
verdade usando isso", respondida uma vez, antes de cada live até virar
rotina.

**Backlog de Estabilização (P0-P3) fechado antes deste documento existir:**
credencial da Twitch (checklist), Welcome Reward duplicado (corrigido),
Gold race (corrigido), Ranking desatualizado (corrigido), Overlay
divergente de 300s (corrigido), OAuth (refutado — não existe corrida real
no código atual). Cenário A confirmado: Boss continua desligado.

---

## Papéis da live

Mesmo que hoje as duas funções sejam a mesma pessoa, tratar como dois
papéis distintos:

- **Operador da Live** — acompanha a transmissão e o chat, decide se
  algo comentado pelos viewers merece investigação.
- **Operador dos Logs** — acompanha o terminal/Railway (seção abaixo),
  o Tick Summary, e decide quando aplicar um critério de parada.

## Iniciar o ambiente

- **Comando real do projeto** (`package.json`): `npm start` roda
  `tsx apps/api/src/server.ts`. É exatamente o que a Railway executa em
  produção (`railway.json`, `deploy.startCommand: "npm start"`) — não
  existe comando diferente entre local e produção, só o ambiente onde
  ele roda.
- **Local vs. produção:** local é `http://localhost:4000` (porta padrão
  de `env.port`, salvo `PORT` sobrescrita). Produção é a URL pública
  atribuída ao serviço no painel da Railway — confirmar ali antes da
  live qual é a URL ativa, este documento não fixa isso porque muda por
  ambiente/projeto Railway.
- **URL que precisa responder antes da live:** `GET /health` (rota já
  existe em `routes/auth.ts`) — responde
  `{ ok: true, ping_interval_seconds: 60, overlay_poll_seconds: 5, xp_per_ping: 10 }`
  quando o servidor está de pé. Testar essa URL, na produção real, antes
  de qualquer viewer chegar.
- **Confirmação de boot correto**, na ordem real em que aparecem:
  1. (Só na primeira vez contra um banco novo) `[Migration] first_join_reward_at adicionada...`
  2. Se `DEBUG_EVENT_SUBSCRIBER=true`: `[server] DebugEventSubscriber ativo (DEBUG_EVENT_SUBSCRIBER=true)`
  3. `DEBUG cwd:` / `DEBUG WEB_SRC:` / `DEBUG WEB_DIST:` / `Web bundle built successfully` / `DEBUG main.js exists after build: true`
  4. **`StreamRPG running on http://localhost:<porta>`** — linha que confirma o boot completo. Sem essa linha, o servidor não subiu.
  5. Se aparecer `Warning: TWITCH_CLIENT_ID not set` — parar agora, não começar a live sem credencial configurada.

## Acesso aos logs

- **Local/ensaio:** o próprio terminal onde `npm start` está rodando.
- **Produção (Railway):** painel da Railway → aba de Deployments/Logs do
  serviço, ou `railway logs` pela Railway CLI se estiver instalada e
  logada no projeto. Não existe outro lugar onde esses logs ficam —
  nada é gravado em arquivo local em produção.
- **Primeiro log esperado logo após o boot:** a sequência de "Confirmação
  de boot correto" acima, terminando em `StreamRPG running on...`.
- **Mensagens que confirmam saúde contínua, já em operação:** o bloco
  `=== Tick N ===` do Tick Summary aparecendo a cada ~60s (ver seção de
  Tick Summary abaixo) e ausência de qualquer linha de erro/exceção não
  tratada.

## Verificação visual do Overlay (obrigatória antes da live)

Backend respondendo não é considerado suficiente. Confirmar, nesta ordem:

1. O Browser Source do OBS aponta para
   `<baseUrl>/overlay/<channel_id>` — mesmo formato que já é devolvido
   pela própria API em `GET /api/streamer/dashboard`
   (`overlay_url`) e na resposta de `POST /api/streamer/connect`. Usar
   esse valor diretamente, não montar a URL de memória.
2. O overlay **aparece de verdade na transmissão** (captura visual, não
   só a URL abrindo num navegador comum).
3. Fazer um personagem de teste entrar e sair (ou usar a própria conta
   do operador) e confirmar que os dados exibidos **mudam** — nome
   aparecendo/sumindo, XP atualizando.

Só depois dos três itens acima confirmados visualmente é que o
"backend respondendo" das seções seguintes passa a valer.

## O que precisa estar ligado

- Servidor no ar com o build do web atualizado (`buildWebOnce()` roda no
  start — confirmar que não falhou silenciosamente).
- `TWITCH_CLIENT_ID` / `TWITCH_CLIENT_SECRET` válidos — ponto único de
  falha já identificado: se o token app expirar, XP/Gold/Welcome/Drop
  zeram pra todo mundo, silenciosamente, sem erro visível fora do log.
- `DEBUG_EVENT_SUBSCRIBER=true` — liga o Tick Summary, o log de Session
  End e a observabilidade construída especificamente pra esta live.
- Boss **desligado** (nenhuma env/flag de Boss ativa) — confirmado por
  decisão, não é omissão.

## O que precisa ser conferido antes de começar

- Boot limpo do servidor, sem exceção no log de inicialização (ver
  "Iniciar o ambiente" acima).
- Banco de produção sem resíduo de harness/teste (nenhum personagem ou
  canal com nome de teste/UUID solto).
- `isChannelLive()` respondendo `true` pro canal real — a forma
  concreta de testar isso é chamar `GET /health` (confirma o servidor
  de pé) e observar o primeiro `[isChannelLive]` real assim que o
  streamer entrar ao vivo, antes de contar com qualquer ping de viewer.
- Verificação visual do Overlay (seção própria acima) já concluída.

## O que observar durante

- Primeiro ping de cada viewer novo — Welcome Reward concedida uma vez
  só, nunca em dobro.
- Qualquer linha `[isChannelLive] live=false reason=...` — distinguir
  `offline` (canal realmente caiu) de `http_error_*`/`exception_*`
  (problema técnico, não do streamer).
- Ritmo do cooldown de ping — sensação de progressão, não só número.
- Reação do chat a drops — quase sempre `common` é esperado (bug do RNG
  já conhecido, não corrigido ainda, não é novidade se acontecer).
- Reconexão de viewer (troca de aba, celular bloqueando) — não deveria
  gerar Welcome Reward de novo nem comportamento estranho.
- Qualquer exceção não tratada no log do servidor.

## Logs para acompanhar, em ordem de prioridade

1. **Tick Summary** (`DebugEventSubscriber`) — uma linha por tick,
   primeiro lugar pra notar qualquer coisa fora do esperado (sessões,
   XP, gold, drops, welcome, live online/offline). Periodicidade
   esperada: **~60 segundos** (intervalo padrão da `GameEngine`, não
   sobrescrito em `server.ts`). Se não aparecer nenhum bloco
   `=== Tick N ===` por mais de **2 ciclos seguidos (~2 minutos)**,
   tratar como servidor travado — ver critério de parada abaixo.
2. **`[DebugEventSubscriber] Session End`** — ritmo real de entrada e
   saída de viewers.
3. **`[applyPing]`** — granular, usar só quando precisar investigar um
   personagem específico. Carrega `duration_ms` — ver critério objetivo
   de lentidão abaixo.
4. **`[isChannelLive]`** quando falso — para diagnosticar instabilidade
   de API vs. canal realmente offline.

## Métricas para anotar (ao vivo e depois)

Viewers únicos, sessões totais, pings totais, XP total concedido, Gold
total concedido, distribuição real de raridade dos drops (comparar com a
previsão matemática já feita — deve bater com "quase tudo common"),
quantidade de Welcome Rewards (proxy de gente nova), proporção
online/offline do `isChannelLive`, tempo médio de presença (via Session
End). Estas são exatamente as métricas P0/P1 do documento de Painel de
Operação — nada novo aqui, só a checklist de captura-las de verdade
desta vez.

## Quando interromper a live por segurança

- Exceção derrubando o processo (crash real, não um erro tratado no log)
  — parar, reiniciar, investigar antes de deixar continuar.
- **Nenhum `=== Tick N ===` aparecendo por mais de ~2 minutos** — sinal
  objetivo de servidor travado (ver seção de Tick Summary acima).
  Reiniciar o processo.
- Gold ou XP concedidos em quantidade grosseiramente incorreta reportada
  por um viewer (ex.: milhares do nada) — pausar e investigar antes de
  seguir; não é o tipo de bug já mapeado nesta sessão.
- `isChannelLive` retornando falso repetidamente com o canal
  claramente ao vivo — sinal de credencial/API quebrada, não "azar";
  recompensas param pra todo mundo silenciosamente. Parar e checar
  credenciais, não esperar passar.
- Erro 500 recorrente em qualquer rota crítica (`/api/ping`,
  `/api/overlay/*`, `/api/ranking`).
- **Critério objetivo de lentidão** (substitui "lentidão perceptível"):
  não existe hoje um valor de referência medido em produção para o
  `duration_ms` de `[applyPing]` — a checagem observável é comparar
  contra os próprios primeiros pings daquela live: se `duration_ms`
  estiver claramente crescendo ping a ping, ou destoando muito da
  ordem de grandeza observada no início da mesma sessão, tratar como
  sinal real, não uma sensação.

## Consultas SQL prontas para depois da live

```sql
-- Personagens únicos ativos no dia
SELECT COUNT(DISTINCT character_id) FROM viewer_sessions WHERE session_date = 'YYYY-MM-DD';

-- Pings totais e XP/Gold concedidos no dia
SELECT SUM(ping_count) AS pings, SUM(xp_earned) AS xp, SUM(gold_earned) AS gold
FROM viewer_sessions WHERE session_date = 'YYYY-MM-DD';

-- Distribuição real de raridade dos itens concedidos no dia
SELECT i.rarity, COUNT(*) AS total
FROM character_items ci JOIN items i ON i.id = ci.item_id
WHERE ci.obtained_at >= strftime('%s', 'YYYY-MM-DD')
GROUP BY i.rarity;

-- Welcome Rewards concedidos no dia (proxy de viewers novos)
SELECT COUNT(*) FROM characters WHERE first_join_reward_at >= strftime('%s', 'YYYY-MM-DD');

-- Ranking final do canal
SELECT c.display_name, cr.total_xp, cr.position
FROM channel_rankings cr JOIN characters c ON c.id = cr.character_id
WHERE cr.channel_id = ? ORDER BY cr.position;

-- Ritmo de presença por personagem (quem ficou mais tempo, quantos pings)
SELECT character_id, ping_count, minutes_watched, first_ping_at, last_ping_at
FROM viewer_sessions WHERE channel_id = ? AND session_date = 'YYYY-MM-DD'
ORDER BY ping_count DESC;

-- Sanidade de Gold: nenhum valor negativo ou fora do esperado
SELECT MIN(gold), MAX(gold) FROM characters;

-- Sanity check: nenhum profile duplicado por twitch_id (confirma empiricamente
-- que a corrida de OAuth, já refutada por análise, também não aconteceu na prática)
SELECT twitch_id, COUNT(*) AS total FROM profiles GROUP BY twitch_id HAVING COUNT(*) > 1;
```
