import { useState } from "react";
import {
  ArrowLeft,
  Bot,
  Carrot,
  CookingPot,
  FileUp,
  HeartPulse,
  LayoutDashboard,
  Plus,
  ShieldCheck,
  Users,
} from "lucide-react";
import AppShell from "../../components/AppShell";
import Button from "../../components/Button";
import PageHeader from "../../components/PageHeader";
import ClinicalCatalogs from "./ClinicalCatalogs";
import IngredientForm from "./Ingredients/IngredientForm";
import IngredientList from "./Ingredients/IngredientList";
import OperationsOverview from "./OperationsOverview";
import RecipeForm from "./Recipes/RecipeForm";
import RecipeImport from "./Recipes/RecipeImport";
import RecipeList from "./Recipes/RecipeList";
import RulesAndRestrictions from "./RulesAndRestrictions";
import UsersAdmin from "./UsersAdmin";
import VisionUsageAdmin from "./VisionUsageAdmin";

const tabs = [
  { id: "overview", label: "Operación", description: "Estado general", Icon: LayoutDashboard },
  { id: "users", label: "Usuarios", description: "Perfiles y accesos", Icon: Users },
  { id: "clinical", label: "Catálogos clínicos", description: "Objetivos y condiciones", Icon: HeartPulse },
  { id: "rules", label: "Reglas", description: "Criterios nutricionales", Icon: ShieldCheck },
  { id: "vision", label: "Uso de IA", description: "Consumo y análisis", Icon: Bot },
  { id: "recipes", label: "Recetas", description: "Catálogo nutricional", Icon: CookingPot },
  { id: "ingredients", label: "Ingredientes", description: "Grupos y sustituciones", Icon: Carrot },
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

  const activeTab = tabs.find((item) => item.id === tab) || tabs[0];
  const ActiveIcon = activeTab.Icon;

  return (
    <AppShell>
      <PageHeader
        title="Administración"
        subtitle="Supervisa la operación, la calidad del catálogo y las reglas de personalización de NutriEdu."
      />

      <div className="mb-6 lg:hidden">
        <label className="mb-2 block text-sm font-semibold text-[var(--color-text)]" htmlFor="admin-section">Sección</label>
        <select
          id="admin-section"
          value={tab}
          onChange={(event) => selectTab(event.target.value)}
          className="min-h-11 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm font-semibold text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-green-100"
        >
          {tabs.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
      </div>

      <div className="grid min-w-0 gap-8 lg:grid-cols-[224px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <nav aria-label="Secciones de administración" className="sticky top-24 space-y-1 border-l border-[var(--color-border)] pl-3">
            {tabs.map(({ id, label, description, Icon }) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  type="button"
                  aria-current={active ? "page" : undefined}
                  onClick={() => selectTab(id)}
                  className={`flex min-h-14 w-full items-center gap-3 rounded-lg px-3 text-left transition-colors ${active ? "bg-green-50 text-green-800" : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]"}`}
                >
                  <Icon aria-hidden="true" className="shrink-0" size={19} />
                  <span className="min-w-0">
                    <span className="block text-sm font-bold">{label}</span>
                    <span className="block truncate text-xs font-normal opacity-80">{description}</span>
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0" aria-labelledby="admin-active-section">
          <div className="mb-5 flex items-center gap-3 border-b border-[var(--color-border)] pb-4">
            <ActiveIcon aria-hidden="true" className="text-[var(--color-primary)]" size={22} />
            <div>
              <h2 id="admin-active-section" className="text-xl font-bold text-[var(--color-text)]">{activeTab.label}</h2>
              <p className="text-sm text-[var(--color-text-muted)]">{activeTab.description}</p>
            </div>
          </div>

          {tab === "overview" ? <OperationsOverview onNavigate={selectTab} /> : null}
          {tab === "users" ? <UsersAdmin /> : null}
          {tab === "clinical" ? <ClinicalCatalogs /> : null}
          {tab === "rules" ? <RulesAndRestrictions /> : null}
          {tab === "vision" ? <VisionUsageAdmin /> : null}

          {tab === "recipes" ? (
            <div>
              {view === "list" ? (
                <>
                  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-xl text-sm text-[var(--color-text-muted)]">Mantén completos los nutrientes, porciones e ingredientes para mejorar las recomendaciones.</p>
                    <div className="flex flex-wrap gap-2 sm:justify-end">
                      <Button variant="secondary" onClick={() => setView("import")}><FileUp size={18} /> Importar</Button>
                      <Button onClick={() => { setSelectedRecipe(null); setView("form"); }}><Plus size={18} /> Crear receta</Button>
                    </div>
                  </div>
                  <div className="overflow-x-auto"><RecipeList onEdit={(recipe) => { setSelectedRecipe(recipe); setView("form"); }} /></div>
                </>
              ) : view === "form" ? (
                <><BackButton onPress={() => setView("list")} /><RecipeForm recipe={selectedRecipe} onFinish={() => setView("list")} /></>
              ) : (
                <><BackButton onPress={() => setView("list")} /><RecipeImport /></>
              )}
            </div>
          ) : null}

          {tab === "ingredients" ? (
            <div>
              {view === "list" ? (
                <>
                  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-xl text-sm text-[var(--color-text-muted)]">Clasifica cada ingrediente para generar listas y alternativas culinarias más precisas.</p>
                    <Button onClick={() => { setSelectedIngredient(null); setView("form"); }}><Plus size={18} /> Crear ingrediente</Button>
                  </div>
                  <IngredientList onEdit={(ingredient) => { setSelectedIngredient(ingredient); setView("form"); }} />
                </>
              ) : (
                <><BackButton onPress={() => setView("list")} /><IngredientForm ingredient={selectedIngredient} onFinish={() => setView("list")} /></>
              )}
            </div>
          ) : null}
        </section>
      </div>
    </AppShell>
  );
}

function BackButton({ onPress }) {
  return <Button className="mb-5" variant="secondary" onClick={onPress}><ArrowLeft size={18} /> Volver</Button>;
}
