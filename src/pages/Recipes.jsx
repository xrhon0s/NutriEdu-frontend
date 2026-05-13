import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import NavBar from "../components/navBar";

export default function Recipes() {
  const [safeRecipes, setSafeRecipes] = useState([]);
  const [recommendedRecipes, setRecommendedRecipes] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados de búsqueda y filtros
  const [query, setQuery] = useState("");
  const [nivelFilter, setNivelFilter] = useState("");
  const [tipoFilter, setTipoFilter] = useState("");
  const [caloriasMin, setCaloriasMin] = useState("");
  const [caloriasMax, setCaloriasMax] = useState("");

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const searchInputRef = useRef(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const [safeRes, recommendedRes] = await Promise.all([
          api.get(`/recipes/safe/${user.id}`),
          api.get(`/recipes/recommended/${user.id}`)
        ]);
        setSafeRecipes(safeRes.data);
        setRecommendedRecipes(recommendedRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchRecipes();
  }, [user?.id]);

  const fetchSearchResults = useCallback(
    debounce(async () => {
      if (query.trim() === "" && !nivelFilter && !tipoFilter && !caloriasMin && !caloriasMax) {
        setSearchResults([]);
        return;
      }

      try {
        const res = await api.get(`/recipes/search/${user.id}`, {
          params: {
            query: query || undefined,
            nivel_salud: nivelFilter || undefined,
            tipo: tipoFilter || undefined,
            calorias_min: caloriasMin || undefined,
            calorias_max: caloriasMax || undefined,
          },
        });
        setSearchResults(res.data);
      } catch (err) {
        console.error(err);
      }
    }, 300),
    [user?.id, query, nivelFilter, tipoFilter, caloriasMin, caloriasMax]
  );

  useEffect(() => {
    fetchSearchResults();
  }, [query, nivelFilter, tipoFilter, caloriasMin, caloriasMax, fetchSearchResults]);

  function debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  const resetFilters = () => {
    setQuery("");
    setNivelFilter("");
    setTipoFilter("");
    setCaloriasMin("");
    setCaloriasMax("");
    searchInputRef.current.focus();
  };

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

  const RecipeCard = ({ recipe }) => (
    <div
      className={`bg-white rounded-3xl shadow-md p-6 border transition cursor-pointer hover:shadow-xl hover:-translate-y-1
        ${recipe.hasUnsafeIngredients ? "border-red-300 bg-red-50" : "border-green-100"}`}
      onClick={() => navigate(`/recipes/${recipe.id}`)}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${recipe.hasUnsafeIngredients ? "bg-red-100" : "bg-green-100"}`}>
          {recipe.hasUnsafeIngredients ? "⚠️" : "🥗"}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getHealthColor(recipe.nivel_salud)}`}>
          {getHealthLabel(recipe.nivel_salud)}
        </span>
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">{recipe.nombre}</h2>
      <p className="text-gray-600 text-sm mb-5 min-h-[60px]">{recipe.descripcion}</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 rounded-2xl p-3">
          <p className="text-xs text-gray-500">Calorías</p>
          <p className="font-semibold text-gray-800">{recipe.calorias} kcal</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-3">
          <p className="text-xs text-gray-500">Tiempo</p>
          <p className="font-semibold text-gray-800">{recipe.tiempo_preparacion ? `${recipe.tiempo_preparacion} min` : "No definido"}</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-3 col-span-2">
          <p className="text-xs text-gray-500">Nivel de salud</p>
          <p className="font-semibold text-gray-800">{recipe.nivel_salud}/5</p>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between">
        {recipe.hasUnsafeIngredients ? (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700 animate-pulse">
            Ingredientes restringidos
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
            Segura para ti
          </span>
        )}
        <span className="text-green-700 font-semibold text-sm">Ver más</span>
      </div>
    </div>
  );

  if (loading) return <p className="text-center mt-10">Cargando recetas...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-100 to-white">
      <NavBar />
      <div className="px-6 py-10 max-w-6xl mx-auto">

        {/* Input de búsqueda */}
        <input
          autoFocus
          ref={searchInputRef}
          type="text"
          placeholder="Buscar recetas..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full mb-4 p-4 rounded-2xl border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white shadow-sm"
        />

        {/* Filtros */}
        <div className="flex gap-3 mb-6 flex-wrap items-center">
          <select value={nivelFilter} onChange={(e) => setNivelFilter(e.target.value)} className="border rounded-xl p-2">
            <option value="">Nivel de salud</option>
            <option value="5">Muy saludable</option>
            <option value="3">Saludable</option>
            <option value="1">Moderada</option>
          </select>
          <select value={tipoFilter} onChange={(e) => setTipoFilter(e.target.value)} className="border rounded-xl p-2">
            <option value="">Tipo de receta</option>
            <option value="Desayuno">Desayuno</option>
            <option value="Plato principal">Plato principal</option>
            <option value="Snack">Snack</option>
          </select>
          <input type="number" placeholder="Calorías mínimas" value={caloriasMin} onChange={(e) => setCaloriasMin(e.target.value)} className="border rounded-xl p-2 w-36"/>
          <input type="number" placeholder="Calorías máximas" value={caloriasMax} onChange={(e) => setCaloriasMax(e.target.value)} className="border rounded-xl p-2 w-36"/>
          <button onClick={resetFilters} className="bg-blue-500 text-white rounded-xl px-4 py-2 font-semibold hover:bg-blue-600 transition">Restablecer filtros</button>
        </div>

        {/* Contenido */}
        {query.length === 0 && !nivelFilter && !tipoFilter && !caloriasMin && !caloriasMax ? (
          <>
            {/* Recetas seguras */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">Recetas seguras</h2>
              <p className="text-gray-600 text-sm mb-6">Compatibles con tus restricciones alimentarias.</p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {safeRecipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}
              </div>
            </section>
            {/* Recetas recomendadas */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">Recomendadas para ti</h2>
              <p className="text-gray-600 text-sm mb-6">Seleccionadas según tu perfil y nivel de salud.</p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedRecipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}
              </div>
            </section>
          </>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.length === 0 ? (
              <p className="text-gray-500 col-span-3">No se encontraron recetas.</p>
            ) : (
              searchResults.map((r) => <RecipeCard key={r.id} recipe={r} />)
            )}
          </div>
        )}
      </div>
    </div>
  );
}