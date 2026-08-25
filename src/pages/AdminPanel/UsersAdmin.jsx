import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";

export default function UsersAdmin() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
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

  const changeRole = async (user, nextRole) => {
    if (nextRole === user.rol) return;
    try {
      setError("");
      setStatus("");
      const response = await api.patch(`/admin/users/${user.id}/role`, { role: nextRole });
      setItems((current) => current.map((item) => item.id === user.id ? { ...item, rol: response.data.rol } : item));
      setStatus(`Rol actualizado para ${user.nombre}.`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "No se pudo actualizar el rol");
    }
  };

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Usuarios</h2>
        <p className="text-sm text-gray-500">Consulta cobertura de perfil y administra accesos. {pagination.total} cuentas registradas.</p>
      </div>
      <form className="flex flex-col gap-3 sm:flex-row" onSubmit={(event) => { event.preventDefault(); setPage(1); setSearch(query.trim()); }}>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre o correo" className="min-h-11 flex-1 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-green-600" />
        <select value={role} onChange={(event) => { setRole(event.target.value); setPage(1); }} className="min-h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm">
          <option value="">Todos los roles</option><option value="usuario">Usuarios</option><option value="administrador">Administradores</option>
        </select>
        <button className="min-h-11 rounded-lg bg-green-600 px-5 text-sm font-semibold text-white hover:bg-green-700">Buscar</button>
      </form>
      {error ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      {status ? <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{status}</p> : null}
      <div className="overflow-x-auto border-y border-gray-200">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500"><tr><th className="px-3 py-3">Usuario</th><th className="px-3 py-3">Perfil</th><th className="px-3 py-3">Objetivos</th><th className="px-3 py-3">Condiciones</th><th className="px-3 py-3">Restricciones</th><th className="px-3 py-3">Rol</th></tr></thead>
          <tbody>{loading ? <tr><td colSpan="6" className="px-3 py-10 text-center text-gray-500">Consultando usuarios...</td></tr> : items.map((user) => (
            <tr key={user.id} className="border-t border-gray-100">
              <td className="px-3 py-3"><p className="font-semibold text-gray-900">{user.nombre}</p><p className="text-xs text-gray-500">{user.email}</p></td>
              <td className="px-3 py-3">{user.has_profile ? "Completo" : "Pendiente"}</td>
              <td className="px-3 py-3">{user.goals_count}</td><td className="px-3 py-3">{user.conditions_count}</td><td className="px-3 py-3">{user.restrictions_count}</td>
              <td className="px-3 py-3"><select aria-label={`Rol de ${user.nombre}`} value={user.rol} onChange={(event) => void changeRole(user, event.target.value)} className="min-h-10 rounded-lg border border-gray-300 bg-white px-2"><option value="usuario">Usuario</option><option value="administrador">Administrador</option></select></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-4">
        <button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="min-h-10 rounded-lg border border-gray-300 px-4 text-sm font-semibold disabled:opacity-40">Anterior</button>
        <span className="text-sm text-gray-500">Pagina {pagination.page} de {pagination.totalPages}</span>
        <button disabled={page >= pagination.totalPages} onClick={() => setPage((value) => value + 1)} className="min-h-10 rounded-lg border border-gray-300 px-4 text-sm font-semibold disabled:opacity-40">Siguiente</button>
      </div>
    </section>
  );
}
