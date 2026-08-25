import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";

const emptyForm = { id: null, code: "", nombre: "", descripcion: "", riskLevel: "medium", requiresProfessionalGuidance: false, isActive: true };

export default function ClinicalCatalogs() {
  const [catalog, setCatalog] = useState("goals");
  const [data, setData] = useState({ goals: [], conditions: [] });
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try { setLoading(true); setError(""); setData((await api.get("/admin/clinical-catalogs")).data); }
    catch (requestError) { setError(requestError.response?.data?.message || requestError.response?.data?.error || "No se pudieron consultar los catalogos"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const edit = (item) => setForm({
    id: item.id, code: item.code, nombre: item.nombre, descripcion: item.descripcion || "",
    riskLevel: item.risk_level || "medium", requiresProfessionalGuidance: item.requires_professional_guidance === true,
    isActive: item.is_active !== false,
  });
  const save = async (event) => {
    event.preventDefault();
    try {
      setSaving(true); setError("");
      const payload = { ...form };
      if (form.id) await api.patch(`/admin/clinical-catalogs/${catalog}/${form.id}`, payload);
      else await api.post(`/admin/clinical-catalogs/${catalog}`, payload);
      setForm(emptyForm); await load();
    } catch (requestError) { setError(requestError.response?.data?.message || "No se pudo guardar el elemento"); }
    finally { setSaving(false); }
  };
  const toggle = async (item) => {
    const payload = { code: item.code, nombre: item.nombre, descripcion: item.descripcion || "", riskLevel: item.risk_level || "medium", requiresProfessionalGuidance: item.requires_professional_guidance === true, isActive: !item.is_active };
    try { setError(""); await api.patch(`/admin/clinical-catalogs/${catalog}/${item.id}`, payload); await load(); }
    catch (requestError) { setError(requestError.response?.data?.message || "No se pudo cambiar el estado"); }
  };
  const items = data[catalog] || [];

  return <section className="space-y-6">
    <div><h2 className="text-lg font-bold text-gray-900">Catalogos clinicos</h2><p className="text-sm text-gray-500">Administra las opciones disponibles para construir perfiles. Desactivar conserva el historial existente.</p></div>
    <div className="flex border-b border-gray-200" role="tablist">{[["goals", "Objetivos"], ["conditions", "Condiciones"]].map(([id, label]) => <button key={id} role="tab" aria-selected={catalog === id} onClick={() => { setCatalog(id); setForm(emptyForm); }} className={`min-h-11 border-b-2 px-4 text-sm font-semibold ${catalog === id ? "border-green-600 text-green-700" : "border-transparent text-gray-500"}`}>{label}</button>)}</div>
    {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
    <form onSubmit={save} className="grid gap-3 border-y border-gray-200 py-5 md:grid-cols-2">
      <div><label className="text-xs font-bold text-gray-600">Codigo estable</label><input required pattern="[a-z][a-z0-9_]{2,79}" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toLowerCase() })} className="mt-1 min-h-11 w-full rounded-lg border border-gray-300 px-3" /></div>
      <div><label className="text-xs font-bold text-gray-600">Nombre</label><input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="mt-1 min-h-11 w-full rounded-lg border border-gray-300 px-3" /></div>
      <div className="md:col-span-2"><label className="text-xs font-bold text-gray-600">Descripcion</label><textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="mt-1 min-h-24 w-full rounded-lg border border-gray-300 p-3" /></div>
      {catalog === "conditions" ? <><div><label className="text-xs font-bold text-gray-600">Nivel de riesgo</label><select value={form.riskLevel} onChange={(e) => setForm({ ...form, riskLevel: e.target.value })} className="mt-1 min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3"><option value="low">Bajo</option><option value="medium">Medio</option><option value="high">Alto</option></select></div><label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={form.requiresProfessionalGuidance} onChange={(e) => setForm({ ...form, requiresProfessionalGuidance: e.target.checked })} /> Requiere orientacion profesional</label></> : null}
      <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Disponible para usuarios</label>
      <div className="flex justify-end gap-2"><button type="button" onClick={() => setForm(emptyForm)} className="min-h-11 rounded-lg border border-gray-300 px-4 text-sm font-semibold">Limpiar</button><button disabled={saving} className="min-h-11 rounded-lg bg-green-600 px-5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Guardando..." : form.id ? "Actualizar" : "Crear"}</button></div>
    </form>
    <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-gray-50 text-xs text-gray-500"><tr><th className="px-3 py-3">Nombre</th><th className="px-3 py-3">Codigo</th>{catalog === "conditions" ? <th className="px-3 py-3">Riesgo</th> : null}<th className="px-3 py-3">Estado</th><th className="px-3 py-3 text-right">Acciones</th></tr></thead><tbody>{loading ? <tr><td colSpan="5" className="py-10 text-center text-gray-500">Consultando catalogo...</td></tr> : items.map((item) => <tr key={item.id} className="border-t border-gray-100"><td className="px-3 py-3"><p className="font-semibold text-gray-900">{item.nombre}</p><p className="max-w-xl text-xs text-gray-500">{item.descripcion}</p></td><td className="px-3 py-3 font-mono text-xs">{item.code}</td>{catalog === "conditions" ? <td className="px-3 py-3">{item.risk_level}</td> : null}<td className="px-3 py-3">{item.is_active ? "Activo" : "Inactivo"}</td><td className="px-3 py-3 text-right"><button onClick={() => edit(item)} className="mr-3 font-semibold text-green-700">Editar</button><button onClick={() => void toggle(item)} className="font-semibold text-gray-600">{item.is_active ? "Desactivar" : "Activar"}</button></td></tr>)}</tbody></table></div>
  </section>;
}
