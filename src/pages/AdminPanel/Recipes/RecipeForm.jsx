// src/pages/AdminPanel/Recipes/RecipeForm.jsx
import { useEffect, useState } from "react";
import { Calculator } from "lucide-react";
import api from "../../../services/api";

const nutrientFields = [
  ["protein_g", "Proteína", "g"],
  ["carbs_g", "Carbohidratos", "g"],
  ["fat_g", "Grasas", "g"],
  ["saturated_fat_g", "Grasa saturada", "g"],
  ["sugar_g", "Azúcar", "g"],
  ["fiber_g", "Fibra", "g"],
  ["sodium_mg", "Sodio", "mg"]
];

export default function RecipeForm({ recipe, onFinish }) {
  // Si recipe es null => estamos creando, si tiene datos => editando
  const isEditing = !!recipe;

  const [nombre, setNombre] = useState(recipe?.nombre || "");
  const [descripcion, setDescripcion] = useState(recipe?.descripcion || "");
  const [calorias, setCalorias] = useState(recipe?.calorias || "");
  const [tiempo, setTiempo] = useState(recipe?.tiempo_preparacion || "");
  const [nutrition, setNutrition] = useState({
    nivel_salud: recipe?.nivel_salud || 3,
    protein_g: recipe?.protein_g ?? "",
    carbs_g: recipe?.carbs_g ?? "",
    fat_g: recipe?.fat_g ?? "",
    saturated_fat_g: recipe?.saturated_fat_g ?? "",
    sugar_g: recipe?.sugar_g ?? "",
    fiber_g: recipe?.fiber_g ?? "",
    sodium_mg: recipe?.sodium_mg ?? "",
    serving_size_g: recipe?.serving_size_g ?? "",
    servings: recipe?.servings ?? 1,
    nutrition_source: recipe?.nutrition_source || "unknown",
    nutrition_source_reference: recipe?.nutrition_source_reference || ""
  });
  const [ingredients, setIngredients] = useState([]);
  const [ingredientPage, setIngredientPage] = useState(1);
  const [ingredientPagination, setIngredientPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [ingredientQuery, setIngredientQuery] = useState("");
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState(
    recipe?.ingredients?.map((item) => ({ id: item.id, nombre: item.nombre, amount: item.amount ?? "", unit: item.unit ?? "", amount_g: item.amount_g ?? "" })) || []
  );
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [nutritionMessage, setNutritionMessage] = useState(null);

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

  const toggleIngredient = (ingredient) => {
    if (selectedIngredients.some((item) => item.id === ingredient.id)) {
      setSelectedIngredients((current) => current.filter((item) => item.id !== ingredient.id));
    } else {
      setSelectedIngredients((current) => [...current, { id: ingredient.id, nombre: ingredient.nombre, amount: "", unit: "", amount_g: "" }]);
    }
    invalidateCalculatedNutrition();
  };

  const updateIngredientQuantity = (id, field, value) => {
    setSelectedIngredients((current) => current.map((item) => item.id === id ? { ...item, [field]: value } : item));
    if (field === "amount_g") invalidateCalculatedNutrition();
  };

  const invalidateCalculatedNutrition = () => {
    setNutrition((current) => current.nutrition_source === "calculated"
      ? { ...current, nutrition_source: "unknown", nutrition_source_reference: "" }
      : current);
    setNutritionMessage(null);
  };

  const updateNutritionField = (field, value) => {
    setNutrition((current) => ({
      ...current,
      [field]: value,
      ...(current.nutrition_source === "calculated" ? { nutrition_source: "manual", nutrition_source_reference: "" } : {})
    }));
    setNutritionMessage(null);
  };

  const calculateNutrition = async () => {
    try {
      setCalculating(true);
      setNutritionMessage(null);
      const response = await api.post("/admin/recipes/calculate-nutrition", {
        servings: nutrition.servings,
        ingredients: selectedIngredients.map(({ id, amount_g }) => ({ id, amount_g }))
      });
      const { calorias: calculatedCalories, ...calculatedNutrition } = response.data;
      setCalorias(calculatedCalories);
      setNutrition((current) => ({ ...current, ...calculatedNutrition }));
      setNutritionMessage({ type: "success", text: "Cálculo completado con perfiles de ingredientes revisados. Guarda la receta para aplicarlo." });
    } catch (error) {
      const details = error.response?.data?.details || [];
      const names = details.map((item) => item.name).filter(Boolean).join(", ");
      setNutritionMessage({ type: "error", text: names ? `Completa el perfil nutricional de: ${names}.` : error.response?.data?.message || "No se pudo calcular la nutrición." });
    } finally {
      setCalculating(false);
    }
  };

  const calculationReady = selectedIngredients.length > 0
    && Number(nutrition.servings) > 0
    && selectedIngredients.every((item) => Number(item.amount_g) > 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      nombre,
      descripcion,
      calorias,
      tiempo_preparacion: tiempo,
      ...nutrition,
      ingredients: selectedIngredients.map(({ id, amount, unit, amount_g }) => ({ id, amount, unit, amount_g }))
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
          onChange={(event) => { setCalorias(event.target.value); updateNutritionField("nutrition_source", nutrition.nutrition_source === "calculated" ? "manual" : nutrition.nutrition_source); }}
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

      <fieldset className="border-y border-gray-200 py-5">
        <legend className="px-2 text-base font-semibold text-gray-900">Nutrición por porción</legend>
        <p className="mb-4 text-sm text-gray-500">Registra únicamente valores revisados e indica su procedencia. Los campos vacíos reducen la confianza de la recomendación.</p>
        {nutritionMessage ? <p role="status" className={`mb-4 rounded-lg border p-3 text-sm ${nutritionMessage.type === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-green-200 bg-green-50 text-green-800"}`}>{nutritionMessage.text}</p> : null}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm font-medium text-gray-700">Nivel de salud
            <input type="number" min="1" max="5" step="1" value={nutrition.nivel_salud} onChange={(event) => setNutrition((current) => ({ ...current, nivel_salud: event.target.value }))} className="mt-1 w-full rounded-lg border p-3" required />
          </label>
          <label className="text-sm font-medium text-gray-700">Tamaño de porción
            <span className="relative block"><input type="number" min="0.01" step="0.01" value={nutrition.serving_size_g} onChange={(event) => setNutrition((current) => ({ ...current, serving_size_g: event.target.value }))} className="mt-1 w-full rounded-lg border p-3 pr-10" /><span className="pointer-events-none absolute inset-y-0 right-3 top-1 flex items-center text-xs text-gray-400">g</span></span>
          </label>
          <label className="text-sm font-medium text-gray-700">Porciones de la preparación
            <input type="number" min="0.01" step="0.01" value={nutrition.servings} onChange={(event) => { invalidateCalculatedNutrition(); setNutrition((current) => ({ ...current, servings: event.target.value })); }} className="mt-1 w-full rounded-lg border p-3" required />
          </label>
          {nutrientFields.map(([field, label, unit]) => (
            <label key={field} className="text-sm font-medium text-gray-700">{label}
              <span className="relative block"><input type="number" min="0" step="0.01" value={nutrition[field]} onChange={(event) => updateNutritionField(field, event.target.value)} className="mt-1 w-full rounded-lg border p-3 pr-10" /><span className="pointer-events-none absolute inset-y-0 right-3 top-1 flex items-center text-xs text-gray-400">{unit}</span></span>
            </label>
          ))}
          <label className="text-sm font-medium text-gray-700">Fuente nutricional
            <select value={nutrition.nutrition_source} onChange={(event) => setNutrition((current) => ({ ...current, nutrition_source: event.target.value }))} className="mt-1 w-full rounded-lg border bg-white p-3">
              <option value="unknown">Sin verificar</option>
              <option value="manual">Carga manual revisada</option>
              <option value="usda_fdc">USDA FoodData Central</option>
              <option value="calculated">Calculada por ingredientes</option>
              <option value="ai_estimate">Estimación de IA</option>
              <option value="professional">Profesional de nutrición</option>
            </select>
          </label>
          <label className="text-sm font-medium text-gray-700 sm:col-span-2">Referencia de la fuente
            <input type="text" maxLength="1000" required={nutrition.nutrition_source !== "unknown"} disabled={nutrition.nutrition_source === "unknown"} value={nutrition.nutrition_source_reference} onChange={(event) => setNutrition((current) => ({ ...current, nutrition_source_reference: event.target.value }))} placeholder={nutrition.nutrition_source === "unknown" ? "Selecciona una fuente para documentarla" : "URL, ficha técnica, registro o profesional responsable"} className="mt-1 w-full rounded-lg border p-3 disabled:bg-gray-100 disabled:text-gray-500" />
          </label>
        </div>
      </fieldset>

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
              onClick={() => toggleIngredient(i)}
              className={`px-3 py-2 border rounded-xl text-center ${
                selectedIngredients.some((item) => item.id === i.id)
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-800 hover:bg-gray-100"
              }`}
            >
              {i.nombre}
            </button>
          ))}
        </div>
        {selectedIngredients.length ? <div className="mt-5 border-y border-gray-200">
          <div className="hidden grid-cols-[minmax(120px,1fr)_90px_90px_100px] gap-2 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-500 sm:grid"><span>Ingrediente</span><span>Cantidad</span><span>Unidad</span><span>Equivalencia</span></div>
          {selectedIngredients.map((item) => <div key={item.id} className="grid grid-cols-2 items-center gap-2 border-t border-gray-100 px-3 py-3 text-sm sm:grid-cols-[minmax(120px,1fr)_90px_90px_100px] sm:py-2">
            <span className="col-span-2 truncate font-medium sm:col-span-1" title={item.nombre}>{item.nombre}</span>
            <input aria-label={`Cantidad de ${item.nombre}`} type="number" min="0.01" step="0.01" required={Boolean(item.unit)} value={item.amount} onChange={(event) => updateIngredientQuantity(item.id, "amount", event.target.value)} placeholder="--" className="min-w-0 rounded-lg border p-2" />
            <input aria-label={`Unidad de ${item.nombre}`} type="text" maxLength="30" required={Boolean(item.amount)} value={item.unit} onChange={(event) => updateIngredientQuantity(item.id, "unit", event.target.value)} placeholder="g, taza" className="min-w-0 rounded-lg border p-2" />
            <span className="relative col-span-2 sm:col-span-1"><input aria-label={`Gramos de ${item.nombre}`} type="number" min="0.01" step="0.01" value={item.amount_g} onChange={(event) => updateIngredientQuantity(item.id, "amount_g", event.target.value)} placeholder="Equivalencia en gramos" className="min-w-0 w-full rounded-lg border p-2 pr-7" /><span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-xs text-gray-400">g</span></span>
          </div>)}
          <div className="flex flex-col gap-3 border-t border-gray-100 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-xs text-gray-500">Cantidad y unidad alimentan Compras. Para calcular nutrientes, completa gramos y usa perfiles por 100 g revisados.</p>
            <button type="button" disabled={!calculationReady || calculating} onClick={() => void calculateNutrition()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-green-700 px-4 text-sm font-semibold text-green-800 disabled:cursor-not-allowed disabled:opacity-40"><Calculator size={17} /> {calculating ? "Calculando..." : "Calcular nutrición"}</button>
          </div>
        </div> : null}
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
