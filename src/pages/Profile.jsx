import { useCallback, useMemo, useState, useEffect } from "react";
import {
  Check,
  Gauge,
  HeartPulse,
  Save,
  Search,
  Target,
  UserRound,
} from "lucide-react";
import api from "../services/api";
import AppShell from "../components/AppShell";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";
import Pagination from "../components/Pagination";
import StatusMessage from "../components/StatusMessage";

const tabs = [
  { id: "personal", label: "Datos personales", shortLabel: "Datos", icon: UserRound },
  { id: "goals", label: "Objetivos", shortLabel: "Objetivos", icon: Target },
  { id: "clinical", label: "Salud y restricciones", shortLabel: "Salud", icon: HeartPulse },
  { id: "targets", label: "Metas nutricionales", shortLabel: "Metas", icon: Gauge },
];

const initialProfile = {
  fecha_nacimiento: "",
  sexo: "",
  estatura_cm: "",
  peso_kg: "",
  nivel_actividad: "",
  condicion_fisica: "",
  meals_per_day: "",
  eats_out_frequency: "",
  diet_style: "",
  cooking_time: "",
  notas: "",
};

const initialTargets = {
  calories_min: "",
  calories_max: "",
  protein_min_g: "",
  protein_max_g: "",
  carbs_min_g: "",
  carbs_max_g: "",
  fat_min_g: "",
  fat_max_g: "",
  saturated_fat_max_g: "",
  sugar_max_g: "",
  fiber_min_g: "",
  sodium_max_mg: "",
  water_min_ml: "",
  notes: "",
};

const targetGroups = [
  {
    title: "Energía diaria",
    description: "Rango total distribuido entre las comidas del día.",
    fields: [
      ["calories_min", "Calorías mínimas", "kcal"],
      ["calories_max", "Calorías máximas", "kcal"],
    ],
  },
  {
    title: "Macronutrientes",
    description: "Rangos diarios de proteína, carbohidratos y grasas.",
    fields: [
      ["protein_min_g", "Proteína mínima", "g"],
      ["protein_max_g", "Proteína máxima", "g"],
      ["carbs_min_g", "Carbohidratos mínimos", "g"],
      ["carbs_max_g", "Carbohidratos máximos", "g"],
      ["fat_min_g", "Grasas mínimas", "g"],
      ["fat_max_g", "Grasas máximas", "g"],
    ],
  },
  {
    title: "Límites y mínimos específicos",
    description: "Valores diarios usados por las reglas de seguridad nutricional.",
    fields: [
      ["saturated_fat_max_g", "Grasa saturada máxima", "g"],
      ["sugar_max_g", "Azúcar máxima", "g"],
      ["fiber_min_g", "Fibra mínima", "g"],
      ["sodium_max_mg", "Sodio máximo", "mg"],
      ["water_min_ml", "Agua mínima", "ml"],
    ],
  },
];

const restrictionPageSize = 8;
const labelClass = "block text-sm font-semibold text-[var(--color-text)]";

