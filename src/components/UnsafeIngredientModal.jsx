import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Check, X } from "lucide-react";
import Button from "./Button";

export default function UnsafeIngredientModal({
  isOpen,
  onClose,
  onConfirm,
  unsafeIngredients = [],
  substitutes = [],
  recipeName,
}) {
  const [chosenSubs, setChosenSubs] = useState({});
  const closeButtonRef = useRef(null);
  const selectable = typeof onConfirm === "function";
  const optionsByIngredient = useMemo(
    () => new Map(substitutes.map((item) => [item.ingredienteOriginal, item.opciones || []])),
    [substitutes]
  );
  const allSelected = unsafeIngredients.every((ingredient) => chosenSubs[ingredient.nombre]);
  const dismiss = useCallback(() => {
    setChosenSubs({});
    onClose();
  }, [onClose]);

  const confirm = () => {
    onConfirm(chosenSubs);
    setChosenSubs({});
  };

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => closeButtonRef.current?.focus(), 0);

    const handleKeyDown = (event) => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dismiss, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-0 sm:items-center sm:p-5" onMouseDown={(event) => event.target === event.currentTarget && dismiss()}>
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-lg bg-white shadow-xl sm:max-w-xl sm:rounded-lg" role="dialog" aria-modal="true" aria-labelledby="unsafe-modal-title" aria-describedby="unsafe-modal-description">
        <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-[var(--color-border)] bg-white px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-red-50 text-red-700">
              <AlertTriangle aria-hidden="true" size={19} />
            </span>
            <div>
              <h2 id="unsafe-modal-title" className="text-lg font-bold text-[var(--color-text)]">Alternativas de ingredientes</h2>
              <p className="mt-1 text-sm font-medium text-red-700">{recipeName}</p>
            </div>
          </div>
          <button ref={closeButtonRef} type="button" onClick={dismiss} className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]" aria-label="Cerrar alternativas">
            <X aria-hidden="true" size={20} />
          </button>
        </div>

        <div className="px-5 py-5 sm:px-6">
          <p id="unsafe-modal-description" className="text-sm leading-6 text-[var(--color-text-muted)]">
            {selectable
              ? "Elige una alternativa para cada ingrediente antes de aplicarlas al plan."
              : "Estas opciones no coinciden con las restricciones registradas en tu perfil. Revísalas antes de preparar la receta."}
          </p>

          <div className="mt-5 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
            {unsafeIngredients.map((ingredient) => {
              const options = optionsByIngredient.get(ingredient.nombre) || [];
              return (
                <div key={ingredient.id} className="py-4">
                  <p className="font-bold text-red-800">{ingredient.nombre}</p>
                  {selectable ? (
                    <label className="mt-3 block">
                      <span className="mb-1.5 block text-xs font-bold text-[var(--color-text-muted)]">Sustituto</span>
                      <select
                        className="field-control"
                        value={chosenSubs[ingredient.nombre] || ""}
                        onChange={(event) => setChosenSubs((current) => ({ ...current, [ingredient.nombre]: event.target.value }))}
                        disabled={!options.length}
                      >
                        <option value="">{options.length ? "Selecciona una opción" : "Sin alternativas disponibles"}</option>
                        {options.map((option) => <option key={option.id} value={option.nombre}>{option.nombre}</option>)}
                      </select>
                    </label>
                  ) : options.length ? (
                    <ul className="mt-3 flex flex-wrap gap-2" aria-label={`Alternativas para ${ingredient.nombre}`}>
                      {options.map((option) => <li key={option.id} className="rounded-md bg-[var(--color-surface-muted)] px-3 py-2 text-sm text-[var(--color-text)]">{option.nombre}</li>)}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-amber-800">No hay alternativas seguras suficientemente cercanas en el catálogo.</p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={dismiss}>Cerrar</Button>
            {selectable ? (
              <Button disabled={!allSelected} onClick={confirm}>
                <Check aria-hidden="true" size={17} />
                Aplicar sustituciones
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
