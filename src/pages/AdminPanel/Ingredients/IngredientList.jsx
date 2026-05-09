import { useEffect, useState } from "react";
import api from "../../../services/api";

export default function IngredientList({ onEdit }) {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadIngredients = async () => {
      try {
        const res = await api.get("/admin/ingredients");
        setIngredients(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
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
      alert("Error eliminando ingrediente");
    }
  };

  if (loading) return <p>Cargando ingredientes...</p>;

  return (
    <div className="bg-white p-6 rounded-3xl shadow-md border border-gray-100">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-green-100 text-green-800">
            <th className="px-4 py-2 border-b">ID</th>
            <th className="px-4 py-2 border-b">Nombre</th>
            <th className="px-4 py-2 border-b">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map((i) => (
            <tr key={i.id} className="hover:bg-green-50 transition">
              <td className="px-4 py-2 border-b">{i.id}</td>
              <td className="px-4 py-2 border-b">{i.nombre}</td>
              <td className="px-4 py-2 border-b flex gap-2">
                <button
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                  onClick={() => onEdit(i)}
                >
                  Editar
                </button>
                <button
                  className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                  onClick={() => handleDelete(i.id)}
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