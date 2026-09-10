import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import Button from "./Button";

const baseItems = [
  { label: "Perfil", to: "/profile" },
  { label: "Recetas", to: "/recipes" },
  { label: "Planificador", to: "/planner" },
  { label: "Compras", to: "/shopping-list" },
];

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const items = user?.rol === "administrador"
    ? [...baseItems, { label: "Administración", to: "/admin/recipes" }]
    : baseItems;

  useEffect(() => {
    if (!menuOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-white/95 backdrop-blur">
      <nav className="mx-auto flex min-h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8" aria-label="Navegación principal">
        <Link to="/recipes" className="flex min-w-0 shrink-0 items-center gap-2.5" aria-label="NutriEdu, ir a recetas">
          <img src="/logonutri.png" alt="" className="h-11 w-11 object-contain" />
          <span className="min-w-0">
            <span className="block text-lg font-extrabold leading-5 text-[var(--color-primary)]">NutriEdu</span>
            <span className="hidden text-xs text-[var(--color-text-muted)] sm:block">Nutrición personalizada</span>
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex">
          {items.map((item) => <NavItem key={item.to} item={item} currentPath={location.pathname} />)}
        </div>

        <div className="ml-auto hidden shrink-0 items-center gap-3 lg:flex">
          <div className="max-w-40 text-right">
            <p className="truncate text-sm font-semibold text-[var(--color-text)]">{user?.nombre || "Usuario"}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Sesión activa</p>
          </div>
          <Button variant="secondary" onClick={logout} aria-label="Cerrar sesión">
            <LogOut aria-hidden="true" size={17} />
            Salir
          </Button>
        </div>

        <button
          type="button"
          className="ml-auto grid h-11 w-11 shrink-0 place-items-center rounded-lg text-[var(--color-text)] hover:bg-[var(--color-surface-muted)] lg:hidden"
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X aria-hidden="true" size={22} /> : <Menu aria-hidden="true" size={22} />}
        </button>
      </nav>

      {menuOpen ? (
        <div id="mobile-navigation" className="border-t border-[var(--color-border)] bg-white px-4 py-3 lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-1">
            {items.map((item) => <NavItem key={item.to} item={item} currentPath={location.pathname} mobile onNavigate={() => setMenuOpen(false)} />)}
            <div className="mt-2 flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--color-text)]">{user?.nombre || "Usuario"}</p>
                <p className="text-xs text-[var(--color-text-muted)]">Sesión activa</p>
              </div>
              <Button variant="secondary" onClick={logout}>
                <LogOut aria-hidden="true" size={17} />
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function NavItem({ item, currentPath, mobile = false, onNavigate }) {
  const active = currentPath === item.to || currentPath.startsWith(`${item.to}/`);
  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`${mobile ? "min-h-11 w-full justify-start px-3" : "min-h-10 px-3"} inline-flex items-center rounded-lg text-sm font-semibold transition-colors ${active ? "bg-[var(--color-primary-soft)] text-[var(--color-primary-hover)]" : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]"}`}
    >
      {item.label}
    </Link>
  );
}
