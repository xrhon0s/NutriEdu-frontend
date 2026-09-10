import { Link } from "react-router-dom";

const footerLinks = [
  { label: "Inicio", to: "/" },
  { label: "Recetas", to: "/recipes" },
  { label: "Planificador", to: "/planner" },
  { label: "Compras", to: "/shopping-list" },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const authenticated = Boolean(localStorage.getItem("token"));
  const homePath = authenticated ? "/recipes" : "/";
  const visibleLinks = authenticated ? footerLinks.filter((link) => link.to !== "/") : footerLinks;

  return (
    <footer className="border-t border-[var(--color-border)] bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <Link to={homePath} className="inline-flex items-center gap-3">
            <img
              src="/logonobg.png"
              alt=""
              className="h-9 w-9 object-contain"
            />
            <div>
              <p className="font-bold text-[var(--color-primary)]">NutriEdu</p>
              <p className="text-xs text-[var(--color-text-muted)]">Nutrición personalizada</p>
            </div>
          </Link>

          <p className="mt-3 max-w-md text-sm leading-6 text-[var(--color-text-muted)]">
            Recetas, restricciones y planificación semanal para tomar decisiones alimentarias con más claridad.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:flex-col lg:items-end">
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-[var(--color-text-muted)]" aria-label="Navegación del pie">
            {visibleLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to === "/" ? homePath : link.to}
                className="transition-colors hover:text-[var(--color-primary)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <p className="text-xs text-[var(--color-text-muted)]">
            © {year} NutriEdu. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
