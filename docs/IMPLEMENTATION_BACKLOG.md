# StreamRPG — Implementation Backlog

> Gerado em 2026-07-04. Este documento **não inventa features novas**.
> Lista apenas infraestrutura que já existe no código, já foi
> deliberadamente projetada para crescer, e hoje está sub-utilizada —
> ou seja: o próximo trabalho aqui é **conteúdo e/ou uma decisão
> pequena de dado**, não arquitetura nova. Cada item aponta o arquivo
> exato que precisa crescer e o que, precisamente, falta.

## 1. Identity — Títulos e Molduras

- **Onde**: `apps/api/src/services/identity.service.ts` (`TITLE_CATALOG`, `FRAME_CATALOG`).
- **Hoje**: 6 títulos + 6 molduras.
- **Pronto para**: centenas de entradas — cada título/moldura novo é uma linha no catálogo + uma função de critério em `TITLE_CHECKS`/`FRAME_CHECKS` (leitura pura sobre dado que já existe: level, minutos, `boss_rewards`, `expeditions`, `viewer_sessions`). **Nenhuma migração de schema necessária** para crescer.
- **O que falta de verdade**: escrever os títulos/critérios em si. A moldura `moldura-evento` já existe no catálogo com critério `() => false` — reservada para quando um World Event real existir.

## 2. Kingdom Prestige — Cargos do Hall da Fama

- **Onde**: `packages/shared/src/types.ts` (`KINGDOM_ROLE_CATALOG`), critérios em `apps/api/src/services/kingdom-prestige.service.ts`.
- **Hoje**: 6 cargos fixos (Guardião, Campeão dos Bosses, Grande Explorador, Herói do Reino, Membro Mais Antigo, Maior Sequência).
- **Pronto para**: mais cargos — o padrão `ROLE_COMPUTERS: Record<KingdomRoleSlug, ...>` já é extensível, mas **cada cargo novo exige uma função de critério nova em SQL/JS**, não é tão barato quanto Identity (não é só uma linha de catálogo).
- **O que falta**: decidir se vale a pena mais de 6 cargos antes de implementar — hoje o Hall da Fama já ocupa uma tela cheia com 6.

## 3. Biblioteca (Library)

- **Onde**: `apps/web/src/lib/library.ts` (`BOOKS`, `BOOK_CATEGORIES`).
- **Hoje**: 5 livros placeholder, 10 categorias estruturadas (só 5 usadas).
- **Pronto para**: milhares de livros — é um array estático no frontend, sem paginação de rede, sem backend. Crescer é só adicionar entradas a `BOOKS`.
- **O que falta de verdade**:
  1. Escrever o conteúdo real de `pages: string[]` de cada livro (o exemplo que a Sprint anterior deu — "Os Lobos Cinzentos do Bosque Sussurrante..." — é exatamente esse tipo de texto).
  2. **Decisão pendente de infraestrutura, não de conteúdo**: com centenas/milhares de livros, um array estático no bundle do frontend deixa de ser ideal (aumenta o tamanho do JS carregado por todo mundo, mesmo quem nunca abre a Biblioteca). Ponto natural para migrar para uma tabela `books` + rota `GET /api/library` quando o catálogo passar de ~50-100 entradas.
  3. A lógica de `locked`/`status` (Bloqueado/Conhecido/Lido) é hoje **só um campo estático no catálogo** — nenhuma regra real de desbloqueio existe. Decidir o que desbloqueia um livro (Prestígio? Level? Expedição específica?) é a próxima decisão de design, não de código.

## 4. Bestiário (Bestiary)

- **Onde**: `apps/web/src/lib/bestiary.ts` (`CREATURES`, `CREATURE_TYPES`).
- **Hoje**: 5 criaturas placeholder, 8 tipos.
- **Pronto para**: milhares de criaturas, mesmo padrão da Biblioteca (reaproveita literalmente o `BookPage`/`renderMarkdownLite` dela).
- **O que falta**: idêntico à Biblioteca (itens 1-3 acima) — escrever o conteúdo real, e a mesma decisão futura de mover para tabela quando o catálogo crescer. Cada criatura já referencia um `regionId` real (`packages/shared`/`apps/web/src/lib/regions.ts`) — histórias de criatura podem (e provavelmente devem) cruzar com o texto de Encounter da mesma região.

## 5. Encounters (Expedição)

- **Onde**: `apps/api/src/systems/ExpeditionSystem.ts` (geração de `current_event`/categoria/ícone).
- **Hoje**: 8 categorias (natureza/combate/descoberta/descanso/mistério/comércio/clima/ruínas), texto genérico por categoria — não específico por região.
- **Pronto para**: até 300 Encounters de alta qualidade, o volume que o próprio usuário já mencionou como meta. A estrutura (categoria + ícone + texto) já existe e já alimenta a Timeline do Reino automaticamente (World Simulation) sem precisar de mudança de código.
- **O que falta**: os textos reais, idealmente diferenciados por região (`regionId`) e não só por categoria — hoje o mesmo texto de "natureza" pode aparecer em qualquer região, o que dilui a identidade de cada uma (documentada em `docs/world-design/regions.md`).

