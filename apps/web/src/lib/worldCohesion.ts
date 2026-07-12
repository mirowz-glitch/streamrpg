import type { ExpeditionApproach, WorldEventCategory } from "@streamrpg/shared";
import type { WorldPresenceContext } from "./worldPresence";
import type { ExpeditionEchoContext } from "./expeditionEchoes";
import { keySalt, resolveRotatingLine, type RotatingVariant } from "./dailyRotation";
import type { CityPlace } from "./cityPlaces";

// Sprint World Cohesion Phase I (Connected World) — camada central, sem
// estado, sem persistência, sem backend/tabela/fetch/API/hook/React:
// "que pequena conexão entre dois sistemas já existentes vale a pena
// mostrar agora?". Nunca cria informação/lore/NPC novo — só aponta que
// dois sistemas reais (ex.: Biblioteca + Expedição, Guilda + Taverna)
// estão, coincidentemente, falando da mesma coisa hoje.
//
// REQUISITO OBRIGATÓRIO — auditoria feita ANTES de escrever qualquer
// linha, mapeando as 13 camadas do brief:
// - JÁ USAM O MESMO DADO: World Presence/City Ambient State/Micro
//   Events (praça) todos leem `worldState.current_event.category` +
//   `players_online`; Environmental Storytelling/World Simulation/City
//   Ambient State/Micro Events (Portão Norte) todos leem a mesma
//   categoria "militar"; Expedition Journey/Evolution/Echoes (mesmo
//   `expedition.progress_percent`/`status`/`approach`/
//   `destination_region_name`, cada um respondendo um eixo diferente).
// - FALAM DO MESMO ASSUNTO SEM SABER UM DO OUTRO: Discovery Chains +
//   Knowledge Threads + Knowledge Network (as três já foram unificadas
//   em Knowledge Network Phase I, nenhuma sobreposição real restante);
//   Kingdom Memory (Biblioteca: "Novos mapas aparecem com mais
//   frequência") e Expedition Echoes (Biblioteca: eco de região) —
//   ambos sobre MAPAS/REGIÕES na Biblioteca, mas nunca se referenciam;
//   NPC Daily Activities (Mestre da Arena: "Treina golpes.") e World
//   Presence (evento "militar": "Os aventureiros treinam com mais
//   afinco hoje.") — ambos sobre TREINO na Arena, isolados.
// - PODERIAM SE REFERENCIAR NATURALMENTE (implementado nesta Sprint):
//   Biblioteca ↔ Expedição (mapas/direção), Museu ↔ Expedição/Discovery
//   (achados além das muralhas), Guilda ↔ Taverna/Kingdom Reputation
//   (contratos ecoam rumores), Taverna ↔ World Presence (histórias
//   combinam com o clima do Reino), Ferreiro ↔ World Presence
//   (movimento da forja acompanha o Reino), Praça ↔ Expedição (relatos
//   de outras regiões), Portão Norte ↔ Knowledge Threads/Casa dos
//   Viajantes (relatos parecidos), Arena ↔ NPC Daily Activities/World
//   Presence (treino acompanha o momento), Casa dos Viajantes ↔
//   Expedição (conversas convergem pro mesmo destino).
// - INDEPENDENTES DEMAIS (fora de escopo, considerados e descartados):
//   Landmark Identity (deliberadamente constante — conectar algo
//   permanente a um sinal variável contradiria o próprio propósito da
//   camada); Personal Chronicle/Legacy/Kingdom Reputation/Hero Journey
//   (todos sobre o JOGADOR especificamente — World Cohesion nunca cita
//   jogador, é sempre sobre o Reino em si).
//
// DÍVIDA TÉCNICA — nenhuma encontrada: `resolveRotatingLine`/
// `pickOfTheDay`/`keySalt` (lib/dailyRotation.ts) já são o único
// algoritmo de resolução de contexto/prioridade/seleção de variante do
// projeto (centralizado por Sprints anteriores) — reaproveitado tal
// como está, nenhuma cópia nova, nenhum helper de renderização/fallback
// duplicado.
//
// CRITÉRIO MÁXIMO — 2 dos 9 exemplos literais do brief foram ajustados
// por colidirem com uma camada irmã real já auditada:
// - Museu: exemplo teria começado com "Alguns visitantes comentam
//   sobre..." — frase QUASE IDÊNTICA ao abridor real de Kingdom Memory
//   pra Biblioteca ("Alguns visitantes comentam sobre terras que poucos
//   exploraram."). Reescrito para nunca reusar esse abridor.
// - Casa dos Viajantes: exemplo ("Quase toda conversa acaba chegando ao
//   mesmo destino.") era quase idêntico à assinatura permanente real de
//   Landmark Identity pro mesmo lugar ("Quase toda história importante
//   passou por esta mesa.") — mesma estrutura "Quase toda X". Reescrito
//   com estrutura e vocabulário diferentes.
// - `RotatingVariant.line` (dailyRotation.ts) é sempre uma STRING FIXA,
//   nunca uma função/template — por isso as variantes reativas a
//   `destinationRegionName` abaixo nunca citam o NOME da região (isso
//   exigiria estender o contrato do helper reaproveitado, fora do
//   escopo desta Sprint); elas só reagem a "existe uma expedição em
//   curso com destino real?", nunca inventam o nome.
export interface WorldCohesionContext {
  worldEventCategory?: WorldEventCategory;
  approach?: ExpeditionApproach | null;
  destinationRegionName?: string | null;
}

