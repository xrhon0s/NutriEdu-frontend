import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";

export default function Pagination({ page, totalPages, hasMore, onPage, label = "Página" }) {
  const pageLabel = totalPages ? `${label} ${page} de ${totalPages}` : `${label} ${page}`;

  return (
    <nav className="mt-7 flex min-h-12 items-center justify-between gap-3 border-t border-[var(--color-border)] pt-5" aria-label="Paginación">
      <Button variant="secondary" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Página anterior">
        <ChevronLeft aria-hidden="true" size={17} />
        <span className="hidden sm:inline">Anterior</span>
      </Button>
      <span className="text-sm font-semibold text-[var(--color-text-muted)]" aria-live="polite">{pageLabel}</span>
      <Button variant="secondary" disabled={!hasMore} onClick={() => onPage(page + 1)} aria-label="Página siguiente">
        <span className="hidden sm:inline">Siguiente</span>
        <ChevronRight aria-hidden="true" size={17} />
      </Button>
    </nav>
  );
}
