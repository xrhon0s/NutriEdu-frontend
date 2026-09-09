import { useCallback, useEffect, useState } from "react";
import { Bot, CircleAlert, Coins, RefreshCw, Search, Sparkles, X, Zap } from "lucide-react";
import Button from "../../components/Button";
import EmptyState from "../../components/EmptyState";
import Pagination from "../../components/Pagination";
import StatusMessage from "../../components/StatusMessage";
import api from "../../services/api";

export default function VisionUsageAdmin() {
  const [data, setData] = useState({ items: [], summary: {}, policy: {}, pagination: { page: 1, totalPages: 1, total: 0 } });
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/admin/vision-usage", { params: { page, limit: 20, status: status || undefined, search: search || undefined } });
      setData(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.response?.data?.error || "No se pudo consultar el uso de IA");
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => { void load(); }, [load]);

  const submitSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(query.trim());
  };
  const clearFilters = () => {
    setQuery("");
    setSearch("");
    setStatus("");
    setPage(1);
  };
  const hasFilters = Boolean(search || status);
  const summary = data.summary || {};
  const successRate = Number(summary.total) ? Math.round((Number(summary.succeeded || 0) / Number(summary.total)) * 100) : 0;

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <p className="max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">Audita análisis visuales, errores, tokens y costos. Los límites son configuración protegida del backend y aquí se muestran en modo de solo lectura.</p>
        <Button variant="secondary" size="sm" onClick={() => void load()} disabled={loading}><RefreshCw aria-hidden="true" size={16} /> Actualizar</Button>
      </div>
      <StatusMessage type="error" message={error} />

      <section aria-labelledby="vision-summary-title">
        <div className="mb-3 flex items-end justify-between gap-3"><div><h3 id="vision-summary-title" className="font-bold text-[var(--color-text)]">{hasFilters ? "Resumen filtrado" : "Resumen de uso"}</h3><p className="mt-1 text-sm text-[var(--color-text-muted)]">Totales para la consulta actual.</p></div>{hasFilters ? <Button size="sm" variant="ghost" onClick={clearFilters}>Limpiar filtros</Button> : null}</div>
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <Metric label="Solicitudes" value={summary.total ?? 0} Icon={Sparkles} />
          <Metric label="Tasa de éxito" value={`${successRate}%`} Icon={Zap} />
          <Metric label="Tokens" value={formatNumber(summary.total_tokens ?? 0)} Icon={Bot} />
          <Metric label="Costo comprometido" value={formatCost(summary.committed_usd)} Icon={Coins} />
        </div>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--color-text-muted)]"><span><strong className="text-green-700">{summary.succeeded ?? 0}</strong> exitosos</span><span><strong className="text-red-700">{summary.failed ?? 0}</strong> fallidos</span><span><strong className="text-amber-700">{summary.pending ?? 0}</strong> pendientes</span></div>
      </section>

      <section className="border-y border-[var(--color-border)] py-6" aria-labelledby="vision-policy-title">
        <h3 id="vision-policy-title" className="font-bold text-[var(--color-text)]">Política de costo activa</h3>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">Cambiar estos valores requiere actualizar las variables de entorno del backend.</p>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <PolicyValue label="Límite diario por usuario" value={data.policy.dailyLimitPerUser ?? "Sin configurar"} />
          <PolicyValue label="Presupuesto mensual" value={formatCost(data.policy.monthlyBudgetUsd, 2)} />
          <PolicyValue label="Reserva por análisis" value={formatCost(data.policy.reservationUsd)} />
        </dl>
      </section>

      <section aria-labelledby="vision-audit-title">
        <div className="mb-4"><h3 id="vision-audit-title" className="font-bold text-[var(--color-text)]">Registro de análisis</h3><p className="mt-1 text-sm text-[var(--color-text-muted)]">{data.pagination.total ?? summary.total ?? 0} solicitudes encontradas</p></div>
        <form onSubmit={submitSearch} className="mb-5 grid gap-3 sm:grid-cols-[minmax(220px,1fr)_190px_auto]" role="search">
          <label className="relative min-w-0"><span className="sr-only">Buscar usuario o correo</span><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar usuario o correo" className="input-admin w-full pl-10 pr-10" />{query ? <button type="button" onClick={() => setQuery("")} className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]" aria-label="Limpiar texto"><X size={17} /></button> : null}</label>
          <label><span className="sr-only">Filtrar por estado</span><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="input-admin w-full"><option value="">Todos los estados</option><option value="succeeded">Exitosos</option><option value="failed">Fallidos</option><option value="pending">Pendientes</option></select></label>
          <Button type="submit" variant="secondary"><Search size={17} /> Buscar</Button>
        </form>

        {loading ? <AuditSkeleton /> : data.items.length ? <><div className="space-y-3 md:hidden">{data.items.map((item) => <UsageCard key={item.request_id} item={item} />)}</div><div className="hidden overflow-hidden border-y border-[var(--color-border)] md:block"><table className="w-full table-fixed text-left text-sm"><thead className="bg-[var(--color-surface-muted)] text-xs text-[var(--color-text-muted)]"><tr><th className="w-40 p-3">Fecha</th><th className="p-3">Usuario</th><th className="hidden w-40 p-3 lg:table-cell">Proveedor</th><th className="w-28 p-3">Estado</th><th className="w-28 p-3">Consumo</th><th className="hidden w-36 p-3 xl:table-cell">Referencia</th></tr></thead><tbody>{data.items.map((item) => <UsageRow key={item.request_id} item={item} />)}</tbody></table></div></> : <EmptyState icon={hasFilters ? Search : Bot} title="No hay análisis para mostrar" description={hasFilters ? "Ajusta o limpia los filtros para consultar otras solicitudes." : "Todavía no se han registrado análisis visuales."} action={hasFilters ? <Button variant="secondary" onClick={clearFilters}>Limpiar filtros</Button> : null} />}
        {!loading && data.items.length ? <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} hasMore={page < data.pagination.totalPages} onPage={setPage} /> : null}
      </section>
    </div>
  );
}

