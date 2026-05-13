import { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import RecipeCard from "../components/RecipeCard"; // usa tu card existente

export default function RecipeSearch() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [query, setQuery] = useState("");
  const [safeRecipes, setSafeRecipes] = useState([]);
  const [recommendedRecipes, setRecommendedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecipes = async () => {
    try {
      setLoading(true);

      // Recetas seguras (todas)
      const safeRes = await api.get(`/recipes/safe/${user.id}`);
      setSafeRecipes(safeRes.data);

      // Recetas recomendadas (subset)
      const recRes = await api.get(`/recipes/recommended/${user.id}`);
      setRecommendedRecipes(recRes.data);
    } catch (err) {
      console.error("Error cargando recetas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  // Filtrado por búsqueda libre
  const filteredSafe = safeRecipes.filter((r) =>
    r.nombre.toLowerCase().includes(query.toLowerCase())
  );

  const filteredRecommended = recommendedRecipes.filter((r) =>
    r.nombre.toLowerCase().includes(query.toLowerCase())
  );

  if (loading) return <p className="text-center mt-10">Cargando recetas...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-100 to-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <input
          type="text"
          placeholder="Buscar recetas..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full mb-6 p-3 rounded-xl border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        {/* Recetas seguras */}
        <h2 className="text-2xl font-bold mb-4">Recetas Seguras</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {filteredSafe.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onClick={() => navigate(`/recipe/${recipe.id}`)}
            />
          ))}
        </div>

        {/* Recetas recomendadas */}
        <h2 className="text-2xl font-bold mb-4">Recomendadas</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecommended.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onClick={() => navigate(`/recipe/${recipe.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}