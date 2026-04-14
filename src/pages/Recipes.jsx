import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import NavBar from "../components/navBar";

export default function Recipes() {
  const [safeRecipes, setSafeRecipes] = useState([]);
  const [recommendedRecipes, setRecommendedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const [safeRes, recommendedRes] = await Promise.all([
          api.get(`/recipes/safe/${user.id}`),
          api.get(`/recipes/recommended/${user.id}`)
        ]);

        setSafeRecipes(safeRes.data);
        setRecommendedRecipes(recommendedRes.data);
      } catch (error) {
        console.error(error);
        alert("Error cargando recetas");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchRecipes();
    }
  }, [user?.id]);

  const getHealthLabel = (nivel) => {
    if (nivel >= 5) return "Muy saludable";
    if (nivel >= 3) return "Saludable";
    return "Moderada";
  };

  const getHealthColor = (nivel) => {
    if (nivel >= 5) return "bg-green-100 text-green-700";
    if (nivel >= 3) return "bg-emerald-100 text-emerald-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const RecipeCard = ({ recipe, type = "safe" }) => (
    <div className="bg-white rounded-3xl shadow-md p-6 border border-green-100 hover:shadow-xl hover:-translate-y-1 transition">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center text-2xl shrink-0">
          🥗
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${getHealthColor(
            recipe.nivel_salud
          )}`}
        >
          {getHealthLabel(recipe.nivel_salud)}
        </span>
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-2">
        {recipe.nombre}
      </h2>

      <p className="text-gray-600 text-sm mb-5 min-h-[60px]">
        {recipe.descripcion}
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 rounded-2xl p-3">
          <p className="text-xs text-gray-500">Calorías</p>
          <p className="font-semibold text-gray-800">
            {recipe.calorias} kcal
          </p>
        </div>

        <div className="bg-green-50 rounded-2xl p-3">
          <p className="text-xs text-gray-500">Tiempo</p>
          <p className="font-semibold text-gray-800">
            {recipe.tiempo_preparacion
              ? `${recipe.tiempo_preparacion} min`
              : "No definido"}
          </p>
        </div>

        <div className="bg-green-50 rounded-2xl p-3 col-span-2">
          <p className="text-xs text-gray-500">Nivel de salud</p>
          <p className="font-semibold text-gray-800">
            {recipe.nivel_salud}/5
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            type === "recommended"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {type === "recommended" ? "Recomendada" : "Segura para ti"}
        </span>

        <button
          onClick={() => navigate(`/recipes/${recipe.id}`)}
          className="text-green-700 font-semibold text-sm hover:underline"
        >
          Ver más
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-100 to-white">
        <NavBar />
        <div className="flex items-center justify-center py-20">
          <p className="text-lg text-gray-600">Cargando recetas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-100 to-white">
      <NavBar />

      <div className="px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-green-700">
              Tus recetas
            </h1>
            <p className="text-gray-600 mt-2">
              Aquí puedes ver recetas seguras y recomendadas según tu perfil.
            </p>
          </div>

          <section className="mb-14">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Recetas seguras
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Compatibles con tus restricciones alimentarias.
              </p>
            </div>

            {safeRecipes.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-md p-8 text-center">
                <p className="text-gray-500">
                  No se encontraron recetas seguras para este usuario.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {safeRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} type="safe" />
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Recomendadas para ti
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Seleccionadas según tu perfil y nivel de salud.
              </p>
            </div>

            {recommendedRecipes.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-md p-8 text-center">
                <p className="text-gray-500">
                  No hay recetas recomendadas en este momento.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    type="recommended"
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}