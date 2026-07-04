import type { CodexFact } from "../../lib/codex";

// Sprint Codex Framework — lista de fatos rápidos do reader (habitat/
// região/periculosidade no Bestiário; ala/ano no Museu). Já era
// compartilhada entre os dois via `.creature-reader-facts`/
// `.creature-reader-fact` antes desta Sprint — a Biblioteca nunca usou
// (por isso o BookReader simplesmente não passa `facts`).
export function CodexFacts({ facts }: { facts: CodexFact[] }) {
  return (
    <div className="creature-reader-facts">
      {facts.map((fact) => (
        <div className="creature-reader-fact" key={fact.label}>
          <span>{fact.label}</span>
          <strong>{fact.value}</strong>
        </div>
      ))}
    </div>
  );
}
