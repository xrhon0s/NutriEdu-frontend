import { useCallback, useEffect, useState } from "react";
import api from "../../../services/api";

export default function RecipeList({ onEdit }) {
  const [recipes, setRecipes] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const deleteRecipe = async (id) => {
    if (!confirm("¿Seguro que quieres eliminar esta receta?")) return;
    try {
      await api.delete(`/admin/recipes/${id}`);
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "No se pudo eliminar la receta");
    }
  };

  return <div className="space-y-5">
    <form onSubmit={(event) => { event.preventDefault(); setPage(1); setSearch(query.trim()); }} className="flex gap-3">
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre o descripción" className="input-admin flex-1" />
      <button className="min-h-11 rounded-lg border border-gray-300 px-5 text-sm font-semibold">Buscar</button>
    </form>
    <p className="text-sm text-gray-500">{pagination.total} recetas registradas.</p>
    {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
    <div className="overflow-x-auto border-y border-gray-200"><table className="w-full min-w-[1100px] text-left text-sm"><thead className="bg-gray-50 text-xs text-gray-500"><tr><th className="p-3">ID</th><th className="p-3">Nombre</th><th className="p-3">Descripción</th><th className="p-3">Calorías</th><th className="p-3">Tiempo</th><th className="p-3">Nutrición</th><th className="p-3">Ingredientes</th><th className="p-3 text-right">Acciones</th></tr></thead><tbody>{loading ? <tr><td colSpan="8" className="py-10 text-center text-gray-500">Consultando recetas...</td></tr> : recipes.map((recipe) => { const names = recipe.ingredients?.map((item) => item.nombre).join(", ") || "-"; const nutrientCount = [recipe.calorias, recipe.protein_g, recipe.carbs_g, recipe.fat_g, recipe.saturated_fat_g, recipe.sugar_g, recipe.fiber_g, recipe.sodium_mg].filter((value) => value !== null && value !== undefined && value !== "").length; return <tr key={recipe.id} className="border-t border-gray-100"><td className="p-3">{recipe.id}</td><td className="p-3 font-semibold">{recipe.nombre}</td><td className="max-w-xs truncate p-3" title={recipe.descripcion}>{recipe.descripcion}</td><td className="p-3">{recipe.calorias}</td><td className="p-3">{recipe.tiempo_preparacion} min</td><td className="p-3"><span className={`font-semibold ${nutrientCount === 8 ? "text-green-700" : "text-amber-700"}`}>{nutrientCount}/8</span><span className="block text-xs text-gray-500">{recipe.nutrition_source || "unknown"}</span></td><td className="max-w-xs truncate p-3" title={names}>{names}</td><td className="p-3 text-right"><button onClick={() => onEdit(recipe)} className="mr-3 font-semibold text-green-700">Editar</button><button onClick={() => void deleteRecipe(recipe.id)} className="font-semibold text-red-700">Eliminar</button></td></tr>; })}</tbody></table></div>
    <AdminPagination pagination={pagination} page={page} setPage={setPage} />
  </div>;
}

function AdminPagination({ pagination, page, setPage }) {
  return <div className="flex items-center justify-between"><button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold disabled:opacity-40">Anterior</button><span className="text-sm text-gray-500">Página {pagination.page} de {pagination.totalPages}</span><button disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold disabled:opacity-40">Siguiente</button></div>;
}
