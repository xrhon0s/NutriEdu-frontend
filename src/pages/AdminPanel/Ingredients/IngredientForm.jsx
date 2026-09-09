import { useState } from "react";
import api from "../../../services/api";
import { foodGroupOptions, substitutionGroupOptions } from "../../../constants/ingredientTaxonomy";

export default function IngredientForm({ ingredient, onFinish }) {
  const isEditing = !!ingredient;
  const [nombre, setNombre] = useState(ingredient?.nombre || "");
  const [foodGroup, setFoodGroup] = useState(ingredient?.food_group || "other");
  const [substitutionGroup, setSubstitutionGroup] = useState(ingredient?.substitution_group || "other");
  const [saving, setSaving] = useState(false);

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