function UsageRow({ item }) {
  return <tr className="border-t border-[var(--color-border)] first:border-t-0"><td className="p-3 text-xs text-[var(--color-text-muted)]">{formatDate(item.created_at)}</td><td className="p-3"><p className="truncate font-semibold text-[var(--color-text)]" title={item.user_name}>{item.user_name}</p><p className="mt-1 truncate text-xs text-[var(--color-text-muted)]" title={item.user_email}>{item.user_email}</p></td><td className="hidden p-3 lg:table-cell"><p>{item.provider}</p><p className="mt-1 truncate text-xs text-[var(--color-text-muted)]" title={item.model}>{item.model}</p></td><td className="p-3"><StatusBadge status={item.status} errorCode={item.error_code} /></td><td className="p-3"><p>{formatNumber(item.total_tokens ?? 0)} tokens</p><p className="mt-1 text-xs text-[var(--color-text-muted)]">{formatCost(costFor(item))}</p></td><td className="hidden p-3 xl:table-cell"><code className="block truncate text-xs text-[var(--color-text-muted)]" title={item.request_id}>{item.request_id}</code></td></tr>;
}
function UsageCard({ item }) {
  return <article className="rounded-lg border border-[var(--color-border)] bg-white p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h4 className="truncate font-bold text-[var(--color-text)]">{item.user_name}</h4><p className="mt-1 break-all text-xs text-[var(--color-text-muted)]">{item.user_email}</p></div><StatusBadge status={item.status} errorCode={item.error_code} /></div><dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-xs text-[var(--color-text-muted)]">Fecha</dt><dd className="mt-1 text-[var(--color-text)]">{formatDate(item.created_at)}</dd></div><div><dt className="text-xs text-[var(--color-text-muted)]">Consumo</dt><dd className="mt-1 font-semibold text-[var(--color-text)]">{formatNumber(item.total_tokens ?? 0)} tokens</dd></div><div><dt className="text-xs text-[var(--color-text-muted)]">Proveedor</dt><dd className="mt-1 text-[var(--color-text)]">{item.provider} · {item.model}</dd></div><div><dt className="text-xs text-[var(--color-text-muted)]">Costo</dt><dd className="mt-1 font-semibold text-[var(--color-text)]">{formatCost(costFor(item))}</dd></div></dl><code className="mt-4 block truncate border-t border-[var(--color-border)] pt-3 text-xs text-[var(--color-text-muted)]">{item.request_id}</code></article>;
}
function StatusBadge({ status, errorCode }) {
  const config = { succeeded: ["Exitoso", "bg-green-100 text-green-800"], failed: ["Fallido", "bg-red-100 text-red-800"], pending: ["Pendiente", "bg-amber-100 text-amber-900"] };
  const [label, className] = config[status] || [status, "bg-gray-100 text-gray-700"];
  return <div><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${className}`}>{label}</span>{errorCode ? <p className="mt-1 flex max-w-32 items-start gap-1 break-all text-xs text-red-700"><CircleAlert className="mt-0.5 shrink-0" size={13} />{errorCode}</p> : null}</div>;
}
function Metric({ label, value, Icon }) {
  return <div className="rounded-lg border border-[var(--color-border)] bg-white p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-[var(--color-text-muted)]">{label}</p><p className="mt-1 text-xl font-bold text-[var(--color-text)]">{value}</p></div><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-green-50 text-green-700"><Icon aria-hidden="true" size={18} /></span></div></div>;
}
function PolicyValue({ label, value }) {
  return <div><dt className="text-xs font-bold text-[var(--color-text-muted)]">{label}</dt><dd className="mt-1 text-lg font-bold text-[var(--color-text)]">{value}</dd></div>;
}
function AuditSkeleton() {
  return <div className="animate-pulse space-y-3" aria-label="Consultando uso de IA">{Array.from({ length: 5 }, (_, index) => <div key={index} className="h-20 rounded-lg bg-gray-100" />)}</div>;
}
function costFor(item) {
  return item.estimated_cost_usd ?? item.reserved_cost_usd ?? 0;
}
function formatCost(value, decimals = 4) {
  return `$${Number(value || 0).toFixed(decimals)}`;
}
function formatNumber(value) {
  return new Intl.NumberFormat("es-CO").format(Number(value || 0));
}
function formatDate(value) {
  return new Date(value).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });
}
