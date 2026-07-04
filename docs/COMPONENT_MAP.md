# StreamRPG — Component Map

> Gerado automaticamente a partir de `apps/web/src/` em 2026-07-04.
> 9 páginas + 60 componentes + 8 hooks + 13 módulos `lib/`. Convenção do
> projeto: cada pasta de `components/` é um domínio (`ui`, `city`,
> `landing`, `onboarding`, `library`, `bestiary`), nunca um componente
> solto na raiz de `components/`.

## Páginas (`apps/web/src/pages/`) — todas lazy-loaded via `React.lazy` em `lib/router.tsx`

| Página | Rota | Chunk próprio desde |
|---|---|---|
| `LoginPage` | `/`, `/login` | Sprint Performance Optimization |
| `AuthCallbackPage` | `/auth/callback` | idem |
| `CharacterPage` | `/app/character` | idem |
| `CityPage` | `/app/city` | idem |
| `InventoryPage` | `/app/inventory` | idem |
| `RankingPage` | `/app/ranking` | idem |
| `WorldPage` | `/app/world` | idem |
| `StreamerPage` | `/app/streamer` | idem |
| `OverlayPage` | `/overlay/:channel` | idem |

`CharacterPage` é a página mais "pesada" em composição — importa 9 componentes de `onboarding/` + `BossCard` + `ExpeditionPanel` + `IdentityPanel` + `EquipmentSlots` + `StatsRow` + `XpBar` + `FramedAvatar`. `CityPage` é a segunda — 9 `*Building` + `CityMap` + `CityHubBar` + `CitySquareDecor`.

## `components/ui/` — genéricos, reaproveitados entre páginas

| Componente | Usado por (contagem) | Observação |
|---|---|---|
| `StatsRow` | 7: `ArenaBuilding`, `BankBuilding`, `CityHubBar`, `ExpeditionPanel`, `IdentityPanel`, `CharacterPage`, `WorldPage` | Extraído na Sprint Engineering Cleanup — antes eram 7 blocos JSX idênticos duplicados |
| `ProgressBar` | 4: `BossCard`, `ExpeditionCompact`, `ExpeditionPanel`, `XpBar` | Extraído na mesma Sprint — 4 variantes de barra (`xp`/`boss`/`expedition`/`expedition-compact`) sobre uma única estrutura CSS |
| `FramedAvatar` | 3: `CharacterPage`, `RankingPage`, `landing/CharacterPreview` | Avatar + moldura de Identity num só lugar |
| `XpBar` | `CharacterPage`, `OverlayPage`, `RankingPage`, `landing/CharacterPreview` | Wrapper fino sobre `ProgressBar` |
| `AppNav` | toda página autenticada (8 delas) | Também injeta o "brilho" de onboarding (Sprint New Player Journey) |
| `BossCard` | `CharacterPage`, `OverlayPage` | `React.memo` (Sprint Performance) — tem polling próprio via `useBossState` |
| `ExpeditionPanel` | `CharacterPage` | `React.memo`, polling próprio via `useExpedition` |
| `ExpeditionCompact` | `OverlayPage` | Versão compacta, sem polling próprio (recebe dado já pronto) |
| `EquipmentSlots` | `CharacterPage`, `city/BlacksmithBuilding` | `React.memo` |
| `IdentityPanel` | `CharacterPage` | `React.memo` — depende de callbacks `useCallback` estáveis vindos de `CharacterPage` |
| `HallOfFame` | `WorldPage`, `landing/KingdomPreview` | Item interno `HallOfFameSlotItem` memoizado |
| `Timeline` | `WorldPage`, `landing/KingdomPreview` | Item interno `TimelineItem` memoizado |
| `RegionGallery` | `WorldPage`, `city/NorthGateBuilding`, `landing/WorldPreview` | `React.memo`, zero props (conteúdo 100% estático) |
| `Feedback` | `CharacterPage`, `InventoryPage` | Mensagem inline (erro/level-up/drop) |

## `components/city/` — Cidade e seus 9 prédios

`CityMap` (memoizado) é o único ponto que conhece a lista de prédios
(`BuildingKey` + array `BUILDINGS`). Cada prédio é um componente
independente que `CityPage.tsx` renderiza condicionalmente por
`selected === "chave"` — nenhum prédio importa outro.

| Prédio | NPC | Reaproveita |
|---|---|---|
| `ArenaBuilding` | Kade | `StatsRow`, `NpcIntro` |
| `BlacksmithBuilding` (Ferreiro) | Borin | `EquipmentSlots`, `NpcIntro` |
| `MerchantBuilding` (Mercador) | Talia | `NpcIntro` (sem funcionalidade real ainda) |
| `AlchemistBuilding` | Zoltar | `NpcIntro` (sem funcionalidade real ainda) |
| `GuildBuilding` (Guilda) | Mestra Elenya | `HallOfFame`, `NpcIntro` |
| `BankBuilding` (Banco) | Dorwin | `StatsRow`, `NpcIntro` |
| `NorthGateBuilding` (Portão Norte) | Sargento Roth | `RegionGallery`, `ExpeditionPanel`, `NpcIntro` |
| `LibraryBuilding` (Biblioteca) | Bibliotecária Miriam | `BookShelf`, `BookReader`, `NpcIntro` |
| `BestiaryBuilding` (Bestiário) | Erudito Yannick | `CreatureCatalog`, `CreatureReader`, `NpcIntro` |

