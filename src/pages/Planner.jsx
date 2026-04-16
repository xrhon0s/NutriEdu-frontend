import { useEffect, useState } from "react";
import api from "../services/api";
import NavBar from "../components/navBar";

export default function Planner() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [recipes, setRecipes] = useState([]);
  const [weeklyPlan, setWeeklyPlan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedRecipe, setSelectedRecipe] = useState("");
  const [selectedDay, setSelectedDay] = useState("Lunes");
  const [selectedMealType, setSelectedMealType] = useState("Almuerzo");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const days = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo"
  ];

  const mealTypes = ["Desayuno", "Almuerzo", "Cena"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recipesRes, planRes] = await Promise.all([
          api.get(`/recipes/safe/${user.id}`),
          api.get(`/planner/${user.id}`)
        ]);

        setRecipes(recipesRes.data);
        setWeeklyPlan(planRes.data);
      } catch (error) {
        console.error(error);
        setMessage("Error cargando el planificador");
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const addToPlan = () => {
    if (!selectedRecipe) {
      setMessage("Selecciona una receta");
      setMessageType("error");
      return;
    }

    const recipe = recipes.find((r) => r.id === Number(selectedRecipe));

    if (!recipe) return;

    const alreadyExists = weeklyPlan.some(
      (item) =>
        item.dia_semana === selectedDay &&
        item.tipo_comida === selectedMealType
    );

    if (alreadyExists) {
      setMessage("Ya existe una receta asignada para ese día y tipo de comida");
      setMessageType("error");
      return;
    }

    const newItem = {
      dia_semana: selectedDay,
      tipo_comida: selectedMealType,
      receta_id: recipe.id,
      receta_nombre: recipe.nombre,
      descripcion: recipe.descripcion,
      calorias: recipe.calorias,
      tiempo_preparacion: recipe.tiempo_preparacion,
      nivel_salud: recipe.nivel_salud
    };

    setWeeklyPlan([...weeklyPlan, newItem]);
    setSelectedRecipe("");
    setMessage("Receta agregada al plan");
    setMessageType("success");
  };

  const removeFromPlan = (day, mealType) => {
    const updatedPlan = weeklyPlan.filter(
      (item) =>
        !(item.dia_semana === day && item.tipo_comida === mealType)
    );

    setWeeklyPlan(updatedPlan);
    setMessage("Receta eliminada del plan");
    setMessageType("success");
  };

  const savePlan = async () => {
    try {
      setSaving(true);
      setMessage("");

      const planPayload = weeklyPlan.map((item) => ({
        recetaId: item.receta_id,
        diaSemana: item.dia_semana,
        tipoComida: item.tipo_comida
      }));

      await api.post("/planner", {
        userId: user.id,
        plan: planPayload
      });

      setMessage("Plan semanal guardado correctamente");
      setMessageType("success");
    } catch (error) {
      console.error(error);
      setMessage(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Error guardando el plan semanal"
      );
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  const getPlanForSlot = (day, mealType) => {
    return weeklyPlan.find(
      (item) =>
        item.dia_semana === day &&
        item.tipo_comida === mealType
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-100 to-white">
        <NavBar />
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-600 text-lg">Cargando planificador...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-100 to-white">
      <NavBar />

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-green-700">
            Planificador semanal
          </h1>
          <p className="text-gray-600 mt-2">
            Organiza tus recetas seguras por día y tipo de comida.
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium ${
              messageType === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white rounded-3xl shadow-md border border-green-100 p-6 h-fit">
            <h2 className="text-2xl font-bold text-gray-800 mb-5">
              Agregar comida
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Receta
                </label>
                <select
                  value={selectedRecipe}
                  onChange={(e) => setSelectedRecipe(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Selecciona una receta</option>
                  {recipes.map((recipe) => (
                    <option key={recipe.id} value={recipe.id}>
                      {recipe.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Día
                </label>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Tipo de comida
                </label>
                <select
                  value={selectedMealType}
                  onChange={(e) => setSelectedMealType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {mealTypes.map((mealType) => (
                    <option key={mealType} value={mealType}>
                      {mealType}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={addToPlan}
                className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
              >
                Agregar al plan
              </button>

              <button
                onClick={savePlan}
                disabled={saving}
                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-70"
              >
                {saving ? "Guardando..." : "Guardar plan semanal"}
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-3xl shadow-md border border-green-100 p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-5">
              Tu semana
            </h2>

            <div className="space-y-6">
              {days.map((day) => (
                <div key={day}>
                  <h3 className="text-lg font-bold text-green-700 mb-3">
                    {day}
                  </h3>

                  <div className="grid md:grid-cols-3 gap-4">
                    {mealTypes.map((mealType) => {
                      const plannedItem = getPlanForSlot(day, mealType);

                      return (
                        <div
                          key={mealType}
                          className="rounded-2xl border border-green-100 bg-green-50/50 p-4 min-h-[180px]"
                        >
                          <p className="text-sm font-semibold text-gray-600 mb-3">
                            {mealType}
                          </p>

                          {plannedItem ? (
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-bold text-gray-800">
                                  {plannedItem.receta_nombre}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                                  {plannedItem.descripcion}
                                </p>
                              </div>

                              <div className="text-xs text-gray-500 space-y-1">
                                <p>{plannedItem.calorias} kcal</p>
                                <p>
                                  {plannedItem.tiempo_preparacion
                                    ? `${plannedItem.tiempo_preparacion} min`
                                    : "Tiempo no definido"}
                                </p>
                              </div>

                              <button
                                onClick={() =>
                                  removeFromPlan(day, mealType)
                                }
                                className="text-sm text-red-600 font-medium hover:underline"
                              >
                                Eliminar
                              </button>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400">
                              Sin receta asignada
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}