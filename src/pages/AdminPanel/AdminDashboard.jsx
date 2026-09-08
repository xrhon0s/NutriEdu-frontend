import { useState } from "react";
import IngredientForm from "./Ingredients/IngredientForm";
import IngredientList from "./Ingredients/IngredientList";
import OperationsOverview from "./OperationsOverview";
import RecipeForm from "./Recipes/RecipeForm";
import RecipeList from "./Recipes/RecipeList";
import RecipeImport from "./Recipes/RecipeImport";
import { FileUp, Plus } from "lucide-react";
import NavBar from "../../components/navBar";
import UsersAdmin from "./UsersAdmin";
import ClinicalCatalogs from "./ClinicalCatalogs";
import RulesAndRestrictions from "./RulesAndRestrictions";
import VisionUsageAdmin from "./VisionUsageAdmin";

const tabs = [
  { id: "overview", label: "Operacion" },
  { id: "users", label: "Usuarios" },
  { id: "clinical", label: "Catalogos clinicos" },
  { id: "rules", label: "Reglas" },
  { id: "vision", label: "Uso de IA" },
  { id: "recipes", label: "Recetas" },
  { id: "ingredients", label: "Ingredientes" },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const [view, setView] = useState("list");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedIngredient, setSelectedIngredient] = useState(null);

  const selectTab = (nextTab) => {
    setTab(nextTab);
    setView("list");
    setSelectedRecipe(null);
    setSelectedIngredient(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <header className="mb-6">
          <p className="text-xs font-bold text-green-700">ADMINISTRACION</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-950">Operacion de NutriEdu</h1>
        </header>

        <div className="mb-6 flex overflow-x-auto border-b border-gray-200" role="tablist">
          {tabs.map((item) => (
            <button
              key={item.id}
              role="tab"
              aria-selected={tab === item.id}
              className={`min-h-11 shrink-0 border-b-2 px-4 text-sm font-semibold ${tab === item.id ? "border-green-600 text-green-700" : "border-transparent text-gray-500 hover:text-gray-800"}`}
              onClick={() => selectTab(item.id)}>
              {item.label}
            </button>
          ))}
        </div>

        {tab === "overview" ? <OperationsOverview /> : null}
        {tab === "users" ? <UsersAdmin /> : null}
        {tab === "clinical" ? <ClinicalCatalogs /> : null}
        {tab === "rules" ? <RulesAndRestrictions /> : null}
        {tab === "vision" ? <VisionUsageAdmin /> : null}

        {tab === "recipes" ? (
          <section className="rounded-lg border border-gray-200 bg-white p-5">
            {view === "list" ? (
              <>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h2 className="text-lg font-bold text-gray-900">Catalogo de recetas</h2>
                  <div className="flex flex-wrap justify-end gap-2">
                    <button className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50" onClick={() => setView("import")}><FileUp size={18} /> Importar</button>
                    <button className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-green-600 px-4 text-sm font-semibold text-white hover:bg-green-700" onClick={() => { setSelectedRecipe(null); setView("form"); }}><Plus size={18} /> Crear receta</button>
                  </div>
                </div>
                <div className="overflow-x-auto"><RecipeList onEdit={(recipe) => { setSelectedRecipe(recipe); setView("form"); }} /></div>
              </>
            ) : view === "form" ? (
              <><BackButton onPress={() => setView("list")} /><RecipeForm recipe={selectedRecipe} onFinish={() => setView("list")} /></>
            ) : (
              <><BackButton onPress={() => setView("list")} /><RecipeImport /></>
            )}
          </section>
        ) : null}

        {tab === "ingredients" ? (
          <section className="rounded-lg border border-gray-200 bg-white p-5">
            {view === "list" ? (
              <>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h2 className="text-lg font-bold text-gray-900">Catalogo de ingredientes</h2>
                  <button className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700" onClick={() => { setSelectedIngredient(null); setView("form"); }}>Crear ingrediente</button>
                </div>
                <IngredientList onEdit={(ingredient) => { setSelectedIngredient(ingredient); setView("form"); }} />
              </>
            ) : (
              <><BackButton onPress={() => setView("list")} /><IngredientForm ingredient={selectedIngredient} onFinish={() => setView("list")} /></>
            )}
          </section>
        ) : null}
      </main>
    </div>
  );
}

function BackButton({ onPress }) {
  return <button className="mb-5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50" onClick={onPress}>Volver</button>;
}
