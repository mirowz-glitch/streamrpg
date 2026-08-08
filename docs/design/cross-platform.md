# Cross-Platform Integration

**Status:** 🚧 Preparação — conceitual, nenhuma implementação. Parte da Sprint "Foundation Refactor".

## 1. O princípio

Twitch, Kick, YouTube e Discord passam a ser integrações — exatamente como Google Login, Discord Login e E-mail Login. Elas conectam pessoas. Nunca controlam a existência do personagem, nunca são requisito para jogar.

## 2. O que cada integração faz (nunca gameplay obrigatório)

- **Chat** — comandos/consultas de status via chat da plataforma (ex.: "!personagem" mostrando XP atual), sempre um espelho de dado que já existe no jogo, nunca uma fonte de dado exclusiva.
- **Notificações** — avisos de eventos do Reino (invasão, eleição, marco de Crônica) entregues via Discord/chat, para quem optou por conectar.
- **Raids** (Twitch/Kick) — trazer viewers de uma live diretamente para o Reino do streamer, uma forma de aquisição/onboarding, nunca um mecanismo de jogo.
- **Eventos** — festivais/feiras podem ser anunciados ou até levemente influenciados por atividade de stream (ex.: um Reino-Streamer em live pode ter frequência de evento ligeiramente maior enquanto a live está ativa) — desde que a mesma frequência de evento continue existindo, em ritmo normal, quando não há live.
- **Recompensas** — bônus cosméticos/de reconhecimento por conectar uma plataforma (ex.: um selo de "vindo da Twitch de [nome]"), nunca vantagem de poder/progressão.
- **Integração social** — o vínculo entre a comunidade de uma plataforma (seguidores de um streamer) e a cidadania real dentro do jogo, sem fundir os dois conceitos (ver `citizen-system.md` — cidadania nunca é audiência).

## 3. O teste de equivalência (reaplicado)

Mesma regra de `login-providers.md`: qualquer proposta de integração precisa responder "sim" a *"se removermos Twitch, YouTube, Kick e Discord completamente, esta mecânica continua funcionando?"* Se a resposta for "não", a mecânica pertence ao sistema de integração social, nunca ao núcleo do jogo — e precisa ser redesenhada até que o núcleo funcione sem ela.

## 4. O que muda tecnicamente hoje (descrito conceitualmente)

`routes/overlay.ts` (rotas `/api/overlay/:channel/viewers`, `/api/overlay/:channel/boss`) e o mecanismo de Overlay em si deixam de ser uma peça central do fluxo de jogo e passam a ser um dos vários consumidores possíveis dos mesmos dados que já existem (estado de Reino, Boss, Hall da Fama) — não um caminho de dado exclusivo. O `channel` como parâmetro de rota passa a significar Reino, coerente com `kingdom-domain-2.0.md`.

## 5. O que não muda

Nenhuma mecânica de jogo (Adventure, Economy, Merchant, Blacksmith, Salvage, Boss, Cidadania) lê estado de plataforma de streaming diretamente — todas consomem `character_id`/`kingdomId`, nunca `channel`-como-Twitch. Isso já é verdade hoje para a maior parte do jogo (auditado em `world-foundation-4.0.md` Seção 2.7) e continua assim.

---

*Referências: `login-providers.md` (o teste de equivalência de origem); `world-foundation-4.0.md` Seção 2.5 (auditoria das rotas Overlay/World channel-scoped); `social-loop.md`.*
