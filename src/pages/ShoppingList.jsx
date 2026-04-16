import { useEffect, useState } from "react";
import api from "../services/api";
import NavBar from "../components/navBar";
import PageHeader from "../components/PageHeader";
import LoadingScreen from "../components/LoadingScreen";
import EmptyState from "../components/EmptyState";

export default function ShoppingList() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [items, setItems] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});
  const [loading, setLoading] = useState(true);

  // ================= Cargar lista =================
  useEffect(() => {
    const fetchList = async () => {
      try {
        const res = await api.get(`/planner/${user.id}/shopping-list`);
        setItems(res.data);

        // cargar estado guardado en localStorage
        const saved = JSON.parse(localStorage.getItem("shopping_checked")) || {};
        setCheckedItems(saved);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, []);

  // ================= Toggle checkbox =================
  const toggleItem = (id) => {
    const updated = {
      ...checkedItems,
      [id]: !checkedItems[id]
    };

    setCheckedItems(updated);
    localStorage.setItem("shopping_checked", JSON.stringify(updated));
  };

  // ================= Reset =================
  const resetList = () => {
    setCheckedItems({});
    localStorage.removeItem("shopping_checked");
  };

  // ================= Stats =================
  const total = items.length;
  const completed = items.filter((item) => checkedItems[item.id]).length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (loading) {
    return <LoadingScreen text="Generando lista de compras..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-100 to-white">
      <NavBar />

      <div className="max-w-4xl mx-auto px-6 py-10">

        <PageHeader
          title="Lista de compras"
          subtitle="Marca los ingredientes que ya tienes y sigue tu progreso."
        />

        {/* ===== Resumen ===== */}
        <div className="bg-white rounded-3xl shadow-md border border-green-100 p-6 mb-8">

          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">
              Progreso
            </h3>

            <button
              onClick={resetList}
              className="text-sm text-gray-500 hover:text-red-500 transition"
            >
              Reiniciar
            </button>
          </div>

          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{completed} completados</span>
            <span>{total} total</span>
          </div>

          <div className="w-full h-3 bg-green-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-sm text-gray-500 mt-3">
            {progress}% de tu lista completada
          </p>

        </div>

        {/* ===== Lista ===== */}
        {items.length === 0 ? (
          <EmptyState
            title="Sin ingredientes"
            description="Agrega recetas a tu plan semanal para generar una lista de compras."
          />
        ) : (
          <div className="space-y-3">

            {items.map((item) => {
              const checked = checkedItems[item.id];

              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between px-5 py-4 rounded-2xl border transition ${
                    checked
                      ? "bg-green-50 border-green-200 opacity-70"
                      : "bg-white border-green-100 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-4">

                    <input
                      type="checkbox"
                      checked={checked || false}
                      onChange={() => toggleItem(item.id)}
                      className="w-5 h-5 accent-green-600 cursor-pointer"
                    />

                    <span
                      className={`font-medium ${
                        checked
                          ? "line-through text-gray-400"
                          : "text-gray-800"
                      }`}
                    >
                      {item.nombre}
                    </span>
                  </div>

                  {checked && (
                    <span className="text-xs text-green-600 font-semibold">
                      ✔
                    </span>
                  )}
                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
}