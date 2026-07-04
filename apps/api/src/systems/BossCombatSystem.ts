/**
 * BossCombatSystem — Sprint B3 (Combate)
 *
 * Reage a world.tick. Responsabilidade única: fazer Bosses "active"
 * avançarem — aplicar dano coletivo, verificar HP, verificar duração, e
 * emitir boss.defeated/boss.escaped quando a luta termina.
 *
 * Decisão da B2 resolvida aqui: esta é uma classe própria, separada de
 * BossParticipationSystem — não a estende. Motivo: responsabilidades
 * diferentes (participação é presença acumulada; combate é HP e fim de
 * luta), mesmo padrão de Systems estreitos já usado no resto da Engine.
 * As duas reagem independentemente ao mesmo world.tick, cada uma
 * derivando "quem está presente" de event.sessions por conta própria —
 * nenhuma lê o estado da outra (Princípio 4: Systems nunca chamam
 * Systems).
 *
 * Fora do escopo desta Sprint, por decisão explícita: recompensas, UI,
 * ataques do Boss, dano em personagens, Modifiers, Economia 1.0,
 * Frontend Event Bridge.
 *
 * Sprint Combat Model Runtime — ✅ fórmula fixa (`DAMAGE_PER_CHARACTER_PER_TICK`)
 * substituída pela fórmula canônica (docs/combat-model/canonical-formula.md).
 * `calculateCanonicalDamage()` é uma função pura, exportada, testável
 * isoladamente (mesmo padrão de `distributeXpBudget`/`drawItemWinners` em
 * BossRewardSystem.ts) — consome Level, ATQ Físico/Mágico e Resistência
 * do alvo; tipo do ataque decidido pelo próprio equipamento (nunca
 * misturado implicitamente). Termos sem fonte de dado ainda — Classe
 * (capítulo 4, Placeholder), Penetração, Bloqueio (Escudo não existe no
 * schema) e Resistência do Boss (Boss não tem esse stat) — são tratados
 * como neutros (1 ou 0), mesma convenção já usada para `Classe_mult=1`
 * em BossRewardSystem/Technical Design, nunca como exceção nem hack.
 *
 * SUS e UTI são carregados e calculados por sua fórmula própria (regen e
 * checagem de limiar, docs/combat-model/canonical-formula.md) — nenhum
 * dos dois entra na multiplicação de dano, porque o Combat Model nunca
 * definiu isso. Hoje não têm o que fazer com o resultado (Boss não
 * ataca personagens, não tem mecânica de controle/detecção) — carregam e
 * calculam corretamente, sem erro, e ficam prontos para quando essas
 * mecânicas existirem.
 */
import { CRITICAL_HIT_CHANCE } from "@streamrpg/shared";
import type { EventBus } from "../engine/EventBus.js";
import type {
  BossDefeatedEvent,
  BossEscapedEvent,
  BossRepository,
  CharacterRepository,
  BossSnapshot,
  CombatAttributesSnapshot,
  RandomProvider,
  WorldTickEvent,
} from "../engine/types.js";

// ============================================================
// Fórmula canônica (docs/combat-model/canonical-formula.md) — função
// pura, sem I/O, testável isoladamente pelo harness.
// ============================================================

// Ilustrativo, não calibrado — mesma disciplina de honestidade já usada
// em todo placeholder numérico do projeto (TIER_MAX_HP, XP_BUDGET_PER_BOSS
// etc.).
const BASE_PER_LEVEL = 1; // Base(level) = level × 1
const CRITICAL_HIT_MULTIPLIER = 2;

// Termos do Combat Model sem fonte de dado ainda — tratados como neutros,
// nunca como exceção. Nenhum dos três bloqueia a fórmula: eles só deixam
// de ter efeito até existir dado real.
const CLASSE_MULT_PLACEHOLDER = 1; // Classe ainda Placeholder (cap. 4 da Bible)
const PENETRACAO_PADRAO = 0; // sem fonte de dado de Penetração ainda
const BLOQUEIO_PADRAO = 0; // sem slot de Escudo no schema
// Boss não tem stat de Resistência (bosses não têm coluna para isso) —
// resolve para 0 em qualquer combate real contra Boss. Exposto como
// parâmetro (não hardcoded dentro da função) para que o harness possa
// provar a mitigação com um alvo hipotético, sem precisar de uma
// mudança de schema em `bosses`.
const RESISTENCIA_ALVO_PADRAO = 0;

export interface DamageInput {
  level: number;
  attackPhysical: number;
  attackMagic: number;
  isCritical: boolean;
  targetResistancePhysical?: number;
  targetResistanceMagic?: number;
}

export interface DamageResult {
  damage: number;
  tipo: "fisico" | "magico";
}

/**
 * Dano_bruto(tipo) = Base(level) × Equipamento_ATQ(tipo) × Classe_mult(tipo) × Critical
 * Resistência_efetiva(tipo) = max(0, Resistência(tipo)_alvo − Penetração_atacante(tipo))
 * Dano_final(tipo) = max(1, Dano_bruto(tipo) × (1 − Resistência_efetiva(tipo)/100) − Bloqueio_aplicável)
 *
 * Tipo do ataque: decidido pelo próprio equipamento do atacante (ATQ
 * Físico vs. ATQ Mágico) — nunca os dois ao mesmo tempo (Etapa 3: "não
 * permitir mistura implícita"). Um personagem sem arma equipada tem os
 * dois em 0 — o tipo escolhido (físico, por padrão) não afeta o
 * resultado, porque Dano_bruto já é 0 nos dois casos.
 */
