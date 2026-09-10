import { useCallback, useEffect, useMemo, useState } from "react";
import { Ban, Pencil, Power, PowerOff, Search, ShieldCheck, X } from "lucide-react";
import Button from "../../components/Button";
import EmptyState from "../../components/EmptyState";
import Pagination from "../../components/Pagination";
import StatusMessage from "../../components/StatusMessage";
import api from "../../services/api";

const nutrientOptions = [
  ["calories", "Calorías"], ["protein_g", "Proteína"], ["carbs_g", "Carbohidratos"],
  ["fat_g", "Grasa"], ["saturated_fat_g", "Grasa saturada"], ["sugar_g", "Azúcar"],
  ["fiber_g", "Fibra"], ["sodium_mg", "Sodio"],
];
const nutrientLabels = Object.fromEntries(nutrientOptions);
const scopeLabels = { global: "Global", goal: "Objetivo", condition: "Condición" };
const severityLabels = { info: "Informativa", warning: "Advertencia", danger: "Crítica" };
const emptyRule = { id: null, scopeType: "global", scopeCode: "default", nutrient: "calories", ruleType: "max", minValue: "", maxValue: "", unit: "kcal_per_meal", severity: "warning", message: "", isActive: true };
const emptyRestriction = { id: null, nombre: "", descripcion: "", isActive: true };

export default function RulesAndRestrictions() {
  const [section, setSection] = useState("rules");
  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">Configura cómo se evalúan los nutrientes y qué ingredientes deben evitarse. Desactivar conserva el historial.</p>
      <div className="inline-flex rounded-lg border border-[var(--color-border)] bg-white p-1" role="tablist" aria-label="Reglas y restricciones">
        <SectionTab id="rules" label="Reglas nutricionales" Icon={ShieldCheck} active={section === "rules"} onSelect={setSection} />
        <SectionTab id="restrictions" label="Restricciones" Icon={Ban} active={section === "restrictions"} onSelect={setSection} />
      </div>
      {section === "rules" ? <Rules /> : <Restrictions />}
    </div>
  );
}

