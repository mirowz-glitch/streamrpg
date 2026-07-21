import type { FinalStats } from "../characterbuild/types.js";
import type { CombatDamageType } from "./damageTypes.js";

// Combat Engine Phase I — tipos isolados de propósito.
//
// Requisito 2 — "Combatant" não é exportado por nenhuma Sprint
// anterior (Character Build só exporta `FinalStats`, um valor sem
// vida-atual nem multiplicador crítico próprio). Duas decisões de
// escopo, tomadas aqui e não em Character Build/Equipment (esta
// Sprint não pode alterar nenhum dos dois):
// - `currentLife`: não é um Final Stat — é estado de UMA sessão de
//   combate (a vida "agora", que sobe e desce a cada ataque),
//   rastreado por fora e só LIDO/devolvido pelo Combat Engine, nunca
//   guardado internamente.
// - `criticalMultiplier`: o requisito 5 pede "Critical Multiplier...
//   tudo vindo dos Final Stats", mas `FinalStats` (Character Build)
//   não tem esse campo — só `criticalChance`. Em vez de alterar
//   Character Build (proibido nesta Sprint), o Combatant carrega o
//   multiplicador como um campo próprio que quem monta o Combatant
//   preenche (ex.: um valor fixo de 1.5x hoje, ou futuramente um novo
//   Final Stat, sem mudar nada aqui além de como esse número é
//   produzido por fora).
export interface Combatant {
  finalStats: FinalStats;
  criticalMultiplier: number;
  currentLife: number;
}

// Requisito 9 — Future Modifiers: bônus/penalidades OPCIONAIS, sempre
// multiplicativos ou aditivos sobre o resultado já calculado — nunca
// substituem uma etapa do pipeline. Nenhum sistema real (Passive
// Tree/Buffs/Debuffs/Auras/Boss Modifiers/Difficulty/Season Effects)
// produz um valor aqui nesta Sprint; o pipeline só está pronto pra
// somar quando um existir (mesmo padrão de GenerateItemOptions/
// GenerateLootOptions/FutureStatModifiers das Sprints anteriores).
export interface FutureCombatModifiers {
  hitChanceMultiplier?: number;
  criticalChanceMultiplier?: number;
  damageMultiplier?: number;
  armorPenetration?: number;
  lifeLeechMultiplier?: number;
}

// Requisito 2 — Combat Context: tudo que resolveCombat() precisa,
// "nenhuma dependência de UI" (nenhum campo de exibição, cor, texto).
export interface CombatContext {
  attacker: Combatant;
  target: Combatant;
  seed: number;
  // Aceito por tipagem, reservado pra logs/replay/futuras mecânicas
  // sensíveis a tempo (ex.: duração de buff) — não influencia nenhum
  // cálculo desta fase.
  timestamp: number;
  attackType: CombatDamageType;
  // Requisito 6 — "Guaranteed Hit": pula o Hit Roll por completo
  // quando true (uma futura skill/mecânica poderia forçar isso).
  guaranteedHit?: boolean;
  futureModifiers?: FutureCombatModifiers;
}

// Requisito 8 — Combat Result: só dados, "nenhuma lógica de
// interface". `lifeLeech` é a quantidade que o Attacker DEVERIA
// recuperar — resolveCombat() nunca muta nenhum Combatant recebido
// (puro, sem efeito colateral); quem chama é responsável por aplicar
// isso na vida do Attacker, rastreada por fora.
export interface CombatResult {
  damage: number;
  critical: boolean;
  miss: boolean;
  lifeLeech: number;
  remainingLife: number;
  damageType: CombatDamageType;
  seed: number;
}
