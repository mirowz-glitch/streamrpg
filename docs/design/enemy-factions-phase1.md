# Enemy Factions — Phase I (Sprint 26)

**Status:** 🚧 Infraestrutura apenas — nenhum consumidor real (`itemgen/generator.ts`, `lootgen/`, `lootidentity/resolve.ts`, `enemy/lootIntegration.ts`) lê nada deste módulo ainda. Este documento explica a DECISÃO (por que cultura de monstro passa a ser um eixo econômico) — a integração real no pipeline de drop fica para uma Sprint futura.

## 1. Por que isso melhora a economia

Antes desta Sprint, todo monstro já carregava uma "natureza" (`MonsterArchetype`, Sprint Monster Loot Identity) que JÁ influencia drops de verdade — mas essa natureza é sobre O QUE o monstro É (besta, morto-vivo, construto), nunca sobre a que CULTURA/grupo ele pertence. Um Lobo comum e um Lobo Alfa são ambos "beast" — a mesma coisa, mecanicamente. Esta Sprint adiciona o eixo que faltava: `EnemyFaction`. Um Cavaleiro Negro e um Construto Ancião são arquétipos diferentes (humanoid vs. construct) mas pertencem à MESMA cultura — o Império — porque narrativamente ambos servem à mesma força de conquista antiga. Esse é exatamente o tipo de identidade que faz "farmar os Cavaleiros Negros" ser uma frase que faz sentido, em vez de "farmar tudo que é humanoid".

## 2. Por que jogadores irão escolher monstros diferentes

`FactionEconomyProfile` (Fase 5) declara que Goblins tendem a mais Ouro, Mortos-Vivos a mais Materiais, Cultistas a mais Esferas, Império a mais Equipamentos, Bestas a mais Gemas — uma vez que uma Sprint futura ligar isso ao pipeline real, um jogador que precise de Esferas terá um motivo mecânico concreto de procurar Cultistas especificamente, em vez de qualquer encontro aleatório da região onde está. Isso é o Mandamento 7 da Filosofia (`00-philosophy.md`) aplicado a uma nova camada: nenhuma taxa é fixada nesta Sprint, só a identidade que uma Sprint de balanceamento futura vai poder ler.

## 3. Por que isso evita farm único

`FactionEconomyProfile`/`FactionAffinity` são deliberadamente ESPARSOS — nenhuma Facção tem tendência alta em todas as 5 categorias (Ouro/Materiais/Esferas/Gemas/Equipamentos) ao mesmo tempo, mesma disciplina de "nenhuma região deve fornecer tudo" já usada em `world-loot-system-phase1.md`. Bestas favorecem Gemas mas não Ouro; Goblins favorecem Ouro mas não Esferas. Um jogador que queira otimizar todos os recursos precisa, necessariamente, caçar facções diferentes — nunca uma única fonte "melhor em tudo".

## 4. O que já existia (não recriado nesta Sprint)

- **`MonsterArchetype`** (`lootidentity/archetypes.ts`, 8 valores) — JÁ é real, já influencia drops via `resolveLootBias()`. É a NATUREZA do monstro, eixo ortogonal à Facção (a CULTURA). `EnemyFaction` nunca substitui nem funde com Archetype — `getFactionBaseAffinity()` (Fase 6) DERIVA de Archetype real, nunca duplica seus números.
- **`factions/` (Reputation Factions)** — Guardiões da Floresta/Mercadores Livres/Culto das Ruínas/Legião Sombria: sistema de reputação do JOGADOR com quem controla politicamente uma REGIÃO. Eixo diferente de Enemy Faction (a cultura de um MONSTRO). As duas coexistem sem sobreposição de código — nenhum campo de `EnemyFaction` referencia `FactionDefinition.id`. Achado da auditoria (Fase 1): 2 das 10 Enemy Factions batem tematicamente 1:1 com Reputation Factions já existentes (Cultistas ≈ Culto das Ruínas, Império ≈ Legião Sombria) — coincidência de LORE, não de arquitetura; nenhum código foi unificado.
- **`worldregion/` (Sprint 25)** — `BiomeTypeId` e o tipo `DropProfile` são reaproveitados literalmente (nunca redefinidos) por `EnemyFaction.preferredBiomes`/`dropProfile`. `getFactionSphereAffinity()`/`getFactionGemAffinity()`/`getFactionMaterialAffinity()` (Fase 6) derivam das tabelas por bioma da Sprint 25, nunca reinventam números.
- **`enemy/templates.ts`** (22 Enemy Templates reais) — toda `EnemyFamily.templateIds` referencia um id real; nenhum monstro novo foi criado.

## 5. O que esta Sprint deliberadamente NÃO faz

Balanceamento de taxa, integração real no pipeline de drop (`generateMonsterLoot`/`resolveLootBias` continuam lendo só Archetype, nunca Faction), IA, Patrulha, Aggro, Eventos, Missões, NPC, PvP, Guild, Treasury, Housing, Real Estate, Runewords, Links, Combate novo. `hostileTo` fica vazio em toda Facção — lore de conflito político fica para a Sprint de "facções em guerra" já sinalizada pelo usuário como próximo passo natural desta infraestrutura.

---

*Referências: `docs/game-design-bible/00-philosophy.md` (Mandamento 7), `docs/design/world-loot-system-phase1.md` (mesmo princípio aplicado a Região/Bioma), `packages/shared/src/enemyFaction/` (implementação real desta Sprint), `packages/shared/src/lootidentity/archetypes.ts` (Archetype real, reaproveitado nunca duplicado), `packages/shared/src/factions/` (Reputation Factions, eixo distinto).*
