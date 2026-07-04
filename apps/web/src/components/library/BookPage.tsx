import { memo } from "react";
import { renderMarkdownLite } from "../../lib/markdownLite";

interface BookPageProps {
  content: string;
  pageNumber: number;
  totalPages: number;
}

// Sprint Library System — uma página de códice: fundo próprio, texto em
// markdown simples. Sem efeitos, sem animação de virar página.
export const BookPage = memo(function BookPage({ content, pageNumber, totalPages }: BookPageProps) {
  return (
    <div className="book-page">
      <div className="book-page-content">{renderMarkdownLite(content)}</div>
      <div className="book-page-number">
        Página {pageNumber} de {totalPages}
      </div>
    </div>
  );
});
