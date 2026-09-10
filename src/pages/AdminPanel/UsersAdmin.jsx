import { useCallback, useEffect, useState } from "react";
import { Search, UserRoundX, X } from "lucide-react";
import Button from "../../components/Button";
import ConfirmModal from "../../components/ConfirmModal";
import EmptyState from "../../components/EmptyState";
import Pagination from "../../components/Pagination";
import StatusMessage from "../../components/StatusMessage";
import api from "../../services/api";

export default function UsersAdmin() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [pendingRoleChange, setPendingRoleChange] = useState(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/admin/users", { params: { page, limit: 15, search: search || undefined, role: role || undefined } });
      setItems(response.data.items);
      setPagination(response.data.pagination);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.response?.data?.error || "No se pudieron consultar los usuarios");
    } finally {
      setLoading(false);
    }
  }, [page, role, search]);

  useEffect(() => { void load(); }, [load]);

  const requestRoleChange = (user, nextRole) => {
    if (nextRole !== user.rol) setPendingRoleChange({ user, nextRole });
  };

  const confirmRoleChange = async () => {
    if (!pendingRoleChange) return;
    const { user, nextRole } = pendingRoleChange;
    try {
      setUpdatingUserId(user.id);
      setError("");
      setStatus("");
      const response = await api.patch(`/admin/users/${user.id}/role`, { role: nextRole });
      setItems((current) => current.map((item) => item.id === user.id ? { ...item, rol: response.data.rol } : item));
      setStatus(`Rol actualizado para ${user.nombre}.`);
      setPendingRoleChange(null);
    } catch (requestError) {
      setPendingRoleChange(null);
      setError(requestError.response?.data?.message || "No se pudo actualizar el rol");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const submitSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(query.trim());
    setStatus("");
  };

  const clearFilters = () => {
    setQuery("");
    setSearch("");
    setRole("");
    setPage(1);
  };

  const hasFilters = Boolean(search || role);

  return (
    <div className="space-y-5">
      <p className="max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">Consulta la cobertura del perfil y administra accesos. Los cambios de rol requieren confirmación y vuelven a validarse en el servidor.</p>

      <form className="grid gap-3 sm:grid-cols-[minmax(220px,1fr)_200px_auto]" onSubmit={submitSearch} role="search">
        <label className="relative min-w-0">
          <span className="sr-only">Buscar usuarios</span>
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre o correo" className="input-admin w-full pl-10 pr-10" />
          {query ? <button type="button" onClick={() => setQuery("")} className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]" aria-label="Limpiar texto"><X size={17} /></button> : null}
        </label>
        <label>
          <span className="sr-only">Filtrar por rol</span>
          <select value={role} onChange={(event) => { setRole(event.target.value); setPage(1); setStatus(""); }} className="input-admin w-full"><option value="">Todos los roles</option><option value="usuario">Usuarios</option><option value="administrador">Administradores</option></select>
        </label>
        <Button variant="secondary" type="submit"><Search size={17} /> Buscar</Button>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-[var(--color-text-muted)]">
        <p><strong className="text-[var(--color-text)]">{pagination.total}</strong> cuentas registradas</p>
        {hasFilters ? <Button size="sm" variant="ghost" onClick={clearFilters}>Limpiar filtros</Button> : null}
      </div>
      <StatusMessage type="error" message={error} />
      <StatusMessage message={status} />

      {loading ? <UserListSkeleton /> : items.length ? (
        <>
          <div className="space-y-3 md:hidden">
            {items.map((user) => <UserCard key={user.id} user={user} updating={updatingUserId === user.id} onRoleChange={requestRoleChange} />)}
          </div>
          <div className="hidden overflow-hidden border-y border-[var(--color-border)] md:block">
            <table className="w-full table-fixed text-left text-sm">
              <thead className="bg-[var(--color-surface-muted)] text-xs text-[var(--color-text-muted)]"><tr><th className="p-3">Usuario</th><th className="w-28 p-3">Perfil</th><th className="hidden w-32 p-3 lg:table-cell">Contexto</th><th className="w-44 p-3">Rol</th></tr></thead>
              <tbody>{items.map((user) => <UserRow key={user.id} user={user} updating={updatingUserId === user.id} onRoleChange={requestRoleChange} />)}</tbody>
            </table>
          </div>
        </>
      ) : (
        <EmptyState icon={UserRoundX} title="No encontramos usuarios" description={hasFilters ? "Ajusta o limpia los filtros para consultar otras cuentas." : "Todavía no hay cuentas registradas."} action={hasFilters ? <Button variant="secondary" onClick={clearFilters}>Limpiar filtros</Button> : null} />
      )}

      {!loading && items.length ? <Pagination page={pagination.page} totalPages={pagination.totalPages} hasMore={page < pagination.totalPages} onPage={setPage} /> : null}

      <ConfirmModal
        isOpen={Boolean(pendingRoleChange)}
        onClose={() => setPendingRoleChange(null)}
        onConfirm={() => void confirmRoleChange()}
        title="Cambiar rol de usuario"
        message={pendingRoleChange ? roleChangeMessage(pendingRoleChange.user, pendingRoleChange.nextRole) : ""}
        confirmLabel="Cambiar rol"
        loading={Boolean(updatingUserId)}
        variant="warning"
      />
    </div>
  );
}

