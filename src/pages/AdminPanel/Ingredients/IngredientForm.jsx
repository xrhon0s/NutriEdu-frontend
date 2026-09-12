import { useState } from "react";
import { CheckCircle2, Database, Search } from "lucide-react";
import api from "../../../services/api";
import { foodGroupOptions, substitutionGroupOptions } from "../../../constants/ingredientTaxonomy";

export default function IngredientForm({ ingredient, onFinish }) {
  const isEditing = !!ingredient;
  const [nombre, setNombre] = useState(ingredient?.nombre || "");
  const [foodGroup, setFoodGroup] = useState(ingredient?.food_group || "other");
  const [substitutionGroup, setSubstitutionGroup] = useState(ingredient?.substitution_group || "other");
  const [saving, setSaving] = useState(false);
  const [fdcQuery, setFdcQuery] = useState(ingredient?.nombre || "");
  const [fdcResults, setFdcResults] = useState([]);
  const [selectedFdcId, setSelectedFdcId] = useState(null);
  const [fdcBusy, setFdcBusy] = useState(false);
  const [fdcStatus, setFdcStatus] = useState(null);
  const [currentFoodData, setCurrentFoodData] = useState({ fdcId: ingredient?.fdc_id || null, source: ingredient?.nutrition_source || "unknown" });

  const searchFoodData = async () => {
    if (fdcQuery.trim().length < 2) return;
    try {
      setFdcBusy(true);
      setFdcStatus(null);
      setSelectedFdcId(null);
      const response = await api.get("/admin/ingredients/fdc/search", { params: { q: fdcQuery.trim() } });
      setFdcResults(response.data.items || []);
      if (!response.data.items?.length) setFdcStatus({ type: "info", message: "No encontramos candidatos Foundation o SR Legacy." });
    } catch (error) {
      setFdcResults([]);
      setFdcStatus({ type: "error", message: error.response?.data?.message || "No se pudo consultar FoodData Central." });
    } finally {
      setFdcBusy(false);
    }
  };

  const applyFoodData = async () => {
    if (!selectedFdcId || !ingredient?.id) return;
    try {
      setFdcBusy(true);
      setFdcStatus(null);
      const response = await api.post(`/admin/ingredients/${ingredient.id}/fdc`, { fdcId: selectedFdcId });
      setCurrentFoodData({ fdcId: response.data.ingredient.fdc_id, source: response.data.ingredient.nutrition_source });
      setFdcStatus({ type: "success", message: "Perfil nutricional USDA aplicado y registrado." });
    } catch (error) {
      const missing = error.response?.data?.details?.missing;
      setFdcStatus({ type: "error", message: missing?.length ? `El candidato no incluye: ${missing.join(", ")}.` : error.response?.data?.message || "No se pudo aplicar el perfil nutricional." });
    } finally {
      setFdcBusy(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (isEditing) {
        await api.put(`/admin/ingredients/${ingredient.id}`, { nombre, foodGroup, substitutionGroup });
      } else {
        await api.post("/admin/ingredients", { nombre, foodGroup, substitutionGroup });
      }
      onFinish();
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error al crear el ingrediente");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="font-medium block mb-1">Nombre del ingrediente</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre del ingrediente"
          className="w-full p-3 border rounded-xl"
          required
        />
      </div>

      <div>
        <label className="mb-1 block font-medium">Grupo alimentario</label>
        <select value={foodGroup} onChange={(event) => setFoodGroup(event.target.value)} className="w-full rounded-lg border p-3" required>
          {foodGroupOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>

      <div>
        <label className="mb-1 block font-medium">Grupo de sustitución culinaria</label>
        <select value={substitutionGroup} onChange={(event) => setSubstitutionGroup(event.target.value)} className="w-full rounded-lg border p-3" required>
          {substitutionGroupOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <p className="mt-1 text-xs text-gray-500">Solo se propondrán alternativas seguras dentro de este mismo grupo.</p>
      </div>

      {isEditing ? <section className="border-y border-gray-200 py-5" aria-labelledby="fdc-heading">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 id="fdc-heading" className="flex items-center gap-2 font-semibold text-gray-900"><Database size={18} /> FoodData Central</h3>
          <span className={`text-xs font-semibold ${currentFoodData.source === "usda_fdc" ? "text-green-700" : "text-amber-700"}`}>{currentFoodData.fdcId ? `FDC ${currentFoodData.fdcId}` : "Sin perfil USDA"}</span>
        </div>
        <div className="mt-4 flex min-w-0 gap-2">
          <label className="min-w-0 flex-1"><span className="sr-only">Buscar alimento en USDA</span><input type="search" value={fdcQuery} onChange={(event) => setFdcQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void searchFoodData(); } }} placeholder="Buscar alimento en inglés" className="min-h-11 w-full rounded-lg border px-3" /></label>
          <button type="button" disabled={fdcBusy || fdcQuery.trim().length < 2} onClick={() => void searchFoodData()} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-gray-300 px-4 text-sm font-semibold disabled:opacity-40"><Search size={17} /> Buscar</button>
        </div>
        {fdcStatus ? <p role="status" className={`mt-3 rounded-lg border p-3 text-sm ${fdcStatus.type === "error" ? "border-red-200 bg-red-50 text-red-700" : fdcStatus.type === "success" ? "border-green-200 bg-green-50 text-green-800" : "border-gray-200 bg-gray-50 text-gray-700"}`}>{fdcStatus.message}</p> : null}
        {fdcResults.length ? <div className="mt-4 divide-y divide-gray-200 border-y border-gray-200">
          {fdcResults.map((candidate) => <button key={candidate.fdcId} type="button" onClick={() => setSelectedFdcId(candidate.fdcId)} aria-pressed={selectedFdcId === candidate.fdcId} className={`flex w-full items-start gap-3 px-3 py-3 text-left ${selectedFdcId === candidate.fdcId ? "bg-green-50" : "hover:bg-gray-50"}`}>
            <span className={`mt-1 grid size-5 shrink-0 place-items-center rounded-full border ${selectedFdcId === candidate.fdcId ? "border-green-700 bg-green-700 text-white" : "border-gray-300"}`}>{selectedFdcId === candidate.fdcId ? <CheckCircle2 size={14} /> : null}</span>
            <span className="min-w-0 flex-1"><span className="block font-semibold text-gray-900">{candidate.description}</span><span className="mt-1 block text-xs text-gray-500">{candidate.dataType} · {candidate.foodCategory || "Sin categoría"} · FDC {candidate.fdcId}</span><span className="mt-1 block text-xs text-gray-600">{candidate.nutrientCoverage}/8 nutrientes · {candidate.nutritionPer100g.calories_per_100g ?? "--"} kcal · {candidate.nutritionPer100g.protein_per_100g ?? "--"} g proteína</span></span>
          </button>)}
        </div> : null}
        {fdcResults.length ? <div className="mt-4 flex justify-end"><button type="button" disabled={!selectedFdcId || fdcBusy} onClick={() => void applyFoodData()} className="min-h-11 rounded-lg bg-green-700 px-5 text-sm font-semibold text-white disabled:opacity-40">{fdcBusy ? "Aplicando..." : "Aplicar perfil seleccionado"}</button></div> : null}
      </section> : null}

      <button
        type="submit"
        disabled={saving}
        className={`mt-4 w-full py-3 rounded-xl text-white ${
          saving ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isEditing ? "Actualizar" : "Crear"} ingrediente
      </button>
    </form>
  );
}
