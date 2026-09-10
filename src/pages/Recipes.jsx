import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Clock3,
  Flame,
  HeartPulse,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import api from "../services/api";
import AppShell from "../components/AppShell";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";
import Pagination from "../components/Pagination";
import StatusMessage from "../components/StatusMessage";

const healthRanges = {
  muy_saludable: { min: 5 },
  saludable: { min: 3, max: 4 },
  moderada: { max: 2 },
};

const SAFE_RECIPES_PAGE_SIZE = 6;
const SEARCH_RESULTS_PAGE_SIZE = 12;

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [recommendedRecipes, setRecommendedRecipes] = useState([]);
  const [recommendationContext, setRecommendationContext] = useState(null);
  const [recommendedLoading, setRecommendedLoading] = useState(true);
  const [recommendedError, setRecommendedError] = useState("");
  const [recipesError, setRecipesError] = useState("");
  const [pagination, setPagination] = useState({ hasMore: false });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [nivelFilter, setNivelFilter] = useState("");
  const [caloriasMin, setCaloriasMin] = useState("");
  const [caloriasMax, setCaloriasMax] = useState("");
  const navigate = useNavigate();
  const userId = JSON.parse(localStorage.getItem("user"))?.id;
  const searchInputRef = useRef(null);
  const isDefaultView = query.trim() === "" && !nivelFilter && !caloriasMin && !caloriasMax;

  const fetchRecommendations = useCallback(async () => {
    try {
      setRecommendedLoading(true);
      setRecommendedError("");
      const response = await api.get("/recipes/recommendations", { params: { limit: 6, offset: 0 } });
      setRecommendedRecipes(response.data.recipes || []);
      setRecommendationContext(response.data.profileContext || null);
    } catch (error) {
      console.error(error);
      setRecommendedError(error.response?.data?.error || "No pudimos calcular tus recomendaciones.");
    } finally {
      setRecommendedLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) void fetchRecommendations();
  }, [fetchRecommendations, userId]);

  useEffect(() => setPage(1), [query, nivelFilter, caloriasMin, caloriasMax]);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);
        setRecipesError("");
        const healthRange = healthRanges[nivelFilter] || {};
        const pageSize = isDefaultView ? SAFE_RECIPES_PAGE_SIZE : SEARCH_RESULTS_PAGE_SIZE;
        const response = await api.get(`/recipes/search/${userId}`, {
          params: {
            query: query || undefined,
            nivel_min: healthRange.min,
            nivel_max: healthRange.max,
            calorias_min: caloriasMin || undefined,
            calorias_max: caloriasMax || undefined,
            safe_only: isDefaultView ? "true" : undefined,
            paginated: "true",
            limit: pageSize,
            offset: (page - 1) * pageSize,
          },
        });
        if (active) {
          setRecipes(response.data.recipes || []);
          setPagination(response.data.pagination || { hasMore: false });
        }
      } catch (error) {
        console.error(error);
        if (active) setRecipesError(error.response?.data?.error || "No pudimos consultar las recetas.");
      } finally {
        if (active) setLoading(false);
      }
    }, 300);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [userId, query, nivelFilter, caloriasMin, caloriasMax, page, isDefaultView]);

  const resetFilters = () => {
    setQuery("");
    setNivelFilter("");
    setCaloriasMin("");
    setCaloriasMax("");
    setPage(1);
    searchInputRef.current?.focus();
  };

  const cards = (items) => items.map((recipe) => (
    <RecipeCard key={recipe.id} recipe={recipe} onOpen={() => navigate(`/recipes/${recipe.id}`)} />
  ));

  return (
    <AppShell className="max-w-6xl">
      <PageHeader
        title="Recetas"
        subtitle="Encuentra opciones compatibles con tus restricciones y revisa cómo se ajustan a tu perfil."
      />

      <section className="mb-8 border-y border-[var(--color-border)] bg-white py-4" aria-label="Filtros de recetas">
        <div className="grid gap-3 px-3 sm:px-4 lg:grid-cols-[minmax(260px,1fr)_190px_150px_150px_auto] lg:items-end">
          <label className="min-w-0">
            <span className="mb-1.5 block text-xs font-bold text-[var(--color-text-muted)]">Buscar</span>
            <span className="relative block">
              <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
              <input
                ref={searchInputRef}
                type="search"
                placeholder="Nombre o descripción"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="field-control pl-10"
              />
            </span>
          </label>

          <label>
            <span className="mb-1.5 block text-xs font-bold text-[var(--color-text-muted)]">Nivel de salud</span>
            <select value={nivelFilter} onChange={(event) => setNivelFilter(event.target.value)} className="field-control">
              <option value="">Todos</option>
              <option value="muy_saludable">Muy saludable</option>
              <option value="saludable">Saludable</option>
              <option value="moderada">Moderada</option>
            </select>
          </label>

          <label>
            <span className="mb-1.5 block text-xs font-bold text-[var(--color-text-muted)]">Calorías mín.</span>
            <input type="number" min="0" placeholder="0" value={caloriasMin} onChange={(event) => setCaloriasMin(event.target.value)} className="field-control" />
          </label>

          <label>
            <span className="mb-1.5 block text-xs font-bold text-[var(--color-text-muted)]">Calorías máx.</span>
            <input type="number" min="0" placeholder="Sin límite" value={caloriasMax} onChange={(event) => setCaloriasMax(event.target.value)} className="field-control" />
          </label>

          <Button variant="secondary" onClick={resetFilters} disabled={isDefaultView}>
            <RotateCcw aria-hidden="true" size={17} />
            Restablecer
          </Button>
        </div>
      </section>

      {isDefaultView ? (
        <>
          <RecipeSection
            title="Recetas seguras"
            description="Compatibles con tus restricciones alimentarias registradas."
            icon={ShieldCheck}
          >
            {recipesError ? <StatusMessage type="error" message={recipesError} /> : null}
            {loading ? <RecipeSkeletonGrid /> : recipes.length ? <RecipeGrid>{cards(recipes)}</RecipeGrid> : <EmptyState title="No hay recetas seguras" description="Revisa tus restricciones o vuelve a intentarlo más tarde." />}
            {!loading && !recipesError ? <Pagination page={page} hasMore={pagination.hasMore} onPage={setPage} /> : null}
          </RecipeSection>

          <RecipeSection
            title="Recomendadas para ti"
            description="Priorizadas según restricciones, objetivos, condiciones, metas y preferencias disponibles."
            icon={Sparkles}
          >
            {recommendationContext?.clinicalReviewRequired ? (
              <StatusMessage type="warning" message="Tu perfil contiene condiciones o límites que requieren acompañamiento profesional. El puntaje es informativo." />
            ) : null}
            {recommendedError ? (
              <div>
                <StatusMessage type="error" message={recommendedError} />
                <Button variant="secondary" onClick={() => void fetchRecommendations()}>Volver a intentar</Button>
              </div>
            ) : recommendedLoading ? (
              <RecipeSkeletonGrid />
            ) : recommendedRecipes.length ? (
              <RecipeGrid>{cards(recommendedRecipes)}</RecipeGrid>
            ) : (
              <EmptyState title="Aún no hay recomendaciones" description="Completa tu perfil para obtener una selección personalizada." />
            )}
          </RecipeSection>
        </>
      ) : (
        <RecipeSection
          title="Resultados"
          description={loading ? "Actualizando resultados..." : `${recipes.length} recetas en esta página.`}
          icon={Search}
        >
          {recipesError ? <StatusMessage type="error" message={recipesError} /> : null}
          {loading ? <RecipeSkeletonGrid count={6} /> : recipes.length ? <RecipeGrid>{cards(recipes)}</RecipeGrid> : <EmptyState title="Sin coincidencias" description="Prueba otro nombre o amplía el rango de calorías." action={<Button variant="secondary" onClick={resetFilters}>Limpiar filtros</Button>} />}
          {!loading && !recipesError && recipes.length ? <Pagination page={page} hasMore={pagination.hasMore} onPage={setPage} /> : null}
        </RecipeSection>
      )}
    </AppShell>
  );
}

