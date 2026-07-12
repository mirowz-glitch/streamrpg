// Sprint Reactive UI — World Feedback Phase I — camada central, sem
// estado, sem persistência, sem backend: "dado que este sinal real já
// existe, qual pequeno destaque visual a interface deve aplicar agora?".
// Ela NÃO renderiza, NÃO conhece componentes, NÃO cria regras de CSS —
// só traduz um booleano real (já computado por quem chama, nunca
// recalculado aqui) num nome de estado estável. O componente só
// pergunta "como devo parecer?" e aplica a classe correspondente
// (styles.css define a aparência de cada estado, uma única vez,
// reaproveitada em todo lugar).
//
// REQUISITO OBRIGATÓRIO — auditoria feita ANTES de escrever qualquer
// código, procurando lógica de "isHighlighted"/"showBadge"/
// "hasSomething"/"shouldGlow" já duplicada:
// - Nenhum componente hoje calcula um booleano e decide uma classe CSS
//   sozinho a partir dele (todo `{linha ? <p>...</p> : null}` já existe
//   só controla PRESENÇA de texto, nunca uma classe de destaque) — não
//   havia uma duplicação literal de código pra remover, mas HAVIA uma
//   ausência de padrão: cada Building que ganhasse um destaque no
//   futuro inventaria seu próprio nome de classe. Esta camada existe
//   pra isso nunca acontecer — um único vocabulário de estados.
// - `.identity-stat-highlight` (styles.css, já usada por StatsRow) é o
//   único precedente real de "destaque condicional" hoje — mesmo
//   espírito (troca de cor, nunca de layout), generalizado aqui em vez
//   de cada tela inventar sua própria variante.
export type UiFeedbackState = "highlight" | "softGlow" | "attention" | "subtleBorder" | "quiet";

// Pura: dado um sinal real (já calculado por quem chama, a partir de
// PlayerFacts/PlayerGoals/CharacterPresence/CollectionInsights/Legacy/
// KingdomReputation/Approach/Expedition/WorldState — nunca um dado
// novo), decide se o estado se aplica. Nunca inverte prioridade, nunca
// combina dois estados — no máximo um por elemento.
export function resolveFeedback(isActive: boolean, state: UiFeedbackState): UiFeedbackState | null {
  return isActive ? state : null;
}

// Utilitário de nomenclatura — não é CSS (nenhuma regra de estilo vive
// aqui), só evita cada componente reconstruir a mesma string de classe
// (`ui-feedback-${state}`) à mão.
export function feedbackClassName(state: UiFeedbackState | null): string {
  return state ? `ui-feedback-${state}` : "";
}
