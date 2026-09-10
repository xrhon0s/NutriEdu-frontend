import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, LoaderCircle, ShieldCheck } from "lucide-react";

export function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <main className="min-h-screen bg-[var(--color-canvas)] px-4 py-6 text-[var(--color-text)] sm:px-6 sm:py-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-5xl items-center gap-10 lg:min-h-[calc(100vh-4rem)] lg:grid-cols-[0.9fr_1fr]">
        <section className="hidden border-r border-[var(--color-border)] pr-12 lg:block">
          <Link to="/" className="inline-flex items-center gap-3">
            <img
              src="/logonobg.png"
              alt="NutriEdu"
              className="h-12 w-12 object-contain"
            />
            <div>
              <p className="text-2xl font-bold text-[var(--color-primary)]">NutriEdu</p>
              <p className="text-sm text-[var(--color-text-muted)]">Nutrición personalizada</p>
            </div>
          </Link>

          <div className="mt-12 max-w-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
              <ShieldCheck aria-hidden="true" size={22} />
            </div>
            <p className="mt-5 text-sm font-semibold text-[var(--color-primary)]">
              Tu espacio personal
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight text-[var(--color-text)]">
              Decisiones alimentarias con contexto.
            </h1>
            <p className="mt-5 text-base leading-7 text-[var(--color-text-muted)]">
              Accede a tu perfil, recomendaciones y planificación desde una experiencia clara y consistente.
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
                <p className="text-2xl font-bold text-[var(--color-primary)]">NutriEdu</p>
                <p className="text-xs text-[var(--color-text-muted)]">Nutrición personalizada</p>
              </div>
            </Link>
          </div>

          <div className="surface-panel p-6 sm:p-8">
            <div className="mb-7 text-center">
              <h2 className="text-3xl font-bold text-[var(--color-text)]">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                  {subtitle}
                </p>
              )}
            </div>

            {children}

            {footer && (
              <div className="mt-6 border-t border-[var(--color-border)] pt-5 text-center text-sm text-[var(--color-text-muted)]">
                {footer}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export function AuthField({ label, className = "", error = "", hint = "", id, type = "text", ...props }) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const descriptionId = `${inputId}-description`;
  const isPassword = type === "password";
  const [passwordVisible, setPasswordVisible] = useState(false);
  const describedBy = [props["aria-describedby"], error || hint ? descriptionId : ""].filter(Boolean).join(" ") || undefined;

  return (
    <div className={className}>
      <label htmlFor={inputId} className="text-sm font-semibold text-[var(--color-text)]">
        {label}
      </label>
      <div className="relative mt-2">
        <input
          {...props}
          id={inputId}
          type={isPassword && passwordVisible ? "text" : type}
          aria-describedby={describedBy}
          aria-invalid={props["aria-invalid"] || Boolean(error)}
          className={`field-control h-12 px-4 ${error ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""} ${isPassword ? "pr-12" : ""}`}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setPasswordVisible((visible) => !visible)}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[var(--color-text-muted)] transition hover:text-[var(--color-text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-focus)]"
            aria-label={passwordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={passwordVisible}
            title={passwordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {passwordVisible ? <EyeOff aria-hidden="true" size={20} /> : <Eye aria-hidden="true" size={20} />}
          </button>
        ) : null}
      </div>
      {error || hint ? (
        <p id={descriptionId} className={`mt-2 text-sm ${error ? "font-medium text-red-700" : "text-[var(--color-text-muted)]"}`}>
          {error || hint}
        </p>
      ) : null}
    </div>
  );
}

export function AuthSubmitButton({ loading, loadingText, children, ...props }) {
  return (
    <button
      type="submit"
      {...props}
      disabled={loading || props.disabled}
      aria-busy={loading}
      className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-[var(--color-primary-hover)] focus:outline-none focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? <LoaderCircle aria-hidden="true" className="animate-spin" size={19} /> : null}
      <span>{loading ? loadingText : children}</span>
    </button>
  );
}
