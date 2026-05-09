import { useState } from "react";
import RecipeList from "./Recipes/RecipeList";
import RecipeForm from "./Recipes/RecipeForm";
import IngredientList from "./Ingredients/IngredientList";
import IngredientForm from "./Ingredients/IngredientForm";
import PageHeader from "../../components/PageHeader";
import NavBar from "../../components/navBar";

// Modal visual simple
function ConfirmModal({ isOpen, onClose, onConfirm, message }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-80">
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={onConfirm}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState("recipes");
  const [view, setView] = useState("list");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedIngredient, setSelectedIngredient] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);

  const goBack = () => setView("list");

  // Función de eliminar que ya tienes
  const handleDelete = (id) => {
    // Aquí llamas la lógica que ya funciona para borrar la receta
    console.log("Eliminar receta id:", id);
    // Ejemplo: RecipeList maneja el delete
  };

  const openDeleteModal = (recipe) => {
    setRecipeToDelete(recipe);
    setModalOpen(true);
  };

  const confirmDelete = () => {
    if (recipeToDelete) handleDelete(recipeToDelete.id);
    setModalOpen(false);
    setRecipeToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-100 to-white">
      <NavBar />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <PageHeader
          title="Panel Administrativo"
          subtitle="Gestiona recetas e ingredientes desde un solo lugar."
        />

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            className={`px-5 py-2 rounded-xl font-semibold transition ${
              tab === "recipes"
                ? "bg-green-600 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => { setTab("recipes"); setView("list"); }}
          >
            Recetas
          </button>
          <button
            className={`px-5 py-2 rounded-xl font-semibold transition ${
              tab === "ingredients"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => { setTab("ingredients"); setView("list"); }}
          >
            Ingredientes
          </button>
        </div>

        {/* Recetas */}
        {tab === "recipes" && (
          <div className="bg-white rounded-3xl shadow-md border border-green-100 p-6 mb-8">
            {view === "list" && (
              <>
                <button
                  className="create-btn mt-4"
                  onClick={() => { setSelectedRecipe(null); setView("form"); }}

                >
                  Crear nueva receta
                </button>
                
                <div className="overflow-x-auto">
                  <RecipeList
                    onEdit={(r) => { setSelectedRecipe(r); setView("form"); }}
                    onDelete={(r) => openDeleteModal(r)}
                  />
                </div>
              </>
            )}
            {view === "form" && (
              <>
                <button
                  className="mb-4 px-5 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition shadow-sm"
                  onClick={goBack}
                >
                  Volver
                </button>
                <RecipeForm recipe={selectedRecipe} onFinish={goBack} />
              </>
            )}
          </div>
        )}

        {/* Ingredientes */}
        {tab === "ingredients" && (
          <div className="bg-white rounded-3xl shadow-md border border-green-100 p-6 mb-8">
            {view === "list" && (
              <>
                <button
                  className="mb-4 px-5 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition shadow-sm"
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
                  className="mb-4 px-5 py-2 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition shadow-sm"
                  onClick={goBack}
                >
                  Volver
                </button>
                <IngredientForm ingredient={selectedIngredient} onFinish={goBack} />
              </>
            )}
          </div>
        )}

        {/* Modal */}
        <ConfirmModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={confirmDelete}
          message="¿Seguro que quieres eliminar esta receta?"
        />
      </div>
    </div>
  );
}