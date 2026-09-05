import { useState } from "react";
import api from "../../../services/api";

export default function IngredientForm({ ingredient, onFinish }) {
  const isEditing = !!ingredient;
  const [nombre, setNombre] = useState(ingredient?.nombre || "");
  const [foodGroup, setFoodGroup] = useState(ingredient?.food_group || "other");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (isEditing) {
        await api.put(`/admin/ingredients/${ingredient.id}`, { nombre, foodGroup });
      } else {
        await api.post("/admin/ingredients", { nombre, foodGroup });
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
          <option value="protein">Proteínas</option><option value="carbohydrate">Cereales y carbohidratos</option><option value="vegetable">Verduras</option><option value="fruit">Frutas</option><option value="dairy">Lácteos</option><option value="fat">Grasas, nueces y semillas</option><option value="legume">Legumbres</option><option value="seasoning">Condimentos y endulzantes</option><option value="beverage">Bebidas</option><option value="other">Otros</option>
        </select>
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