function UserRow({ user, updating, onRoleChange }) {
  return (
    <tr className="border-t border-[var(--color-border)] first:border-t-0">
      <td className="p-3"><p className="truncate font-semibold text-[var(--color-text)]" title={user.nombre}>{user.nombre}</p><p className="mt-1 truncate text-xs text-[var(--color-text-muted)]" title={user.email}>{user.email}</p></td>
      <td className="p-3"><ProfileStatus complete={user.has_profile} /></td>
      <td className="hidden p-3 lg:table-cell"><ClinicalCounts user={user} /></td>
      <td className="p-3"><RoleSelect user={user} updating={updating} onRoleChange={onRoleChange} /></td>
    </tr>
  );
}

function UserCard({ user, updating, onRoleChange }) {
  return (
    <article className="rounded-lg border border-[var(--color-border)] bg-white p-4">
      <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate font-bold text-[var(--color-text)]">{user.nombre}</h3><p className="mt-1 break-all text-xs text-[var(--color-text-muted)]">{user.email}</p></div><ProfileStatus complete={user.has_profile} /></div>
      <div className="mt-4 border-y border-[var(--color-border)] py-3"><ClinicalCounts user={user} /></div>
      <div className="mt-4"><RoleSelect user={user} updating={updating} onRoleChange={onRoleChange} /></div>
    </article>
  );
}

function RoleSelect({ user, updating, onRoleChange }) {
  return <label className="block"><span className="mb-1 block text-xs font-semibold text-[var(--color-text-muted)]">Rol</span><select aria-label={`Rol de ${user.nombre}`} value={user.rol} disabled={updating} onChange={(event) => onRoleChange(user, event.target.value)} className="input-admin min-h-10 w-full py-1 disabled:opacity-50"><option value="usuario">Usuario</option><option value="administrador">Administrador</option></select></label>;
}

function ProfileStatus({ complete }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${complete ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-900"}`}>{complete ? "Completo" : "Pendiente"}</span>;
}

function ClinicalCounts({ user }) {
  return <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--color-text-muted)]"><span><strong className="text-[var(--color-text)]">{user.goals_count}</strong> objetivos</span><span><strong className="text-[var(--color-text)]">{user.conditions_count}</strong> condiciones</span><span><strong className="text-[var(--color-text)]">{user.restrictions_count}</strong> restricciones</span></div>;
}

function UserListSkeleton() {
  return <div className="animate-pulse space-y-3" aria-label="Consultando usuarios">{Array.from({ length: 5 }, (_, index) => <div key={index} className="h-20 rounded-lg bg-gray-100" />)}</div>;
}

function roleChangeMessage(user, nextRole) {
  return nextRole === "administrador"
    ? `${user.nombre} podrá administrar usuarios, catálogos, reglas y consumo de IA. Confirma que debe recibir estos permisos.`
    : `${user.nombre} perderá el acceso administrativo. El servidor impedirá el cambio si es la última cuenta administradora.`;
}
