import { useEffect, useState } from "react";
import type { CreatureDefinition } from "../../lib/bestiary";
import { CREATURE_TYPES, DANGER_LABEL, getRegionName } from "../../lib/bestiary";
import { getCreatureMentions } from "../../lib/knowledgeLinks";
import { getCreatureEcologyCandidates } from "../../lib/creatureEcology";
import { getCreatureDiscoveryCandidates } from "../../lib/discoveryChains";
import { getCreatureThreadCandidates } from "../../lib/knowledgeThreads";
import { pickKnowledge } from "../../lib/knowledgeRewards";
import { getNextSteps } from "../../lib/knowledgeNetwork";
import { EMPTY_ECHO_CONTEXT, getCreatureEchoLine, type ExpeditionEchoContext } from "../../lib/expeditionEchoes";
import type { UiFeedbackState } from "../../lib/uiFeedback";
import { recordEvent } from "../../lib/personalTimeline";
import { hasRemembered, remember } from "../../lib/playerMemory";
import { CodexReader } from "../codex/CodexReader";

interface CreatureReaderProps {
  creature: CreatureDefinition | null;
  // Sprint Expedition Echoes Phase I — opcional/default vazio: toda
  // chamada existente sem o prop continua com o comportamento de
  // sempre. Substitui o `expeditionApproach` solto da Sprint anterior
  // (Expedition Consequences Phase I) — dívida técnica encontrada e
  // eliminada nesta auditoria: um único contexto (approach + região da
  // expedição atual) em vez de dois props paralelos.
  echoContext?: ExpeditionEchoContext;
  // Sprint Live Readiness Phase I (First 5 Minutes) — antes calculado
  // aqui dentro (`resolveFeedback(echoLine !== null, "subtleBorder")`,
  // ignorava Creature Ecology/Discovery Chain/Knowledge Thread por
  // completo). Dívida eliminada: agora BestiaryBuilding decide qual dos
  // 4 sinais reais da tela vence (lib/liveReadiness.ts) e só repassa o
  // resultado — CreatureReader nunca decide sozinho.
  feedbackState?: UiFeedbackState | null;
}

