import { useEffect, useState } from "react";
import api from "../services/api";
import NavBar from "../components/navBar";

export default function ShoppingList() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchList = async () => {
      try {
        const res = await api.get(`/planner/${user.id}/shopping-list`);
        setItems(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        Cargando lista...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-100 to-white">
      <NavBar />

      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-bold text-green-700 mb-6">
          Lista de compras
        </h1>

        {items.length === 0 ? (
          <p className="text-gray-500">
            No hay ingredientes en tu planificación.
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-green-100 rounded-xl px-4 py-3 shadow-sm"
              >
                {item.nombre}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}