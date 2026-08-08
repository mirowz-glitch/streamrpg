# World Foundation 4.0 — MMORPG Idle Independente da Twitch

**Status:** 🚧 Preparação — documento conceitual, nenhuma implementação a partir daqui. Sprint "Foundation Refactor", consolidando as três revisões arquiteturais anteriores (Product Vision 2.0, Kingdom Domain Redesign, World Design 3.0 — todas realizadas na mesma sessão, antes deste documento) em documentação formal de `docs/design/`.

Este é o documento-índice da nova fundação conceitual do StreamRPG. Os 13 documentos irmãos (`identity-core.md`, `login-providers.md`, `kingdom-domain-2.0.md`, `citizen-system.md`, `housing-phase1.md`, `real-estate.md`, `kingdom-treasury.md`, `trade-routes.md`, `world-events.md`, `cross-platform.md`, `social-loop.md`, `long-term-retention.md`, `new-roadmap.md`) detalham cada domínio; este documento explica **por que** a mudança é necessária e **o que exatamente** depende da Twitch hoje, com evidência real do código, não suposição.

## 0. A frase que resume tudo

De: *"Um jogo para Twitch."*
Para: *"Um MMORPG Idle independente, persistente e social, onde Twitch, Kick, YouTube e Discord são apenas portas de entrada para comunidades e Reinos, nunca requisitos para jogar."*

## 1. Antes / Depois

```
ANTES                          DEPOIS

Streamer                       Mundo
  ↓                              ↓
Canal                          Reinos
  ↓                              ↓
Jogadores                      Cidadãos
                                 ↓
                               Streamer (opcional — um tipo
                               de liderança entre vários)
```

Hoje, um jogador só existe porque um streamer (ou ele mesmo, agindo como "canal de si mesmo") existe primeiro na cadeia. Na visão nova, o Mundo existe primeiro — sempre — e Reinos, Cidadãos e (opcionalmente) streamers vêm depois, sem nenhum deles ser pré-requisito do anterior.

## 2. Auditoria — o que depende da Twitch hoje (evidência real)

Esta seção é o produto de uma leitura direta do código (`apps/api/src/config/schema.ts`, `routes/auth.ts`, `services/auth.service.ts`, `services/channel.service.ts`, `services/kingdom-prestige.service.ts`, `routes/overlay.ts`, `routes/world.ts`, `services/identity.service.ts`), não de memória ou suposição.

### 2.1 Identity — `profiles`

**O que existe hoje:** `profiles.twitch_id TEXT NOT NULL UNIQUE`. `services/auth.service.ts` só sabe fazer OAuth com a Twitch (`getTwitchAuthUrl`/`exchangeTwitchCode`/`fetchTwitchUser`). `routes/auth.ts`'s `GET /api/auth/callback` é o único caminho de criação de `profile` — sempre a partir de um usuário Twitch real.

**Por que depende da Twitch:** o projeto nasceu como overlay de engajamento de viewer — a identidade do jogador sempre foi, por construção, a identidade Twitch dele.

**Como ficará:** `profiles` deixa de ter uma identidade externa obrigatória embutida na própria linha. Login vira um evento que resolve/cria um `profileId` — nunca o inverso. Ver `identity-core.md`.

**O que pode ser reaproveitado:** o mecanismo de sessão inteiro (`middleware/auth.ts` — cookie HTTP-only, tabela `sessions`, `profile_id`) **já é agnóstico de provedor** — ele só sabe de `profileId`, nunca de `twitch_id`. Essa é a melhor notícia desta auditoria: o pedaço mais sensível (sessão autenticada) não precisa mudar de forma nenhuma.

**O que muda:** a rota de callback e o modelo de dado de identidade externa. Ver `login-providers.md`.

### 2.2 Reino — `streamer_channels`

**O que existe hoje:** `streamer_channels` já tem exatamente a forma de um Reino embrionário (`id`, `display_name`, `owner_profile_id` — já nullable —, `is_pro`, `settings`), mas também tem `twitch_id TEXT NOT NULL UNIQUE`, e todo login via `routes/auth.ts` chama `connectStreamerChannel()` automaticamente — **todo jogador que já jogou hoje é, sem saber, dono de um "canal"** criado no próprio login.

**Por que depende da Twitch:** um Reino hoje só nasce como efeito colateral de alguém logar com Twitch — nunca por um ato de fundação deliberado.

**Como ficará:** Reino vira uma entidade fundada explicitamente (por um jogador, por uma comunidade, ou preexistente como o Reino Oficial administrado pela Coroa), nunca um subproduto automático de login. Ver `kingdom-domain-2.0.md`.

**O que pode ser reaproveitado:** a tabela em si (forma física: nome, avatar, dono opcional, configurações) e toda a UI de Cidade construída em cima dela (`CityMap.tsx`, `GuildBuilding.tsx`, os 12 prédios).

**O que muda:** remoção da obrigatoriedade de `twitch_id`; o mecanismo de "quem lidera" deixa de ser um único campo fixo e vira um modelo plugável.

### 2.3 Kingdom Prestige — `kingdom-prestige.service.ts`

**O que existe hoje:** um sistema já sofisticado — 6 cargos (`Guardião`, `Campeão de Bosses`, `Grande Explorador`, `Herói do Reino`, `Membro Antigo`, `Maior Sequência`), Hall da Fama, score de prestígio. Todos os 6 `computeX()` leem de `viewer_sessions`/`channel_rankings` — o comentário no próprio código diz, literalmente: *"'Membro' de um Reino é definido por ter ao menos uma linha em viewer_sessions ou channel_rankings"*.

**Por que depende da Twitch:** pertencer a um Reino, hoje, significa ter assistido àquela live.

