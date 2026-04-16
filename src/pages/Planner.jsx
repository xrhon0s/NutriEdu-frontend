import { useEffect, useState } from "react";
import api from "../services/api";
import NavBar from "../components/navBar";
import PageHeader from "../components/PageHeader";
import StatusMessage from "../components/StatusMessage";
import LoadingScreen from "../components/LoadingScreen";

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

  const clearMessageLater = () => {
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 2200);
  };

  const addToPlan = () => {
    if (!selectedRecipe) {
      setMessage("Selecciona una receta");
      setMessageType("error");
      clearMessageLater();
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
      clearMessageLater();
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
    clearMessageLater();
  };

  const removeFromPlan = (day, mealType) => {
    const updatedPlan = weeklyPlan.filter(
      (item) => !(item.dia_semana === day && item.tipo_comida === mealType)
    );

    setWeeklyPlan(updatedPlan);
    setMessage("Receta eliminada del plan");
    setMessageType("success");
    clearMessageLater();
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
      clearMessageLater();
    } catch (error) {
      console.error(error);
      setMessage(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Error guardando el plan semanal"
      );
      setMessageType("error");
      clearMessageLater();
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

  const getHealthLabel = (nivel) => {
    if (nivel >= 5) return "Muy saludable";
    if (nivel >= 3) return "Saludable";
    return "Moderada";
  };

  const totalPlannedMeals = weeklyPlan.length;
  const maxMeals = days.length * mealTypes.length;
  const completionPercent = Math.round((totalPlannedMeals / maxMeals) * 100);

  if (loading) {
    return <LoadingScreen text="Cargando planificador..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-100 to-white">
      <NavBar />

      <div className="max-w-7xl mx-auto px-6 py-10">
        <PageHeader
          title="Planificador semanal"
          subtitle="Organiza tus recetas seguras por día y tipo de comida de una forma simple y visual."
        />

        <StatusMessage message={message} type={messageType} />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl shadow-md border border-green-100 p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                Planificar comida
              </h2>
              <p className="text-sm text-gray-500 mb-5">
                Selecciona una receta segura y asígnala a un espacio de tu semana.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Receta
                  </label>
                  <select
                    value={selectedRecipe}
                    onChange={(e) => setSelectedRecipe(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
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

            <div className="bg-white rounded-3xl shadow-md border border-green-100 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Resumen de progreso
              </h3>

              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Comidas planificadas</span>
                  <span>
                    {totalPlannedMeals} / {maxMeals}
                  </span>
                </div>

                <div className="w-full h-3 bg-green-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600 rounded-full transition-all duration-300"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 rounded-2xl p-4">
                  <p className="text-xs text-gray-500">Recetas seguras</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {recipes.length}
                  </p>
                </div>

                <div className="bg-green-50 rounded-2xl p-4">
                  <p className="text-xs text-gray-500">Avance semanal</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {completionPercent}%
                  </p>
                </div>
              </div>
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
                          className={`rounded-2xl border p-4 min-h-[190px] transition hover:shadow-md ${
                            plannedItem
                              ? "bg-white border-green-200"
                              : "bg-green-50/50 border-green-100"
                          }`}
                        >
                          <p className="text-sm font-semibold text-gray-600 mb-3">
                            {mealType}
                          </p>

                          {plannedItem ? (
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-bold text-gray-900 text-base">
                                  {plannedItem.receta_nombre}
                                </h4>

                                <span className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">
                                  {getHealthLabel(plannedItem.nivel_salud)}
                                </span>

                                <p className="text-sm text-gray-600 mt-2 line-clamp-3">
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
                                onClick={() => removeFromPlan(day, mealType)}
                                className="text-xs text-red-500 font-semibold hover:text-red-700 transition"
                              >
                                Eliminar
                              </button>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400 italic">
                              + Agrega una receta
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