function RecipeSection({ title, description, icon: Icon, children }) {
  return (
    <section className="mb-10" aria-labelledby={`section-${title.replaceAll(" ", "-").toLowerCase()}`}>
      <div className="mb-5 flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
          <Icon aria-hidden="true" size={20} />
        </span>
        <div>
          <h2 id={`section-${title.replaceAll(" ", "-").toLowerCase()}`} className="text-xl font-bold text-[var(--color-text)]">{title}</h2>
          <p className="mt-1 text-sm leading-5 text-[var(--color-text-muted)]">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function RecipeGrid({ children }) {
  return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

function RecipeCard({ recipe, onOpen }) {
  const unsafe = Boolean(recipe.hasUnsafeIngredients);
  const recommendation = recipe.recommendation;
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group flex min-h-64 w-full flex-col rounded-lg border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${unsafe ? "border-red-300" : "border-[var(--color-border)]"}`}
      aria-label={`Ver receta ${recipe.nombre}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${unsafe ? "bg-red-50 text-red-700" : "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"}`}>
          {unsafe ? <AlertTriangle aria-hidden="true" size={19} /> : <ShieldCheck aria-hidden="true" size={19} />}
        </span>
        <div className="flex flex-wrap justify-end gap-1.5">
          {recommendation ? <span className="rounded-md bg-sky-50 px-2 py-1 text-xs font-bold text-sky-800">Afinidad {recommendation.score}/100</span> : null}
          <span className={`rounded-md px-2 py-1 text-xs font-bold ${healthColor(recipe.nivel_salud)}`}>{healthLabel(recipe.nivel_salud)}</span>
        </div>
      </div>

      <h3 className="mt-4 text-lg font-bold leading-6 text-[var(--color-text)]">{recipe.nombre}</h3>
      <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-[var(--color-text-muted)]">{recipe.descripcion || "Descripción pendiente."}</p>

      {recommendation ? (
        <div className="mt-3 min-h-11 border-l-2 border-sky-300 pl-3 text-xs leading-5 text-[var(--color-text-muted)]">
          <p className="line-clamp-2">{recommendation.reasons[0] || "Compatible con la información disponible de tu perfil."}</p>
          {recommendation.confidence < 0.5 ? <p className="font-semibold text-amber-800">Datos nutricionales limitados</p> : null}
        </div>
      ) : <div className="min-h-3" />}

      <div className="mt-auto grid grid-cols-3 gap-2 border-y border-[var(--color-border)] py-3 text-xs text-[var(--color-text-muted)]">
        <Metric icon={Flame} label={`${recipe.calorias ?? "--"} kcal`} />
        <Metric icon={Clock3} label={recipe.tiempo_preparacion ? `${recipe.tiempo_preparacion} min` : "Sin tiempo"} />
        <Metric icon={HeartPulse} label={`${recipe.nivel_salud}/5`} />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className={`text-xs font-bold ${unsafe ? "text-red-700" : "text-[var(--color-primary)]"}`}>{unsafe ? "Revisar ingredientes" : "Segura para ti"}</span>
        <span className="inline-flex items-center gap-1 text-sm font-bold text-[var(--color-primary)]">Ver detalle <ArrowRight aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" size={16} /></span>
      </div>
    </button>
  );
}

function Metric({ icon: Icon, label }) {
  return <span className="inline-flex min-w-0 items-center gap-1.5"><Icon aria-hidden="true" className="shrink-0" size={15} /><span className="truncate">{label}</span></span>;
}

function RecipeSkeletonGrid({ count = 3 }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" aria-label="Cargando recetas" aria-busy="true">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="min-h-64 animate-pulse rounded-lg border border-[var(--color-border)] bg-white p-5">
          <div className="h-9 w-9 rounded-lg bg-gray-200" />
          <div className="mt-4 h-5 w-2/3 rounded bg-gray-200" />
          <div className="mt-3 h-4 w-full rounded bg-gray-100" />
          <div className="mt-2 h-4 w-4/5 rounded bg-gray-100" />
          <div className="mt-14 h-11 border-y border-gray-100" />
        </div>
      ))}
    </div>
  );
}

function healthLabel(level) {
  if (level >= 5) return "Muy saludable";
  if (level >= 3) return "Saludable";
  return "Moderada";
}

function healthColor(level) {
  if (level >= 5) return "bg-green-50 text-green-800";
  if (level >= 3) return "bg-teal-50 text-teal-800";
  return "bg-amber-50 text-amber-900";
}
