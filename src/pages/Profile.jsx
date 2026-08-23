import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";
import StatusMessage from "../components/StatusMessage";

const tabs = [
  ["personal", "Datos personales"],
  ["goals", "Objetivos"],
  ["clinical", "Salud y restricciones"],
  ["targets", "Metas nutricionales"]
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
  notas: ""
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
  notes: ""
};

const targetFields = [
  ["calories_min", "Calorias minimas", "kcal"],
  ["calories_max", "Calorias maximas", "kcal"],
  ["protein_min_g", "Proteina minima", "g"],
  ["protein_max_g", "Proteina maxima", "g"],
  ["carbs_min_g", "Carbohidratos minimos", "g"],
  ["carbs_max_g", "Carbohidratos maximos", "g"],
  ["fat_min_g", "Grasas minimas", "g"],
  ["fat_max_g", "Grasas maximas", "g"],
  ["saturated_fat_max_g", "Grasa saturada maxima", "g"],
  ["sugar_max_g", "Azucar maxima", "g"],
  ["fiber_min_g", "Fibra minima", "g"],
  ["sodium_max_mg", "Sodio maximo", "mg"],
  ["water_min_ml", "Agua minima diaria", "ml"]
];

const inputClass = "mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-gray-900 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100";
const labelClass = "block text-sm font-semibold text-gray-700";
const saveButtonClass = "rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60";

const toggleValue = (values, value) =>
  values.includes(value) ? values.filter((item) => item !== value) : [...values, value];

function NumberField({ label, name, value, unit, onChange, min = "0", step = "0.01" }) {
  return (
    <label className={labelClass}>
      {label}
      <div className="relative">
        <input className={`${inputClass} pr-14`} type="number" name={name} value={value} min={min} step={step} onChange={onChange} />
        {unit && <span className="pointer-events-none absolute inset-y-0 right-3 top-2 flex items-center text-xs font-medium text-gray-400">{unit}</span>}
      </div>
    </label>
  );
}

