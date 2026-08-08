# World Loot System — Phase I (Sprint 25)

**Status:** 🚧 Infraestrutura apenas — nenhuma taxa de drop foi balanceada, nenhum consumidor real (`itemgen/generator.ts`, `lootgen/`, `lootidentity/`, `spheredrop/rollSphereDrop.ts`) lê nenhuma tabela deste módulo ainda. Este documento explica a DECISÃO (por que região passa a ter identidade econômica própria) — o balanceamento real e a integração no pipeline de drop ficam para uma Sprint futura.

## 1. Por que regiões diferentes mantêm o mercado vivo

Antes desta Sprint, o pipeline de loot era `Monstro -> Item`: o `regionId` só influenciava o Item Level (`getRegionItemLevelAnchor()`, `regions.ts`, Sprint "Region-Anchored Item Level") — nunca QUAL base, esfera, gema ou material tinha mais chance de aparecer. Duas regiões de mesmo nível produziam, em expectativa, exatamente o mesmo tipo de item, só com Item Level diferente. Isso significa que, hoje, "onde farmar" nunca é uma pergunta com resposta interessante — só "que nível está a região".

Esta Sprint introduz a camada que falta: `Mundo -> Região -> Biome -> Zona -> Monstro -> Item`. Cada `WorldRegion` aponta pra um `BiomeTypeId` (`worldregion/biomeRegistry.ts`); cada Biome carrega uma afinidade própria de Base Item (`baseAffinity.ts`), Esfera (`sphereAffinity.ts`) e categoria de Gema (`gemAffinity.ts`) — nunca exclusividade, sempre multiplicador. Uma vez que o pipeline real ler essas tabelas (Sprint futura), "Machados vêm mais de Montanhas" deixa de ser só lore e passa a ser um motivo real pra visitar uma região específica.

Mandamento 7 da Filosofia (`00-philosophy.md`): *"A economia é dirigida pelos jogadores, nunca por decreto."* Esta Sprint não fixa nenhuma taxa — ela só garante que a infraestrutura de identidade regional existe pronta pra um balanceamento futuro ler. O valor de uma região continua emergindo do que os jogadores decidirem fazer com essa identidade (farmar lá, revender o excedente), nunca de um número de design imutável.

## 2. Por que um jogador sempre terá motivo de visitar mapas antigos

Hoje, uma vez que uma região fica "pra trás" na progressão (ex.: Bosque Sussurrante depois de já estar em Fortaleza Sombria), não existe nenhum motivo mecânico pra voltar — o Item Level do loot lá é sempre pior. Com afinidade regional real (Sprint futura consumindo esta infraestrutura), isso muda: se Arcos têm afinidade real com Floresta (`bow: { forest: 2 }`), um jogador de nível alto que precise de um Arco específico ainda tem um motivo genuíno de revisitar o Bosque Sussurrante — mesmo sabendo que o Item Level de lá é baixo — porque a IDENTIDADE do loot, não só o nível, é o que importa.

Esse é o mesmo princípio que já rege as Esferas como moeda do mundo (`economy-sphere-currency.md`, Sprint 24): quanto mais específico o motivo de visitar um lugar, mais o mundo se sente like um lugar de verdade, e não uma escada linear de níveis.

## 3. Por que nenhuma região deve fornecer tudo

`WorldRegion.biome` é um único valor — uma região nunca pertence a dois Biomes ao mesmo tempo, e a afinidade de Base/Esfera/Gema é sempre parcial (`Partial<Record<...>>`, nunca todas as combinações preenchidas). Isso é deliberado: se toda região tivesse afinidade alta pra tudo, a escolha de "onde farmar" deixaria de ser uma escolha real. A Esfera da Incerteza é a única exceção documentada nesta Sprint — "nunca possui afinidade, pode aparecer em qualquer lugar, sempre extremamente rara" (Fase 6 do brief) — precisamente porque ela representa o inesperado, não uma rota de farm previsível.

## 4. O que já existe (não recriado nesta Sprint)

- **Regiões reais** (`regions.ts`, `REGION_GRAPH`, 11 nós): esta Sprint nunca inventa uma região — toda `WorldRegion.id` reaproveita um `regionId` já existente.
- **Metadados de região** (`worldencounter/biomes.ts`, `BiomeDefinition`, apesar do nome histórico): já cobre climate/description/difficultyLabel/order pra 9 das 11 regiões. `WorldRegion.dangerLevel` reaproveita literalmente o `order` desse arquivo — nunca uma segunda escala de dificuldade paralela.
- **Esferas e sua tabela de drop por fonte** (`spheredrop/`, Sprint 13/24): a afinidade por bioma desta Sprint é um eixo NOVO e ortogonal (bioma, não fonte de combate) — nunca substitui `DEFAULT_SPHERE_DROP_TABLE`.
- **Base Items reais** (`itemgen/baseItems.ts`, 14 entradas): esta Sprint nunca inventa uma Base — toda entrada de `baseAffinity.ts` referencia um `baseItemId` real.
- **Categorias de Gema** (`socket/gemDefinition.ts`, `GemCategory`, Sprint 20/21): `gemAffinity.ts` referencia por categoria, nunca por Gema individual.
- **Recurso `materials`** (`economy/types.ts`, `ResourceId`): continua um único contador escalar — o catálogo de `MaterialType` desta Sprint é só um vocabulário descritivo por cima, nunca um novo `ResourceId`.

## 5. O que esta Sprint deliberadamente NÃO faz

Balanceamento de peso real, integração no `itemgen/generator.ts`/`lootgen/`/`lootidentity/`/`rollSphereDrop()` (todos continuam cegos a região/bioma), Mapa, Viagem, Fast Travel, NPC, Quest, World Boss novo, Eventos, Temporadas, Guild, PvP. Toda tabela de afinidade criada aqui é lida hoje só por testes — nenhum consumidor de produção a importa.

---

*Referências: `docs/game-design-bible/00-philosophy.md` (Mandamento 7), `docs/design/economy-sphere-currency.md` (mesmo princípio de escassez aplicado a Esferas), `packages/shared/src/worldregion/` (implementação real desta Sprint), `packages/shared/src/regions.ts`/`worldencounter/biomes.ts` (dados reaproveitados, nunca duplicados).*
