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
  const [selectedIngredients, setSelectedIngredients] = useState(
    recipe?.ingredients?.map((i) => i.id) || []
  );
  const [loading, setLoading] = useState(true);

  // Cargar ingredientes desde la API
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const res = await api.get("/admin/ingredients");
        setIngredients(res.data);
      } catch (error) {
        console.error("Error cargando ingredientes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchIngredients();
  }, []);

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

  if (loading) return <p>Cargando ingredientes...</p>;

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
        <h3 className="font-semibold mb-2">Ingredientes</h3>
        <div className="grid grid-cols-2 gap-2">
          {ingredients.map((i) => (
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