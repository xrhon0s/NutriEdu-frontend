import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  Eye,
  EyeOff,
  RefreshCw,
  RotateCcw,
  ShoppingBasket,
} from "lucide-react";
import api from "../services/api";
import AppShell from "../components/AppShell";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";
import StatusMessage from "../components/StatusMessage";

const STORAGE_PREFIX = "nutriedu:shopping-checked";

const categoryDefinitions = {
  protein: { label: "Proteínas", order: 1 },
  vegetable: { label: "Verduras", order: 2 },
  fruit: { label: "Frutas", order: 3 },
  carbohydrate: { label: "Cereales y carbohidratos", order: 4 },
  legume: { label: "Legumbres", order: 5 },
  dairy: { label: "Lácteos", order: 6 },
  fat: { label: "Grasas, nueces y semillas", order: 7 },
  seasoning: { label: "Condimentos", order: 8 },
  beverage: { label: "Bebidas", order: 9 },
  other: { label: "Otros", order: 10 },
};

const quantityFormatter = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 2 });

const normalizeResponse = (payload) => {
  if (!Array.isArray(payload)) return payload;

  return {
    items: payload.map((item) => ({
      ...item,
      foodGroup: "other",
      knownAmountG: null,
      plannedUses: 1,
      missingQuantityUses: 1,
      recipeCount: 0,
      sourceRecipes: [],
      quantities: [],
    })),
    planSignature: `legacy-${payload.map((item) => item.id).join("-")}`,
    plannedMeals: null,
    missingQuantityItems: payload.length,
  };
};

const storageKey = (userId, planSignature) => `${STORAGE_PREFIX}:${userId}:${planSignature}`;

const readCheckedItems = (key, validIds) => {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "{}");
    return Object.fromEntries(
      Object.entries(saved).filter(([id, checked]) => checked && validIds.has(Number(id)))
    );
  } catch {
    localStorage.removeItem(key);
    return {};
  }
};

const clearSupersededLists = (userId, activeKey) => {
  const prefix = `${STORAGE_PREFIX}:${userId}:`;
  for (let index = localStorage.length - 1; index >= 0; index -= 1) {
    const key = localStorage.key(index);
    if (key?.startsWith(prefix) && key !== activeKey) localStorage.removeItem(key);
  }
};

const formatQuantity = (item) => {
  const parts = [];
  const knownGrams = Number(item.knownAmountG);
  let totalGrams = item.knownAmountG !== null && Number.isFinite(knownGrams) ? knownGrams : null;

  item.quantities.forEach((quantity) => {
    const amount = Number(quantity.amount);
    const unit = String(quantity.unit || "unidad");
    if (!Number.isFinite(amount)) return;

    if (["g", "gramo", "gramos"].includes(unit.toLowerCase())) {
      totalGrams = (totalGrams || 0) + amount;
      return;
    }
    parts.push(`${quantityFormatter.format(amount)} ${unit}`);
  });

  if (totalGrams !== null) parts.unshift(`${quantityFormatter.format(totalGrams)} g`);

  if (item.missingQuantityUses > 0) {
    parts.push(parts.length ? "más cantidad por definir" : "Cantidad por definir");
  }

  return parts.join(" + ") || "Cantidad por definir";
};

