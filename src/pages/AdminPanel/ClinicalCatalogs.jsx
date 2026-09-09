import { useCallback, useEffect, useMemo, useState } from "react";
import { HeartPulse, Pencil, Power, PowerOff, Search, Target, X } from "lucide-react";
import Button from "../../components/Button";
import EmptyState from "../../components/EmptyState";
import Pagination from "../../components/Pagination";
import StatusMessage from "../../components/StatusMessage";
import api from "../../services/api";

const emptyForm = { id: null, code: "", nombre: "", descripcion: "", riskLevel: "medium", requiresProfessionalGuidance: false, isActive: true };
const pageSize = 8;
const catalogs = [{ id: "goals", label: "Objetivos", Icon: Target }, { id: "conditions", label: "Condiciones", Icon: HeartPulse }];

export default function ClinicalCatalogs() {
  const [catalog, setCatalog] = useState("goals");
  const [data, setData] = useState({ goals: [], conditions: [] });
  const [form, setForm] = useState(emptyForm);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingId, setChangingId] = useState(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setData((await api.get("/admin/clinical-catalogs")).data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.response?.data?.error || "No se pudieron consultar los catálogos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const resetForm = () => setForm(emptyForm);

  const selectCatalog = (id) => {
    setCatalog(id);
    setForm(emptyForm);
    setQuery("");
    setPage(1);
    setError("");
    setStatus("");
  };

  const edit = (item) => {
    setForm({
      id: item.id,
      code: item.code,
      nombre: item.nombre,
      descripcion: item.descripcion || "",
      riskLevel: item.risk_level || "medium",
      requiresProfessionalGuidance: item.requires_professional_guidance === true,
      isActive: item.is_active !== false,
    });
    setStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const save = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      setStatus("");
      const payload = { ...form, code: form.code.trim(), nombre: form.nombre.trim(), descripcion: form.descripcion.trim() };
      if (form.id) await api.patch(`/admin/clinical-catalogs/${catalog}/${form.id}`, payload);
      else await api.post(`/admin/clinical-catalogs/${catalog}`, payload);
      setStatus(`${catalog === "goals" ? "Objetivo" : "Condición"} ${form.id ? "actualizado" : "creado"} correctamente.`);
      resetForm();
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "No se pudo guardar el elemento");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (item) => {
    const payload = { code: item.code, nombre: item.nombre, descripcion: item.descripcion || "", riskLevel: item.risk_level || "medium", requiresProfessionalGuidance: item.requires_professional_guidance === true, isActive: !item.is_active };
    try {
      setChangingId(item.id);
      setError("");
      setStatus("");
      await api.patch(`/admin/clinical-catalogs/${catalog}/${item.id}`, payload);
      setStatus(`${item.nombre} ahora está ${item.is_active ? "inactivo" : "activo"}.`);
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "No se pudo cambiar el estado");
    } finally {
      setChangingId(null);
    }
  };

  const filteredItems = useMemo(() => {
    const items = data[catalog] || [];
    const normalizedQuery = normalize(query);
    if (!normalizedQuery) return items;
    return items.filter((item) => normalize(`${item.nombre} ${item.code} ${item.descripcion || ""}`).includes(normalizedQuery));
  }, [catalog, data, query]);
  const catalogTotal = data[catalog]?.length || 0;
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const visibleItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-7">
      <p className="max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">Administra las opciones usadas para construir perfiles y reglas. Desactivar un elemento conserva las relaciones históricas.</p>

      <div className="inline-flex rounded-lg border border-[var(--color-border)] bg-white p-1" role="tablist" aria-label="Catálogo clínico">
        {catalogs.map(({ id, label, Icon }) => <button key={id} type="button" role="tab" aria-selected={catalog === id} onClick={() => selectCatalog(id)} className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors ${catalog === id ? "bg-green-50 text-green-800" : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]"}`}><Icon aria-hidden="true" size={17} />{label}</button>)}
      </div>

      <StatusMessage type="error" message={error} />
      <StatusMessage message={status} />

      <form onSubmit={save} className="border-y border-[var(--color-border)] py-6" aria-labelledby="clinical-form-title">
        <div className="mb-5">
          <h3 id="clinical-form-title" className="text-base font-bold text-[var(--color-text)]">{form.id ? "Editar" : "Crear"} {catalog === "goals" ? "objetivo" : "condición"}</h3>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">El código es una clave estable usada por el motor y debe escribirse en minúsculas, sin espacios.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Código estable"><input required pattern="[a-z][a-z0-9_]{2,79}" title="Usa minúsculas, números y guion bajo; comienza con una letra" value={form.code} onChange={(event) => updateForm("code", event.target.value.toLowerCase().replace(/\s/g, "_"))} className="input-admin mt-1 w-full font-mono" /></Field>
          <Field label="Nombre"><input required minLength="2" maxLength="120" value={form.nombre} onChange={(event) => updateForm("nombre", event.target.value)} className="input-admin mt-1 w-full" /></Field>
          <Field label="Descripción" className="md:col-span-2"><textarea maxLength="1200" value={form.descripcion} onChange={(event) => updateForm("descripcion", event.target.value)} className="input-admin mt-1 min-h-24 w-full resize-y py-3" /></Field>
          {catalog === "conditions" ? <><Field label="Nivel de riesgo"><select value={form.riskLevel} onChange={(event) => updateForm("riskLevel", event.target.value)} className="input-admin mt-1 w-full"><option value="low">Bajo</option><option value="medium">Medio</option><option value="high">Alto</option></select></Field><CheckboxField checked={form.requiresProfessionalGuidance} onChange={(checked) => updateForm("requiresProfessionalGuidance", checked)} label="Requiere orientación profesional" description="Muestra una advertencia de seguimiento en el perfil." /></> : null}
          <CheckboxField checked={form.isActive} onChange={(checked) => updateForm("isActive", checked)} label="Disponible para usuarios" description="Permite seleccionarlo en perfiles nuevos o existentes." />
        </div>
        <div className="mt-5 flex flex-wrap justify-end gap-2"><Button type="button" variant="secondary" onClick={resetForm} disabled={saving}>{form.id ? "Cancelar edición" : "Limpiar"}</Button><Button type="submit" disabled={saving} aria-busy={saving}>{saving ? "Guardando..." : form.id ? "Actualizar" : "Crear"}</Button></div>
      </form>

      <section aria-labelledby="clinical-list-title">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><h3 id="clinical-list-title" className="font-bold text-[var(--color-text)]">{catalog === "goals" ? "Objetivos registrados" : "Condiciones registradas"}</h3><p className="mt-1 text-sm text-[var(--color-text-muted)]">{filteredItems.length} de {catalogTotal} elementos</p></div>
          <label className="relative w-full sm:max-w-xs"><span className="sr-only">Buscar en el catálogo</span><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={17} /><input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Buscar por nombre o código" className="input-admin w-full pl-10 pr-10" />{query ? <button type="button" onClick={() => { setQuery(""); setPage(1); }} className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]" aria-label="Limpiar búsqueda"><X size={17} /></button> : null}</label>
        </div>

        {loading ? <CatalogSkeleton /> : visibleItems.length ? (
          <>
            <div className="space-y-3 md:hidden">{visibleItems.map((item) => <CatalogCard key={item.id} item={item} isCondition={catalog === "conditions"} changing={changingId === item.id} onEdit={edit} onToggle={toggle} />)}</div>
            <div className="hidden overflow-hidden border-y border-[var(--color-border)] md:block"><table className="w-full table-fixed text-left text-sm"><thead className="bg-[var(--color-surface-muted)] text-xs text-[var(--color-text-muted)]"><tr><th className="p-3">Elemento</th><th className="w-40 p-3">Código</th>{catalog === "conditions" ? <th className="w-28 p-3">Riesgo</th> : null}<th className="w-24 p-3">Estado</th><th className="w-48 p-3 text-right">Acciones</th></tr></thead><tbody>{visibleItems.map((item) => <CatalogRow key={item.id} item={item} isCondition={catalog === "conditions"} changing={changingId === item.id} onEdit={edit} onToggle={toggle} />)}</tbody></table></div>
          </>
        ) : <EmptyState icon={catalog === "goals" ? Target : HeartPulse} title="No encontramos elementos" description={query ? "Prueba otra búsqueda o limpia el campo." : `Todavía no hay ${catalog === "goals" ? "objetivos" : "condiciones"} en este catálogo.`} action={query ? <Button variant="secondary" onClick={() => { setQuery(""); setPage(1); }}>Limpiar búsqueda</Button> : null} />}
        {!loading && visibleItems.length ? <Pagination page={page} totalPages={totalPages} hasMore={page < totalPages} onPage={setPage} /> : null}
      </section>
    </div>
  );
}

