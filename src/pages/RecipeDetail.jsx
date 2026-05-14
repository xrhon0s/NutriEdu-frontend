import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import NavBar from "../components/navBar";
import UnsafeIngredientModal from "../components/UnsafeIngredientModal";

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [unsafeIngredients, setUnsafeIngredients] = useState([]);
  const [substitutes, setSubstitutes] = useState([]);
  const [showUnsafeModal, setShowUnsafeModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  // Traer receta y revisar seguridad
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await api.get(`/recipes/${id}`);
        setRecipe(res.data);

        const safetyRes = await api.get(`/recipes/check/${id}/${user.id}`);
        setUnsafeIngredients(safetyRes.data.unsafeIngredients);
        setSubstitutes(safetyRes.data.substitutes);
      } catch (error) {
        setErrorMessage(error.response?.data?.message || "No se pudo cargar la receta");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, user.id]);

  const getHealthLabel = (nivel) => {
    if (nivel >= 5) return "Muy saludable";
    if (nivel >= 3) return "Saludable";
    return "Moderada";
  };

  if (loading) return <div>Cargando receta...</div>;
  if (!recipe)
    return (
      <div className="min-h-screen">
        <NavBar />
        <div className="max-w-4xl mx-auto p-6 text-center">
          <p>{errorMessage || "Receta no encontrada"}</p>
          <button onClick={() => navigate("/recipes")} className="mt-4 px-4 py-2 bg-green-600 text-white rounded">
            Volver a recetas
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-100 to-white">
      <NavBar />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <button onClick={() => navigate("/recipes")} className="mb-6 text-green-700 font-medium hover:underline">
          ← Volver a recetas
        </button>

        <div className="bg-white rounded-3xl shadow-xl border border-green-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-500 text-white p-8">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-sm opacity-90 mb-2">Detalle de receta</p>
                <h1 className="text-4xl font-extrabold">{recipe.nombre}</h1>
              </div>
              <span className="px-4 py-2 rounded-full bg-white/20 text-sm font-semibold">
                {getHealthLabel(recipe.nivel_salud)}
              </span>
            </div>
          </div>

          <div className="p-8 space-y-6">
            {unsafeIngredients.length > 0 && (
              <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded-md">
                <p className="font-semibold text-red-700 mb-2">⚠ Ingredientes no seguros:</p>
                <ul className="list-disc list-inside text-red-700">
                  {unsafeIngredients.map((ing) => (
                    <li key={ing.id}>{ing.nombre}</li>
                  ))}
                </ul>
                <button
                  onClick={() => setShowUnsafeModal(true)}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                  Ver sustitutos
                </button>
              </div>
            )}

            <p className="text-gray-700 text-lg leading-relaxed">{recipe.descripcion}</p>

            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-green-50 rounded-2xl p-5">
                <p className="text-sm text-gray-500">Calorías</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{recipe.calorias} kcal</p>
              </div>

              <div className="bg-green-50 rounded-2xl p-5">
                <p className="text-sm text-gray-500">Tiempo de preparación</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {recipe.tiempo_preparacion ? `${recipe.tiempo_preparacion} min` : "No definido"}
                </p>
              </div>

              <div className="bg-green-50 rounded-2xl p-5">
                <p className="text-sm text-gray-500">Nivel de salud</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{recipe.nivel_salud}/5</p>
              </div>
            </div>

            {/* Solo Información general */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-3">Información general</h2>
              <p className="text-gray-700 leading-relaxed">
                Esta receta forma parte del catálogo de NutriEdu. Más adelante aquí se mostrarán ingredientes,
                pasos de preparación, compatibilidad con restricciones y observaciones nutricionales.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de sustitutos */}
      <UnsafeIngredientModal
        isOpen={showUnsafeModal}
        onClose={(chosenSubs) => {
          console.log("Sustitutos seleccionados:", chosenSubs);
          setShowUnsafeModal(false);
        }}
        unsafeIngredients={unsafeIngredients}
        substitutes={substitutes}
        recipeName={recipe.nombre}
      />
    </div>
  );
}