function SelectField({ label, name, value, options, onChange }) {
  return (
    <label className={labelClass}>
      {label}
      <select className={inputClass} name={name} value={value} onChange={onChange}>
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
      className={`min-h-28 w-full rounded-lg border p-4 text-left transition focus:outline-none focus:ring-4 focus:ring-green-100 ${selected ? "border-green-500 bg-green-50" : "border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/40"}`}
    >
      <span className="flex items-start justify-between gap-3">
        <span className="font-semibold text-gray-900">{title}</span>
        {badge && <span className="shrink-0 rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">{badge}</span>}
      </span>
      {description && <span className="mt-2 block text-sm leading-5 text-gray-500">{description}</span>}
    </button>
  );
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState("personal");
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [profile, setProfile] = useState(initialProfile);
  const [targets, setTargets] = useState(initialTargets);
  const [goals, setGoals] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [restrictions, setRestrictions] = useState([]);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [selectedRestrictions, setSelectedRestrictions] = useState([]);
  const user = useMemo(() => JSON.parse(localStorage.getItem("user")), []);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [catalogs, saved, allRestrictions, userRestrictions] = await Promise.all([
          api.get("/profile/catalogs"),
          api.get("/profile"),
          api.get("/users/restrictions"),
          api.get(`/users/restrictions/${user.id}`)
        ]);
        const savedProfile = saved.data.profile || {};
        const savedTargets = saved.data.targets || {};

        setGoals(catalogs.data.goals || []);
        setConditions(catalogs.data.conditions || []);
        setRestrictions(allRestrictions.data.restrictions || []);
        setSelectedGoals(saved.data.goals.map((goal) => goal.code));
        setSelectedConditions(saved.data.conditions.map((condition) => condition.code));
        setSelectedRestrictions(userRestrictions.data.restrictions.map((item) => Number(item.restriccion_id)));
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
          notas: savedProfile.notas || ""
        });
        setTargets(Object.fromEntries(Object.keys(initialTargets).map((key) => [key, savedTargets[key] ?? ""])));
      } catch (error) {
        console.error(error);
        setMessage(error.response?.data?.error || "No pudimos cargar el perfil clinico");
        setMessageType("error");
      } finally {
        setChecking(false);
      }
    };

    if (user?.id) loadProfile();
  }, [user]);

  const changeProfile = ({ target }) => setProfile((current) => ({ ...current, [target.name]: target.value }));
  const changeTarget = ({ target }) => setTargets((current) => ({ ...current, [target.name]: target.value }));

  const runSave = async (section, action, successMessage) => {
    try {
      setSaving(section);
      setMessage("");
      await action();
      setMessage(successMessage);
      setMessageType("success");
    } catch (error) {
      setMessage(error.response?.data?.message || error.response?.data?.error || "No pudimos guardar los cambios");
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
    notas: profile.notas
  }), "Datos personales actualizados");

  const saveGoals = () => runSave("goals", () => api.put("/profile/goals", { goals: selectedGoals }), "Objetivos actualizados");

  const saveClinical = () => runSave("clinical", () => Promise.all([
    api.put("/profile/conditions", { conditions: selectedConditions, source: "user" }),
    api.post("/users/restrictions", { userId: user.id, restricciones: selectedRestrictions })
  ]), "Condiciones y restricciones actualizadas");

  const saveTargets = () => runSave("targets", () => api.put("/profile/targets", {
    ...targets,
    calculation_source: "manual"
  }), "Metas nutricionales actualizadas");

  if (checking) {
    return <AppShell><div className="flex min-h-64 items-center justify-center"><p className="text-gray-600">Cargando perfil clinico...</p></div></AppShell>;
  }

  return (
    <AppShell>
      <PageHeader title="Perfil de salud" subtitle="Tus datos permiten adaptar recetas, alertas y metas nutricionales a tu contexto." />
      <StatusMessage message={message} type={messageType} />

      <div className="overflow-x-auto border-b border-gray-200">
        <div className="flex min-w-max gap-1" role="tablist" aria-label="Secciones del perfil">
          {tabs.map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={activeTab === id} onClick={() => { setActiveTab(id); setMessage(""); }} className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${activeTab === id ? "border-green-600 text-green-700" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <section className="mt-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
        {activeTab === "personal" && (
          <div role="tabpanel">
            <SectionTitle title="Datos personales y estilo de vida" text="Completa los datos que cambian tus necesidades diarias." />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <label className={labelClass}>Fecha de nacimiento<input className={inputClass} type="date" name="fecha_nacimiento" value={profile.fecha_nacimiento} onChange={changeProfile} /></label>
              <SelectField label="Sexo" name="sexo" value={profile.sexo} onChange={changeProfile} options={[["female", "Femenino"], ["male", "Masculino"], ["other", "Otro"], ["prefer_not_to_say", "Prefiero no indicarlo"]]} />
              <NumberField label="Estatura" name="estatura_cm" value={profile.estatura_cm} unit="cm" onChange={changeProfile} />
              <NumberField label="Peso actual" name="peso_kg" value={profile.peso_kg} unit="kg" onChange={changeProfile} />
              <SelectField label="Nivel de actividad" name="nivel_actividad" value={profile.nivel_actividad} onChange={changeProfile} options={[["sedentary", "Sedentario"], ["light", "Actividad ligera"], ["moderate", "Actividad moderada"], ["high", "Actividad alta"], ["athlete", "Entrenamiento intenso"]]} />
              <SelectField label="Condicion fisica actual" name="condicion_fisica" value={profile.condicion_fisica} onChange={changeProfile} options={[["starting", "Iniciando actividad"], ["active", "Activo"], ["trained", "Entrenado"], ["limited", "Actividad limitada"], ["recovery", "En recuperacion"]]} />
              <NumberField label="Comidas por dia" name="meals_per_day" value={profile.meals_per_day} unit="" min="1" step="1" onChange={changeProfile} />
              <SelectField label="Comidas fuera" name="eats_out_frequency" value={profile.eats_out_frequency} onChange={changeProfile} options={[["rarely", "Casi nunca"], ["weekly", "1 a 2 veces por semana"], ["frequent", "3 o mas veces por semana"], ["daily", "Todos los dias"]]} />
              <SelectField label="Estilo alimentario" name="diet_style" value={profile.diet_style} onChange={changeProfile} options={[["omnivore", "Omnivoro"], ["vegetarian", "Vegetariano"], ["vegan", "Vegano"], ["pescatarian", "Pescetariano"]]} />
              <SelectField label="Tiempo para cocinar" name="cooking_time" value={profile.cooking_time} onChange={changeProfile} options={[["short", "Menos de 20 minutos"], ["medium", "20 a 45 minutos"], ["long", "Mas de 45 minutos"]]} />
            </div>
            <label className={`${labelClass} mt-5`}>Notas adicionales<textarea className={inputClass} name="notas" value={profile.notas} rows="3" onChange={changeProfile} /></label>
            <SaveRow onSave={savePersonal} disabled={Boolean(saving)} saving={saving === "personal"} label="Guardar datos personales" />
          </div>
        )}

        {activeTab === "goals" && (
          <div role="tabpanel">
            <SectionTitle title="Objetivos prioritarios" text="El orden de seleccion define la prioridad de tus objetivos." />
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {goals.map((goal) => <SelectableOption key={goal.code} selected={selectedGoals.includes(goal.code)} title={goal.nombre} description={goal.descripcion} onClick={() => setSelectedGoals((current) => toggleValue(current, goal.code))} />)}
            </div>
            <SaveRow onSave={saveGoals} disabled={Boolean(saving)} saving={saving === "goals"} label="Guardar objetivos" detail={`${selectedGoals.length} seleccionados`} />
          </div>
        )}

        {activeTab === "clinical" && (
          <div role="tabpanel" className="space-y-9">
            <div>
              <SectionTitle title="Condiciones clinicas" text="Registra solo condiciones confirmadas. Las de mayor riesgo requieren acompanamiento profesional." />
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {conditions.map((condition) => <SelectableOption key={condition.code} selected={selectedConditions.includes(condition.code)} title={condition.nombre} description={condition.descripcion} badge={condition.requires_professional_guidance ? "Seguimiento" : ""} onClick={() => setSelectedConditions((current) => toggleValue(current, condition.code))} />)}
              </div>
            </div>
            <div className="border-t border-gray-200 pt-8">
              <SectionTitle title="Restricciones alimentarias" text="Se aplican al evaluar ingredientes y recetas." />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {restrictions.map((restriction) => {
                  const id = Number(restriction.restriccion_id);
                  const selected = selectedRestrictions.includes(id);
                  return <button key={id} type="button" aria-pressed={selected} onClick={() => setSelectedRestrictions((current) => toggleValue(current, id))} className={`min-h-14 rounded-lg border px-4 py-3 text-sm font-semibold transition ${selected ? "border-green-500 bg-green-50 text-green-800" : "border-gray-200 bg-white text-gray-700 hover:border-green-300"}`}>{restriction.nombre}</button>;
                })}
              </div>
            </div>
            <SaveRow onSave={saveClinical} disabled={Boolean(saving)} saving={saving === "clinical"} label="Guardar salud y restricciones" />
          </div>
        )}

        {activeTab === "targets" && (
          <div role="tabpanel">
            <SectionTitle title="Metas y limites por comida" text="Usa valores indicados por un profesional. Los campos vacios no generan alertas." />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {targetFields.map(([name, label, unit]) => <NumberField key={name} label={label} name={name} value={targets[name]} unit={unit} onChange={changeTarget} />)}
            </div>
            <label className={`${labelClass} mt-5`}>Notas de las metas<textarea className={inputClass} name="notes" value={targets.notes} rows="3" onChange={changeTarget} /></label>
            <SaveRow onSave={saveTargets} disabled={Boolean(saving)} saving={saving === "targets"} label="Guardar metas nutricionales" />
          </div>
        )}
      </section>
    </AppShell>
  );
}

function SectionTitle({ title, text }) {
  return <div className="mb-6"><h2 className="text-xl font-bold text-gray-900">{title}</h2><p className="mt-1 text-sm text-gray-500">{text}</p></div>;
}

function SaveRow({ onSave, disabled, saving, label, detail }) {
  return (
    <div className="mt-7 flex items-center justify-between gap-4 border-t border-gray-100 pt-5">
      <p className="text-sm text-gray-500">{detail}</p>
      <button type="button" onClick={onSave} disabled={disabled} className={saveButtonClass}>{saving ? "Guardando..." : label}</button>
    </div>
  );
}
