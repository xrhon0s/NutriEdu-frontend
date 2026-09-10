import { useCallback, useEffect, useState } from "react";
import { CookingPot, Pencil, Search, Trash2, X } from "lucide-react";
import Button from "../../../components/Button";
import ConfirmModal from "../../../components/ConfirmModal";
import EmptyState from "../../../components/EmptyState";
import Pagination from "../../../components/Pagination";
import StatusMessage from "../../../components/StatusMessage";
import api from "../../../services/api";

const nutrientFields = ["calorias", "protein_g", "carbs_g", "fat_g", "saturated_fat_g", "sugar_g", "fiber_g", "sodium_mg"];

export default function RecipeList({ onEdit }) {
  const [recipes, setRecipes] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/admin/recipes", { params: { page, limit: 15, search: search || undefined } });
      setRecipes(response.data.items);
      setPagination(response.data.pagination);
    } catch (requestError) {
      setError(requestError.response?.data?.error || "No se pudieron consultar las recetas");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { void load(); }, [load]);

  const submitSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(query.trim());
    setMessage("");
  };

  const clearSearch = () => {
    setQuery("");
    setSearch("");
    setPage(1);
  };

  const deleteRecipe = async () => {
    if (!recipeToDelete) return;
    try {
      setDeleting(true);
      setError("");
      await api.delete(`/admin/recipes/${recipeToDelete.id}`);
      setMessage(`“${recipeToDelete.nombre}” fue eliminada.`);
      setRecipeToDelete(null);
      if (recipes.length === 1 && page > 1) setPage((current) => current - 1);
      else await load();
    } catch (requestError) {
      setRecipeToDelete(null);
      setError(requestError.response?.data?.message || "No se pudo eliminar la receta");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={submitSearch} className="flex flex-col gap-2 sm:flex-row" role="search">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Buscar recetas</span>
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre o descripción" className="input-admin w-full pl-10 pr-10" />
          {query ? <button type="button" onClick={() => setQuery("")} className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]" aria-label="Limpiar texto"><X size={17} /></button> : null}
        </label>
        <Button variant="secondary" type="submit"><Search size={17} /> Buscar</Button>
        {search ? <Button variant="ghost" onClick={clearSearch}>Limpiar filtro</Button> : null}
      </form>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-[var(--color-text-muted)]">
        <p><strong className="text-[var(--color-text)]">{pagination.total}</strong> recetas registradas</p>
        {search ? <p>Resultados para “{search}”</p> : null}
      </div>
      <StatusMessage type="error" message={error} />
      <StatusMessage message={message} />

      {loading ? <RecipeListSkeleton /> : recipes.length ? (
        <>
          <div className="space-y-3 md:hidden">
            {recipes.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} onEdit={onEdit} onDelete={setRecipeToDelete} />)}
          </div>
          <div className="hidden overflow-hidden border-y border-[var(--color-border)] md:block">
            <table className="w-full table-fixed text-left text-sm">
              <thead className="bg-[var(--color-surface-muted)] text-xs text-[var(--color-text-muted)]">
                <tr><th className="w-16 p-3">ID</th><th className="p-3">Receta</th><th className="hidden w-24 p-3 lg:table-cell">Calorías</th><th className="w-24 p-3">Nutrición</th><th className="hidden w-40 p-3 xl:table-cell">Ingredientes</th><th className="w-44 p-3 text-right">Acciones</th></tr>
              </thead>
              <tbody>{recipes.map((recipe) => <RecipeRow key={recipe.id} recipe={recipe} onEdit={onEdit} onDelete={setRecipeToDelete} />)}</tbody>
            </table>
          </div>
        </>
      ) : (
        <EmptyState icon={CookingPot} title="No encontramos recetas" description={search ? "Prueba con otro nombre o limpia la búsqueda." : "El catálogo todavía no tiene recetas registradas."} action={search ? <Button variant="secondary" onClick={clearSearch}>Limpiar búsqueda</Button> : null} />
      )}

      {!loading && recipes.length ? <Pagination page={pagination.page} totalPages={pagination.totalPages} hasMore={page < pagination.totalPages} onPage={setPage} /> : null}

      <ConfirmModal
        isOpen={Boolean(recipeToDelete)}
        onClose={() => setRecipeToDelete(null)}
        onConfirm={() => void deleteRecipe()}
        title="Eliminar receta"
        message={recipeToDelete ? `Se eliminará “${recipeToDelete.nombre}” y sus relaciones con ingredientes. Esta acción no se puede deshacer.` : ""}
        confirmLabel="Eliminar receta"
        loading={deleting}
      />
    </div>
  );
}

