import { useCallback, useEffect, useState } from "react";
import api from "../../../services/api";
import { foodGroupLabels, foodGroupOptions, substitutionGroupLabels, substitutionGroupOptions } from "../../../constants/ingredientTaxonomy";

export default function IngredientList({ onEdit }) {
  const [ingredients, setIngredients] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [foodGroup, setFoodGroup] = useState("");
  const [substitutionGroup, setSubstitutionGroup] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/admin/ingredients", { params: { page, limit: 15, search: search || undefined, foodGroup: foodGroup || undefined, substitutionGroup: substitutionGroup || undefined } });
      setIngredients(response.data.items);
      setPagination(response.data.pagination);
    } catch (requestError) {
      setError(requestError.response?.data?.error || "No se pudieron consultar los ingredientes");
    } finally {
      setLoading(false);
    }
  }, [foodGroup, page, search, substitutionGroup]);

  useEffect(() => { void load(); }, [load]);

  const handleDelete = async (id) => {
    if (!confirm("¿Deseas eliminar este ingrediente?")) return;
    try {
      await api.delete(`/admin/ingredients/${id}`);
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "No se pudo eliminar el ingrediente");
    }
  };

  return <div className="space-y-5">
    <form onSubmit={(event) => { event.preventDefault(); setPage(1); setSearch(query.trim()); }} className="flex flex-col gap-3 sm:flex-row">
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar ingrediente" className="input-admin flex-1" />
      <select value={foodGroup} onChange={(event) => { setFoodGroup(event.target.value); setPage(1); }} className="input-admin sm:max-w-64"><option value="">Todos los grupos alimentarios</option>{foodGroupOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      <select value={substitutionGroup} onChange={(event) => { setSubstitutionGroup(event.target.value); setPage(1); }} className="input-admin sm:max-w-64"><option value="">Todos los grupos de sustitución</option>{substitutionGroupOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      <button className="min-h-11 rounded-lg border border-gray-300 px-5 text-sm font-semibold">Buscar</button>
    </form>
    <p className="text-sm text-gray-500">{pagination.total} ingredientes registrados.</p>
    {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
    <div className="overflow-x-auto border-y border-gray-200"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-gray-50 text-xs text-gray-500"><tr><th className="p-3">ID</th><th className="p-3">Nombre</th><th className="p-3">Grupo alimentario</th><th className="p-3">Sustitución culinaria</th><th className="p-3 text-right">Acciones</th></tr></thead><tbody>{loading ? <tr><td colSpan="5" className="py-10 text-center text-gray-500">Consultando ingredientes...</td></tr> : ingredients.map((ingredient) => <tr key={ingredient.id} className="border-t border-gray-100"><td className="p-3">{ingredient.id}</td><td className="p-3 font-semibold">{ingredient.nombre}</td><td className="p-3">{foodGroupLabels[ingredient.food_group] || foodGroupLabels.other}</td><td className="p-3">{substitutionGroupLabels[ingredient.substitution_group] || substitutionGroupLabels.other}</td><td className="p-3 text-right"><button className="mr-3 font-semibold text-green-700" onClick={() => onEdit(ingredient)}>Editar</button><button className="font-semibold text-red-700" onClick={() => void handleDelete(ingredient.id)}>Eliminar</button></td></tr>)}</tbody></table></div>
    <div className="flex items-center justify-between"><button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold disabled:opacity-40">Anterior</button><span className="text-sm text-gray-500">Página {pagination.page} de {pagination.totalPages}</span><button disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold disabled:opacity-40">Siguiente</button></div>
  </div>;
}
