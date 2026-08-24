import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";

const metrics = [
  ["users", "Usuarios"],
  ["profileCoveragePercent", "Perfiles completos", "%"],
  ["recipes", "Recetas"],
  ["ingredients", "Ingredientes"],
  ["activeGoals", "Objetivos activos"],
  ["activeConditions", "Condiciones activas"],
  ["activeRules", "Reglas activas"],
  ["unreadNotifications", "Avisos sin leer"],
];

export default function OperationsOverview() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOverview = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/admin/overview");
      setOverview(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.response?.data?.error || "No se pudo consultar el estado operativo");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadOverview(); }, [loadOverview]);

  if (loading) return <p className="py-10 text-sm text-gray-500">Consultando operacion...</p>;
  if (error) return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      <p>{error}</p>
      <button className="mt-3 font-semibold underline" onClick={loadOverview}>Reintentar</button>
    </div>
  );

  const budgetPercent = overview.vision.monthlyBudgetUsd
    ? Math.min(100, Math.round((overview.vision.committedUsd / overview.vision.monthlyBudgetUsd) * 100))
    : 0;

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Resumen operativo</h2>
            <p className="text-sm text-gray-500">Actualizado {new Date(overview.generatedAt).toLocaleString("es-CO")}</p>
          </div>
          <button onClick={loadOverview} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">Actualizar</button>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {metrics.map(([key, label, suffix = ""]) => (
            <div key={key} className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-xs font-semibold text-gray-500">{label}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{overview.counts[key]}{suffix}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-gray-200 pt-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Consumo de IA este mes</h2>
            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-2xl font-bold text-gray-900">${overview.vision.committedUsd.toFixed(4)}</p>
                <p className="text-sm text-gray-500">de ${overview.vision.monthlyBudgetUsd.toFixed(2)} configurados</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${overview.vision.configured ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                {overview.vision.configured ? `${overview.vision.provider} / ${overview.vision.model}` : "Proveedor desactivado"}
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full bg-green-600" style={{ width: `${budgetPercent}%` }} /></div>
            <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
              <UsageStat label="Total" value={overview.vision.analyses} />
              <UsageStat label="Correctos" value={overview.vision.succeeded} />
              <UsageStat label="Fallidos" value={overview.vision.failed} />
              <UsageStat label="Pendientes" value={overview.vision.pending} />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900">Migraciones incluidas</h2>
            <div className="mt-4 max-h-72 overflow-auto rounded-lg border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-gray-50 text-xs text-gray-500"><tr><th className="px-3 py-2">Version</th><th className="px-3 py-2">Archivo</th><th className="px-3 py-2">Ledger</th></tr></thead>
                <tbody>
                  {overview.migrations.map((migration) => (
                    <tr key={migration.version} className="border-t border-gray-100">
                      <td className="px-3 py-2 font-mono">{migration.version}</td>
                      <td className="px-3 py-2 text-gray-600">{migration.fileName.replace(/^\d{3}_/, "").replace(/\.sql$/, "")}</td>
                      <td className="px-3 py-2"><span className={migration.recorded ? "text-green-700" : "text-amber-700"}>{migration.recorded ? "Registrada" : "Sin registro"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function UsageStat({ label, value }) {
  return <div className="rounded-lg bg-gray-50 px-2 py-3"><p className="font-bold text-gray-900">{value}</p><p className="mt-1 text-gray-500">{label}</p></div>;
}