function Rules() {
  const [items, setItems] = useState([]);
  const [catalogs, setCatalogs] = useState({ goals: [], conditions: [] });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [scopeFilter, setScopeFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [form, setForm] = useState(emptyRule);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingId, setChangingId] = useState(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const loadRules = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/admin/nutrition-rules", { params: { page, limit: 20, scopeType: scopeFilter || undefined, active: activeFilter || undefined } });
      setItems(response.data.items);
      setPagination(response.data.pagination);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.response?.data?.error || "No se pudieron consultar las reglas");
    } finally {
      setLoading(false);
    }
  }, [activeFilter, page, scopeFilter]);

  useEffect(() => { void loadRules(); }, [loadRules]);
  useEffect(() => {
    api.get("/admin/clinical-catalogs")
      .then((response) => setCatalogs(response.data))
      .catch((requestError) => setError(requestError.response?.data?.message || "No se pudieron consultar los perfiles asociados"));
  }, []);

  const scopeChoices = useMemo(() => form.scopeType === "goal" ? catalogs.goals : form.scopeType === "condition" ? catalogs.conditions : [], [catalogs, form.scopeType]);
  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const resetForm = () => setForm(emptyRule);

  const setScope = (scopeType) => setForm((current) => ({ ...current, scopeType, scopeCode: scopeType === "global" ? "default" : "" }));
  const setNutrient = (nutrient) => setForm((current) => ({ ...current, nutrient, unit: unitForNutrient(nutrient) }));
  const setRuleType = (ruleType) => setForm((current) => ({ ...current, ruleType, minValue: ["min", "range"].includes(ruleType) ? current.minValue : "", maxValue: ["max", "range"].includes(ruleType) ? current.maxValue : "" }));

  const edit = (item) => {
    setForm({ id: item.id, scopeType: item.scope_type, scopeCode: item.scope_code, nutrient: item.nutrient, ruleType: item.rule_type, minValue: item.min_value ?? "", maxValue: item.max_value ?? "", unit: item.unit, severity: item.severity, message: item.message, isActive: item.is_active });
    setStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const payloadFor = (value) => ({ ...value, minValue: value.minValue === "" ? null : Number(value.minValue), maxValue: value.maxValue === "" ? null : Number(value.maxValue) });
  const save = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      setStatus("");
      const payload = payloadFor({ ...form, message: form.message.trim() });
      if (form.id) await api.patch(`/admin/nutrition-rules/${form.id}`, payload);
      else await api.post("/admin/nutrition-rules", payload);
      setStatus(`Regla ${form.id ? "actualizada" : "creada"} correctamente.`);
      resetForm();
      await loadRules();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "No se pudo guardar la regla");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (item) => {
    try {
      setChangingId(item.id);
      setError("");
      setStatus("");
      await api.patch(`/admin/nutrition-rules/${item.id}`, payloadFor({ id: item.id, scopeType: item.scope_type, scopeCode: item.scope_code, nutrient: item.nutrient, ruleType: item.rule_type, minValue: item.min_value, maxValue: item.max_value, unit: item.unit, severity: item.severity, message: item.message, isActive: !item.is_active }));
      setStatus(`La regla ahora está ${item.is_active ? "inactiva" : "activa"}.`);
      await loadRules();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "No se pudo cambiar el estado");
    } finally {
      setChangingId(null);
    }
  };

  const hasFilters = Boolean(scopeFilter || activeFilter);

  return (
    <div className="space-y-6">
      <StatusMessage type="error" message={error} />
      <StatusMessage message={status} />
      <form onSubmit={save} className="border-y border-[var(--color-border)] py-6" aria-labelledby="rule-form-title">
        <div className="mb-5"><h3 id="rule-form-title" className="font-bold text-[var(--color-text)]">{form.id ? "Editar regla" : "Crear regla nutricional"}</h3><p className="mt-1 text-sm text-[var(--color-text-muted)]">Los límites se evalúan por comida y se aplican según el objetivo o condición del perfil.</p></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field label="Alcance"><select value={form.scopeType} onChange={(event) => setScope(event.target.value)} className="input-admin mt-1 w-full"><option value="global">Global</option><option value="goal">Objetivo</option><option value="condition">Condición</option></select></Field>
          <Field label="Perfil asociado">{form.scopeType === "global" ? <input value="Regla general" disabled className="input-admin mt-1 w-full bg-[var(--color-surface-muted)]" /> : <select required value={form.scopeCode} onChange={(event) => updateForm("scopeCode", event.target.value)} className="input-admin mt-1 w-full"><option value="">Selecciona una opción</option>{scopeChoices.map((item) => <option key={item.id} value={item.code}>{item.nombre}</option>)}</select>}</Field>
          <Field label="Nutriente"><select value={form.nutrient} onChange={(event) => setNutrient(event.target.value)} className="input-admin mt-1 w-full">{nutrientOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
          <Field label="Tipo de regla"><select value={form.ruleType} onChange={(event) => setRuleType(event.target.value)} className="input-admin mt-1 w-full"><option value="min">Mínimo</option><option value="max">Máximo</option><option value="range">Rango</option><option value="recommendation">Recomendación</option></select></Field>
          <Field label="Valor mínimo"><input type="number" min="0" step="0.01" value={form.minValue} onChange={(event) => updateForm("minValue", event.target.value)} required={form.ruleType === "min" || form.ruleType === "range"} disabled={!['min', 'range'].includes(form.ruleType)} className="input-admin mt-1 w-full disabled:bg-[var(--color-surface-muted)]" /></Field>
          <Field label="Valor máximo"><input type="number" min="0" step="0.01" value={form.maxValue} onChange={(event) => updateForm("maxValue", event.target.value)} required={form.ruleType === "max" || form.ruleType === "range"} disabled={!['max', 'range'].includes(form.ruleType)} className="input-admin mt-1 w-full disabled:bg-[var(--color-surface-muted)]" /></Field>
          <Field label="Unidad"><input value={form.unit} readOnly className="input-admin mt-1 w-full bg-[var(--color-surface-muted)] font-mono text-xs" /></Field>
          <Field label="Severidad"><select value={form.severity} onChange={(event) => updateForm("severity", event.target.value)} className="input-admin mt-1 w-full"><option value="info">Informativa</option><option value="warning">Advertencia</option><option value="danger">Crítica</option></select></Field>
          <CheckboxField checked={form.isActive} onChange={(checked) => updateForm("isActive", checked)} label="Regla activa" description="Permite que el motor la use en evaluaciones y recomendaciones." />
          <Field label="Mensaje mostrado al usuario" className="md:col-span-2 xl:col-span-3"><textarea required minLength="5" maxLength="1200" value={form.message} onChange={(event) => updateForm("message", event.target.value)} className="input-admin mt-1 min-h-24 w-full resize-y py-3" /></Field>
        </div>
        <div className="mt-5 flex flex-wrap justify-end gap-2"><Button type="button" variant="secondary" onClick={resetForm} disabled={saving}>{form.id ? "Cancelar edición" : "Limpiar"}</Button><Button type="submit" disabled={saving} aria-busy={saving}>{saving ? "Guardando..." : form.id ? "Actualizar" : "Crear regla"}</Button></div>
      </form>

      <section aria-labelledby="rules-list-title">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h3 id="rules-list-title" className="font-bold text-[var(--color-text)]">Reglas registradas</h3><p className="mt-1 text-sm text-[var(--color-text-muted)]">{pagination.total} resultados</p></div><div className="grid gap-2 sm:grid-cols-2"><label><span className="sr-only">Filtrar por alcance</span><select value={scopeFilter} onChange={(event) => { setScopeFilter(event.target.value); setPage(1); }} className="input-admin w-full"><option value="">Todos los alcances</option><option value="global">Global</option><option value="goal">Objetivo</option><option value="condition">Condición</option></select></label><label><span className="sr-only">Filtrar por estado</span><select value={activeFilter} onChange={(event) => { setActiveFilter(event.target.value); setPage(1); }} className="input-admin w-full"><option value="">Todos los estados</option><option value="true">Activas</option><option value="false">Inactivas</option></select></label></div></div>
        {hasFilters ? <div className="mb-3 flex justify-end"><Button size="sm" variant="ghost" onClick={() => { setScopeFilter(""); setActiveFilter(""); setPage(1); }}>Limpiar filtros</Button></div> : null}
        {loading ? <ListSkeleton label="Consultando reglas" /> : items.length ? <><div className="space-y-3 md:hidden">{items.map((item) => <RuleCard key={item.id} item={item} changing={changingId === item.id} onEdit={edit} onToggle={toggle} />)}</div><div className="hidden overflow-hidden border-y border-[var(--color-border)] md:block"><table className="w-full table-fixed text-left text-sm"><thead className="bg-[var(--color-surface-muted)] text-xs text-[var(--color-text-muted)]"><tr><th className="p-3">Alcance</th><th className="w-32 p-3">Nutriente</th><th className="w-40 p-3">Límite</th><th className="hidden w-28 p-3 lg:table-cell">Severidad</th><th className="w-44 p-3 text-right">Acciones</th></tr></thead><tbody>{items.map((item) => <RuleRow key={item.id} item={item} changing={changingId === item.id} onEdit={edit} onToggle={toggle} />)}</tbody></table></div></> : <EmptyState icon={ShieldCheck} title="No encontramos reglas" description={hasFilters ? "Limpia los filtros para revisar otras reglas." : "Todavía no hay reglas nutricionales registradas."} action={hasFilters ? <Button variant="secondary" onClick={() => { setScopeFilter(""); setActiveFilter(""); setPage(1); }}>Limpiar filtros</Button> : null} />}
        {!loading && items.length ? <Pagination page={pagination.page} totalPages={pagination.totalPages} hasMore={page < pagination.totalPages} onPage={setPage} /> : null}
      </section>
    </div>
  );
}