export default function Profile() {
  const user = useMemo(() => JSON.parse(localStorage.getItem("user")), []);
  const [activeTab, setActiveTab] = useState("personal");
  const [checking, setChecking] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [profile, setProfile] = useState(initialProfile);
  const [targets, setTargets] = useState(initialTargets);
  const [goals, setGoals] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [restrictions, setRestrictions] = useState([]);
  const [restrictionQuery, setRestrictionQuery] = useState("");
  const [restrictionPage, setRestrictionPage] = useState(1);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [selectedRestrictions, setSelectedRestrictions] = useState([]);

  const filteredRestrictions = useMemo(() => {
    const normalizedQuery = restrictionQuery.trim().toLocaleLowerCase("es");
    return normalizedQuery
      ? restrictions.filter((restriction) => restriction.nombre.toLocaleLowerCase("es").includes(normalizedQuery))
      : restrictions;
  }, [restrictionQuery, restrictions]);
  const restrictionTotalPages = Math.max(1, Math.ceil(filteredRestrictions.length / restrictionPageSize));
  const visibleRestrictions = filteredRestrictions.slice(
    (restrictionPage - 1) * restrictionPageSize,
    restrictionPage * restrictionPageSize
  );
  const filledTargets = Object.entries(targets).filter(([key, value]) => key !== "notes" && value !== "").length;
  const filledPersonal = Object.entries(profile).filter(([key, value]) => key !== "notas" && value !== "").length;

  const loadProfile = useCallback(async () => {
    if (!user?.id) return;

    try {
      setChecking(true);
      setLoadError("");
      const [catalogs, saved, allRestrictions, userRestrictions] = await Promise.all([
        api.get("/profile/catalogs"),
        api.get("/profile"),
        api.get("/users/restrictions"),
        api.get(`/users/restrictions/${user.id}`),
      ]);
      const savedProfile = saved.data.profile || {};
      const savedTargets = saved.data.targets || {};

      setGoals(catalogs.data.goals || []);
      setConditions(catalogs.data.conditions || []);
      setRestrictions(allRestrictions.data.restrictions || []);
      setSelectedGoals((saved.data.goals || []).map((goal) => goal.code));
      setSelectedConditions((saved.data.conditions || []).map((condition) => condition.code));
      setSelectedRestrictions((userRestrictions.data.restrictions || []).map((item) => Number(item.restriccion_id)));
      setProfile({
        fecha_nacimiento: savedProfile.fecha_nacimiento ? String(savedProfile.fecha_nacimiento).slice(0, 10) : "",
        sexo: savedProfile.sexo || "",
        estatura_cm: savedProfile.estatura_cm || "",
        peso_kg: savedProfile.peso_kg || "",
        nivel_actividad: savedProfile.nivel_actividad || "",
        condicion_fisica: savedProfile.condicion_fisica || "",
        meals_per_day: savedProfile.habitos_alimentarios?.meals_per_day || "",
        eats_out_frequency: savedProfile.habitos_alimentarios?.eats_out_frequency || "",
        diet_style: savedProfile.preferencias_alimentarias?.diet_style || "",
        cooking_time: savedProfile.preferencias_alimentarias?.cooking_time || "",
        notas: savedProfile.notas || "",
      });
      setTargets(Object.fromEntries(Object.keys(initialTargets).map((key) => [key, savedTargets[key] ?? ""])));
    } catch (error) {
      console.error(error);
      setLoadError(error.response?.data?.error || "No pudimos cargar tu perfil de salud.");
    } finally {
      setChecking(false);
    }
  }, [user]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const runSave = async (section, action, successMessage) => {
    try {
      setSaving(section);
      setMessage("");
      await action();
      setMessage(successMessage);
      setMessageType("success");
    } catch (error) {
      setMessage(error.response?.data?.message || error.response?.data?.error || "No pudimos guardar los cambios.");
      setMessageType("error");
    } finally {
      setSaving("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const savePersonal = () => runSave("personal", () => api.put("/profile", {
    fecha_nacimiento: profile.fecha_nacimiento,
    sexo: profile.sexo,
    estatura_cm: profile.estatura_cm,
    peso_kg: profile.peso_kg,
    nivel_actividad: profile.nivel_actividad,
    condicion_fisica: profile.condicion_fisica,
    habitos_alimentarios: { meals_per_day: profile.meals_per_day, eats_out_frequency: profile.eats_out_frequency },
    preferencias_alimentarias: { diet_style: profile.diet_style, cooking_time: profile.cooking_time },
    notas: profile.notas,
  }), "Datos personales actualizados.");
  const saveGoals = () => runSave("goals", () => api.put("/profile/goals", { goals: selectedGoals }), "Objetivos actualizados.");
  const saveClinical = () => runSave("clinical", () => Promise.all([
    api.put("/profile/conditions", { conditions: selectedConditions, source: "user" }),
    api.post("/users/restrictions", { userId: user.id, restricciones: selectedRestrictions }),
  ]), "Condiciones y restricciones actualizadas.");
  const saveTargets = () => runSave("targets", () => api.put("/profile/targets", {
    ...targets,
    calculation_source: "manual",
  }), "Metas nutricionales actualizadas.");

  if (checking) return <AppShell><ProfileSkeleton /></AppShell>;

  if (loadError) {
    return (
      <AppShell>
        <PageHeader title="Perfil de salud" subtitle="No fue posible consultar tu información." />
        <StatusMessage type="error" message={loadError} />
        <EmptyState
          icon={UserRound}
          title="Tu perfil no está disponible"
          description="Comprueba la conexión con el servidor y vuelve a intentarlo."
          action={<Button onClick={() => void loadProfile()}>Volver a intentar</Button>}
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader title="Perfil de salud" subtitle="Tus datos permiten adaptar recetas, alertas y metas nutricionales a tu contexto." />
      <StatusMessage message={message} type={messageType} />

      <section className="mb-6 border-y border-[var(--color-border)] bg-white px-4 py-4" aria-label="Resumen del perfil">
        <div className="grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-4">
          <ProfileMetric label="Datos registrados" value={`${filledPersonal}/10`} />
          <ProfileMetric label="Objetivos" value={selectedGoals.length} />
          <ProfileMetric label="Alertas de perfil" value={selectedConditions.length + selectedRestrictions.length} />
          <ProfileMetric label="Metas definidas" value={`${filledTargets}/13`} />
        </div>
      </section>

      <div className="overflow-x-auto border-b border-[var(--color-border)]">
        <div className="flex min-w-max gap-1" role="tablist" aria-label="Secciones del perfil">
          {tabs.map(({ id, label, shortLabel, icon: Icon }) => (
            <button
              key={id}
              id={`profile-tab-${id}`}
              type="button"
              role="tab"
              aria-selected={activeTab === id}
              aria-controls={`profile-panel-${id}`}
              onClick={() => { setActiveTab(id); setMessage(""); }}
              className={`inline-flex min-h-12 items-center gap-2 border-b-2 px-4 text-sm font-semibold transition ${activeTab === id ? "border-[var(--color-primary)] text-[var(--color-primary)]" : "border-transparent text-[var(--color-text-muted)] hover:border-gray-300 hover:text-[var(--color-text)]"}`}
            >
              <Icon aria-hidden="true" size={17} />
              <span className="sm:hidden">{shortLabel}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <section className="surface-panel mt-6 p-5 sm:p-7">
        {activeTab === "personal" ? (
          <div id="profile-panel-personal" role="tabpanel" aria-labelledby="profile-tab-personal">
            <SectionTitle title="Datos personales y estilo de vida" text="Completa los datos que cambian tus necesidades diarias." />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <label className={labelClass}>Fecha de nacimiento<input className="field-control mt-2" type="date" max={localToday()} name="fecha_nacimiento" value={profile.fecha_nacimiento} onChange={(event) => updateValue(setProfile, event)} /></label>
              <SelectField label="Sexo" name="sexo" value={profile.sexo} onChange={(event) => updateValue(setProfile, event)} options={[["female", "Femenino"], ["male", "Masculino"], ["other", "Otro"], ["prefer_not_to_say", "Prefiero no indicarlo"]]} />
              <NumberField label="Estatura" name="estatura_cm" value={profile.estatura_cm} unit="cm" onChange={(event) => updateValue(setProfile, event)} />
              <NumberField label="Peso actual" name="peso_kg" value={profile.peso_kg} unit="kg" onChange={(event) => updateValue(setProfile, event)} />
              <SelectField label="Nivel de actividad" name="nivel_actividad" value={profile.nivel_actividad} onChange={(event) => updateValue(setProfile, event)} options={[["sedentary", "Sedentario"], ["light", "Actividad ligera"], ["moderate", "Actividad moderada"], ["high", "Actividad alta"], ["athlete", "Entrenamiento intenso"]]} />
              <SelectField label="Condición física actual" name="condicion_fisica" value={profile.condicion_fisica} onChange={(event) => updateValue(setProfile, event)} options={[["starting", "Iniciando actividad"], ["active", "Activo"], ["trained", "Entrenado"], ["limited", "Actividad limitada"], ["recovery", "En recuperación"]]} />
              <NumberField label="Comidas por día" name="meals_per_day" value={profile.meals_per_day} min="1" max="12" step="1" onChange={(event) => updateValue(setProfile, event)} />
              <SelectField label="Comidas fuera de casa" name="eats_out_frequency" value={profile.eats_out_frequency} onChange={(event) => updateValue(setProfile, event)} options={[["rarely", "Casi nunca"], ["weekly", "1 a 2 veces por semana"], ["frequent", "3 o más veces por semana"], ["daily", "Todos los días"]]} />
              <SelectField label="Estilo alimentario" name="diet_style" value={profile.diet_style} onChange={(event) => updateValue(setProfile, event)} options={[["omnivore", "Omnívoro"], ["vegetarian", "Vegetariano"], ["vegan", "Vegano"], ["pescatarian", "Pescetariano"]]} />
              <SelectField label="Tiempo para cocinar" name="cooking_time" value={profile.cooking_time} onChange={(event) => updateValue(setProfile, event)} options={[["short", "Menos de 20 minutos"], ["medium", "20 a 45 minutos"], ["long", "Más de 45 minutos"]]} />
            </div>
            <label className={`${labelClass} mt-5`}>Notas adicionales<textarea className="field-control mt-2 min-h-24 py-3" name="notas" value={profile.notas} onChange={(event) => updateValue(setProfile, event)} /></label>
            <SaveRow onSave={savePersonal} disabled={Boolean(saving)} saving={saving === "personal"} label="Guardar datos personales" />
          </div>
        ) : null}

        {activeTab === "goals" ? (
          <div id="profile-panel-goals" role="tabpanel" aria-labelledby="profile-tab-goals">
            <SectionTitle title="Objetivos prioritarios" text="El número muestra el orden que utiliza el motor al interpretar tus objetivos." />
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {goals.map((goal) => {
                const priority = selectedGoals.indexOf(goal.code) + 1;
                return <SelectableOption key={goal.code} selected={priority > 0} title={goal.nombre} description={goal.descripcion} badge={priority ? `Prioridad ${priority}` : ""} onClick={() => setSelectedGoals((current) => toggleValue(current, goal.code))} />;
              })}
            </div>
            {!goals.length ? <EmptyState icon={Target} title="No hay objetivos disponibles" description="El catálogo de objetivos está vacío o desactivado." /> : null}
            <SaveRow onSave={saveGoals} disabled={Boolean(saving)} saving={saving === "goals"} label="Guardar objetivos" detail={`${selectedGoals.length} seleccionados`} />
          </div>
        ) : null}

        {activeTab === "clinical" ? (
          <div id="profile-panel-clinical" role="tabpanel" aria-labelledby="profile-tab-clinical" className="space-y-9">
            <div>
              <SectionTitle title="Condiciones clínicas" text="Registra solo condiciones confirmadas. Las de mayor riesgo requieren acompañamiento profesional." />
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {conditions.map((condition) => <SelectableOption key={condition.code} selected={selectedConditions.includes(condition.code)} title={condition.nombre} description={condition.descripcion} badge={condition.requires_professional_guidance ? "Seguimiento profesional" : ""} onClick={() => setSelectedConditions((current) => toggleValue(current, condition.code))} />)}
              </div>
              {!conditions.length ? <EmptyState icon={HeartPulse} title="No hay condiciones disponibles" description="El catálogo clínico está vacío o desactivado." /> : null}
            </div>
            <div className="border-t border-[var(--color-border)] pt-8">
              <SectionTitle title="Restricciones alimentarias" text="Se aplican como exclusiones al evaluar ingredientes y recetas." />
              <label className="block max-w-xl">
                <span className="mb-1.5 block text-xs font-bold text-[var(--color-text-muted)]">Buscar restricción</span>
                <span className="relative block">
                  <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
                  <input
                    type="search"
                    value={restrictionQuery}
                    onChange={(event) => { setRestrictionQuery(event.target.value); setRestrictionPage(1); }}
                    placeholder="Ejemplo: lactosa"
                    className="field-control pl-10"
                  />
                </span>
              </label>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {visibleRestrictions.map((restriction) => {
                  const id = Number(restriction.restriccion_id);
                  return <CompactOption key={id} selected={selectedRestrictions.includes(id)} label={restriction.nombre} onClick={() => setSelectedRestrictions((current) => toggleValue(current, id))} />;
                })}
              </div>
              {!visibleRestrictions.length ? <p className="py-6 text-sm text-[var(--color-text-muted)]">No se encontraron restricciones.</p> : null}
              {filteredRestrictions.length > restrictionPageSize ? <Pagination page={restrictionPage} totalPages={restrictionTotalPages} hasMore={restrictionPage < restrictionTotalPages} onPage={setRestrictionPage} /> : null}
            </div>
            <StatusMessage type="warning" message="Las recomendaciones de NutriEdu son informativas y no reemplazan el seguimiento médico o nutricional." />
            <SaveRow onSave={saveClinical} disabled={Boolean(saving)} saving={saving === "clinical"} label="Guardar salud y restricciones" />
          </div>
        ) : null}

        {activeTab === "targets" ? (
          <div id="profile-panel-targets" role="tabpanel" aria-labelledby="profile-tab-targets">
            <SectionTitle title="Metas y límites diarios" text="El motor distribuye estos valores entre tus comidas. Los campos vacíos no generan alertas." />
            <StatusMessage type="warning" message="Registra límites clínicos únicamente cuando hayan sido indicados por un profesional." />
            <div className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
              {targetGroups.map((group) => (
                <section key={group.title} className="grid gap-5 py-6 lg:grid-cols-[220px_1fr]" aria-labelledby={`target-${group.title.replaceAll(" ", "-").toLowerCase()}`}>
                  <div>
                    <h3 id={`target-${group.title.replaceAll(" ", "-").toLowerCase()}`} className="font-bold text-[var(--color-text)]">{group.title}</h3>
                    <p className="mt-1 text-sm leading-5 text-[var(--color-text-muted)]">{group.description}</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {group.fields.map(([name, label, unit]) => <NumberField key={name} label={label} name={name} value={targets[name]} unit={unit} onChange={(event) => updateValue(setTargets, event)} />)}
                  </div>
                </section>
              ))}
            </div>
            <label className={`${labelClass} mt-5`}>Notas de las metas<textarea className="field-control mt-2 min-h-24 py-3" name="notes" value={targets.notes} onChange={(event) => updateValue(setTargets, event)} /></label>
            <SaveRow onSave={saveTargets} disabled={Boolean(saving)} saving={saving === "targets"} label="Guardar metas nutricionales" detail={`${filledTargets} de 13 valores definidos`} />
          </div>
        ) : null}
      </section>
    </AppShell>
  );
}

function NumberField({ label, name, value, unit, onChange, min = "0", max, step = "0.01" }) {
  return (
    <label className={labelClass}>
      {label}
      <span className="relative mt-2 block">
        <input className={`field-control ${unit ? "pr-14" : ""}`} inputMode="decimal" type="number" name={name} value={value} min={min} max={max} step={step} onChange={onChange} />
        {unit ? <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium text-[var(--color-text-muted)]">{unit}</span> : null}
      </span>
    </label>
  );
}

function SelectField({ label, name, value, options, onChange }) {
  return (
    <label className={labelClass}>
      {label}
      <select className="field-control mt-2" name={name} value={value} onChange={onChange}>
        <option value="">Seleccionar</option>
        {options.map(([optionValue, text]) => <option key={optionValue} value={optionValue}>{text}</option>)}
      </select>
    </label>
  );
}

function SelectableOption({ selected, title, description, badge, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`min-h-28 w-full rounded-lg border p-4 text-left transition ${selected ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]" : "border-[var(--color-border)] bg-white hover:border-green-300"}`}
    >
      <span className="flex items-start justify-between gap-3">
        <span className="font-semibold text-[var(--color-text)]">{title}</span>
        {selected ? <Check aria-hidden="true" className="shrink-0 text-[var(--color-primary)]" size={19} /> : null}
      </span>
      {description ? <span className="mt-2 block text-sm leading-5 text-[var(--color-text-muted)]">{description}</span> : null}
      {badge ? <span className="mt-3 inline-flex rounded-md bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900">{badge}</span> : null}
    </button>
  );
}

function CompactOption({ selected, label, onClick }) {
  return (
    <button type="button" aria-pressed={selected} onClick={onClick} className={`flex min-h-12 items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left text-sm font-semibold transition ${selected ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-green-900" : "border-[var(--color-border)] bg-white text-[var(--color-text)] hover:border-green-300"}`}>
      <span>{label}</span>
      {selected ? <Check aria-hidden="true" className="shrink-0 text-[var(--color-primary)]" size={17} /> : null}
    </button>
  );
}

function SectionTitle({ title, text }) {
  return <div className="mb-6"><h2 className="text-xl font-bold text-[var(--color-text)]">{title}</h2><p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--color-text-muted)]">{text}</p></div>;
}

function SaveRow({ onSave, disabled, saving, label, detail }) {
  return (
    <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[var(--color-border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-[var(--color-text-muted)]">{detail}</p>
      <Button onClick={onSave} disabled={disabled}>
        <Save aria-hidden="true" size={17} />
        {saving ? "Guardando..." : label}
      </Button>
    </div>
  );
}

function ProfileMetric({ label, value }) {
  return <div><p className="text-xs font-semibold text-[var(--color-text-muted)]">{label}</p><p className="mt-1 text-lg font-bold text-[var(--color-text)]">{value}</p></div>;
}

function ProfileSkeleton() {
  return (
    <div className="animate-pulse" aria-label="Cargando perfil de salud" aria-busy="true">
      <div className="h-9 w-64 rounded bg-gray-200" />
      <div className="mt-3 h-5 w-full max-w-xl rounded bg-gray-100" />
      <div className="mt-8 h-20 rounded-lg bg-gray-100" />
      <div className="mt-6 h-12 border-b border-gray-200" />
      <div className="mt-6 h-96 rounded-lg border border-[var(--color-border)] bg-white" />
    </div>
  );
}

function updateValue(setter, event) {
  const { name, value } = event.target;
  setter((current) => ({ ...current, [name]: value }));
}

function toggleValue(values, value) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function localToday() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}
