import { useCallback, useEffect, useState } from "react";
import {
  Bot,
  Carrot,
  ChevronRight,
  CircleAlert,
  CookingPot,
  HeartPulse,
  RefreshCw,
  ShieldCheck,
  UserRoundCheck,
  Users,
} from "lucide-react";
import Button from "../../components/Button";
import StatusMessage from "../../components/StatusMessage";
import api from "../../services/api";

const metrics = [
  { key: "users", label: "Usuarios", Icon: Users },
  { key: "profileCoveragePercent", label: "Perfiles completos", suffix: "%", Icon: UserRoundCheck },
  { key: "recipes", label: "Recetas", Icon: CookingPot },
  { key: "ingredients", label: "Ingredientes", Icon: Carrot },
  { key: "activeGoals", label: "Objetivos activos", Icon: HeartPulse },
  { key: "activeRules", label: "Reglas activas", Icon: ShieldCheck },
];

export default function OperationsOverview({ onNavigate }) {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOverview = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/admin/overview");
      setOverview(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.response?.data?.error || "No se pudo consultar el estado operativo");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadOverview(); }, [loadOverview]);

  if (loading) return <OverviewSkeleton />;
  if (error) return (
    <div>
      <StatusMessage type="error" message={error} />
      <Button variant="secondary" onClick={loadOverview}><RefreshCw size={17} /> Reintentar</Button>
    </div>
  );

  const budgetPercent = overview.vision.monthlyBudgetUsd
    ? Math.min(100, Math.round((overview.vision.committedUsd / overview.vision.monthlyBudgetUsd) * 100))
    : 0;
  const missingMigrations = overview.migrations.filter((migration) => !migration.recorded).length;
  const qualityItems = buildQualityItems(overview);

  return (
    <div className="space-y-9">
      <section aria-labelledby="operations-summary-title">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 id="operations-summary-title" className="text-lg font-bold text-[var(--color-text)]">Resumen operativo</h3>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">Actualizado {new Date(overview.generatedAt).toLocaleString("es-CO")}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={loadOverview}><RefreshCw size={16} /> Actualizar</Button>
        </div>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
          {metrics.map(({ key, label, suffix = "", Icon }) => (
            <div key={key} className="rounded-lg border border-[var(--color-border)] bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-[var(--color-text-muted)]">{label}</p>
                  <p className="mt-1 text-2xl font-bold text-[var(--color-text)]">{overview.counts[key]}{suffix}</p>
                </div>
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-green-50 text-green-700"><Icon aria-hidden="true" size={18} /></span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--color-text-muted)]">
          <span>{overview.counts.activeConditions} condiciones activas</span>
          <span>{overview.counts.restrictions} restricciones</span>
          <span className={overview.counts.unreadNotifications ? "font-semibold text-amber-700" : ""}>{overview.counts.unreadNotifications} avisos sin leer</span>
        </div>
      </section>

      <section className="border-y border-[var(--color-border)] py-7" aria-labelledby="catalog-quality-title">
        <div className="mb-5">
          <h3 id="catalog-quality-title" className="text-lg font-bold text-[var(--color-text)]">Calidad del catálogo</h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">Estos datos determinan qué tan precisas pueden ser las recomendaciones, las sustituciones y las listas de compras.</p>
        </div>
        <div className="divide-y divide-[var(--color-border)]">
          {qualityItems.map((item) => <QualityRow key={item.label} item={item} onNavigate={onNavigate} />)}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2" aria-label="Servicios y base de datos">
        <div className="rounded-lg border border-[var(--color-border)] bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="flex items-center gap-2 text-base font-bold text-[var(--color-text)]"><Bot aria-hidden="true" size={19} /> Uso de IA este mes</h3>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">Presupuesto y resultados de análisis.</p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${overview.vision.configured ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>{overview.vision.configured ? "Activa" : "Desactivada"}</span>
          </div>
          <div className="mt-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-2xl font-bold text-[var(--color-text)]">${overview.vision.committedUsd.toFixed(4)}</p>
              <p className="text-sm text-[var(--color-text-muted)]">de ${overview.vision.monthlyBudgetUsd.toFixed(2)}</p>
            </div>
            {overview.vision.configured ? <p className="text-right text-xs text-[var(--color-text-muted)]">{overview.vision.provider}<br />{overview.vision.model}</p> : null}
          </div>
          <ProgressBar value={budgetPercent} label={`${budgetPercent}% del presupuesto mensual`} />
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <UsageStat label="Total" value={overview.vision.analyses} />
            <UsageStat label="Correctos" value={overview.vision.succeeded} />
            <UsageStat label="Fallidos" value={overview.vision.failed} />
            <UsageStat label="Pendientes" value={overview.vision.pending} />
          </div>
          <Button className="mt-4 w-full sm:w-auto" variant="secondary" size="sm" onClick={() => onNavigate?.("vision")}>Revisar uso <ChevronRight size={16} /></Button>
        </div>

        <div className="rounded-lg border border-[var(--color-border)] bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[var(--color-text)]">Estado de migraciones</h3>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">Comparación entre archivos y registro de la base de datos.</p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${missingMigrations ? "bg-amber-100 text-amber-900" : "bg-green-100 text-green-800"}`}>{missingMigrations ? `${missingMigrations} pendientes` : "Al día"}</span>
          </div>
          <div className="mt-4 max-h-64 overflow-auto border-y border-[var(--color-border)]">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-[var(--color-surface-muted)] text-xs text-[var(--color-text-muted)]"><tr><th className="px-3 py-2">Versión</th><th className="px-3 py-2">Migración</th><th className="px-3 py-2">Estado</th></tr></thead>
              <tbody>
                {overview.migrations.map((migration) => (
                  <tr key={migration.version} className="border-t border-[var(--color-border)] first:border-t-0">
                    <td className="px-3 py-2 font-mono">{migration.version}</td>
                    <td className="max-w-40 truncate px-3 py-2 text-[var(--color-text-muted)]" title={migration.fileName}>{migration.fileName.replace(/^\d{3}_/, "").replace(/\.sql$/, "")}</td>
                    <td className={`px-3 py-2 font-semibold ${migration.recorded ? "text-green-700" : "text-amber-700"}`}>{migration.recorded ? "Registrada" : "Sin registro"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {missingMigrations ? <p className="mt-4 flex items-start gap-2 text-sm text-amber-800"><CircleAlert aria-hidden="true" className="mt-0.5 shrink-0" size={17} /> Verifica el estado con <code className="font-semibold">npm run migrate:status</code> antes de publicar cambios de datos.</p> : null}
        </div>
      </section>
    </div>
  );
}

function buildQualityItems(overview) {
  const quality = overview.catalogQuality;
  return [
    { label: "Recetas con nutrición completa", detail: `${quality.nutritionCompleteRecipes} de ${overview.counts.recipes}`, value: quality.nutritionCompletePercent, tab: "recipes" },
    { label: "Recetas con nutrición revisada", detail: `${quality.nutritionReviewedRecipes} de ${overview.counts.recipes}`, value: quality.nutritionReviewedPercent, tab: "recipes" },
    { label: "Ingredientes de receta cuantificados", detail: `${quality.quantifiedIngredientRelations} de ${quality.ingredientRelations}`, value: quality.quantifiedIngredientsPercent, tab: "recipes" },
    { label: "Ingredientes categorizados", detail: `${quality.categorizedIngredients} de ${overview.counts.ingredients}`, value: quality.categorizedIngredientsPercent, tab: "ingredients" },
    { label: "Sustituciones precisas", detail: `${quality.substitutionReadyIngredients} de ${overview.counts.ingredients}`, value: quality.substitutionReadyPercent, tab: "ingredients" },
  ];
}

function QualityRow({ item, onNavigate }) {
  return (
    <div className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(180px,0.8fr)_auto] sm:items-center">
      <div className="min-w-0">
        <p className="font-semibold text-[var(--color-text)]">{item.label}</p>
        <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">{item.detail}</p>
      </div>
      <div className="flex items-center gap-3">
        <ProgressBar value={item.value} label={`${item.value}%`} />
        <span className={`w-11 text-right text-sm font-bold ${item.value < 70 ? "text-amber-700" : "text-green-700"}`}>{item.value}%</span>
      </div>
      <button type="button" onClick={() => onNavigate?.(item.tab)} className="inline-flex min-h-10 items-center gap-1 justify-self-start text-sm font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] sm:justify-self-end">Revisar <ChevronRight size={16} /></button>
    </div>
  );
}

function ProgressBar({ value, label }) {
  return (
    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100" role="progressbar" aria-label={label} aria-valuemin="0" aria-valuemax="100" aria-valuenow={value}>
      <div className={`h-full rounded-full ${value < 70 ? "bg-amber-500" : "bg-green-600"}`} style={{ width: `${value}%` }} />
    </div>
  );
}

function UsageStat({ label, value }) {
  return <div className="rounded-lg bg-[var(--color-surface-muted)] px-2 py-3 text-center text-xs"><p className="font-bold text-[var(--color-text)]">{value}</p><p className="mt-1 text-[var(--color-text-muted)]">{label}</p></div>;
}

function OverviewSkeleton() {
  return (
    <div className="animate-pulse space-y-7" aria-label="Cargando resumen operativo">
      <div className="h-6 w-48 rounded bg-gray-200" />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-24 rounded-lg bg-gray-200" />)}</div>
      <div className="space-y-3 border-y border-[var(--color-border)] py-7">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-12 rounded bg-gray-100" />)}</div>
    </div>
  );
}