export default function ShoppingList() {
  const userId = JSON.parse(localStorage.getItem("user"))?.id;
  const [shoppingData, setShoppingData] = useState({
    items: [],
    planSignature: "",
    plannedMeals: 0,
    missingQuantityItems: 0,
  });
  const [checkedItems, setCheckedItems] = useState({});
  const [showCompleted, setShowCompleted] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadList = useCallback(async ({ refresh = false } = {}) => {
    if (!userId) {
      setError("No encontramos una sesión válida para generar la lista.");
      setLoading(false);
      return;
    }

    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);
      setError("");

      const response = await api.get(`/planner/${userId}/shopping-list?detailed=true`);
      const nextData = normalizeResponse(response.data);
      const key = storageKey(userId, nextData.planSignature);
      const validIds = new Set(nextData.items.map((item) => item.id));

      clearSupersededLists(userId, key);
      setShoppingData(nextData);
      setCheckedItems(readCheckedItems(key, validIds));
    } catch (requestError) {
      setError(
        requestError.response?.data?.message
        || requestError.response?.data?.error
        || "No pudimos generar la lista de compras."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const completed = useMemo(
    () => shoppingData.items.filter((item) => checkedItems[item.id]).length,
    [checkedItems, shoppingData.items]
  );
  const total = shoppingData.items.length;
  const progress = total ? Math.round((completed / total) * 100) : 0;

  const groupedItems = useMemo(() => {
    const groups = new Map();
    const visibleItems = showCompleted
      ? shoppingData.items
      : shoppingData.items.filter((item) => !checkedItems[item.id]);

    visibleItems.forEach((item) => {
      const category = categoryDefinitions[item.foodGroup] ? item.foodGroup : "other";
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category).push(item);
    });

    return Array.from(groups.entries()).sort(
      ([left], [right]) => categoryDefinitions[left].order - categoryDefinitions[right].order
    );
  }, [checkedItems, shoppingData.items, showCompleted]);

  const persistChecked = (nextChecked) => {
    if (!shoppingData.planSignature) return;
    localStorage.setItem(
      storageKey(userId, shoppingData.planSignature),
      JSON.stringify(nextChecked)
    );
  };

  const toggleItem = (id) => {
    const next = { ...checkedItems, [id]: !checkedItems[id] };
    if (!next[id]) delete next[id];
    setCheckedItems(next);
    persistChecked(next);
  };

  const resetList = () => {
    if (!completed || !window.confirm("¿Quieres marcar todos los ingredientes como pendientes?")) return;
    setCheckedItems({});
    localStorage.removeItem(storageKey(userId, shoppingData.planSignature));
  };

  if (loading) {
    return (
      <AppShell>
        <ShoppingListSkeleton />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Lista de compras"
        subtitle="Ingredientes reunidos a partir de tu plan semanal guardado."
        actions={(
          <Link
            to="/planner"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-muted)]"
          >
            <CalendarDays aria-hidden="true" size={18} />
            Editar plan
          </Link>
        )}
      />

      {error ? <StatusMessage message={error} type="error" /> : null}

      {error && total === 0 ? (
        <div className="flex justify-start">
          <Button onClick={() => loadList()}>
            <RefreshCw aria-hidden="true" size={17} />
            Reintentar
          </Button>
        </div>
      ) : total === 0 ? (
        <EmptyState
          icon={ShoppingBasket}
          title="Tu lista está vacía"
          description="Guarda al menos una receta en el plan semanal para reunir sus ingredientes aquí."
          action={(
            <Link
              to="/planner"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)]"
            >
              <CalendarDays aria-hidden="true" size={18} />
              Ir al planificador
            </Link>
          )}
        />
      ) : (
        <div className="space-y-6">
          <section className="surface-panel p-5 sm:p-6" aria-labelledby="shopping-progress-title">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 id="shopping-progress-title" className="font-bold text-[var(--color-text)]">Progreso de compra</h2>
                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                      {completed} de {total} ingredientes completados
                      {shoppingData.plannedMeals !== null ? ` · ${shoppingData.plannedMeals} comidas planificadas` : ""}
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-[var(--color-primary)]">{progress}%</span>
                </div>
                <div
                  className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--color-surface-muted)]"
                  role="progressbar"
                  aria-label="Progreso de la lista de compras"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-valuenow={progress}
                >
                  <div className="h-full rounded-full bg-[var(--color-primary)] transition-[width] duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 sm:justify-end">
                <Button variant="secondary" size="sm" onClick={() => loadList({ refresh: true })} disabled={refreshing}>
                  <RefreshCw aria-hidden="true" className={refreshing ? "animate-spin" : ""} size={16} />
                  {refreshing ? "Actualizando..." : "Actualizar"}
                </Button>
                <Button variant="ghost" size="sm" onClick={resetList} disabled={!completed}>
                  <RotateCcw aria-hidden="true" size={16} />
                  Reiniciar
                </Button>
              </div>
            </div>
          </section>

          {shoppingData.missingQuantityItems > 0 ? (
            <StatusMessage
              type="warning"
              message={`${shoppingData.missingQuantityItems} ${shoppingData.missingQuantityItems === 1 ? "ingrediente aún no tiene" : "ingredientes aún no tienen"} cantidades completas en el catálogo.`}
            />
          ) : null}

          <div className="flex flex-col gap-3 border-b border-[var(--color-border)] pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex w-fit rounded-lg border border-[var(--color-border)] bg-white p-1" role="group" aria-label="Visibilidad de ingredientes completados">
              <button
                type="button"
                onClick={() => setShowCompleted(true)}
                aria-pressed={showCompleted}
                className={`inline-flex min-h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors ${showCompleted ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"}`}
              >
                <Eye aria-hidden="true" size={16} />
                Todos
              </button>
              <button
                type="button"
                onClick={() => setShowCompleted(false)}
                aria-pressed={!showCompleted}
                className={`inline-flex min-h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors ${!showCompleted ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"}`}
              >
                <EyeOff aria-hidden="true" size={16} />
                Solo pendientes
              </button>
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">{total - completed} pendientes</p>
          </div>

          {groupedItems.length ? (
            <div className="grid items-start gap-5 lg:grid-cols-2">
              {groupedItems.map(([category, items]) => (
                <ShoppingGroup
                  key={category}
                  title={categoryDefinitions[category].label}
                  items={items}
                  checkedItems={checkedItems}
                  onToggle={toggleItem}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CheckCircle2}
              title="Todo está listo"
              description="Completaste todos los ingredientes de esta lista. Puedes mostrarlos de nuevo o reiniciar el progreso."
              action={<Button variant="secondary" onClick={() => setShowCompleted(true)}>Mostrar completados</Button>}
            />
          )}
        </div>
      )}
    </AppShell>
  );
}