function Restrictions() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyRestriction);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingId, setChangingId] = useState(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/admin/restrictions", { params: { page, limit: 15, search: search || undefined } });
      setItems(response.data.items);
      setPagination(response.data.pagination);
    } catch (requestError) {
      setError(requestError.response?.data?.error || "No se pudieron consultar las restricciones");
    } finally {
      setLoading(false);
    }
  }, [page, search]);
  useEffect(() => { void load(); }, [load]);

  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const save = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      setStatus("");
      const payload = { ...form, nombre: form.nombre.trim(), descripcion: form.descripcion.trim() };
      if (form.id) await api.patch(`/admin/restrictions/${form.id}`, payload);
      else await api.post("/admin/restrictions", payload);
      setStatus(`Restricción ${form.id ? "actualizada" : "creada"} correctamente.`);
      setForm(emptyRestriction);
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "No se pudo guardar la restricción");
    } finally {
      setSaving(false);
    }
  };
  const toggle = async (item) => {
    try {
      setChangingId(item.id);
      setError("");
      setStatus("");
      await api.patch(`/admin/restrictions/${item.id}`, { nombre: item.nombre, descripcion: item.descripcion || "", isActive: !item.is_active });
      setStatus(`${item.nombre} ahora está ${item.is_active ? "inactiva" : "activa"}.`);
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "No se pudo cambiar el estado");
    } finally {
      setChangingId(null);
    }
  };
  const edit = (item) => {
    setForm({ id: item.id, nombre: item.nombre, descripcion: item.descripcion || "", isActive: item.is_active });
    setStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const clearSearch = () => { setQuery(""); setSearch(""); setPage(1); };

  return (
    <div className="space-y-6">
      <StatusMessage type="error" message={error} />
      <StatusMessage message={status} />
      <form onSubmit={save} className="border-y border-[var(--color-border)] py-6" aria-labelledby="restriction-form-title">
        <div className="mb-5"><h3 id="restriction-form-title" className="font-bold text-[var(--color-text)]">{form.id ? "Editar restricción" : "Crear restricción"}</h3><p className="mt-1 text-sm text-[var(--color-text-muted)]">El nombre se normaliza en backend y no puede duplicar otra restricción.</p></div>
        <div className="grid gap-4 md:grid-cols-2"><Field label="Nombre"><input required minLength="2" maxLength="120" value={form.nombre} onChange={(event) => updateForm("nombre", event.target.value)} className="input-admin mt-1 w-full" /></Field><CheckboxField checked={form.isActive} onChange={(checked) => updateForm("isActive", checked)} label="Disponible para usuarios" description="Puede seleccionarse y participar en validaciones de seguridad." /><Field label="Descripción" className="md:col-span-2"><textarea maxLength="1200" value={form.descripcion} onChange={(event) => updateForm("descripcion", event.target.value)} className="input-admin mt-1 min-h-24 w-full resize-y py-3" /></Field></div>
        <div className="mt-5 flex flex-wrap justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setForm(emptyRestriction)} disabled={saving}>{form.id ? "Cancelar edición" : "Limpiar"}</Button><Button type="submit" disabled={saving} aria-busy={saving}>{saving ? "Guardando..." : form.id ? "Actualizar" : "Crear restricción"}</Button></div>
      </form>
      <section aria-labelledby="restrictions-list-title">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h3 id="restrictions-list-title" className="font-bold text-[var(--color-text)]">Restricciones registradas</h3><p className="mt-1 text-sm text-[var(--color-text-muted)]">{pagination.total} resultados</p></div><form onSubmit={(event) => { event.preventDefault(); setPage(1); setSearch(query.trim()); }} className="flex w-full gap-2 sm:max-w-md" role="search"><label className="relative min-w-0 flex-1"><span className="sr-only">Buscar restricciones</span><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={17} /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar restricción" className="input-admin w-full pl-10 pr-10" />{query ? <button type="button" onClick={() => setQuery("")} className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]" aria-label="Limpiar texto"><X size={17} /></button> : null}</label><Button type="submit" variant="secondary"><Search size={17} /><span className="sr-only sm:not-sr-only">Buscar</span></Button></form></div>
        {search ? <div className="mb-3 flex justify-end"><Button size="sm" variant="ghost" onClick={clearSearch}>Limpiar búsqueda</Button></div> : null}
        {loading ? <ListSkeleton label="Consultando restricciones" /> : items.length ? <><div className="space-y-3 md:hidden">{items.map((item) => <RestrictionCard key={item.id} item={item} changing={changingId === item.id} onEdit={edit} onToggle={toggle} />)}</div><div className="hidden overflow-hidden border-y border-[var(--color-border)] md:block"><table className="w-full table-fixed text-left text-sm"><thead className="bg-[var(--color-surface-muted)] text-xs text-[var(--color-text-muted)]"><tr><th className="p-3">Restricción</th><th className="w-28 p-3">Usuarios</th><th className="hidden w-32 p-3 lg:table-cell">Ingredientes</th><th className="w-24 p-3">Estado</th><th className="w-44 p-3 text-right">Acciones</th></tr></thead><tbody>{items.map((item) => <RestrictionRow key={item.id} item={item} changing={changingId === item.id} onEdit={edit} onToggle={toggle} />)}</tbody></table></div></> : <EmptyState icon={Ban} title="No encontramos restricciones" description={search ? "Prueba otra búsqueda o limpia el filtro." : "Todavía no hay restricciones registradas."} action={search ? <Button variant="secondary" onClick={clearSearch}>Limpiar búsqueda</Button> : null} />}
        {!loading && items.length ? <Pagination page={pagination.page} totalPages={pagination.totalPages} hasMore={page < pagination.totalPages} onPage={setPage} /> : null}
      </section>
    </div>
  );
}