// Reaproveita exatamente os dois contextos já existentes (WorldPresenceContext
// + ExpeditionEchoContext, ambos já buscados por CityPage/NorthGateBuilding)
// — nenhum fetch novo, nenhum dado inventado.
export function buildWorldCohesionContext(
  worldPresenceCtx?: WorldPresenceContext,
  echoContext?: ExpeditionEchoContext,
): WorldCohesionContext {
  return {
    worldEventCategory: worldPresenceCtx?.eventCategory,
    approach: echoContext?.approach ?? null,
    destinationRegionName: echoContext?.regionName ?? null,
  };
}

type CohesionVariant = RotatingVariant<WorldCohesionContext>;

const hasDestination = (ctx: WorldCohesionContext) => ctx.destinationRegionName !== null && ctx.destinationRegionName !== undefined;

// Cada linha conecta exatamente 2 sistemas reais (documentado por
// lugar). Nunca cita jogador/NPC pelo nome/World Event pelo nome (só a
// categoria, nunca "o evento X").
const PLACE_VARIANTS: Record<CityPlace, CohesionVariant[]> = {
  // Praça ↔ Expedição: a praça é onde o Reino inteiro comenta o que
  // acontece nas regiões, incluindo a expedição em curso do jogador.
  praca: [
    { when: hasDestination, line: "Quem passa por aqui comenta sobre relatos vindos da região da expedição em curso." },
    { line: "Quem passa por aqui comenta sobre acontecimentos vindos de outras regiões." },
  ],
  // Ferreiro ↔ World Presence: o movimento da forja acompanha o humor
  // geral do Reino, sem repetir a própria frase de World Presence pra
  // "militar" ("A forja trabalha sem descanso hoje." — sobre a forja
  // em si) nem a de Micro Events (o aprendiz varrendo limalha).
  ferreiro: [
    { when: (ctx) => ctx.worldEventCategory === "militar", line: "O ritmo na forja parece acompanhar o mesmo alvoroço que tomou conta do Reino hoje." },
    { line: "O ritmo na forja parece acompanhar o que se comenta pelo Reino hoje." },
  ],
  // Biblioteca ↔ Expedição: os mapas consultados na Biblioteca ecoam
  // pra onde as expedições reais estão indo.
  biblioteca: [
    { when: hasDestination, line: "Os mapas consultados hoje parecem apontar direto para o destino da expedição em curso." },
    { line: "Os mapas consultados hoje parecem apontar para a mesma direção das últimas expedições." },
  ],
  // Museu ↔ Expedição/Discovery: peças recentes do Museu remetem a
  // achados feitos durante expedições além das muralhas.
  museu: [
    { when: (ctx) => ctx.worldEventCategory === "misterios", line: "Peças recém-catalogadas parecem vir de achados intrigantes feitos além das muralhas." },
    { line: "Peças recém-catalogadas parecem vir de achados feitos além das muralhas." },
  ],
  // Guilda ↔ Taverna/Kingdom Reputation: contratos da Guilda ecoam os
  // mesmos rumores que já circulam pela cidade — reage a Approach
  // (mesmo eixo "investigate revela mais detalhe" já usado em Knowledge
  // Rewards, aqui só como tom, nunca alterando quantidade de nada).
  guilda: [
    {
      when: (ctx) => ctx.approach === "investigate",
      line: "Os contratos mais procurados citam detalhes que só quem se aprofunda percebe, os mesmos que os rumores da cidade já insinuavam.",
    },
    {
      when: (ctx) => ctx.approach === "continue",
      line: "Os contratos mais procurados lembram os rumores que circulam pela cidade, sem muita novidade.",
    },
    { line: "Os contratos mais procurados lembram os rumores que circulam pela cidade." },
  ],
  // Taverna ↔ World Presence: as histórias contadas hoje combinam com
  // o clima geral do Reino, sem repetir a própria frase de World
  // Simulation ("Alguém acabou de contar uma história...").
  taverna: [
    { when: (ctx) => ctx.worldEventCategory === "celebracoes", line: "As histórias desta noite parecem ecoar as celebrações que tomam conta do Reino." },
    { line: "As histórias desta noite parecem combinar com o clima do Reino." },
  ],
  // Portão Norte ↔ Casa dos Viajantes/Knowledge Threads: viajantes que
  // chegam contam relatos parecidos com os de quem segue pro mesmo
  // destino.
  "portao-norte": [
    { when: hasDestination, line: "Os viajantes chegam trazendo relatos parecidos com os de quem segue para o mesmo destino agora." },
    { line: "Os viajantes chegam trazendo relatos semelhantes." },
  ],
  // Arena ↔ NPC Daily Activities/World Presence: os treinamentos
  // parecem acompanhar o momento do Reino, sem repetir a própria
  // atividade do Mestre da Arena ("Treina golpes.").
  arena: [
    { when: (ctx) => ctx.worldEventCategory === "militar", line: "Até os treinamentos parecem mais intensos, acompanhando o momento vivido pelo Reino." },
    { line: "Até os treinamentos parecem acompanhar o momento vivido pelo Reino." },
  ],
  // Casa dos Viajantes ↔ Expedição: quase toda conversa acaba
  // convergindo pro destino da expedição em curso.
  "casa-dos-viajantes": [
    { when: hasDestination, line: "As histórias contadas aqui hoje parecem sempre puxar assunto para o destino da expedição em curso." },
    { line: "As histórias contadas aqui hoje parecem sempre puxar assunto para o mesmo lugar." },
  ],
};

// Pura: mesma entrada, mesma saída, sempre (dentro do mesmo dia). Nenhum
// componente decide sozinho: todos perguntam a esta camada.
export function getWorldCohesionLine(place: CityPlace, ctx: WorldCohesionContext = {}): string | null {
  return resolveRotatingLine(PLACE_VARIANTS[place], ctx, keySalt(place));
}
