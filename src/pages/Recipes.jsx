import { useEffect, useState } from "react";
import axios from "axios";

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/recipes/safe/${user.id}`
        );

        setRecipes(res.data);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-100 to-white">
        <p className="text-lg text-gray-600">Cargando recetas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-100 to-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-700">
            Recetas seguras
          </h1>
          <p className="text-gray-600 mt-2">
            Estas recetas son compatibles con tus restricciones alimentarias.
          </p>
        </div>

        {recipes.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-md p-8 text-center">
            <p className="text-gray-500">
              No se encontraron recetas seguras para este usuario.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-white rounded-3xl shadow-md p-6 border border-green-100 hover:shadow-xl transition"
              >
                <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center text-2xl mb-4">
                  🥗
                </div>

                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  {recipe.nombre}
                </h2>

                <p className="text-gray-600 text-sm mb-4">
                  {recipe.descripcion}
                </p>

                <div className="flex items-center justify-between text-sm">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                    Segura
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}