function ShoppingGroup({ title, items, checkedItems, onToggle }) {
  return (
    <section className="surface-panel overflow-hidden" aria-labelledby={`shopping-group-${items[0].foodGroup}`}>
      <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3">
        <h2 id={`shopping-group-${items[0].foodGroup}`} className="font-bold text-[var(--color-text)]">{title}</h2>
        <span className="text-xs font-semibold text-[var(--color-text-muted)]">{items.length} {items.length === 1 ? "ingrediente" : "ingredientes"}</span>
      </div>
      <div className="divide-y divide-[var(--color-border)]">
        {items.map((item) => {
          const checked = Boolean(checkedItems[item.id]);
          return (
            <label key={item.id} className={`flex min-h-20 cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--color-surface-muted)] ${checked ? "bg-green-50/60" : "bg-white"}`}>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(item.id)}
                className="h-5 w-5 shrink-0 cursor-pointer accent-[var(--color-primary)]"
              />
              <span className="min-w-0 flex-1">
                <span className={`block font-semibold ${checked ? "text-[var(--color-text-muted)] line-through" : "text-[var(--color-text)]"}`}>{item.nombre}</span>
                <span className="mt-1 block truncate text-xs text-[var(--color-text-muted)]" title={item.sourceRecipes.join(", ")}>
                  {item.sourceRecipes.length
                    ? `${item.plannedUses} ${item.plannedUses === 1 ? "uso" : "usos"} · ${item.sourceRecipes.join(", ")}`
                    : "Receta de origen no disponible"}
                </span>
              </span>
              <span className="max-w-40 text-right text-sm font-semibold text-[var(--color-text-muted)] sm:max-w-52">
                {formatQuantity(item)}
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
}

function ShoppingListSkeleton() {
  return (
    <div aria-label="Cargando lista de compras" role="status" className="animate-pulse">
      <div className="h-9 w-64 rounded bg-[var(--color-surface-muted)]" />
      <div className="mt-3 h-5 w-full max-w-xl rounded bg-[var(--color-surface-muted)]" />
      <div className="surface-panel mt-8 h-32" />
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="surface-panel h-72" />
        <div className="surface-panel h-72" />
      </div>
      <span className="sr-only">Generando lista de compras...</span>
    </div>
  );
}