**Como ficará:** pertencimento passa a ser derivado de jogo real (expedições, presença de personagem, contribuição econômica) — nunca de audiência. Ver `citizen-system.md`.

**O que pode ser reaproveitado:** a mecânica inteira de cargos/Hall da Fama/score é boa arquitetura e sobrevive **como conceito e UI** — só a fonte de dado muda.

**O que muda:** os 6 `computeX()` internamente; nada na superfície visível ao jogador.

### 2.4 Boss — `bosses.channel_id`

**O que existe hoje:** `bosses.channel_id TEXT NOT NULL REFERENCES streamer_channels`, com um índice único parcial garantindo um Boss ativo por canal. A mecânica de combate em si (participação por presença via `SessionManager`, não por chat/ping) já não é Twitch-específica.

**Como ficará:** `channel_id` passa a significar "Reino", não "canal de streamer" — Boss por Reino, não por canal.

**O que não muda:** toda a mecânica de combate, participação, recompensa proporcional.

### 2.5 Overlay/Ranking/World — rotas channel-scoped

**O que existe hoje:** `routes/overlay.ts` (`/api/overlay/:channel/viewers`, `/api/overlay/:channel/boss`), `routes/world.ts` (`?channel=` para `getChannelKingdomState`), presumivelmente `routes/ranking.ts` — todas usam `channel` como parâmetro de URL, resolvendo para `streamer_channels.id`.

**Como ficará:** o parâmetro passa a significar "Reino" (`kingdomId`), e o Overlay em si vira uma das integrações opcionais (ver `cross-platform.md`), não uma rota central do jogo.

### 2.6 Identity/Founder — `identity.service.ts`

**O que existe hoje:** um único ponto de acoplamento residual — uma subquery usa `viewer_sessions.first_ping_at` para achar "o primeiro personagem a assistir um canal", usado presumivelmente em algum cálculo de Fundador.

**Como ficará:** "primeiro a chegar" passa a ser medido por primeira presença de jogo real no Reino (primeira expedição, primeiro login residente), não primeiro ping de chat.

### 2.7 Economy Core, Merchant, Blacksmith, Salvage, Adventure, Chronicles, Titles/Frames

**O que existe hoje:** confirmado por leitura direta de `character_resources`/`resource_transactions`/`expeditions`/`character_items`/`equipped_items`/`character_chronicles`/`titles`/`frames` — **nenhuma dessas tabelas tem `channel_id`.** Cada uma delas foi construída, sprint após sprint, inteiramente character-scoped.

**Por que não depende da Twitch:** decisão arquitetural antiga e bem-sucedida ("eventos de gameplay nunca carregam channelId") aplicada consistentemente em todo o trabalho de Merchant/Blacksmith/Salvage/Equipment Lock desta fase do projeto.

**Como ficará:** exatamente igual. **Nada muda.** A única mudança de contexto (não de lógica) é que a "Capital" que hospeda Merchant/Ferreiro/Sucateiro deixa de ser um singleton implícito e passa a ser "a Capital do Reino atual do jogador".

## 3. Streamer — a nova definição

De: **servidor / shard / requisito para jogar.**
Para: **líder / governante / prefeito / rei / patrocinador / influenciador — um dos tipos de liderança de um Reino, nunca mais que isso.**

Um streamer que nunca conectar Twitch ainda pode fundar, liderar e crescer um Reino via qualquer outro modelo de liderança (eleição, mérito). Um streamer que conectar Twitch ganha uma forma **a mais** de trazer comunidade — nunca uma forma exclusiva.

## 4. O que não muda (a base técnica é preservada)

Engine (`packages/shared`), Adventure Session, Economy Core, Merchant, Blacksmith, Salvage, Equipment Lock, Item Generator, World/Regiões/Biomas, Chronicles de personagem, Titles/Frames — **tudo isso permanece, sem uma linha alterada, como a base do novo mundo.** Esta Sprint não desperdiça o RC1; ela dá a ele um teto novo, sem tocar as paredes.

## 5. Índice dos documentos irmãos

| Documento | Domínio |
|---|---|
| `identity-core.md` | Personagem pertence ao mundo, nunca ao streamer/canal |
| `login-providers.md` | Google/Discord/E-mail/Kick/Twitch/YouTube — mesma conta, sem vantagens |
| `kingdom-domain-2.0.md` | Reino como entidade permanente, liderança plugável |
| `citizen-system.md` | Visitante → Residente → Cidadão → Veterano → Lenda |
| `housing-phase1.md` | Casas, bairros, impostos, abandono, histórico permanente |
| `real-estate.md` | Mercado imobiliário — propriedade separada de título |
| `kingdom-treasury.md` | Tesouro do Reino, extensão do Economy Core |
| `trade-routes.md` | Comércio inter-Reino, vocações econômicas |
| `world-events.md` | Eventos naturais emergentes + camada permanente vs. sazonal |
| `cross-platform.md` | Twitch/Kick/YouTube/Discord como integrações iguais |
| `social-loop.md` | Amizade, rivalidade, comércio, orgulho de Reino |
| `long-term-retention.md` | Por que alguém joga por 1 semana, 1 ano, 10 anos |
| `new-roadmap.md` | A nova sequência de 14 sistemas |

---

*Referências: as três revisões arquiteturais conduzidas nesta mesma sessão de projeto (Product Vision 2.0, Kingdom Domain Redesign, World Design 3.0 — "O Reino como Sociedade Viva") são a base de todo o raciocínio deste documento e dos seus irmãos; `docs/architecture/decisions.md` (decisões congeladas do RC1, nenhuma delas contradita aqui); `docs/design/gold-architecture-phase1.md` (precedente de "resolver a dúvida arquitetural antes do domínio grande" reaplicado a Kingdom Treasury).*
