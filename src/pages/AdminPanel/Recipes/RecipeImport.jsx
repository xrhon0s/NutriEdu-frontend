import { useRef, useState } from "react";
import { Download, FileJson, Upload, X } from "lucide-react";
import api from "../../../services/api";

const MAX_FILE_BYTES = 2 * 1024 * 1024;

export default function RecipeImport() {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [payload, setPayload] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  const clear = () => {
    setFileName("");
    setPayload(null);
    setPreview(null);
    setStatus(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const selectFile = async (event) => {
    const file = event.target.files?.[0];
    clear();
    if (!file) return;
    setFileName(file.name);
    if (file.size > MAX_FILE_BYTES) {
      setStatus({ type: "error", message: "El archivo supera el límite de 2 MB." });
      return;
    }
    try {
      const parsed = JSON.parse(await file.text());
      setPayload(parsed);
      setStatus({ type: "info", message: "Archivo leído. Ejecuta la vista previa antes de importar." });
    } catch {
      setStatus({ type: "error", message: "El archivo no contiene JSON válido." });
    }
  };

  const downloadTemplate = async () => {
    try {
      setBusy(true);
      const response = await api.get("/admin/recipes/template/catalog", { responseType: "blob" });
      const url = URL.createObjectURL(response.data);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "example.catalog.json";
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setStatus({ type: "error", message: error.response?.data?.message || "No se pudo descargar la plantilla." });
    } finally {
      setBusy(false);
    }
  };

  const requestPreview = async () => {
    if (!payload) return;
    try {
      setBusy(true);
      setStatus(null);
      const response = await api.post("/admin/recipes/import/preview", payload);
      setPreview(response.data);
      setStatus(response.data.valid
        ? { type: "success", message: "Vista previa completa. Revisa los cambios antes de confirmar." }
        : { type: "error", message: "La vista previa encontró problemas que debes corregir." });
    } catch (error) {
      setStatus({ type: "error", message: error.response?.data?.error || "No se pudo generar la vista previa." });
    } finally {
      setBusy(false);
    }
  };

  const executeImport = async () => {
    if (!payload || !preview?.valid || !confirm("¿Importar este catálogo? Las recetas existentes con la misma clave serán actualizadas.")) return;
    try {
      setBusy(true);
      const response = await api.post("/admin/recipes/import", payload);
      setStatus({ type: "success", message: `Importación ${response.data.importId} completada correctamente.` });
      setPreview(null);
    } catch (error) {
      const result = error.response?.data;
      if (result?.errors) setPreview(result);
      setStatus({ type: "error", message: result?.error || "La importación fue rechazada y no se aplicaron cambios." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 pb-5">
        <button type="button" onClick={() => void downloadTemplate()} disabled={busy} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-700 disabled:opacity-50">
          <Download size={18} /> Descargar ejemplo JSON
        </button>
        <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg bg-green-600 px-4 text-sm font-semibold text-white hover:bg-green-700">
          <Upload size={18} /> Seleccionar JSON
          <input ref={inputRef} type="file" accept="application/json,.json" onChange={(event) => void selectFile(event)} className="sr-only" />
        </label>
      </div>

      {fileName ? (
        <div className="flex min-h-12 items-center gap-3 border-y border-gray-200 py-3">
          <FileJson size={20} className="text-green-700" />
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-800">{fileName}</span>
          <button type="button" onClick={clear} title="Quitar archivo" aria-label="Quitar archivo" className="grid h-10 w-10 place-items-center text-gray-500 hover:text-gray-900"><X size={20} /></button>
        </div>
      ) : null}

      {status ? <p className={`rounded-lg border p-3 text-sm ${status.type === "error" ? "border-red-200 bg-red-50 text-red-700" : status.type === "success" ? "border-green-200 bg-green-50 text-green-800" : "border-blue-200 bg-blue-50 text-blue-800"}`}>{status.message}</p> : null}

      {preview ? <PreviewReport preview={preview} /> : null}

      <div className="flex flex-wrap justify-end gap-3 border-t border-gray-200 pt-5">
        <button type="button" onClick={() => void requestPreview()} disabled={!payload || busy} className="min-h-11 rounded-lg border border-gray-300 px-5 text-sm font-semibold text-gray-700 disabled:opacity-40">{busy ? "Procesando..." : "Generar vista previa"}</button>
        <button type="button" onClick={() => void executeImport()} disabled={!preview?.valid || busy} className="min-h-11 rounded-lg bg-green-600 px-5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-40">Importar catálogo</button>
      </div>
    </div>
  );
}

function PreviewReport({ preview }) {
  const metrics = [
    ["Recetas nuevas", preview.summary?.recipesToCreate || 0],
    ["Recetas a actualizar", preview.summary?.recipesToUpdate || 0],
    ["Ingredientes nuevos", preview.summary?.ingredientsToCreate || 0],
    ["Ingredientes a actualizar", preview.summary?.ingredientsToUpdate || 0]
  ];
  return <div className="space-y-5">
    <div className="grid border-y border-gray-200 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map(([label, value]) => <div key={label} className="border-gray-200 p-4 sm:border-r"><p className="text-xs font-semibold text-gray-500">{label}</p><p className="mt-1 text-2xl font-bold text-gray-950">{value}</p></div>)}
    </div>
    <IssueList title="Errores" items={preview.errors} tone="error" />
    <IssueList title="Advertencias" items={preview.warnings} tone="warning" />
  </div>;
}

function IssueList({ title, items = [], tone }) {
  if (!items.length) return null;
  return <div className={`border-l-4 px-4 py-3 ${tone === "error" ? "border-red-500 bg-red-50" : "border-amber-500 bg-amber-50"}`}>
    <h3 className={`font-bold ${tone === "error" ? "text-red-800" : "text-amber-800"}`}>{title} ({items.length})</h3>
    <ul className="mt-2 max-h-64 space-y-2 overflow-y-auto text-sm text-gray-700">
      {items.map((item, index) => <li key={`${item.path}-${item.code}-${index}`}><code className="font-semibold">{item.path}</code>: {item.message}</li>)}
    </ul>
  </div>;
}