function RuleRow({ item, changing, onEdit, onToggle }) {
  return <tr className="border-t border-[var(--color-border)] first:border-t-0"><td className="p-3"><p className="font-semibold text-[var(--color-text)]">{scopeLabels[item.scope_type] || item.scope_type}</p><p className="mt-1 truncate font-mono text-xs text-[var(--color-text-muted)]">{item.scope_code}</p><p className="mt-1 truncate text-xs text-[var(--color-text-muted)]" title={item.message}>{item.message}</p></td><td className="p-3">{nutrientLabels[item.nutrient] || item.nutrient}</td><td className="p-3">{formatLimit(item)}</td><td className="hidden p-3 lg:table-cell"><SeverityBadge severity={item.severity} /></td><td className="p-3"><ItemActions item={item} changing={changing} onEdit={onEdit} onToggle={onToggle} /></td></tr>;
}
function RuleCard({ item, changing, onEdit, onToggle }) {
  return <article className="rounded-lg border border-[var(--color-border)] bg-white p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-[var(--color-text-muted)]">{scopeLabels[item.scope_type] || item.scope_type} · {item.scope_code}</p><h4 className="mt-1 font-bold text-[var(--color-text)]">{nutrientLabels[item.nutrient] || item.nutrient}</h4></div><ActiveBadge active={item.is_active} /></div><p className="mt-3 text-sm font-semibold text-[var(--color-text)]">{formatLimit(item)}</p><p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">{item.message}</p><div className="mt-3"><SeverityBadge severity={item.severity} /></div><div className="mt-4 border-t border-[var(--color-border)] pt-3"><ItemActions item={item} changing={changing} onEdit={onEdit} onToggle={onToggle} /></div></article>;
}
function RestrictionRow({ item, changing, onEdit, onToggle }) {
  return <tr className="border-t border-[var(--color-border)] first:border-t-0"><td className="p-3"><p className="font-semibold text-[var(--color-text)]">{item.nombre}</p><p className="mt-1 truncate text-xs text-[var(--color-text-muted)]" title={item.descripcion}>{item.descripcion || "Sin descripción"}</p></td><td className="p-3">{item.users_count}</td><td className="hidden p-3 lg:table-cell">{item.ingredients_count}</td><td className="p-3"><ActiveBadge active={item.is_active} /></td><td className="p-3"><ItemActions item={item} changing={changing} onEdit={onEdit} onToggle={onToggle} /></td></tr>;
}
function RestrictionCard({ item, changing, onEdit, onToggle }) {
  return <article className="rounded-lg border border-[var(--color-border)] bg-white p-4"><div className="flex items-start justify-between gap-3"><h4 className="font-bold text-[var(--color-text)]">{item.nombre}</h4><ActiveBadge active={item.is_active} /></div><p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">{item.descripcion || "Sin descripción"}</p><div className="mt-3 flex gap-4 text-xs text-[var(--color-text-muted)]"><span><strong className="text-[var(--color-text)]">{item.users_count}</strong> usuarios</span><span><strong className="text-[var(--color-text)]">{item.ingredients_count}</strong> ingredientes</span></div><div className="mt-4 border-t border-[var(--color-border)] pt-3"><ItemActions item={item} changing={changing} onEdit={onEdit} onToggle={onToggle} /></div></article>;
}

