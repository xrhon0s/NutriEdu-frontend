import { Link } from "react-router-dom";

export function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f7fbf8_0%,#e9f7ef_46%,#eef6ff_100%)] px-4 py-8 text-slate-900">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center gap-8 lg:grid-cols-[0.9fr_1fr]">
        <section className="hidden lg:block">
          <Link to="/" className="inline-flex items-center gap-3">
            <img
              src="/logonobg.png"
              alt="NutriEdu"
              className="h-12 w-12 object-contain"
            />
            <div>
              <p className="text-2xl font-bold text-green-700">NutriEdu</p>
              <p className="text-sm text-slate-500">Nutrición personalizada</p>
            </div>
          </Link>

          <div className="mt-12 max-w-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
              Plataforma nutricional
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-slate-950">
              Planes seguros para comer con más confianza.
            </h1>
            <p className="mt-5 text-base leading-7 text-slate-600">
              Gestiona restricciones, recetas, planificación semanal y compras desde una experiencia clara y segura.
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <div className="mb-8 flex justify-center lg:hidden">
            <Link to="/" className="inline-flex items-center gap-3">
              <img
                src="/logonobg.png"
                alt="NutriEdu"
                className="h-11 w-11 object-contain"
              />
              <div>
                <p className="text-2xl font-bold text-green-700">NutriEdu</p>
                <p className="text-xs text-slate-500">Nutrición personalizada</p>
              </div>
            </Link>
          </div>

          <div className="rounded-lg border border-white/80 bg-white/95 p-7 shadow-xl shadow-emerald-900/10 backdrop-blur sm:p-8">
            <div className="mb-7 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {subtitle}
                </p>
              )}
            </div>

            {children}

            {footer && (
              <div className="mt-6 border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
                {footer}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export function AuthField({ label, className = "", ...props }) {
  return (
    <div className={className}>
      <label className="text-sm font-semibold text-slate-700">
        {label}
      </label>
      <input
        {...props}
        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-green-500 focus:ring-4 focus:ring-green-100"
      />
    </div>
  );
}

export function AuthSubmitButton({ loading, loadingText, children, ...props }) {
  return (
    <button
      type="submit"
      {...props}
      disabled={loading || props.disabled}
      className="w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white shadow-sm shadow-green-900/10 transition hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading ? loadingText : children}
    </button>
  );
}