`NpcIntro`/`NpcPortrait` são usados por **10 componentes** (os 9 prédios
+ `landing/CityPreview`) — o retrato (forma+cor+ícone via CSS,
`lib/npcs.ts`) é o padrão de reuso mais bem-sucedido do projeto até
agora.

`CityHubBar` e `CitySquareDecor` compõem a Praça Central (tela sem
prédio selecionado); ambos `React.memo` para não re-renderizar a cada
tick do relógio (1s) de `CityPage`.

## `components/landing/` — só a Landing Page, nunca usados fora dela

`LandingBackground`, `HeroIllustration`, `HeroSection`, `FeatureCard`,
`HowItWorks`, `WorldPreview`, `KingdomPreview`, `CityPreview`,
`CharacterPreview`, `FinalCTA`. Único domínio onde os componentes
recebem **dados fabricados** (mock ilustrativo, rotulado "Exemplo
ilustrativo" na tela) em vez de dados reais — decisão deliberada da
Sprint Landing Page 2.0, não um bug.

## `components/onboarding/` — só usados em `CharacterPage`/`CityPage`/`WorldPage`/`RankingPage`

`WelcomeCard`, `FirstSteps`, `JourneyProgress`, `EldrinGuide`,
`FirstItemCard`, `FirstLevelBanner`, `FirstBossBanner`, `NewTitleModal`
(todos só em `CharacterPage`) e `GuideBubble` (um em cada uma das 4
páginas principais — `CharacterPage`/`CityPage`/`WorldPage`/`RankingPage`).
Toda persistência é `localStorage` (`lib/onboarding.ts`), zero
escrita no backend.

## `components/library/` e `components/bestiary/` — mesma arquitetura, catálogos irmãos

`library/BookPage` é importado tanto por `library/BookReader` quanto
por `bestiary/CreatureReader` — **é o único componente que já atravessa
dois domínios de pasta**, deliberado (Sprint Bestiary System reaproveitou
o reader da Biblioteca em vez de duplicar). `BookCard`/`BookCategory`/
`BookShelf` têm equivalentes paralelos e não-compartilhados em
`bestiary/` (`CreatureCard`/`CreatureFilter`/`CreatureCatalog`) porque os
campos de uma criatura (habitat/região/periculosidade) não mapeiam 1:1
para os de um livro (autor/categoria) — ver `IMPLEMENTATION_BACKLOG.md`
para a análise de quando valeria generalizar isso.

## Hooks (`apps/web/src/hooks/`)

| Hook | Consumido por | Padrão |
|---|---|---|
| `useAuth` | toda página | fetch único em `/api/auth/me` |
| `useCharacter` | `CharacterPage`, `CityPage`, `onboarding/*` | idem, `/api/character` |
| `useIdentity` | `CharacterPage`, `CityPage` | idem, `/api/identity/me`, expõe `equipTitle`/`equipFrame` já com `useCallback` |
| `useKingdomRole` | `CharacterPage` | idem, `/api/kingdom/:channel/me` |
| `usePing` | `CharacterPage` | único hook com `setInterval` de contagem regressiva (cooldown) — re-renderiza a página host a cada 1s enquanto o cooldown está ativo |
| `useExpedition` | `ExpeditionPanel` | poll 5s, pula `setState` se o dado não mudou (Sprint Performance) |
| `useBossState` | `BossCard`, `onboarding/FirstBossBanner` | poll 5s, mesmo padrão de pular `setState` |
| `useFirstVisit` | `onboarding/GuideBubble` | não faz fetch — só lê/escreve uma flag de `localStorage` |

## Dead / duplicado / candidato a reuso

- **Componentes mortos**: nenhum encontrado. Confirmado por varredura
  (`grep` por nome de cada arquivo em `components/`/`hooks/` contra todo
  `apps/web/src/`) na Sprint Engineering Cleanup e novamente ao gerar
  este documento — todo componente tem pelo menos um importador real.
- **Componentes duplicados**: nenhum hoje. Os dois casos reais já foram
  resolvidos (Sprint Engineering Cleanup): a estrutura `.identity-stats`
  repetida 7 vezes virou `StatsRow`; as 4 barras de progresso viraram
  `ProgressBar`.
- **Candidatos a reuso futuro** (não fazer agora, só registrar):
  - `BookReader` (Biblioteca) e `CreatureReader` (Bestiário) têm o
    mesmo esqueleto (título + fatos + `BookPage` + navegação
    anterior/seguinte) com campos diferentes. Se um **terceiro**
    catálogo "estilo códice" aparecer (ex: um Bestiário de Itens
    Lendários, um Diário de Regiões), vale generalizar para um
    `CodexReader<T>` genérico em vez de um terceiro reader paralelo.
  - `NpcPortrait` (forma+cor+ícone via CSS) já é reaproveitado para
    todo NPC — é o candidato mais forte para virar também o retrato de
    "Streamer"/"Guildmaster de outro Reino" se esses conceitos
    ganharem UI própria.
  - `BookCard`/`CreatureCard` têm a mesma estrutura visual (ícone +
    nome + meta + status) com campos diferentes — mesmo raciocínio do
    `CodexReader` acima: só vale generalizar se aparecer um terceiro
    catálogo de cards.