export function calculateCanonicalDamage(input: DamageInput): DamageResult {
  const tipo: "fisico" | "magico" =
    input.attackMagic > input.attackPhysical ? "magico" : "fisico";
  const atqEquipamento = tipo === "magico" ? input.attackMagic : input.attackPhysical;
  const resistenciaAlvo =
    tipo === "magico"
      ? (input.targetResistanceMagic ?? RESISTENCIA_ALVO_PADRAO)
      : (input.targetResistancePhysical ?? RESISTENCIA_ALVO_PADRAO);

  const base = input.level * BASE_PER_LEVEL;
  const critical = input.isCritical ? CRITICAL_HIT_MULTIPLIER : 1;

  const danoBruto = base * atqEquipamento * CLASSE_MULT_PLACEHOLDER * critical;
  const resistenciaEfetiva = Math.max(0, resistenciaAlvo - PENETRACAO_PADRAO);
  const danoFinal = Math.max(1, danoBruto * (1 - resistenciaEfetiva / 100) - BLOQUEIO_PADRAO);

  return { damage: Math.round(danoFinal), tipo };
}

// SUS: Cura_por_tick = SUS_base × (1 − Redução_ambiental). Boss não é uma
// região com mecânica ambiental — redução sempre neutra (0) neste
// contexto.
const REDUCAO_AMBIENTAL_PADRAO = 0;

export function calculateSusRegen(susBase: number): number {
  return susBase * (1 - REDUCAO_AMBIENTAL_PADRAO);
}

export class BossCombatSystem {
  constructor(
    private repo: BossRepository,
    private characterRepo: CharacterRepository,
    private randomProvider: RandomProvider,
  ) {}

  register(bus: EventBus): () => void {
    const repo = this.repo;

    return bus.subscribe("world.tick", async (event) => {
      const { sessions, timestamp } = event as WorldTickEvent;
      const now = Math.floor(timestamp / 1000);

      const activeBosses = await repo.findAllActive().catch((err) => {
        console.error("[BossCombatSystem] Erro ao buscar Bosses ativos:", err);
        return [];
      });
      if (activeBosses.length === 0) return;

      const characterIdsByChannel = new Map<string, string[]>();
      for (const session of sessions) {
        const list = characterIdsByChannel.get(session.channelId) ?? [];
        list.push(session.characterId);
        characterIdsByChannel.set(session.channelId, list);
      }

      for (const boss of activeBosses) {
        try {
          await this.advance(boss, characterIdsByChannel.get(boss.channelId) ?? [], now, timestamp, bus);
        } catch (err) {
          console.error(`[BossCombatSystem] Erro ao processar Boss ${boss.id}:`, err);
        }
      }
    });
  }

  private async advance(
    boss: BossSnapshot,
    characterIds: string[],
    now: number,
    timestamp: number,
    bus: EventBus,
  ): Promise<void> {
    const repo = this.repo;
    let current: BossSnapshot = boss;

    if (characterIds.length > 0) {
      let totalDamage = 0;

      // Uma única leitura por personagem por tick — getCombatAttributes()
      // já reúne level/equipamento/susBase/utiBonus numa consulta própria
      // do CharacterRepository (Sprint Character Attributes Schema).
      // Nenhuma consulta adicional é feita aqui além desta.
      for (const characterId of characterIds) {
        try {
          const combat: CombatAttributesSnapshot | null =
            await this.characterRepo.getCombatAttributes(characterId);
          if (!combat) continue; // personagem não encontrado — segue sem quebrar (Etapa 4)

          const isCritical = this.randomProvider.next() < CRITICAL_HIT_CHANCE;
          const { damage, tipo } = calculateCanonicalDamage({
            level: combat.level,
            attackPhysical: combat.attackPhysical,
            attackMagic: combat.attackMagic,
            isCritical,
          });
          totalDamage += damage;

          const curaPorTick = calculateSusRegen(combat.susBase);

          console.log(
            `[BossCombatSystem][CharacterAttributes] character=${characterId} ` +
              `level=${combat.level} tipo=${tipo} ` +
              `atqFisico=${combat.attackPhysical} atqMagico=${combat.attackMagic} ` +
              `critico=${isCritical} sus=${combat.susBase}(cura/tick=${curaPorTick}) uti=${combat.utiBonus} ` +
              `dano=${damage}`,
          );
        } catch (err) {
          console.error(`[BossCombatSystem] Erro ao calcular dano do personagem ${characterId}:`, err);
        }
      }

      if (totalDamage > 0) {
        current = await repo.applyDamage(boss.id, totalDamage);
        console.log(
          `[BossCombatSystem] Boss ${boss.id} | Dano canônico total: ${totalDamage} (${characterIds.length} presentes) | HP restante: ${current.currentHp}`,
        );
      }
    }

    // Derrota tem prioridade sobre fuga: um golpe que zera o HP no mesmo
    // tick em que a duração expira ainda conta como vitória, não fuga.
    if (current.currentHp <= 0) {
      const resolved = await repo.resolve(boss.id, "defeated", now);
      console.log(`[BossCombatSystem] Boss ${resolved.id} | DERROTADO`);
      const defeated: BossDefeatedEvent = {
        type: "boss.defeated",
        channelId: resolved.channelId,
        bossId: resolved.id,
        timestamp,
      };
      bus.emit(defeated);
      return;
    }

    if (boss.endsAt !== null && now >= boss.endsAt) {
      const resolved = await repo.resolve(boss.id, "escaped", now);
      console.log(`[BossCombatSystem] Boss ${resolved.id} | FUGIU`);
      const escaped: BossEscapedEvent = {
        type: "boss.escaped",
        channelId: resolved.channelId,
        bossId: resolved.id,
        timestamp,
      };
      bus.emit(escaped);
    }
  }
}
