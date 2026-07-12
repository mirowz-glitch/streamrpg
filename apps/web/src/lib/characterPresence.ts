import type { PlayerFacts } from "./playerFacts";

// Sprint Character Evolution Presence Phase I — camada única e central
// que interpreta "como este personagem deve ser percebido hoje?" a
// partir de PlayerFacts (já existente, já usado por Recognition/
// Foreshadowing/Living Consequences/Player Goals) — sem estado, sem
// persistência, sem backend. Nenhum componente decide estágio sozinho;
// todos chamam getCharacterStage()/STAGE_* daqui.
//
// Auditoria: level, bossesDefeated, regionsDiscovered, equipmentTier,
// hasKingdomRole e hasFounderTitle já existem em PlayerFacts (os dois
// últimos vieram da Sprint Gameplay Presence Phase I). Nenhum sinal
// sozinho decide o estágio — cada um contribui pontos pra uma pontuação
// combinada (ilustrativa, não calibrada — mesma convenção de todo
// número não validado por playtest neste projeto, como os Tiers de
// Boss). "Level alto sozinho" fica no máximo em 2 dos 10 pontos
// possíveis — nunca empurra sozinho até um estágio alto.
export type CharacterStage = "iniciante" | "aventureiro" | "veterano" | "heroi" | "lenda";

export const STAGE_LABEL: Record<CharacterStage, string> = {
  iniciante: "Iniciante",
  aventureiro: "Aventureiro",
  veterano: "Veterano",
  heroi: "Herói",
  lenda: "Lenda",
};

function computeEvolutionScore(facts: PlayerFacts): number {
  let score = 0;
  if (facts.level >= 10) score += 1;
  if (facts.level >= 20) score += 1;
  if (facts.bossesDefeated >= 2) score += 1;
  if (facts.bossesDefeated >= 6) score += 1;
  if (facts.regionsDiscovered >= 5) score += 1;
  if (facts.regionsDiscovered >= 9) score += 1;
  if (facts.equipmentTier === "notable") score += 1;
  if (facts.equipmentTier === "strong") score += 2;
  if (facts.hasKingdomRole) score += 1;
  if (facts.hasFounderTitle) score += 1;
  return score;
}

// Pura: mesma entrada, mesmo estágio, sempre.
export function getCharacterStage(facts: PlayerFacts): CharacterStage {
  const score = computeEvolutionScore(facts);
  if (score >= 10) return "lenda";
  if (score >= 8) return "heroi";
  if (score >= 5) return "veterano";
  if (score >= 2) return "aventureiro";
  return "iniciante";
}

// CharacterPage — pequena descrição, exemplo quase literal do brief.
export const STAGE_CHARACTER_DESCRIPTION: Record<CharacterStage, string> = {
  iniciante: "Seu nome ainda passa despercebido pelo Reino.",
  aventureiro: "Alguns já reconhecem seu rosto pela Capital.",
  veterano: "Muitos aventureiros já ouviram falar de você.",
  heroi: "Seu nome já rendeu mais de uma história na Taverna.",
  lenda: "Poucos no Reino não sabem quem você é.",
};

// Guilda — texto ambiente.
export const STAGE_GUILD_AMBIENT: Record<CharacterStage, string> = {
  iniciante: "A Guilda ainda não tem nenhum registro sobre você.",
  aventureiro: "Seu nome começa a aparecer nos registros da Guilda.",
  veterano: "A Guilda já acompanha seu progresso com atenção.",
  heroi: "Novatos perguntam sobre você quando chegam à Guilda.",
  lenda: "A Guilda cita seu nome como exemplo pra quem está começando.",
};

// Inventário — mensagem discreta, exemplo quase literal do brief.
export const STAGE_INVENTORY_HINT: Record<CharacterStage, string> = {
  iniciante: "Seu equipamento ainda é o de quem está começando.",
  aventureiro: "Seu equipamento já mostra alguma experiência.",
  veterano: "Seu equipamento demonstra experiência de sobra.",
  heroi: "Seu equipamento conta uma história por si só.",
  lenda: "Poucos no Reino carregam um equipamento assim.",
};

// Crônicas — pequena frase introdutória.
export const STAGE_CHRONICLE_INTRO: Record<CharacterStage, string> = {
  iniciante: "Toda história começa com um primeiro passo.",
  aventureiro: "Esta história já tem alguns capítulos escritos.",
  veterano: "Esta história já rendeu mais de uma boa aventura.",
  heroi: "Esta é a história de alguém que o Reino já reconhece.",
  lenda: "Esta é a história de uma lenda viva do Reino.",
};

// Cidade — honorífico usado só por 2 NPCs (Elenya/Roth, já ligados a
// reconhecer mérito em Sprints anteriores), camada ACIMA de
// Recognition, nunca no lugar dela.
export const STAGE_CITY_HONORIFIC: Partial<Record<CharacterStage, string>> = {
  veterano: "Já não trata mais você como um rosto qualquer.",
  heroi: "Trata você com um respeito que poucos recebem aqui.",
  lenda: "Trata você quase como se falasse com uma lenda viva.",
};
