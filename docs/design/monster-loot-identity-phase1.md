# Monster Loot Identity — Phase I (Sprint 27)

**Status:** 🚧 Infraestrutura apenas — nenhum consumidor real (`itemgen/generator.ts`, `lootgen/`, `lootidentity/resolve.ts`, `enemy/lootIntegration.ts`) lê nada deste módulo ainda. Este documento explica a DECISÃO (por que cada monstro precisa de assinatura própria, além da Facção) — a integração real no pipeline de drop fica para uma Sprint futura.

## 1. Por que isso evita farm único

Até a Sprint 26, a granularidade econômica máxima era a Facção — todo Cultista (Bruxa do Charco, Acólito Corrompido, Bispo Corrompido, Cultista Flamejante) tinha exatamente a mesma tendência (`sphereTendency: 1.5`). Um jogador que precisasse de Esferas não tinha motivo pra escolher UM desses 4 em vez de outro — "farmar Cultistas" já era a decisão completa. Com `MonsterLootSignature` (Fase 2-4) e `MonsterEconomicProfile` (Fase 5), cada um dos 22 Enemy Templates reais tem sua própria assinatura, capaz de divergir da média da própria Facção — Esqueleto e Guardião Esquecido (ambos "Mortos-Vivos", `materialsTendency` alto na Facção) têm, no nível de monstro, `equipmentTendency` alto (armadura/espada), porque a Sprint pediu explicitamente essa assinatura textual. Isso significa que, no futuro em que esta infraestrutura for realmente lida pelo pipeline de drop, "qual Esqueleto especificamente" pode voltar a importar.

## 2. Por que isso evita "melhor mapa"/"melhor monstro"

Nenhuma das 22 assinaturas favorece mais de 1 categoria de recurso ao mesmo tempo (verificado por teste) — mesma disciplina já usada em `enemy-factions-phase1.md`. Um monstro que seja ótimo pra Ouro nunca é também ótimo pra Esferas. Isso significa que não existe (nem vai existir, quando isso for ligado ao pipeline real) um único monstro "correto" pra todo objetivo — a escolha de alvo sempre depende do que o jogador precisa AGORA.

## 3. Por que isso mantém a economia viva

Mandamento 7 da Filosofia (`00-philosophy.md`): *"A economia é dirigida pelos jogadores, nunca por decreto."* Esta Sprint não fixa nenhuma taxa real — toda assinatura é, por construção, derivada de dado que já existe (`MonsterArchetype.lootBias`, já real e já usado por `resolveLootBias()`; a afinidade por Facção da Sprint 26). As únicas exceções autorais são os 5 exemplos literais do brief (Lobo/Esqueleto/Cultista/Aranha/Cavaleiro Negro), e mesmo esses usam só Base Items/categorias de Gema/Esfera que já existem — nenhum dado novo inventado sem lastro em texto real do brief.

## 4. O que já existia (não recriado nesta Sprint — achado central da auditoria)

- **`lootidentity/types.ts` já exporta um `MonsterLootIdentity` real**, desde a Sprint que deu nome ao próprio diretório `lootidentity/`. Aquele tipo (`{monsterId, archetypeId, lootBiasOverride?, currencyBiasOverride?, futureHooks?}`) já é usado de verdade por `resolveLootBias()` → `generateMonsterLoot()` — propósito e shape diferentes do que este brief pede. Por isso o tipo desta Sprint chama-se `MonsterLootSignature` (o próprio termo que o brief usa na Fase 4, "Loot Signature") — nunca `MonsterLootIdentity`, pra não colidir o nome de um símbolo já real e já wired, nem confundir os dois conceitos.
- **`MonsterArchetype.lootBias`** (`lootidentity/archetypes.ts`, Sprint anterior) — `preferredBases`/`preferredAffixes` de todo monstro SEM exemplo literal no brief são exatamente essa afinidade real, nunca um número novo.
- **`EnemyFaction`/`EnemyFamily`/`getFactionSphereAffinity`/`getFactionGemAffinity`/`getFactionMaterialAffinity`** (Sprint 26) — `preferredSpheres`/`preferredGems`/`preferredMaterials` de todo monstro começam exatamente com a afinidade já derivada da sua Facção.
- **`BaseIdentity`/`BASE_IDENTITY_REGISTRY`** (Sprint 19) — toda chave de `preferredBases` de todo monstro registrado é validada (por teste) como um id real dessa Registry — "Monster → Base Identity" (Fase 6) é uma checagem de integridade sobre dado real, nunca um dado paralelo.
- **`EnemyTemplate.futureFlags.isBoss`** (Sprint original do Enemy System) — `preferredLegendaryChance` elevado usa esse sinal REAL já existente (4 templates: boss/frost-king/corrupted-bishop/ancient-dragon), nunca um novo campo "é chefe".

## 5. O que esta Sprint deliberadamente NÃO faz

Ligação real no pipeline de drop (`resolveLootBias()`/`generateMonsterLoot()` continuam lendo só Archetype, nunca Monster Loot Signature), alteração de Item Generator, Loot Generator, MonsterArchetype, EnemyFaction, WorldRegion, Combat, Sockets, Gemas, Esferas, Legacy, Mythic, Craft, Housing, Real Estate, Economia existente. Balanceamento de taxa real.

---

*Referências: `docs/game-design-bible/00-philosophy.md` (Mandamento 7), `docs/design/enemy-factions-phase1.md` (mesmo princípio na camada de Facção, Sprint 26), `docs/design/world-loot-system-phase1.md` (mesmo princípio na camada de Região/Bioma, Sprint 25), `packages/shared/src/monsterLoot/` (implementação real desta Sprint), `packages/shared/src/lootidentity/` (`MonsterLootIdentity` real, distinto e intocado).*
