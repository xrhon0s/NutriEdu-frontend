import { useState } from "react";
import RecipeList from "./Recipes/RecipeList";
import RecipeForm from "./Recipes/RecipeForm";
import IngredientList from "./Ingredients/IngredientList";
import IngredientForm from "./Ingredients/IngredientForm";
import PageHeader from "../../components/PageHeader";
import NavBar from "../../components/navBar";

export default function AdminDashboard() {
  const [tab, setTab] = useState("recipes");
  const [view, setView] = useState("list");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedIngredient, setSelectedIngredient] = useState(null);

  const goBack = () => setView("list");

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-100 to-white">
      <NavBar />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <PageHeader
          title="Panel Administrativo"
          subtitle="Gestiona recetas e ingredientes desde un solo lugar."
        />

        {/* Tabs internas */}
        <div className="flex gap-4 mb-6">
          <button
            className={`px-4 py-2 rounded-xl font-medium transition ${
              tab === "recipes"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => { setTab("recipes"); setView("list"); }}
          >
            Recetas
          </button>
          <button
            className={`px-4 py-2 rounded-xl font-medium transition ${
              tab === "ingredients"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => { setTab("ingredients"); setView("list"); }}
          >
            Ingredientes
          </button>
        </div>

        {/* Contenido dinámico */}
        {tab === "recipes" && (
          <div className="bg-white rounded-3xl shadow-md border border-green-100 p-6 mb-8">
            {view === "list" && (
              <>
                <button
                  className="mb-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition"
                  onClick={() => setView("form")}
                >
                  Crear nueva receta
                </button>
                <RecipeList
                  onEdit={(r) => { setSelectedRecipe(r); setView("form"); }}
                />
              </>
            )}
            {view === "form" && (
              <>
                <button
                  className="mb-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition"
                  onClick={goBack}
                >
                  Volver
                </button>
                <RecipeForm
                  recipe={selectedRecipe}
                  onFinish={goBack}
                />
              </>
            )}
          </div>
        )}

        {tab === "ingredients" && (
          <div className="bg-white rounded-3xl shadow-md border border-green-100 p-6 mb-8">
            {view === "list" && (
              <>
                <button
                  className="mb-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition"
                  onClick={() => setView("form")}
                >
                  Crear nuevo ingrediente
                </button>
                <IngredientList
                  onEdit={(i) => { setSelectedIngredient(i); setView("form"); }}
                />
              </>
            )}
            {view === "form" && (
              <>
                <button
                  className="mb-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition"
                  onClick={goBack}
                >
                  Volver
                </button>
                <IngredientForm
                  ingredient={selectedIngredient}
                  onFinish={goBack}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}