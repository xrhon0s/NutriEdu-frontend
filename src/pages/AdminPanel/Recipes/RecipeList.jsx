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
    <div className="admin-table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Calorías</th>
            <th>Tiempo</th>
            <th>Ingredientes</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {recipes.map((r) => {
            const ingredientNames = r.ingredients?.map((i) => i.nombre).join(", ") || "-";
            return (
              <tr key={r.id} className="hover:bg-gray-50">
                <td>{r.id}</td>
                <td>{r.nombre}</td>
                <td>{r.descripcion}</td>
                <td>{r.calorias}</td>
                <td>{r.tiempo_preparacion}</td>
                <td>
                  <span
                    title={ingredientNames}               // tooltip completo
                    className="inline-block max-w-xs truncate"  // trunca la lista visualmente
                  >
                    {ingredientNames}
                  </span>
                </td>
                <td className="flex gap-2">
                  <button onClick={() => onEdit(r)} className="edit-btn">
                    Editar
                  </button>
                  <button onClick={() => deleteRecipe(r.id)} className="delete-btn">
                    Eliminar
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

     
    </div>
  );
}