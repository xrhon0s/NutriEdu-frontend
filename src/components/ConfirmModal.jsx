import { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";
import Button from "./Button";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar acción",
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  loading = false,
  variant = "danger",
}) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !loading) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !loading) onClose(); }}>
      <div className="w-full max-w-md rounded-lg border border-[var(--color-border)] bg-white p-5 shadow-xl" role="alertdialog" aria-modal="true" aria-labelledby="confirm-modal-title" aria-describedby="confirm-modal-description">
        <div className="flex items-start gap-3">
          <span className={`grid size-10 shrink-0 place-items-center rounded-lg ${variant === "danger" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800"}`}>
            <AlertTriangle aria-hidden="true" size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="confirm-modal-title" className="text-lg font-bold text-[var(--color-text)]">{title}</h2>
            <p id="confirm-modal-description" className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">{message}</p>
          </div>
          <button type="button" className="grid size-10 shrink-0 place-items-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)] disabled:opacity-45" onClick={onClose} disabled={loading} aria-label="Cerrar">
            <X aria-hidden="true" size={19} />
          </button>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button ref={cancelRef} variant="secondary" onClick={onClose} disabled={loading}>{cancelLabel}</Button>
          <Button variant={variant} onClick={onConfirm} disabled={loading} aria-busy={loading}>{loading ? "Procesando..." : confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