function CatalogRow({ item, isCondition, changing, onEdit, onToggle }) {
  return <tr className="border-t border-[var(--color-border)] first:border-t-0"><td className="p-3"><p className="font-semibold text-[var(--color-text)]">{item.nombre}</p><p className="mt-1 truncate text-xs text-[var(--color-text-muted)]" title={item.descripcion}>{item.descripcion || "Sin descripción"}</p>{isCondition && item.requires_professional_guidance ? <p className="mt-1 text-xs font-semibold text-amber-800">Requiere orientación profesional</p> : null}</td><td className="truncate p-3 font-mono text-xs" title={item.code}>{item.code}</td>{isCondition ? <td className="p-3"><RiskBadge level={item.risk_level} /></td> : null}<td className="p-3"><ActiveBadge active={item.is_active} /></td><td className="p-3"><CatalogActions item={item} changing={changing} onEdit={onEdit} onToggle={onToggle} /></td></tr>;
}

function CatalogCard({ item, isCondition, changing, onEdit, onToggle }) {
  return <article className="rounded-lg border border-[var(--color-border)] bg-white p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h4 className="font-bold text-[var(--color-text)]">{item.nombre}</h4><code className="mt-1 block truncate text-xs text-[var(--color-text-muted)]">{item.code}</code></div><ActiveBadge active={item.is_active} /></div><p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">{item.descripcion || "Sin descripción"}</p>{isCondition ? <div className="mt-3 flex flex-wrap items-center gap-2"><RiskBadge level={item.risk_level} />{item.requires_professional_guidance ? <span className="text-xs font-semibold text-amber-800">Orientación profesional</span> : null}</div> : null}<div className="mt-4 border-t border-[var(--color-border)] pt-3"><CatalogActions item={item} changing={changing} onEdit={onEdit} onToggle={onToggle} /></div></article>;
}