function ItemActions({ item, changing, onEdit, onToggle }) {
  const ToggleIcon = item.is_active ? PowerOff : Power;
  return <div className="flex items-center justify-end gap-1"><Button size="sm" variant="ghost" onClick={() => onEdit(item)}><Pencil size={16} /> Editar</Button><Button size="sm" variant="ghost" disabled={changing} onClick={() => void onToggle(item)}><ToggleIcon size={16} /> {changing ? "Cambiando..." : item.is_active ? "Desactivar" : "Activar"}</Button></div>;
}
function SectionTab({ id, label, Icon, active, onSelect }) {
  return <button type="button" role="tab" aria-selected={active} onClick={() => onSelect(id)} className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors ${active ? "bg-green-50 text-green-800" : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]"}`}><Icon aria-hidden="true" size={17} />{label}</button>;
}
function Field({ label, className = "", children }) {
  return <label className={className}><span className="text-xs font-bold text-[var(--color-text-muted)]">{label}</span>{children}</label>;
}
function CheckboxField({ checked, onChange, label, description }) {
  return <label className="flex min-h-16 items-start gap-3 rounded-lg border border-[var(--color-border)] bg-white p-3"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 size-4 accent-green-600" /><span><span className="block text-sm font-semibold text-[var(--color-text)]">{label}</span><span className="mt-1 block text-xs leading-5 text-[var(--color-text-muted)]">{description}</span></span></label>;
}
function ActiveBadge({ active }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>{active ? "Activa" : "Inactiva"}</span>;
}
function SeverityBadge({ severity }) {
  const styles = { info: "bg-sky-100 text-sky-800", warning: "bg-amber-100 text-amber-900", danger: "bg-red-100 text-red-800" };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${styles[severity] || styles.warning}`}>{severityLabels[severity] || severity}</span>;
}
function ListSkeleton({ label }) {
  return <div className="animate-pulse space-y-3" aria-label={label}>{Array.from({ length: 5 }, (_, index) => <div key={index} className="h-20 rounded-lg bg-gray-100" />)}</div>;
}
function unitForNutrient(nutrient) {
  if (nutrient === "calories") return "kcal_per_meal";
  if (nutrient === "sodium_mg") return "mg_per_meal";
  return "g_per_meal";
}
function formatLimit(item) {
  if (item.rule_type === "range") return `${item.min_value}–${item.max_value} ${item.unit}`;
  if (item.rule_type === "min") return `Mín. ${item.min_value} ${item.unit}`;
  if (item.rule_type === "max") return `Máx. ${item.max_value} ${item.unit}`;
  return `Recomendación · ${item.unit}`;
}