// Sprint Codex Framework — painel direito, agora sobre o CodexReader
// genérico. Bestiário e Museu (ao contrário da Biblioteca) sempre
// mostraram um título genérico e nenhum subtítulo quando bloqueados —
// por isso `lockedTitle` fixo e `lockedSubtitle` nunca passado aqui.
export function CreatureReader({ creature, echoContext = EMPTY_ECHO_CONTEXT, feedbackState = null }: CreatureReaderProps) {
  const type = creature ? CREATURE_TYPES.find((t) => t.slug === creature.type) : undefined;

  // Sprint Reactive World Phase I — cada criatura desbloqueada
  // efetivamente aberta vira um registro no Personal Timeline (usado por
  // BestiaryBuilding pra decidir a reação de "caderno cheio"); a
  // primeira criatura de todas também vira o marco `first_bestiary_entry`,
  // uma única vez. hasRemembered/remember usados direto (não
  // useReactiveGlow) porque este componente também monta com
  // `creature === null` (estado "nenhuma seleção"), e o hook marcaria
  // "visto" mesmo sem nenhuma criatura real ter sido aberta.
  // `isFirstEntry` é lido uma única vez, antes do efeito abaixo marcar
  // o registro como visto, pra decidir se a reação aparece nesta abertura.
  const [isFirstEntry] = useState(
    () => creature !== null && !creature.locked && !hasRemembered("first_bestiary_entry"),
  );
  useEffect(() => {
    if (!creature || creature.locked) return;
    recordEvent("creature_viewed", { creatureId: creature.id });
    if (!hasRemembered("first_bestiary_entry")) {
      remember("first_bestiary_entry");
      recordEvent("first_bestiary_entry", { creatureId: creature.id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creature]);

  // Sprint Living Knowledge — "Também citado em": uma página extra ao
  // final do registro, só quando a criatura tem alguma conexão real
  // (lib/bestiary.ts `connections`, criada na Sprint Content
  // Connections). Nenhum componente novo: reaproveita o mesmo
  // `pages`/paginação que o CodexReader já usa.
  const mentions = creature ? getCreatureMentions(creature) : [];
  const pages = creature?.pages ?? [];
  const withMentions =
    mentions.length > 0
      ? [...pages, `**Também citado em**\n\n${mentions.map((m) => `**${m.label}:** ${m.value}`).join("\n\n")}`]
      : pages;
  // Sprint Reactive World Phase I — reação de reconhecimento, mesma
  // técnica de página extra usada acima.
  const allPages = isFirstEntry ? [...withMentions, "Primeira criatura registrada."] : withMentions;

  // Sprint Creature Ecology Phase I — no máximo uma observação
  // ecológica, só quando existe (diferente de Habitat/Região/
  // Periculosidade, que são fatos sempre presentes).
  //
  // Sprint Expedition Discovery Phase IV (Knowledge Rewards) —
  // "Investigate" revela até 3 Tiers de Ecologia reais (pickKnowledge,
  // lib/knowledgeRewards.ts); "Continue"/nenhuma escolha mantêm
  // exatamente 1, como sempre.
  const ecologyLines = creature ? pickKnowledge(getCreatureEcologyCandidates(creature), echoContext.approach) : [];

  // Sprint Discovery Chains Phase I — reaproveita a mesma
  // getCreatureMentions já usada em "Também citado em" acima, só
  // fraseada como sugestão em vez de lista factual ("o que isto
  // menciona").
  //
  // Sprint Knowledge Threads Phase I — "o que é parecido com isto":
  // outras criaturas que compartilham a MESMA região/habitat real.
  //
  // Sprint Knowledge Network Phase I — as duas fontes acima eram
  // renderizadas como DUAS linhas separadas ("Descoberta" +
  // "Também pode interessar"), cada uma decidida sem saber da outra —
  // dívida encontrada e eliminada: `getNextSteps` combina as duas
  // listas de candidatos reais, remove repetições e decide quantos
  // revelar (pickKnowledge, cap 1/3 por Approach) — uma única linha
  // "Próximo Passo".
  const nextSteps = creature
    ? getNextSteps([getCreatureDiscoveryCandidates(creature), getCreatureThreadCandidates(creature)], echoContext.approach)
    : [];

  // Sprint Expedition Echoes Phase I — no máximo um eco, só quando a
  // expedição atual do jogador tem a região desta criatura como
  // destino real.
  const echoLine = creature ? getCreatureEchoLine(getRegionName(creature.regionId), echoContext) : null;

  return (
    <CodexReader
      feedbackState={feedbackState}
      isEmpty={!creature}
      emptyMessage="Escolha uma criatura no catálogo ao lado."
      locked={creature?.locked ?? false}
      lockedTitle="Criatura desconhecida"
      lockedMessage="🔒 Este registro ainda está bloqueado."
      unlockCondition={creature?.unlockCondition ?? ""}
      icon={creature?.icon}
      title={creature?.name ?? ""}
      subtitle={type?.label ?? creature?.type}
      description={creature?.description ?? ""}
      facts={
        creature
          ? [
              { label: "Habitat", value: creature.habitat },
              { label: "Região", value: getRegionName(creature.regionId) },
              { label: "Periculosidade", value: DANGER_LABEL[creature.dangerLevel] },
              ...(ecologyLines.length > 0 ? [{ label: "Ecologia", value: ecologyLines.join(" ") }] : []),
              ...(nextSteps.length > 0 ? [{ label: "Próximo Passo", value: nextSteps.join(" ") }] : []),
              ...(echoLine ? [{ label: "Eco da Expedição", value: echoLine }] : []),
            ]
          : []
      }
      pages={allPages}
    />
  );
}