function CatalogActions({ item, changing, onEdit, onToggle }) {
  const ToggleIcon = item.is_active ? PowerOff : Power;
  return <div className="flex items-center justify-end gap-1"><Button size="sm" variant="ghost" onClick={() => onEdit(item)}><Pencil size={16} /> Editar</Button><Button size="sm" variant="ghost" disabled={changing} onClick={() => void onToggle(item)}><ToggleIcon size={16} /> {changing ? "Cambiando..." : item.is_active ? "Desactivar" : "Activar"}</Button></div>;
}

function Field({ label, className = "", children }) {
  return <label className={className}><span className="text-xs font-bold text-[var(--color-text-muted)]">{label}</span>{children}</label>;
}

function CheckboxField({ checked, onChange, label, description }) {
  return <label className="flex min-h-16 items-start gap-3 rounded-lg border border-[var(--color-border)] bg-white p-3"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 size-4 accent-green-600" /><span><span className="block text-sm font-semibold text-[var(--color-text)]">{label}</span><span className="mt-1 block text-xs leading-5 text-[var(--color-text-muted)]">{description}</span></span></label>;
}

function ActiveBadge({ active }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>{active ? "Activo" : "Inactivo"}</span>;
}

function RiskBadge({ level }) {
  const labels = { low: "Bajo", medium: "Medio", high: "Alto" };
  const styles = { low: "bg-green-100 text-green-800", medium: "bg-amber-100 text-amber-900", high: "bg-red-100 text-red-800" };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${styles[level] || styles.medium}`}>{labels[level] || labels.medium}</span>;
}

function CatalogSkeleton() {
  return <div className="animate-pulse space-y-3" aria-label="Consultando catálogo">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-20 rounded-lg bg-gray-100" />)}</div>;
}

function normalize(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}
