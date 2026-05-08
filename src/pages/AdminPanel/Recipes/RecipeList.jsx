import { useEffect, useState } from "react";
import api from "../../../services/api";

export default function RecipeList({ onEdit }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await api.get("/admin/recipes");
        setRecipes(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, []);

  const deleteRecipe = async (id) => {
    if (!confirm("¿Seguro que quieres eliminar esta receta?")) return;
    try {
      await api.delete(`/admin/recipes/${id}`);
      setRecipes(recipes.filter((r) => r.id !== id));
    } catch (error) {
      console.error(error);
      alert("Error eliminando receta");
    }
  };

  if (loading) return <p>Cargando recetas...</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2 border">ID</th>
            <th className="px-4 py-2 border">Nombre</th>
            <th className="px-4 py-2 border">Descripción</th>
            <th className="px-4 py-2 border">Calorías</th>
            <th className="px-4 py-2 border">Tiempo</th>
            <th className="px-4 py-2 border">Ingredientes</th>
            <th className="px-4 py-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {recipes.map((r) => (
            <tr key={r.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border">{r.id}</td>
              <td className="px-4 py-2 border">{r.nombre}</td>
              <td className="px-4 py-2 border">{r.descripcion}</td>
              <td className="px-4 py-2 border">{r.calorias}</td>
              <td className="px-4 py-2 border">{r.tiempo_preparacion}</td>
              <td className="px-4 py-2 border">
                {r.ingredients?.map(i => i.nombre).join(", ") || "-"}
              </td>
              <td className="px-4 py-2 border flex gap-2">
                <button
                  onClick={() => onEdit(r)}
                  className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm"
                >
                  Editar
                </button>
                <button
                  onClick={() => deleteRecipe(r.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}