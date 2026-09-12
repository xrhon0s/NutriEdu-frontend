import { useCallback, useEffect, useState } from "react";
import { Carrot, Pencil, Search, Trash2, X } from "lucide-react";
import Button from "../../../components/Button";
import ConfirmModal from "../../../components/ConfirmModal";
import EmptyState from "../../../components/EmptyState";
import Pagination from "../../../components/Pagination";
import StatusMessage from "../../../components/StatusMessage";
import { foodGroupLabels, foodGroupOptions, substitutionGroupLabels, substitutionGroupOptions } from "../../../constants/ingredientTaxonomy";
import api from "../../../services/api";

export default function IngredientList({ onEdit }) {
  const [ingredients, setIngredients] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [foodGroup, setFoodGroup] = useState("");
  const [substitutionGroup, setSubstitutionGroup] = useState("");
  const [nutritionStatus, setNutritionStatus] = useState("incomplete");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/admin/ingredients", { params: { page, limit: 15, search: search || undefined, foodGroup: foodGroup || undefined, substitutionGroup: substitutionGroup || undefined, nutritionStatus: nutritionStatus || undefined } });
      setIngredients(response.data.items);
      setPagination(response.data.pagination);
    } catch (requestError) {
      setError(requestError.response?.data?.error || "No se pudieron consultar los ingredientes");
    } finally {
      setLoading(false);
    }
  }, [foodGroup, nutritionStatus, page, search, substitutionGroup]);

  useEffect(() => { void load(); }, [load]);

  const submitSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(query.trim());
    setMessage("");
  };

  const clearFilters = () => {
    setQuery("");
    setSearch("");
    setFoodGroup("");
    setSubstitutionGroup("");
    setNutritionStatus("");
    setPage(1);
  };

  const changeFilter = (setter) => (event) => {
    setter(event.target.value);
    setPage(1);
    setMessage("");
  };

  const deleteIngredient = async () => {
    if (!ingredientToDelete) return;
    try {
      setDeleting(true);
      setError("");
      await api.delete(`/admin/ingredients/${ingredientToDelete.id}`);
      setMessage(`“${ingredientToDelete.nombre}” fue eliminado.`);
      setIngredientToDelete(null);
      if (ingredients.length === 1 && page > 1) setPage((current) => current - 1);
      else await load();
    } catch (requestError) {
      setIngredientToDelete(null);
      setError(requestError.response?.data?.message || "No se pudo eliminar el ingrediente");
    } finally {
      setDeleting(false);
    }
  };

  const hasFilters = Boolean(search || foodGroup || substitutionGroup || nutritionStatus);

  return (
    <div className="space-y-5">
      <form onSubmit={submitSearch} className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_repeat(3,minmax(170px,0.65fr))_auto]" role="search">
        <label className="relative min-w-0">
          <span className="sr-only">Buscar ingredientes</span>
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar ingrediente" className="input-admin w-full pl-10 pr-10" />
          {query ? <button type="button" onClick={() => setQuery("")} className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]" aria-label="Limpiar texto"><X size={17} /></button> : null}
        </label>
        <label>
          <span className="sr-only">Grupo alimentario</span>
          <select value={foodGroup} onChange={changeFilter(setFoodGroup)} className="input-admin w-full"><option value="">Todos los grupos</option>{foodGroupOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        </label>
        <label>
          <span className="sr-only">Grupo de sustitución</span>
          <select value={substitutionGroup} onChange={changeFilter(setSubstitutionGroup)} className="input-admin w-full"><option value="">Todas las sustituciones</option>{substitutionGroupOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        </label>
        <label>
          <span className="sr-only">Estado nutricional</span>
          <select value={nutritionStatus} onChange={changeFilter(setNutritionStatus)} className="input-admin w-full"><option value="">Todos los estados</option><option value="incomplete">Nutricion incompleta</option><option value="complete">Nutricion completa</option><option value="unreviewed">Sin fuente o revision</option></select>
        </label>
        <Button variant="secondary" type="submit"><Search size={17} /> Buscar</Button>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-[var(--color-text-muted)]">
        <p><strong className="text-[var(--color-text)]">{pagination.total}</strong> {nutritionStatus === "incomplete" ? "ingredientes pendientes, priorizados por uso" : "ingredientes encontrados"}</p>
        {hasFilters ? <Button size="sm" variant="ghost" onClick={clearFilters}>Limpiar filtros</Button> : null}
      </div>
      <StatusMessage type="error" message={error} />
      <StatusMessage message={message} />

      {loading ? <IngredientListSkeleton /> : ingredients.length ? (
        <>
          <div className="space-y-3 md:hidden">
            {ingredients.map((ingredient) => <IngredientCard key={ingredient.id} ingredient={ingredient} onEdit={onEdit} onDelete={setIngredientToDelete} />)}
          </div>
          <div className="hidden overflow-hidden border-y border-[var(--color-border)] md:block">
            <table className="w-full table-fixed text-left text-sm">
              <thead className="bg-[var(--color-surface-muted)] text-xs text-[var(--color-text-muted)]"><tr><th className="w-16 p-3">ID</th><th className="p-3">Ingrediente</th><th className="w-40 p-3">Grupo alimentario</th><th className="hidden w-48 p-3 lg:table-cell">Sustitución culinaria</th><th className="w-40 p-3">Cobertura</th><th className="w-44 p-3 text-right">Acciones</th></tr></thead>
              <tbody>{ingredients.map((ingredient) => <IngredientRow key={ingredient.id} ingredient={ingredient} onEdit={onEdit} onDelete={setIngredientToDelete} />)}</tbody>
            </table>
          </div>
        </>
      ) : (
        <EmptyState icon={Carrot} title="No encontramos ingredientes" description={hasFilters ? "Ajusta o limpia los filtros para consultar el catálogo completo." : "El catálogo todavía no tiene ingredientes registrados."} action={hasFilters ? <Button variant="secondary" onClick={clearFilters}>Limpiar filtros</Button> : null} />
      )}

      {!loading && ingredients.length ? <Pagination page={pagination.page} totalPages={pagination.totalPages} hasMore={page < pagination.totalPages} onPage={setPage} /> : null}

      <ConfirmModal
        isOpen={Boolean(ingredientToDelete)}
        onClose={() => setIngredientToDelete(null)}
        onConfirm={() => void deleteIngredient()}
        title="Eliminar ingrediente"
        message={ingredientToDelete ? `Se intentará eliminar “${ingredientToDelete.nombre}”. Si está asociado a recetas o restricciones, el servidor impedirá la operación para proteger los datos.` : ""}
        confirmLabel="Eliminar ingrediente"
        loading={deleting}
      />
    </div>
  );
}