function RecipeRow({ recipe, onEdit, onDelete }) {
  const nutrientCount = countNutrients(recipe);
  const names = ingredientNames(recipe);
  return (
    <tr className="border-t border-[var(--color-border)] first:border-t-0">
      <td className="p-3 text-[var(--color-text-muted)]">{recipe.id}</td>
      <td className="p-3"><p className="truncate font-semibold text-[var(--color-text)]" title={recipe.nombre}>{recipe.nombre}</p><p className="mt-1 truncate text-xs text-[var(--color-text-muted)]" title={recipe.descripcion}>{recipe.descripcion || "Sin descripción"}</p></td>
      <td className="hidden p-3 lg:table-cell">{recipe.calorias ?? "Pendiente"}</td>
      <td className="p-3"><NutritionStatus count={nutrientCount} source={recipe.nutrition_source} /></td>
      <td className="hidden truncate p-3 text-[var(--color-text-muted)] xl:table-cell" title={names}>{names}</td>
      <td className="p-3"><RowActions recipe={recipe} onEdit={onEdit} onDelete={onDelete} /></td>
    </tr>
  );
}

function RecipeCard({ recipe, onEdit, onDelete }) {
  const nutrientCount = countNutrients(recipe);
  return (
    <article className="rounded-lg border border-[var(--color-border)] bg-white p-4">
      <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs font-semibold text-[var(--color-text-muted)]">Receta #{recipe.id}</p><h3 className="mt-1 font-bold text-[var(--color-text)]">{recipe.nombre}</h3></div><NutritionStatus count={nutrientCount} source={recipe.nutrition_source} compact /></div>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--color-text-muted)]">{recipe.descripcion || "Sin descripción"}</p>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--color-text-muted)]"><span>{recipe.calorias ?? "Pendiente"} kcal</span><span>{recipe.tiempo_preparacion ?? "Pendiente"} min</span><span>{recipe.ingredients?.length || 0} ingredientes</span></div>
      <div className="mt-4 border-t border-[var(--color-border)] pt-3"><RowActions recipe={recipe} onEdit={onEdit} onDelete={onDelete} /></div>
    </article>
  );
}

function RowActions({ recipe, onEdit, onDelete }) {
  return <div className="flex items-center justify-end gap-1"><Button size="sm" variant="ghost" onClick={() => onEdit(recipe)}><Pencil size={16} /> Editar</Button><Button size="sm" variant="ghost" className="text-red-700 hover:bg-red-50 hover:text-red-800" onClick={() => onDelete(recipe)}><Trash2 size={16} /> Eliminar</Button></div>;
}

function NutritionStatus({ count, source, compact = false }) {
  return <div className={compact ? "text-right" : ""}><span className={`text-sm font-bold ${count === 8 ? "text-green-700" : "text-amber-700"}`}>{count}/8</span><span className="block max-w-24 truncate text-xs text-[var(--color-text-muted)]">{source === "unknown" || !source ? "Sin revisar" : source}</span></div>;
}

function RecipeListSkeleton() {
  return <div className="animate-pulse space-y-3" aria-label="Consultando recetas">{Array.from({ length: 5 }, (_, index) => <div key={index} className="h-20 rounded-lg bg-gray-100" />)}</div>;
}

function countNutrients(recipe) {
  return nutrientFields.filter((field) => recipe[field] !== null && recipe[field] !== undefined && recipe[field] !== "").length;
}

function ingredientNames(recipe) {
  return recipe.ingredients?.map((item) => item.nombre).join(", ") || "Sin ingredientes";
}
