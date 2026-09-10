import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Plus,
  Save,
  Trash2,
  Utensils,
} from "lucide-react";
import api from "../services/api";
import AppShell from "../components/AppShell";
import Button from "../components/Button";
import PageHeader from "../components/PageHeader";
import StatusMessage from "../components/StatusMessage";
import UnsafeIngredientModal from "../components/UnsafeIngredientModal";

const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const mealTypes = ["Desayuno", "Almuerzo", "Cena"];
const TOTAL_SLOTS = days.length * mealTypes.length;

export default function Planner() {
  const user = useMemo(() => JSON.parse(localStorage.getItem("user")), []);
  const formRef = useRef(null);
  const [recipes, setRecipes] = useState([]);
  const [weeklyPlan, setWeeklyPlan] = useState([]);
  const [savedSignature, setSavedSignature] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [selectedRecipe, setSelectedRecipe] = useState("");
  const [selectedDay, setSelectedDay] = useState(days[0]);
  const [selectedMealType, setSelectedMealType] = useState("Almuerzo");
  const [modalData, setModalData] = useState({ isOpen: false, item: null });

  const currentSignature = planSignature(weeklyPlan);
  const hasChanges = currentSignature !== savedSignature;
  const unsafeCount = weeklyPlan.filter((item) => item.unsafeIngredients?.length).length;
  const completion = Math.round((weeklyPlan.length / TOTAL_SLOTS) * 100);

  const loadPlanner = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setLoadError("");
      const [recipesResponse, planResponse] = await Promise.all([
        api.get(`/recipes/safe/${user.id}`),
        api.get(`/planner/${user.id}`),
      ]);
      const planWithSafety = await Promise.all(
        (planResponse.data || []).map(async (item) => {
          const safetyResponse = await api.get(`/recipes/check/${item.receta_id}/${user.id}`);
          return {
            ...item,
            unsafeIngredients: safetyResponse.data.unsafeIngredients || [],
            substitutes: safetyResponse.data.substitutes || [],
          };
        })
      );
      setRecipes(recipesResponse.data || []);
      setWeeklyPlan(planWithSafety);
      setSavedSignature(planSignature(planWithSafety));
    } catch (error) {
      console.error(error);
      setLoadError(error.response?.data?.error || "No pudimos cargar tu plan semanal.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadPlanner();
  }, [loadPlanner]);

  useEffect(() => {
    if (!message) return undefined;
    const timeout = window.setTimeout(() => setMessage(""), 4000);
    return () => window.clearTimeout(timeout);
  }, [message]);

  const addToPlan = () => {
    if (!selectedRecipe) {
      showMessage("Selecciona una receta antes de agregarla.", "warning");
      return;
    }

    if (getPlanForSlot(weeklyPlan, selectedDay, selectedMealType)) {
      showMessage(`${selectedDay} · ${selectedMealType} ya tiene una receta.`, "warning");
      return;
    }

    const recipe = recipes.find((item) => item.id === Number(selectedRecipe));
    if (!recipe) return;

    setWeeklyPlan((current) => [...current, {
      dia_semana: selectedDay,
      tipo_comida: selectedMealType,
      receta_id: recipe.id,
      receta_nombre: recipe.nombre,
      descripcion: recipe.descripcion,
      calorias: recipe.calorias,
      tiempo_preparacion: recipe.tiempo_preparacion,
      nivel_salud: recipe.nivel_salud,
      unsafeIngredients: [],
      substitutes: [],
    }]);
    setSelectedRecipe("");
    showMessage("Receta agregada. Guarda el plan para conservar el cambio.", "info");
  };

  const removeFromPlan = (day, mealType) => {
    setWeeklyPlan((current) => current.filter(
      (item) => !(item.dia_semana === day && item.tipo_comida === mealType)
    ));
    showMessage("Receta retirada. Guarda el plan para confirmar el cambio.", "info");
  };

  const savePlan = async () => {
    if (unsafeCount) {
      showMessage("Retira las recetas incompatibles antes de guardar el plan.", "error");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      const plan = weeklyPlan.map((item) => ({
        recetaId: item.receta_id,
        diaSemana: item.dia_semana,
        tipoComida: item.tipo_comida,
      }));
      await api.post("/planner", { plan });
      setSavedSignature(planSignature(weeklyPlan));
      showMessage("Plan semanal guardado correctamente.", "success");
    } catch (error) {
      console.error(error);
      showMessage(error.response?.data?.message || error.response?.data?.error || "No pudimos guardar el plan semanal.", "error");
    } finally {
      setSaving(false);
    }
  };

  const selectEmptySlot = (day, mealType) => {
    setSelectedDay(day);
    setSelectedMealType(mealType);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
  };

  const saveAction = (
    <Button onClick={() => void savePlan()} disabled={saving || !hasChanges || Boolean(unsafeCount)}>
      <Save aria-hidden="true" size={17} />
      {saving ? "Guardando..." : hasChanges ? "Guardar cambios" : "Plan guardado"}
    </Button>
  );

  if (loading) {
    return (
      <AppShell>
        <PlannerSkeleton />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Planificador semanal"
        subtitle="Organiza desayunos, almuerzos y cenas con recetas compatibles con tu perfil."
        actions={saveAction}
      />

      {loadError ? (
        <div className="mb-6">
          <StatusMessage type="error" message={loadError} />
          <Button variant="secondary" onClick={() => void loadPlanner()}>Volver a intentar</Button>
        </div>
      ) : null}
      <StatusMessage message={message} type={messageType} />
      {unsafeCount ? <StatusMessage type="error" message={`${unsafeCount} ${unsafeCount === 1 ? "receta guardada dejó" : "recetas guardadas dejaron"} de ser compatible con tus restricciones. Revísala o retírala para guardar.`} /> : null}

      <section ref={formRef} className="surface-panel mb-7 p-5 sm:p-6" aria-labelledby="add-meal-title">
        <div className="mb-4 flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
            <Plus aria-hidden="true" size={20} />
          </span>
          <div>
            <h2 id="add-meal-title" className="text-lg font-bold text-[var(--color-text)]">Agregar comida</h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">El catálogo muestra únicamente recetas compatibles al cargar esta página.</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-[minmax(240px,1fr)_180px_180px_auto] md:items-end">
          <PlannerSelect label="Receta" value={selectedRecipe} onChange={setSelectedRecipe}>
            <option value="">Selecciona una receta</option>
            {recipes.map((recipe) => <option key={recipe.id} value={recipe.id}>{recipe.nombre}</option>)}
          </PlannerSelect>
          <PlannerSelect label="Día" value={selectedDay} onChange={setSelectedDay}>
            {days.map((day) => <option key={day} value={day}>{day}</option>)}
          </PlannerSelect>
          <PlannerSelect label="Comida" value={selectedMealType} onChange={setSelectedMealType}>
            {mealTypes.map((mealType) => <option key={mealType} value={mealType}>{mealType}</option>)}
          </PlannerSelect>
          <Button onClick={addToPlan} disabled={!recipes.length}>
            <Plus aria-hidden="true" size={17} />
            Agregar
          </Button>
        </div>
      </section>

      <section className="mb-7 border-y border-[var(--color-border)] bg-white px-4 py-4" aria-label="Resumen del plan">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-8">
          <div>
            <div className="mb-2 flex items-center justify-between gap-4 text-sm">
              <span className="font-semibold text-[var(--color-text)]">Progreso semanal</span>
              <span className="text-[var(--color-text-muted)]">{weeklyPlan.length} de {TOTAL_SLOTS}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--color-surface-muted)]" role="progressbar" aria-valuemin="0" aria-valuemax={TOTAL_SLOTS} aria-valuenow={weeklyPlan.length} aria-label="Comidas planificadas">
              <div className="h-full rounded-full bg-[var(--color-primary)] transition-[width]" style={{ width: `${completion}%` }} />
            </div>
          </div>
          <SummaryValue label="Completado" value={`${completion}%`} />
          <SummaryValue label="Estado" value={hasChanges ? "Sin guardar" : "Guardado"} emphasis={hasChanges ? "warning" : "success"} />
        </div>
      </section>

      <section aria-labelledby="weekly-plan-title">
        <div className="mb-5 flex items-center gap-3">
          <CalendarDays aria-hidden="true" className="text-[var(--color-primary)]" size={22} />
          <h2 id="weekly-plan-title" className="text-xl font-bold text-[var(--color-text)]">Tu semana</h2>
        </div>
        <div className="space-y-6">
          {days.map((day) => (
            <section key={day} aria-labelledby={`day-${day}`}>
              <h3 id={`day-${day}`} className="mb-2 text-sm font-bold uppercase text-[var(--color-text-muted)]">{day}</h3>
              <div className="grid gap-3 md:grid-cols-3">
                {mealTypes.map((mealType) => {
                  const plannedItem = getPlanForSlot(weeklyPlan, day, mealType);
                  return plannedItem ? (
                    <MealSlot
                      key={mealType}
                      mealType={mealType}
                      item={plannedItem}
                      onRemove={() => removeFromPlan(day, mealType)}
                      onReview={() => setModalData({ isOpen: true, item: plannedItem })}
                    />
                  ) : (
                    <button
                      key={mealType}
                      type="button"
                      onClick={() => selectEmptySlot(day, mealType)}
                      className="flex min-h-36 flex-col items-start justify-between rounded-lg border border-dashed border-[var(--color-border)] bg-white p-4 text-left transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-soft)]"
                      aria-label={`Agregar receta el ${day} para ${mealType}`}
                    >
                      <span className="text-sm font-bold text-[var(--color-text-muted)]">{mealType}</span>
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)]"><Plus aria-hidden="true" size={17} /> Agregar receta</span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </section>

      <UnsafeIngredientModal
        isOpen={modalData.isOpen}
        onClose={() => setModalData({ isOpen: false, item: null })}
        unsafeIngredients={modalData.item?.unsafeIngredients || []}
        substitutes={modalData.item?.substitutes || []}
        recipeName={modalData.item?.receta_nombre || ""}
      />
    </AppShell>
  );
}

function PlannerSelect({ label, value, onChange, children }) {
  return (
    <label>
      <span className="mb-1.5 block text-xs font-bold text-[var(--color-text-muted)]">{label}</span>
      <select className="field-control" value={value} onChange={(event) => onChange(event.target.value)}>{children}</select>
    </label>
  );
}

function SummaryValue({ label, value, emphasis }) {
  const valueColor = emphasis === "warning" ? "text-amber-800" : emphasis === "success" ? "text-green-800" : "text-[var(--color-text)]";
  return <div><p className="text-xs font-semibold text-[var(--color-text-muted)]">{label}</p><p className={`mt-1 font-bold ${valueColor}`}>{value}</p></div>;
}

function MealSlot({ mealType, item, onRemove, onReview }) {
  const unsafe = Boolean(item.unsafeIngredients?.length);
  return (
    <article className={`flex min-h-36 flex-col rounded-lg border bg-white p-4 ${unsafe ? "border-red-300" : "border-[var(--color-border)]"}`}>
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-bold text-[var(--color-text-muted)]">{mealType}</span>
        {unsafe ? <AlertTriangle aria-label="Requiere revisión" className="shrink-0 text-red-700" size={18} /> : <CheckCircle2 aria-label="Compatible" className="shrink-0 text-green-700" size={18} />}
      </div>
      <h4 className="mt-3 line-clamp-2 font-bold leading-5 text-[var(--color-text)]">{item.receta_nombre}</h4>
      <p className="mt-1 text-xs text-[var(--color-text-muted)]">{item.calorias ?? "--"} kcal · {healthLabel(item.nivel_salud)}</p>
      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        {unsafe ? <Button size="sm" variant="danger" onClick={onReview}>Ver alternativas</Button> : <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700"><Utensils aria-hidden="true" size={15} /> Compatible</span>}
        <button type="button" onClick={onRemove} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-red-700 hover:bg-red-50" aria-label={`Eliminar ${item.receta_nombre} del plan`} title="Eliminar del plan">
          <Trash2 aria-hidden="true" size={17} />
        </button>
      </div>
    </article>
  );
}

function PlannerSkeleton() {
  return (
    <div className="animate-pulse" aria-label="Cargando plan semanal" aria-busy="true">
      <div className="h-9 w-72 rounded bg-gray-200" />
      <div className="mt-8 h-40 rounded-lg bg-gray-100" />
      <div className="mt-8 grid gap-3 md:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => <div key={index} className="h-36 rounded-lg border border-[var(--color-border)] bg-white" />)}
      </div>
    </div>
  );
}

function getPlanForSlot(plan, day, mealType) {
  return plan.find((item) => item.dia_semana === day && item.tipo_comida === mealType);
}

function planSignature(plan) {
  return plan
    .map((item) => `${item.dia_semana}:${item.tipo_comida}:${item.receta_id}`)
    .sort()
    .join("|");
}

function healthLabel(level) {
  if (level >= 5) return "Muy saludable";
  if (level >= 3) return "Saludable";
  return "Moderada";
}
