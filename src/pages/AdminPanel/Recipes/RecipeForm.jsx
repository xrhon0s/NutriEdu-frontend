// src/pages/AdminPanel/Recipes/RecipeForm.jsx
import { useEffect, useState } from "react";
import api from "../../../services/api";

export default function RecipeForm({ recipe, onFinish }) {
  // Si recipe es null => estamos creando, si tiene datos => editando
  const isEditing = !!recipe;

  const [nombre, setNombre] = useState(recipe?.nombre || "");
  const [descripcion, setDescripcion] = useState(recipe?.descripcion || "");
  const [calorias, setCalorias] = useState(recipe?.calorias || "");
  const [tiempo, setTiempo] = useState(recipe?.tiempo_preparacion || "");
  const [ingredients, setIngredients] = useState([]);
  const [ingredientPage, setIngredientPage] = useState(1);
  const [ingredientPagination, setIngredientPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [ingredientQuery, setIngredientQuery] = useState("");
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState(
    recipe?.ingredients?.map((i) => i.id) || []
  );
  const [loading, setLoading] = useState(true);

  // Cargar ingredientes desde la API
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const res = await api.get("/admin/ingredients", {
          params: { page: ingredientPage, limit: 12, search: ingredientSearch || undefined }
        });
        setIngredients(res.data.items);
        setIngredientPagination(res.data.pagination);
      } catch (error) {
        console.error("Error cargando ingredientes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchIngredients();
  }, [ingredientPage, ingredientSearch]);

  const toggleIngredient = (id) => {
    if (selectedIngredients.includes(id)) {
      setSelectedIngredients(selectedIngredients.filter((i) => i !== id));
    } else {
      setSelectedIngredients([...selectedIngredients, id]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      nombre,
      descripcion,
      calorias,
      tiempo_preparacion: tiempo,
      ingredients: selectedIngredients.map(Number)
    };

    try {
      if (isEditing) {
        await api.put(`/admin/recipes/${recipe.id}`, payload);
      } else {
        await api.post("/admin/recipes", payload);
      }
      onFinish();
    } catch (error) {
      console.error("Error guardando receta:", error);
      alert("Ocurrió un error al guardar la receta");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      <div>
        <label className="font-medium block mb-1">Nombre de la receta</label>
        <input
          type="text"
          placeholder="Nombre de la receta"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full p-3 border rounded-xl"
          required
        />
      </div>

      <div>
        <label className="font-medium block mb-1">Descripción</label>
        <textarea
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="w-full p-3 border rounded-xl"
          required
        />
      </div>

      <div>
        <label className="font-medium block mb-1">Calorías</label>
        <input
          type="number"
          placeholder="Calorías"
          value={calorias}
          onChange={(e) => setCalorias(e.target.value)}
          className="w-full p-3 border rounded-xl"
          required
        />
      </div>

      <div>
        <label className="font-medium block mb-1">Tiempo de preparación (min)</label>
        <input
          type="number"
          placeholder="Tiempo de preparación (min)"
          value={tiempo}
          onChange={(e) => setTiempo(e.target.value)}
          className="w-full p-3 border rounded-xl"
          required
        />
      </div>

      <div>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="font-semibold">Ingredientes</h3>
            <p className="text-sm text-gray-500">{selectedIngredients.length} seleccionados de {ingredientPagination.total}</p>
          </div>
          <div className="flex min-w-0 flex-1 gap-2 sm:max-w-md">
            <input type="search" value={ingredientQuery} onChange={(event) => setIngredientQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); setIngredientPage(1); setIngredientSearch(ingredientQuery.trim()); } }} placeholder="Buscar ingrediente" className="min-h-11 min-w-0 flex-1 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-green-600" />
            <button type="button" onClick={() => { setIngredientPage(1); setIngredientSearch(ingredientQuery.trim()); }} className="min-h-11 rounded-lg border border-gray-300 px-4 text-sm font-semibold">Buscar</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {loading ? <p className="col-span-2 py-6 text-center text-sm text-gray-500">Consultando ingredientes...</p> : ingredients.map((i) => (
            <button
              key={i.id}
              type="button"
              onClick={() => toggleIngredient(i.id)}
              className={`px-3 py-2 border rounded-xl text-center ${
                selectedIngredients.includes(i.id)
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-800 hover:bg-gray-100"
              }`}
            >
              {i.nombre}
            </button>
          ))}
        </div>
        {!loading && ingredients.length === 0 ? <p className="py-6 text-center text-sm text-gray-500">No se encontraron ingredientes.</p> : null}
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
          <button type="button" disabled={ingredientPage <= 1 || loading} onClick={() => setIngredientPage((value) => value - 1)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold disabled:opacity-40">Anterior</button>
          <span className="text-sm text-gray-500">Página {ingredientPagination.page} de {ingredientPagination.totalPages}</span>
          <button type="button" disabled={ingredientPage >= ingredientPagination.totalPages || loading} onClick={() => setIngredientPage((value) => value + 1)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold disabled:opacity-40">Siguiente</button>
        </div>
      </div>

      <button
        type="submit"
        className="mt-4 w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition"
      >
        {isEditing ? "Actualizar" : "Crear"} receta
      </button>
    </form>
  );
}
