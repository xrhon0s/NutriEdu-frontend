import { useLocation, useNavigate } from "react-router-dom";
import NavBar from "../components/navBar";

export default function RecipeDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const recipe = location.state?.recipe;

  const getHealthLabel = (nivel) => {
    if (nivel >= 5) return "Muy saludable";
    if (nivel >= 3) return "Saludable";
    return "Moderada";
  };

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-100 to-white">
        <NavBar />
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="bg-white rounded-3xl shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">
              No se encontró la información de la receta.
            </p>
            <button
              onClick={() => navigate("/recipes")}
              className="px-5 py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition"
            >
              Volver a recetas
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-100 to-white">
      <NavBar />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate("/recipes")}
          className="mb-6 text-green-700 font-medium hover:underline"
        >
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

          <div className="p-8">
            <p className="text-gray-700 text-lg leading-relaxed mb-8">
              {recipe.descripcion}
            </p>

            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-green-50 rounded-2xl p-5">
                <p className="text-sm text-gray-500">Calorías</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {recipe.calorias} kcal
                </p>
              </div>

              <div className="bg-green-50 rounded-2xl p-5">
                <p className="text-sm text-gray-500">Tiempo de preparación</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {recipe.tiempo_preparacion
                    ? `${recipe.tiempo_preparacion} min`
                    : "No definido"}
                </p>
              </div>

              <div className="bg-green-50 rounded-2xl p-5">
                <p className="text-sm text-gray-500">Nivel de salud</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {recipe.nivel_salud}/5
                </p>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-3">
                Información general
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Esta receta forma parte de tu catálogo personalizado en NutriEdu.
                Más adelante aquí podemos mostrar ingredientes, pasos de preparación,
                restricciones compatibles y observaciones nutricionales.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}