import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../services/api";

const emptyRule = { id: null, scopeType: "global", scopeCode: "default", nutrient: "calories", ruleType: "max", minValue: "", maxValue: "", unit: "kcal_per_meal", severity: "warning", message: "", isActive: true };
const emptyRestriction = { id: null, nombre: "", descripcion: "", isActive: true };

export default function RulesAndRestrictions() {
  const [section, setSection] = useState("rules");
  return <section className="space-y-6">
    <div><h2 className="text-lg font-bold text-gray-900">Reglas y restricciones</h2><p className="text-sm text-gray-500">Configura criterios nutricionales y conserva el historial al desactivar elementos.</p></div>
    <div className="flex border-b border-gray-200" role="tablist">
      {[['rules', 'Reglas nutricionales'], ['restrictions', 'Restricciones']].map(([id, label]) => <button key={id} role="tab" aria-selected={section === id} onClick={() => setSection(id)} className={`min-h-11 border-b-2 px-4 text-sm font-semibold ${section === id ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500'}`}>{label}</button>)}
    </div>
    {section === "rules" ? <Rules /> : <Restrictions />}
  </section>;
}

function Rules() {
  const [items, setItems] = useState([]);
  const [catalogs, setCatalogs] = useState({ goals: [], conditions: [] });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [scopeFilter, setScopeFilter] = useState("");
  const [form, setForm] = useState(emptyRule);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true); setError("");
      const [rules, clinical] = await Promise.all([api.get("/admin/nutrition-rules", { params: { page, limit: 20, scopeType: scopeFilter || undefined } }), api.get("/admin/clinical-catalogs")]);
      setItems(rules.data.items); setPagination(rules.data.pagination); setCatalogs(clinical.data);
    } catch (requestError) { setError(requestError.response?.data?.message || requestError.response?.data?.error || "No se pudieron consultar las reglas"); }
    finally { setLoading(false); }
  }, [page, scopeFilter]);
  useEffect(() => { void load(); }, [load]);

  const scopeChoices = useMemo(() => form.scopeType === "goal" ? catalogs.goals : form.scopeType === "condition" ? catalogs.conditions : [], [catalogs, form.scopeType]);
  const setScope = (scopeType) => setForm({ ...form, scopeType, scopeCode: scopeType === "global" ? "default" : "" });
  const edit = (item) => setForm({ id: item.id, scopeType: item.scope_type, scopeCode: item.scope_code, nutrient: item.nutrient, ruleType: item.rule_type, minValue: item.min_value ?? "", maxValue: item.max_value ?? "", unit: item.unit, severity: item.severity, message: item.message, isActive: item.is_active });
  const payloadFor = (value) => ({ ...value, minValue: value.minValue === "" ? null : Number(value.minValue), maxValue: value.maxValue === "" ? null : Number(value.maxValue) });
  const save = async (event) => {
    event.preventDefault();
    try { setSaving(true); setError(""); const payload = payloadFor(form); if (form.id) await api.patch(`/admin/nutrition-rules/${form.id}`, payload); else await api.post("/admin/nutrition-rules", payload); setForm(emptyRule); await load(); }
    catch (requestError) { setError(requestError.response?.data?.message || "No se pudo guardar la regla"); }
    finally { setSaving(false); }
  };
  const toggle = async (item) => { try { await api.patch(`/admin/nutrition-rules/${item.id}`, payloadFor({ id: item.id, scopeType: item.scope_type, scopeCode: item.scope_code, nutrient: item.nutrient, ruleType: item.rule_type, minValue: item.min_value, maxValue: item.max_value, unit: item.unit, severity: item.severity, message: item.message, isActive: !item.is_active })); await load(); } catch (requestError) { setError(requestError.response?.data?.message || "No se pudo cambiar el estado"); } };

  return <div className="space-y-5">
    {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
    <form onSubmit={save} className="grid gap-3 border-y border-gray-200 py-5 md:grid-cols-3">
      <Field label="Alcance"><select value={form.scopeType} onChange={(e) => setScope(e.target.value)} className="input-admin"><option value="global">Global</option><option value="goal">Objetivo</option><option value="condition">Condicion</option></select></Field>
      <Field label="Perfil asociado">{form.scopeType === "global" ? <input value="default" disabled className="input-admin bg-gray-50" /> : <select required value={form.scopeCode} onChange={(e) => setForm({ ...form, scopeCode: e.target.value })} className="input-admin"><option value="">Selecciona una opcion</option>{scopeChoices.map((item) => <option key={item.id} value={item.code}>{item.nombre}</option>)}</select>}</Field>
      <Field label="Nutriente"><select value={form.nutrient} onChange={(e) => setForm({ ...form, nutrient: e.target.value })} className="input-admin">{[["calories","Calorias"],["protein_g","Proteina"],["carbs_g","Carbohidratos"],["fat_g","Grasa"],["saturated_fat_g","Grasa saturada"],["sugar_g","Azucar"],["fiber_g","Fibra"],["sodium_mg","Sodio"]].map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
      <Field label="Tipo"><select value={form.ruleType} onChange={(e) => setForm({ ...form, ruleType: e.target.value })} className="input-admin"><option value="min">Minimo</option><option value="max">Maximo</option><option value="range">Rango</option><option value="recommendation">Recomendacion</option></select></Field>
      <Field label="Valor minimo"><input type="number" min="0" step="0.01" value={form.minValue} onChange={(e) => setForm({ ...form, minValue: e.target.value })} required={form.ruleType === "min" || form.ruleType === "range"} className="input-admin" /></Field>
      <Field label="Valor maximo"><input type="number" min="0" step="0.01" value={form.maxValue} onChange={(e) => setForm({ ...form, maxValue: e.target.value })} required={form.ruleType === "max" || form.ruleType === "range"} className="input-admin" /></Field>
      <Field label="Unidad"><input required maxLength="30" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="input-admin" /></Field>
      <Field label="Severidad"><select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} className="input-admin"><option value="info">Informativa</option><option value="warning">Advertencia</option><option value="danger">Critica</option></select></Field>
      <label className="flex min-h-11 items-end gap-3 pb-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Regla activa</label>
      <div className="md:col-span-3"><Field label="Mensaje mostrado al usuario"><textarea required minLength="5" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="min-h-20 w-full rounded-lg border border-gray-300 p-3" /></Field></div>
      <div className="flex justify-end gap-2 md:col-span-3"><button type="button" onClick={() => setForm(emptyRule)} className="min-h-11 rounded-lg border border-gray-300 px-4 text-sm font-semibold">Limpiar</button><button disabled={saving} className="min-h-11 rounded-lg bg-green-600 px-5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Guardando..." : form.id ? "Actualizar" : "Crear regla"}</button></div>
    </form>
    <div className="flex justify-end"><select value={scopeFilter} onChange={(e) => { setScopeFilter(e.target.value); setPage(1); }} className="input-admin max-w-52"><option value="">Todos los alcances</option><option value="global">Global</option><option value="goal">Objetivo</option><option value="condition">Condicion</option></select></div>
    <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-gray-50 text-xs text-gray-500"><tr><th className="p-3">Alcance</th><th className="p-3">Nutriente</th><th className="p-3">Limite</th><th className="p-3">Severidad</th><th className="p-3">Estado</th><th className="p-3 text-right">Acciones</th></tr></thead><tbody>{loading ? <tr><td colSpan="6" className="py-10 text-center text-gray-500">Consultando reglas...</td></tr> : items.map((item) => <tr key={item.id} className="border-t border-gray-100"><td className="p-3"><p className="font-semibold">{item.scope_type}</p><p className="font-mono text-xs text-gray-500">{item.scope_code}</p></td><td className="p-3">{item.nutrient}</td><td className="p-3">{formatLimit(item)}</td><td className="p-3">{item.severity}</td><td className="p-3">{item.is_active ? "Activa" : "Inactiva"}</td><td className="p-3 text-right"><button onClick={() => edit(item)} className="mr-3 font-semibold text-green-700">Editar</button><button onClick={() => void toggle(item)} className="font-semibold text-gray-600">{item.is_active ? "Desactivar" : "Activar"}</button></td></tr>)}</tbody></table></div>
    <Pagination page={pagination.page} totalPages={pagination.totalPages} setPage={setPage} />
  </div>;
}

