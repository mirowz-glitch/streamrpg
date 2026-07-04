import { Fragment, createElement, type ReactNode } from "react";

// Sprint Library System — "Markdown simples. Nada mais.": só
// **negrito**, *itálico* e parágrafos separados por linha em branco.
// Sem biblioteca nova, sem HTML bruto (nenhum dangerouslySetInnerHTML) —
// só um parser mínimo que devolve elementos React.
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter((part) => part !== "");
  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (part.startsWith("**") && part.endsWith("**")) {
      return createElement("strong", { key }, part.slice(2, -2));
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return createElement("em", { key }, part.slice(1, -1));
    }
    return createElement(Fragment, { key }, part);
  });
}

export function renderMarkdownLite(content: string): ReactNode {
  const paragraphs = content.split(/\n\s*\n/);
  return paragraphs.map((paragraph, index) =>
    createElement("p", { key: index, className: "book-page-paragraph" }, renderInline(paragraph, `p${index}`)),
  );
}