## 6. Capital City — prédios

- **Onde**: `apps/web/src/components/city/CityMap.tsx` (`BuildingKey`, array `BUILDINGS`).
- **Hoje**: 9 prédios (Arena, Ferreiro, Mercador, Alquimista, Guilda, Banco, Portão Norte, Biblioteca, Bestiário).
- **Pronto para**: mais prédios — cada um novo é uma entrada no array + um componente `XBuilding.tsx` próprio + um `case` a mais em `CityPage.tsx`. Nenhuma mudança estrutural necessária.
- **Prédios com NPC mas sem funcionalidade real ainda** (infraestrutura de apresentação pronta, esperando a mecânica): `MerchantBuilding` (loja — depende da decisão de Gold/Marketplace, ver PROJECT_STATUS §5) e `AlchemistBuilding` (poções — nenhuma mecânica de consumível existe no jogo hoje).

## 7. NPCs

- **Onde**: `apps/web/src/lib/npcs.ts` (`NPCS`).
- **Hoje**: 9 NPCs fixos, um por prédio + Eldrin (guia de onboarding).
- **Pronto para**: qualquer quantidade — `NpcPortrait` gera um retrato único (forma+cor+ícone, CSS puro) para qualquer combinação nova, sem precisar de arte.
- **O que falta**: personalidade mais profunda por NPC (diálogos contextuais, reações a eventos do Reino) — hoje cada NPC só tem uma frase fixa (`quote`) e uma descrição estática, nenhuma variação.

## 8. Regiões

- **Onde**: `packages/shared/src/regions.ts` + `apps/web/src/lib/regions.ts` (`REGIONS`).
- **Hoje**: 11 regiões com nome/dificuldade/tema/descrição — conteúdo estático, compartilhado entre backend (grafo de viagem BFS) e frontend (galeria).
- **Pronto para**: cada região já é referenciada por Expedições, Encounters e agora Bestiário — é o "esqueleto geográfico" mais reaproveitado do projeto.
- **O que falta**: Lendas/Histórias por região (mencionado no pedido do usuário como "Lendas dos Reinos") ainda não tem nenhum lugar estruturado para viver — candidato natural: uma categoria dedicada na Biblioteca (`regioes`, já existe no catálogo de categorias, hoje sem nenhum livro).

## 9. Kingdom (conceito amplo, capítulo 8 da Bible)

- **Onde**: `docs/game-design-bible/08-kingdoms.md` (design), implementação real só em Kingdom Prestige (cargos/Hall da Fama).
- **Hoje**: um Reino = um canal Twitch + seu Hall da Fama + Prestígio (número calculado, sem uso ainda).
- **Pronto para**: o próprio Prestígio já foi desenhado para "servir futuramente para: liberar regiões, NPCs, eventos, Bosses, dungeons, temporadas" (comentário original da Sprint Kingdom Prestige System) — `getKingdomPrestige(channelId)` já retorna um `score` + `breakdown` detalhado, pronto para ser lido por qualquer sistema de gate futuro.
- **O que falta**: nenhum sistema ainda **consome** o Prestígio para liberar nada. É a peça de infraestrutura mais "pronta e não usada" do projeto inteiro.

## 10. Onboarding (New Player Journey)

- **Onde**: `apps/web/src/lib/onboarding.ts`.
- **Hoje**: flags booleanas simples (`welcome_seen`, `city_seen`, etc.) + 3 falas fixas do Eldrin.
- **Pronto para**: mais marcos (`OnboardingFlag` é um union type, fácil de estender) e mais falas do Eldrin (array `LINES`, sequencial).
- **O que falta**: Eldrin só tem 3 falas hoje — a estrutura sequencial (`eldrin_step`) já suporta qualquer número de falas novas, cada uma amarrada a um marco real (flag existente ou nova).

## Ordem sugerida (maior impacto por esforço, não uma exigência)

1. **Conteúdo de Encounter por região** — já tem distribuição automática via Timeline/World, maior alcance imediato (todo jogador vê isso a cada expedição).
2. **Conteúdo da Biblioteca e do Bestiário** — infraestrutura idêntica, mesmo esforço de escrita, ambos já com UI pronta na Cidade.
3. **Decisão de Gold** — não é conteúdo, é a única decisão arquitetural que efetivamente **bloqueia** progresso futuro (Marketplace/Economy).
4. **Classes** — design já fechado, é implementação pura a partir daqui.
5. **Consumir o Prestígio para algo real** — é a peça que mais "sobra" hoje: calculado, exposto, e nunca lido por nenhum gate.