function Restrictions() {
  const [items, setItems] = useState([]); const [form, setForm] = useState(emptyRestriction); const [query, setQuery] = useState(""); const [search, setSearch] = useState(""); const [error, setError] = useState(""); const [saving, setSaving] = useState(false); const [page, setPage] = useState(1); const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const load = useCallback(async () => { try { setError(""); const response = await api.get("/admin/restrictions", { params: { page, limit: 15, search: search || undefined } }); setItems(response.data.items); setPagination(response.data.pagination); } catch (requestError) { setError(requestError.response?.data?.error || "No se pudieron consultar las restricciones"); } }, [page, search]);
  useEffect(() => { void load(); }, [load]);
  const save = async (event) => { event.preventDefault(); try { setSaving(true); setError(""); if (form.id) await api.patch(`/admin/restrictions/${form.id}`, form); else await api.post("/admin/restrictions", form); setForm(emptyRestriction); await load(); } catch (requestError) { setError(requestError.response?.data?.message || "No se pudo guardar la restriccion"); } finally { setSaving(false); } };
  const toggle = async (item) => { try { await api.patch(`/admin/restrictions/${item.id}`, { nombre: item.nombre, descripcion: item.descripcion || "", isActive: !item.is_active }); await load(); } catch (requestError) { setError(requestError.response?.data?.message || "No se pudo cambiar el estado"); } };
  return <div className="space-y-5">{error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}<form onSubmit={save} className="grid gap-3 border-y border-gray-200 py-5 md:grid-cols-2"><Field label="Nombre"><input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="input-admin" /></Field><label className="flex min-h-11 items-end gap-3 pb-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Disponible para usuarios</label><div className="md:col-span-2"><Field label="Descripcion"><textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="min-h-20 w-full rounded-lg border border-gray-300 p-3" /></Field></div><div className="flex justify-end gap-2 md:col-span-2"><button type="button" onClick={() => setForm(emptyRestriction)} className="min-h-11 rounded-lg border border-gray-300 px-4 text-sm font-semibold">Limpiar</button><button disabled={saving} className="min-h-11 rounded-lg bg-green-600 px-5 text-sm font-semibold text-white">{saving ? "Guardando..." : form.id ? "Actualizar" : "Crear restriccion"}</button></div></form><form onSubmit={(e) => { e.preventDefault(); setPage(1); setSearch(query.trim()); }} className="flex gap-3"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar restriccion" className="input-admin flex-1" /><button className="rounded-lg border border-gray-300 px-5 text-sm font-semibold">Buscar</button></form><p className="text-sm text-gray-500">{pagination.total} restricciones registradas.</p><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-gray-50 text-xs text-gray-500"><tr><th className="p-3">Restriccion</th><th className="p-3">Usuarios</th><th className="p-3">Ingredientes</th><th className="p-3">Estado</th><th className="p-3 text-right">Acciones</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-t border-gray-100"><td className="p-3"><p className="font-semibold">{item.nombre}</p><p className="max-w-xl text-xs text-gray-500">{item.descripcion}</p></td><td className="p-3">{item.users_count}</td><td className="p-3">{item.ingredients_count}</td><td className="p-3">{item.is_active ? "Activa" : "Inactiva"}</td><td className="p-3 text-right"><button onClick={() => setForm({ id: item.id, nombre: item.nombre, descripcion: item.descripcion || "", isActive: item.is_active })} className="mr-3 font-semibold text-green-700">Editar</button><button onClick={() => void toggle(item)} className="font-semibold text-gray-600">{item.is_active ? "Desactivar" : "Activar"}</button></td></tr>)}</tbody></table></div><Pagination page={pagination.page} totalPages={pagination.totalPages} setPage={setPage} /></div>;
}

function Field({ label, children }) { return <label className="block text-xs font-bold text-gray-600">{label}{children}</label>; }
function Pagination({ page, totalPages, setPage }) { return <div className="flex items-center justify-between"><button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold disabled:opacity-40">Anterior</button><span className="text-sm text-gray-500">Pagina {page} de {totalPages}</span><button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold disabled:opacity-40">Siguiente</button></div>; }
function formatLimit(item) { if (item.rule_type === "range") return `${item.min_value} - ${item.max_value} ${item.unit}`; if (item.rule_type === "min") return `Min. ${item.min_value} ${item.unit}`; if (item.rule_type === "max") return `Max. ${item.max_value} ${item.unit}`; return item.unit; }
