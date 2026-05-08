import { useEffect, useState } from "react";
import api from "../../../services/api";

export default function IngredientList({ onEdit }) {
  const [ingredients, setIngredients] = useState([]);

  useEffect(() => {
    const loadIngredients = async () => {
      try {
        const res = await api.get("/admin/ingredients");
        setIngredients(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    loadIngredients();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("¿Deseas eliminar este ingrediente?")) return;
    try {
      await api.delete(`/admin/ingredients/${id}`);
      setIngredients(ingredients.filter(i => i.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <table className="w-full border border-gray-300">
      <thead>
        <tr className="bg-gray-200">
          <th className="p-2 border">ID</th>
          <th className="p-2 border">Nombre</th>
          <th className="p-2 border">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {ingredients.map(i => (
          <tr key={i.id}>
            <td className="p-2 border">{i.id}</td>
            <td className="p-2 border">{i.nombre}</td>
            <td className="p-2 border flex space-x-2">
              <button
                className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => onEdit(i)}
              >
                Editar
              </button>
              <button
                className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={() => handleDelete(i.id)}
              >
                Eliminar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}