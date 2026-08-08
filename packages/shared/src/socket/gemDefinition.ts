/**
 * Sprint 20 — Sockets & Gemas Phase I, Fase 4/5/6. Camada de CATÁLOGO
 * (o que uma Gema É), deliberadamente separada da camada de INSTÂNCIA
 * já existente (`Gem`, types.ts, Sprint 15 — o que UM personagem
 * possui: level/experience/quality/history). `Gem.gemType` já era um
 * `string` propositalmente aberto (Sprint 15: "vocabulário aberto...
 * nenhuma Gema real existe ainda") — `GemDefinition.id` agora é o
 * valor real que esse campo referencia, mesmo padrão de
 * `MythicDefinition`/`BaseIdentity` (Sprints 18/19) sobre seus
 * respectivos catálogos.
 *
 * FILOSOFIA OFICIAL desta Sprint (reafirmada, contradiz o comentário
 * antigo de `types.ts` sobre `level`/`experience`): "As Gemas NÃO
 * evoluem. NÃO possuem XP. NÃO possuem qualidade. NÃO sobem de nível.
 * Uma Gema é exatamente aquilo que caiu, sempre." As colunas
 * `level`/`experience`/`quality` da Sprint 15 continuam existindo no
 * schema (mudar isso seria uma migração fora do escopo desta Sprint,
 * "infraestrutura apenas") mas são tratadas como CAMPOS MORTOS por
 * todo código novo desta Sprint — nenhuma função aqui lê ou escreve
 * neles, e `GemDefinition` nunca expõe level/xp/quality. "Rubi III" é
 * o próprio `id`/`displayName` da definição — o tier já nasce
 * embutido na identidade da Gema, nunca um progresso.
 */
/**
 * Fase 6 — vocabulário de categorias de Gema. Deliberadamente mais
 * amplo que qualquer efeito real hoje ("tudo preparado para o
 * futuro") — nenhuma categoria concede bônus nesta Sprint.
 */
export type GemCategory = "attack" | "defense" | "movement" | "critical" | "life" | "mana" | "magic" | "fire" | "ice" | "lightning" | "utility" | "support";

export type GemDefinitionTier = 1 | 2 | 3 | 4 | 5;

/**
 * Fase 4 — campos mínimos pedidos pelo brief. `effect` é só uma
 * descrição textual (nunca um efeito de gameplay real — "NÃO
 * implementar: Efeitos das Gemas" é restrição explícita da Sprint 20,
 * que criou este arquivo). `tradable` (Fase 9 — economia): "Gemas...
 * sempre são negociáveis" é a regra por padrão; o campo existe pra
 * permitir uma exceção futura (ex.: uma Gema de Quest não-negociável),
 * nunca pra restringir as Gemas de hoje.
 *
 * Sprint 21 — Gem Effects Phase I, Fase 3: `effectId` é o novo campo
 * que dá à Gema sua primeira utilidade real — referencia um
 * `GemEffect` (gemEffect.ts) por id, nunca embute o efeito aqui
 * (mesmo princípio de `category` referenciar `GemCategory`).
 * `undefined` é um estado válido e esperado: nem toda Gema de exemplo
 * desta Sprint tem um efeito (ex.: Topázio/`utility`, categoria fora
 * dos 7 tipos de `GemEffectStatType` — "não inventa um efeito que o
 * brief não pediu").
 *
 * Sprint 23 — Sockets & Gems Phase II, Fase 3: `behaviorId` é uma
 * SEGUNDA referência independente, desta vez a um `GemBehavior`
 * (gemBehavior.ts) — "GemEffect = quanto aumenta, GemBehavior = como
 * muda o jogo". Uma Gema pode ter `effectId`, `behaviorId`, os dois,
 * ou nenhum — nunca são mutuamente exclusivos. `topaz-1`, que nunca
 * teve `effectId` (categoria `utility` fora do vocabulário de
 * `GemEffectStatType`), ganha `behaviorId` nesta Sprint — seu primeiro
 * papel real no jogo.
 */
export interface GemDefinition {
  id: string;
  displayName: string;
  tier: GemDefinitionTier;
  category: GemCategory;
  effect: string;
  tags: GemCategory[];
  tradable: boolean;
  enabled: boolean;
  effectId?: string;
  behaviorId?: string;
}

/** Fase 5 — todas as Gemas do jogo, chaveadas por id. Nada hardcoded fora daqui. */
export type GemDefinitionRegistry = Record<string, GemDefinition>;