function IngredientRow({ ingredient, onEdit, onDelete }) {
  return (
    <tr className="border-t border-[var(--color-border)] first:border-t-0">
      <td className="p-3 text-[var(--color-text-muted)]">{ingredient.id}</td>
      <td className="p-3 font-semibold text-[var(--color-text)]">{ingredient.nombre}</td>
      <td className="p-3">{foodGroupLabels[ingredient.food_group] || foodGroupLabels.other}</td>
      <td className="hidden p-3 text-[var(--color-text-muted)] lg:table-cell">{substitutionGroupLabels[ingredient.substitution_group] || substitutionGroupLabels.other}</td>
      <td className="p-3"><NutritionCoverage ingredient={ingredient} /></td>
      <td className="p-3"><RowActions ingredient={ingredient} onEdit={onEdit} onDelete={onDelete} /></td>
    </tr>
  );
}

function IngredientCard({ ingredient, onEdit, onDelete }) {
  return (
    <article className="rounded-lg border border-[var(--color-border)] bg-white p-4">
      <p className="text-xs font-semibold text-[var(--color-text-muted)]">Ingrediente #{ingredient.id}</p>
      <h3 className="mt-1 font-bold text-[var(--color-text)]">{ingredient.nombre}</h3>
      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-xs text-[var(--color-text-muted)]">Grupo</dt><dd className="mt-1 font-semibold text-[var(--color-text)]">{foodGroupLabels[ingredient.food_group] || foodGroupLabels.other}</dd></div><div><dt className="text-xs text-[var(--color-text-muted)]">Sustitución</dt><dd className="mt-1 font-semibold text-[var(--color-text)]">{substitutionGroupLabels[ingredient.substitution_group] || substitutionGroupLabels.other}</dd></div><div className="col-span-2"><dt className="text-xs text-[var(--color-text-muted)]">Cobertura nutricional</dt><dd className="mt-1"><NutritionCoverage ingredient={ingredient} /></dd></div></dl>
      <div className="mt-4 border-t border-[var(--color-border)] pt-3"><RowActions ingredient={ingredient} onEdit={onEdit} onDelete={onDelete} /></div>
    </article>
  );
}

function RowActions({ ingredient, onEdit, onDelete }) {
  return <div className="flex items-center justify-end gap-1"><Button size="sm" variant="ghost" onClick={() => onEdit(ingredient)}><Pencil size={16} /> Editar</Button><Button size="sm" variant="ghost" className="text-red-700 hover:bg-red-50 hover:text-red-800" onClick={() => onDelete(ingredient)}><Trash2 size={16} /> Eliminar</Button></div>;
}

const nutrientFields = ["calories_per_100g", "protein_per_100g", "carbs_per_100g", "fat_per_100g", "saturated_fat_per_100g", "sugar_per_100g", "fiber_per_100g", "sodium_mg_per_100g"];

function NutritionCoverage({ ingredient }) {
  const count = nutrientFields.filter((field) => ingredient[field] !== null && ingredient[field] !== undefined).length;
  const complete = count === nutrientFields.length;
  return <div className="space-y-1"><span className={`inline-flex rounded-full px-2 py-1 text-xs font-bold ${complete ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-900"}`}>{count}/8 nutrientes</span><p className="text-xs text-[var(--color-text-muted)]">{ingredient.recipe_usage_count || 0} recetas · {ingredient.nutrition_source === "unknown" ? "sin fuente" : ingredient.nutrition_source}</p></div>;
}

function IngredientListSkeleton() {
  return <div className="animate-pulse space-y-3" aria-label="Consultando ingredientes">{Array.from({ length: 5 }, (_, index) => <div key={index} className="h-20 rounded-lg bg-gray-100" />)}</div>;
}
