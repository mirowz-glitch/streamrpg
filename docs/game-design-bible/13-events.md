# 13. Eventos

**Status:** ✅ Estável

Este capítulo não explica código — explica as regras permanentes por trás
dos eventos do `EventBus`. Essas decisões levaram dias para amadurecer
(ver histórico de Sprints D4/E4); sem registro, a pergunta "por que o XP não
tem `channelId`?" ia precisar ser respondida do zero outra vez.

## Categorias

Todo evento pertence a exatamente uma categoria:

- **Engine** — o próprio coração da simulação. Hoje: `world.tick`. Não
  representa uma regra de jogo, representa "o tempo avançou".
- **Platform** — presença numa plataforma específica. Hoje: `session.started`.
  Carrega `characterId` + `channelId` (e, futuramente, `platform`).
- **Gameplay** — mudança de estado do Character. Hoje: `xp.granted`,
  `level.up`, `drop.granted`. Progressão pertence ao personagem, nunca à
  sessão ou ao canal onde ele estava presente.
- **World** — algo compartilhado por um contexto (hoje: um canal), sem
  personagem específico. Hoje: `boss.activated`.

## Escopos

- **Global** — sem um único `characterId`/`channelId` próprio. Hoje o único
  exemplo é `world.tick`, que carrega um snapshot de múltiplas sessões (não
  um character ou canal específico) — por isso conta como Global, não
  Session/World/Character. Eventos de sistema inteiro (ex: manutenção,
  evento global) também usariam este escopo, mas ainda não existem.
- **World** — tem `channelId`, nunca `characterId`. Ex: `boss.activated`.
- **Character** — tem `characterId`, nunca `channelId`. Ex: `xp.granted`,
  `level.up`, `drop.granted`.
- **Session** — tem `characterId` **e** `channelId`. Representa presença,
  não progressão. Ex: `session.started`.

## Regras

1. **Gameplay nunca carrega `channelId`.** Progressão pertence ao
   personagem, não ao lugar onde ele estava. Sem exceção até hoje.
2. **World pode carregar contexto** (`channelId`), mas nunca `characterId` —
   representa algo compartilhado por um canal, não por uma pessoa.
3. **Platform nunca modifica Character diretamente — exceto Welcome Reward,
   exceção documentada.** `WelcomeRewardSystem` reage a `session.started`
   (Platform/Session) e concede XP real ao Character. Isso é intencional,
   não um vazamento acidental — mas deve continuar sendo a **única**
   exceção. Qualquer novo System que reaja a um evento de Platform para
   mutar Character diretamente precisa ser confrontado com esta regra antes
   de ser aceito, não depois.

## Tabela de referência rápida

| Evento | Categoria | Escopo | Carrega |
|---|---|---|---|
| `world.tick` | Engine | Global | snapshot de sessões ativas |
| `session.started` | Platform | Session | `characterId`, `channelId` |
| `xp.granted` | Gameplay | Character | `characterId` |
| `level.up` | Gameplay | Character | `characterId` |
| `drop.granted` | Gameplay | Character | `characterId` (`channelId` opcional, hoje sempre ausente) |
| `boss.activated` | World | World | `channelId` |

## Dependências

Eventos depende de:
- Princípios permanentes (as regras de escopo derivam diretamente deles)
