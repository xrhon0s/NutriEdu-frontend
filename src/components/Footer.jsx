import { Link } from "react-router-dom";

const footerLinks = [
  { label: "Inicio", to: "/" },
  { label: "Recetas", to: "/recipes" },
  { label: "Planificador", to: "/planner" },
  { label: "Compras", to: "/shopping-list" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-emerald-100 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link to="/" className="inline-flex items-center gap-3">
            <img
              src="/logonobg.png"
              alt="NutriEdu"
              className="h-10 w-10 object-contain"
            />
            <div>
              <p className="text-lg font-bold text-green-700">NutriEdu</p>
              <p className="text-sm text-slate-500">Nutrición personalizada</p>
            </div>
          </Link>

          <p className="mt-4 max-w-md text-sm leading-6 text-slate-500">
            Recetas, restricciones y planificación semanal para tomar decisiones alimentarias con más claridad.
          </p>
        </div>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between lg:flex-col lg:items-end">
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-slate-600">
            {footerLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="transition hover:text-green-700"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <p className="text-sm text-slate-400">
            © {year} NutriEdu. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
