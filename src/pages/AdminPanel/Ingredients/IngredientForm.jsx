import { useState } from "react";
import api from "../../../services/api";

export default function IngredientForm({ ingredient, onFinish }) {
  const isEditing = !!ingredient;
  const [nombre, setNombre] = useState(ingredient?.nombre || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (isEditing) {
        await api.put(`/admin/ingredients/${ingredient.id}`, { nombre });
      } else {
        await api.post("/admin/ingredients", { nombre });
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