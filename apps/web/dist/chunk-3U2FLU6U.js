import {
  FOUNDER_TITLE_SLUGS
} from "./chunk-LIYTWNFS.js";
import {
  api
} from "./chunk-R22SVZL5.js";
import {
  isFlagSet
} from "./chunk-MU4C5JPO.js";
import {
  __toESM,
  require_react
} from "./chunk-LURRKJSR.js";

// apps/web/src/hooks/useCharacter.ts
var import_react = __toESM(require_react(), 1);
function useCharacter(enabled = true) {
  const [character, setCharacter] = (0, import_react.useState)(null);
  const [loading, setLoading] = (0, import_react.useState)(enabled);
  const [error, setError] = (0, import_react.useState)(null);
  const refresh = (0, import_react.useCallback)(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.get("/api/character");
      setCharacter(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load character");
      setCharacter(null);
    } finally {
      setLoading(false);
    }
  }, [enabled]);
  (0, import_react.useEffect)(() => {
    void refresh();
  }, [refresh]);
  const updateName = (0, import_react.useCallback)(async (displayName) => {
    const data = await api.patch("/api/character", { display_name: displayName });
    setCharacter(data);
    return data;
  }, []);
  return { character, loading, error, refresh, updateName };
}

// apps/web/src/hooks/useKingdomRole.ts
var import_react2 = __toESM(require_react(), 1);
function useKingdomRole(channel, enabled) {
  const [roles, setRoles] = (0, import_react2.useState)([]);
  (0, import_react2.useEffect)(() => {
    if (!enabled || !channel) {
      setRoles([]);
      return;
    }
    let cancelled = false;
    void api.get(`/api/kingdom/${encodeURIComponent(channel)}/me`).then((data) => {
      if (!cancelled) setRoles(data.roles);
    }).catch(() => void 0);
    return () => {
      cancelled = true;
    };
  }, [channel, enabled]);
  return roles;
}

// apps/web/src/lib/playerFacts.ts
var RARITY_RANK = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
function computeEquipmentTier(equipped) {
  if (equipped.length === 0) return "none";
  const maxRank = Math.max(...equipped.map((item) => RARITY_RANK[item.rarity]));
  if (maxRank <= 0) return "weak";
  if (maxRank <= 2) return "notable";
  return "strong";
}
function buildPlayerFacts(character, identity, kingdomRoles) {
  return {
    level: character.level,
    gold: character.gold,
    totalMinutes: character.total_minutes,
    hasEquippedItem: character.equipped.length > 0,
    bossesDefeated: identity.bosses_defeated,
    regionsDiscovered: identity.regions_discovered,
    hasCompletedFirstExpedition: identity.first_expedition_at !== null,
    hasEquippedTitle: identity.equipped_title !== null,
    hasKingdomRole: kingdomRoles.length > 0,
    isFirstCityVisit: !isFlagSet("city_seen"),
    equipmentTier: computeEquipmentTier(character.equipped),
    hasFounderTitle: identity.titles.some((t) => t.unlocked && FOUNDER_TITLE_SLUGS.has(t.slug))
  };
}

// apps/web/src/lib/characterPresence.ts
function computeEvolutionScore(facts) {
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
function getCharacterStage(facts) {
  const score = computeEvolutionScore(facts);
  if (score >= 10) return "lenda";
  if (score >= 8) return "heroi";
  if (score >= 5) return "veterano";
  if (score >= 2) return "aventureiro";
  return "iniciante";
}
var STAGE_CHARACTER_DESCRIPTION = {
  iniciante: "Seu nome ainda passa despercebido pelo Reino.",
  aventureiro: "Alguns j\xE1 reconhecem seu rosto pela Capital.",
  veterano: "Muitos aventureiros j\xE1 ouviram falar de voc\xEA.",
  heroi: "Seu nome j\xE1 rendeu mais de uma hist\xF3ria na Taverna.",
  lenda: "Poucos no Reino n\xE3o sabem quem voc\xEA \xE9."
};
var STAGE_GUILD_AMBIENT = {
  iniciante: "A Guilda ainda n\xE3o tem nenhum registro sobre voc\xEA.",
  aventureiro: "Seu nome come\xE7a a aparecer nos registros da Guilda.",
  veterano: "A Guilda j\xE1 acompanha seu progresso com aten\xE7\xE3o.",
  heroi: "Novatos perguntam sobre voc\xEA quando chegam \xE0 Guilda.",
  lenda: "A Guilda cita seu nome como exemplo pra quem est\xE1 come\xE7ando."
};
var STAGE_INVENTORY_HINT = {
  iniciante: "Seu equipamento ainda \xE9 o de quem est\xE1 come\xE7ando.",
  aventureiro: "Seu equipamento j\xE1 mostra alguma experi\xEAncia.",
  veterano: "Seu equipamento demonstra experi\xEAncia de sobra.",
  heroi: "Seu equipamento conta uma hist\xF3ria por si s\xF3.",
  lenda: "Poucos no Reino carregam um equipamento assim."
};
var STAGE_CHRONICLE_INTRO = {
  iniciante: "Toda hist\xF3ria come\xE7a com um primeiro passo.",
  aventureiro: "Esta hist\xF3ria j\xE1 tem alguns cap\xEDtulos escritos.",
  veterano: "Esta hist\xF3ria j\xE1 rendeu mais de uma boa aventura.",
  heroi: "Esta \xE9 a hist\xF3ria de algu\xE9m que o Reino j\xE1 reconhece.",
  lenda: "Esta \xE9 a hist\xF3ria de uma lenda viva do Reino."
};
var STAGE_CITY_HONORIFIC = {
  veterano: "J\xE1 n\xE3o trata mais voc\xEA como um rosto qualquer.",
  heroi: "Trata voc\xEA com um respeito que poucos recebem aqui.",
  lenda: "Trata voc\xEA quase como se falasse com uma lenda viva."
};

export {
  useCharacter,
  useKingdomRole,
  buildPlayerFacts,
  getCharacterStage,
  STAGE_CHARACTER_DESCRIPTION,
  STAGE_GUILD_AMBIENT,
  STAGE_INVENTORY_HINT,
  STAGE_CHRONICLE_INTRO,
  STAGE_CITY_HONORIFIC
};
