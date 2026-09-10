import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Beef,
  Clock3,
  Droplets,
  Flame,
  HeartPulse,
  Salad,
  ShieldCheck,
  Wheat,
} from "lucide-react";
import api from "../services/api";
import AppShell from "../components/AppShell";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";
import StatusMessage from "../components/StatusMessage";
import UnsafeIngredientModal from "../components/UnsafeIngredientModal";

const nutritionFields = [
  { key: "calorias", label: "Calorías", unit: "kcal", icon: Flame },
  { key: "protein_g", label: "Proteína", unit: "g", icon: Beef },
  { key: "carbs_g", label: "Carbohidratos", unit: "g", icon: Wheat },
  { key: "fat_g", label: "Grasa total", unit: "g", icon: Droplets },
  { key: "saturated_fat_g", label: "Grasa saturada", unit: "g", icon: Droplets },
  { key: "sugar_g", label: "Azúcares", unit: "g", icon: Wheat },
  { key: "fiber_g", label: "Fibra", unit: "g", icon: Salad },
  { key: "sodium_mg", label: "Sodio", unit: "mg", icon: Droplets },
];

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = JSON.parse(localStorage.getItem("user"))?.id;
  const [recipe, setRecipe] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [unsafeIngredients, setUnsafeIngredients] = useState([]);
  const [substitutes, setSubstitutes] = useState([]);
  const [showUnsafeModal, setShowUnsafeModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchRecipe = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setErrorMessage("");
      const [recipeResponse, ingredientsResponse, safetyResponse] = await Promise.all([
        api.get(`/recipes/${id}`),
        api.get(`/recipes/${id}/ingredients`),
        api.get(`/recipes/check/${id}/${userId}`),
      ]);
      setRecipe(recipeResponse.data);
      setIngredients(ingredientsResponse.data || []);
      setUnsafeIngredients(safetyResponse.data.unsafeIngredients || []);
      setSubstitutes(safetyResponse.data.substitutes || []);
    } catch (error) {
      console.error(error);
      setRecipe(null);
      setErrorMessage(error.response?.data?.message || error.response?.data?.error || "No pudimos cargar la receta.");
    } finally {
      setLoading(false);
    }
  }, [id, userId]);

  useEffect(() => {
    void fetchRecipe();
  }, [fetchRecipe]);

  const backButton = (
    <Button variant="secondary" onClick={() => navigate("/recipes")}>
      <ArrowLeft aria-hidden="true" size={17} />
      Volver a recetas
    </Button>
  );

  if (loading) {
    return (
      <AppShell className="max-w-5xl">
        <RecipeDetailSkeleton />
      </AppShell>
    );
  }

  if (!recipe) {
    return (
      <AppShell className="max-w-5xl">
        <PageHeader title="Detalle de receta" subtitle="No fue posible consultar esta información." actions={backButton} />
        <StatusMessage type="error" message={errorMessage || "Receta no encontrada."} />
        <EmptyState
          title="La receta no está disponible"
          description="Comprueba tu conexión o vuelve al catálogo para elegir otra receta."
          action={<Button onClick={() => void fetchRecipe()}>Volver a intentar</Button>}
        />
      </AppShell>
    );
  }

  const isSafe = unsafeIngredients.length === 0;

  return (
    <AppShell className="max-w-5xl">
      <PageHeader
        title={recipe.nombre}
        subtitle="Detalle nutricional y compatibilidad con tus restricciones registradas."
        actions={backButton}
      />

      <section
        className={`mb-6 flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between ${isSafe ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
        aria-labelledby="recipe-safety-title"
      >
        <div className="flex items-start gap-3">
          {isSafe ? <ShieldCheck aria-hidden="true" className="mt-0.5 shrink-0 text-green-700" size={22} /> : <AlertTriangle aria-hidden="true" className="mt-0.5 shrink-0 text-red-700" size={22} />}
          <div>
            <h2 id="recipe-safety-title" className={`font-bold ${isSafe ? "text-green-900" : "text-red-900"}`}>
              {isSafe ? "Compatible con tus restricciones" : `${unsafeIngredients.length} ${unsafeIngredients.length === 1 ? "ingrediente requiere" : "ingredientes requieren"} revisión`}
            </h2>
            <p className={`mt-1 text-sm leading-5 ${isSafe ? "text-green-800" : "text-red-800"}`}>
              {isSafe
                ? "No encontramos coincidencias con las restricciones de tu perfil."
                : unsafeIngredients.map((ingredient) => ingredient.nombre).join(", ")}
            </p>
          </div>
        </div>
        {!isSafe ? (
          <Button variant="danger" className="shrink-0" onClick={() => setShowUnsafeModal(true)}>
            Ver alternativas
          </Button>
        ) : null}
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.75fr)]">
        <div className="space-y-6">
          <section className="surface-panel p-5 sm:p-6" aria-labelledby="general-information-title">
            <h2 id="general-information-title" className="text-xl font-bold text-[var(--color-text)]">Información general</h2>
            <p className="mt-3 leading-7 text-[var(--color-text-muted)]">
              {recipe.descripcion || "Esta receta todavía no tiene una descripción registrada."}
            </p>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 border-t border-[var(--color-border)] pt-4 text-sm">
              <DetailFact icon={Clock3} label="Preparación" value={recipe.tiempo_preparacion ? `${recipe.tiempo_preparacion} min` : "No definida"} />
              <DetailFact icon={HeartPulse} label="Nivel de salud" value={`${recipe.nivel_salud}/5 · ${healthLabel(recipe.nivel_salud)}`} />
              {recipe.servings ? <DetailFact icon={Salad} label="Porciones" value={recipe.servings} /> : null}
              {recipe.serving_size_g ? <DetailFact icon={Salad} label="Tamaño de porción" value={`${recipe.serving_size_g} g`} /> : null}
            </div>
          </section>

          <section className="surface-panel overflow-hidden" aria-labelledby="nutrition-title">
            <div className="border-b border-[var(--color-border)] px-5 py-4 sm:px-6">
              <h2 id="nutrition-title" className="text-xl font-bold text-[var(--color-text)]">Información nutricional</h2>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">Valores registrados por porción.</p>
            </div>
            <dl className="grid sm:grid-cols-2">
              {nutritionFields.map(({ key, label, unit, icon: Icon }) => (
                <div key={key} className="flex min-h-20 items-center gap-3 border-b border-[var(--color-border)] px-5 py-3 odd:sm:border-r sm:px-6 last:border-b-0 sm:[&:nth-last-child(2)]:border-b-0">
                  <Icon aria-hidden="true" className="shrink-0 text-[var(--color-primary)]" size={19} />
                  <dt className="text-sm text-[var(--color-text-muted)]">{label}</dt>
                  <dd className="ml-auto text-right font-bold text-[var(--color-text)]">{formatNutrient(recipe[key], unit)}</dd>
                </div>
              ))}
            </dl>
            {recipe.nutrition_source && recipe.nutrition_source !== "unknown" ? (
              <p className="px-5 py-3 text-xs text-[var(--color-text-muted)] sm:px-6">Fuente nutricional: {nutritionSourceLabel(recipe.nutrition_source)}</p>
            ) : null}
          </section>
        </div>

        <section className="surface-panel p-5 sm:p-6" aria-labelledby="ingredients-title">
          <div className="flex items-center justify-between gap-3">
            <h2 id="ingredients-title" className="text-xl font-bold text-[var(--color-text)]">Ingredientes</h2>
            <span className="rounded-md bg-[var(--color-surface-muted)] px-2 py-1 text-xs font-bold text-[var(--color-text-muted)]">{ingredients.length}</span>
          </div>
          {ingredients.length ? (
            <ul className="mt-4 divide-y divide-[var(--color-border)]">
              {ingredients.map((ingredient) => {
                const unsafe = unsafeIngredients.some((item) => item.id === ingredient.id);
                return (
                  <li key={ingredient.id} className="flex min-h-11 items-center gap-3 py-2.5 text-sm">
                    {unsafe ? <AlertTriangle aria-hidden="true" className="shrink-0 text-red-700" size={17} /> : <ShieldCheck aria-hidden="true" className="shrink-0 text-green-700" size={17} />}
                    <span className={unsafe ? "font-semibold text-red-800" : "text-[var(--color-text)]"}>{ingredient.nombre}</span>
                    {unsafe ? <span className="ml-auto text-xs font-bold text-red-700">Revisar</span> : null}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-4 text-sm leading-6 text-[var(--color-text-muted)]">No hay ingredientes registrados para esta receta.</p>
          )}
        </section>
      </div>

      <UnsafeIngredientModal
        isOpen={showUnsafeModal}
        onClose={() => setShowUnsafeModal(false)}
        unsafeIngredients={unsafeIngredients}
        substitutes={substitutes}
        recipeName={recipe.nombre}
      />
    </AppShell>
  );
}

function DetailFact({ icon: Icon, label, value }) {
  return (
    <span className="inline-flex items-center gap-2 text-[var(--color-text-muted)]">
      <Icon aria-hidden="true" size={17} />
      <span>{label}: <strong className="text-[var(--color-text)]">{value}</strong></span>
    </span>
  );
}

function RecipeDetailSkeleton() {
  return (
    <div className="animate-pulse" aria-label="Cargando detalle de receta" aria-busy="true">
      <div className="h-9 w-2/3 max-w-lg rounded bg-gray-200" />
      <div className="mt-3 h-5 w-1/2 max-w-md rounded bg-gray-100" />
      <div className="mt-8 h-20 rounded-lg bg-gray-100" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.75fr)]">
        <div className="h-96 rounded-lg border border-[var(--color-border)] bg-white" />
        <div className="h-72 rounded-lg border border-[var(--color-border)] bg-white" />
      </div>
    </div>
  );
}

function formatNutrient(value, unit) {
  if (value === null || value === undefined || value === "") return "Pendiente";
  return `${Number(value).toLocaleString("es-CO", { maximumFractionDigits: 1 })} ${unit}`;
}

function healthLabel(level) {
  if (level >= 5) return "Muy saludable";
  if (level >= 3) return "Saludable";
  return "Moderada";
}

function nutritionSourceLabel(source) {
  const labels = { calculated: "calculada", estimated: "estimada", verified: "verificada", imported: "importada" };
  return labels[source] || source;
}
