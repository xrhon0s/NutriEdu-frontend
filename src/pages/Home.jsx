import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const categoryIcons = {
  Desayuno: (
    <svg viewBox="0 0 48 48" className="h-11 w-11" aria-hidden="true">
      <path
        d="M14 25h24v3a10 10 0 0 1-10 10h-4a10 10 0 0 1-10-10v-3Z"
        className="fill-white stroke-emerald-700"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M38 27h2a4 4 0 0 1 0 8h-4M12 39h28M18 18c-2-2 2-4 0-6M25 18c-2-2 2-4 0-6M32 18c-2-2 2-4 0-6"
        className="fill-none stroke-emerald-700"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Almuerzo: (
    <svg viewBox="0 0 48 48" className="h-11 w-11" aria-hidden="true">
      <circle
        cx="24"
        cy="25"
        r="15"
        className="fill-white stroke-emerald-700"
        strokeWidth="2.5"
      />
      <circle
        cx="24"
        cy="25"
        r="8"
        className="fill-emerald-50 stroke-emerald-600"
        strokeWidth="2"
      />
      <path
        d="M8 13v25M13 13v25M8 25h5M40 13v25"
        className="fill-none stroke-emerald-700"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  Cena: (
    <svg viewBox="0 0 48 48" className="h-11 w-11" aria-hidden="true">
      <path
        d="M32 8a16 16 0 1 0 8 28 13 13 0 0 1-8-28Z"
        className="fill-white stroke-emerald-700"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m15 11 1.4 3 3.1.4-2.3 2.2.6 3.1-2.8-1.5-2.8 1.5.6-3.1-2.3-2.2 3.1-.4L15 11Z"
        className="fill-amber-100 stroke-amber-600"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Snack: (
    <svg viewBox="0 0 48 48" className="h-11 w-11" aria-hidden="true">
      <path
        d="M13 25c0-7 5-13 11-13s11 6 11 13-5 13-11 13-11-6-11-13Z"
        className="fill-white stroke-emerald-700"
        strokeWidth="2.5"
      />
      <path
        d="M24 12c1-4 4-6 8-6M24 12c-1-3-4-5-8-5M18 24h.1M25 20h.1M30 27h.1M22 32h.1"
        className="fill-none stroke-emerald-700"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  Postre: (
    <svg viewBox="0 0 48 48" className="h-11 w-11" aria-hidden="true">
      <path
        d="M13 20h22l-2 19H15l-2-19Z"
        className="fill-white stroke-emerald-700"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M16 20c0-5 4-9 8-9s8 4 8 9M19 29h10M20 35h8"
        className="fill-none stroke-emerald-700"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M29 11c0-3 2-5 5-5"
        className="fill-none stroke-rose-500"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  ),
};

const categories = [
  {
    name: "Desayuno",
    detail: "Energía suave",
    accent: "bg-amber-50 text-amber-700 border-amber-100",
  },
  {
    name: "Almuerzo",
    detail: "Platos completos",
    accent: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  {
    name: "Cena",
    detail: "Ligero y seguro",
    accent: "bg-sky-50 text-sky-700 border-sky-100",
  },
  {
    name: "Snack",
    detail: "Entre comidas",
    accent: "bg-lime-50 text-lime-700 border-lime-100",
  },
  {
    name: "Postre",
    detail: "Dulce con cuidado",
    accent: "bg-rose-50 text-rose-700 border-rose-100",
  },
];

const stats = [
  { value: "+100", label: "recetas saludables" },
  { value: "5", label: "categorías rápidas" },
  { value: "24/7", label: "ideas para planear" },
];

const recipeTraits = [
  { label: "Sin gluten", value: "Apto", color: "bg-emerald-50 text-emerald-700" },
  { label: "Sin lactosa", value: "Apto", color: "bg-sky-50 text-sky-700" },
  { label: "Tiempo", value: "20 min", color: "bg-amber-50 text-amber-700" },
  { label: "Nivel", value: "Fácil", color: "bg-rose-50 text-rose-700" },
];

const tips = [
  {
    title: "Hidratación",
    desc: "Ten agua visible durante el día para convertirla en hábito.",
    icon: "H2O",
    color: "bg-sky-50 text-sky-700",
  },
  {
    title: "Color en el plato",
    desc: "Combina vegetales de distintos colores para variar nutrientes.",
    icon: "5+",
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "Proteína práctica",
    desc: "Alterna legumbres, huevos, carnes magras y lácteos si son aptos.",
    icon: "P",
    color: "bg-amber-50 text-amber-700",
  },
];

const testimonials = [
  {
    name: "Ana",
    role: "Planifica para su familia",
    text: "NutriEdu me ayudó a encontrar comidas seguras sin sentir que cocino siempre lo mismo.",
  },
  {
    name: "Carlos",
    role: "Busca recetas rápidas",
    text: "Ahora filtro ideas con más confianza y armo mi semana en menos tiempo.",
  },
  {
    name: "Sofía",
    role: "Cuida restricciones",
    text: "Me gusta que la experiencia se siente clara, amable y fácil de seguir.",
  },
];

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const revealItems = document.querySelectorAll("[data-reveal]");

    if (!("IntersectionObserver" in window)) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -70px 0px" },
    );

    revealItems.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-emerald-50/40 text-slate-800">
      <header className="w-full border-b border-emerald-100 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 text-left"
            aria-label="Ir al inicio"
          >
            <img src="/logonutri.png" alt="" className="h-11 w-11 object-contain" />
            <div data-reveal>
              <h1 className="text-xl font-extrabold text-emerald-700">
                NutriEdu
              </h1>
              <p className="hidden text-xs font-medium text-slate-500 sm:block">
                Nutrición personalizada
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate("/login")}
              className="rounded-lg border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              Iniciar sesión
            </button>

            <button
              onClick={() => navigate("/register")}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-900/10 transition hover:bg-emerald-700"
            >
              Registrarse
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="border-b border-emerald-100 bg-[linear-gradient(135deg,#f7fbf6_0%,#eef8ed_52%,#fff7ed_100%)]">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 sm:px-6 md:grid-cols-[1.04fr_0.96fr] md:py-20">
            <div>
              <span className="inline-flex rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-bold text-emerald-700 shadow-sm">
                Alimentación segura y personalizada
              </span>

              <h2 className="mt-6 max-w-3xl text-4xl font-black leading-tight text-slate-950 sm:text-5xl md:text-6xl">
                Recetas que entienden tus restricciones.
              </h2>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                Encuentra ideas claras para cocinar, adaptar ingredientes y
                planificar comidas con más confianza.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => navigate("/register")}
                  className="rounded-lg bg-emerald-600 px-6 py-3 font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:-translate-y-0.5 hover:bg-emerald-700"
                >
                  Empezar ahora
                </button>

                <button
                  onClick={() => navigate("/login")}
                  className="rounded-lg border border-emerald-200 bg-white px-6 py-3 font-bold text-emerald-700 transition hover:-translate-y-0.5 hover:bg-emerald-50"
                >
                  Ya tengo cuenta
                </button>
              </div>

              <div className="mt-10 grid max-w-xl grid-cols-3 overflow-hidden rounded-lg border border-emerald-100 bg-white shadow-sm">
                {stats.map((stat) => (
                  <div key={stat.label} className="p-4">
                    <p className="text-2xl font-black text-emerald-700">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative" data-reveal data-reveal-delay="120">
              <div className="rounded-lg border border-white bg-white p-4 shadow-2xl shadow-emerald-950/10">
                <div className="overflow-hidden rounded-lg bg-slate-950 text-white">
                  <div className="grid grid-cols-[1.15fr_0.85fr]">
                    <div className="bg-[linear-gradient(145deg,#047857,#16a34a)] p-6">
                      <p className="text-sm font-semibold text-emerald-50">
                        Recomendación del día
                      </p>
                      <h3 className="mt-3 text-3xl font-black">
                        Bowl fresco de quinoa
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-emerald-50">
                        Una base adaptable para ingredientes seguros, vegetales
                        crujientes y proteína ligera.
                      </p>
                    </div>

                    <div className="relative bg-[#fef3c7] p-5">
                      <div className="mx-auto flex aspect-square max-w-48 items-center justify-center rounded-full bg-white shadow-inner">
                        <div className="h-3/4 w-3/4 rounded-full border-[14px] border-emerald-100 bg-[conic-gradient(from_20deg,#f97316_0_18%,#22c55e_18%_42%,#facc15_42%_58%,#38bdf8_58%_74%,#fb7185_74%_100%)] shadow-lg" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  {recipeTraits.map((trait) => (
                    <div
                      key={trait.label}
                      className={`rounded-lg p-4 ${trait.color}`}
                    >
                      <p className="text-xs font-bold uppercase">
                        {trait.label}
                      </p>
                      <p className="mt-1 text-lg font-black">{trait.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6">
          <div
            className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"
            data-reveal
          >
            <div>
              <p className="text-sm font-bold uppercase text-emerald-700">
                Explora
              </p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">
                Categorías para cada momento
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-500">
              Elige el momento del día y empieza con opciones más fáciles de
              adaptar a tus necesidades.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {categories.map((cat, index) => (
              <button
                key={cat.name}
                type="button"
                data-reveal
                style={{ "--reveal-delay": `${index * 70}ms` }}
                className={`group min-h-40 rounded-lg border p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${cat.accent}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-lg bg-white p-3 shadow-sm">
                    {categoryIcons[cat.name]}
                  </div>
                  <span className="text-xl transition group-hover:translate-x-1">
                    →
                  </span>
                </div>
                <p className="mt-5 text-xl font-black">{cat.name}</p>
                <p className="mt-1 text-sm font-semibold opacity-75">
                  {cat.detail}
                </p>
              </button>
            ))}
          </div>
        </section>

        <section className="border-y border-emerald-100 bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div data-reveal>
              <p className="text-sm font-bold uppercase text-emerald-700">
                Tips
              </p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">
                Pequeños hábitos, mejores decisiones
              </h2>
              <p className="mt-4 leading-7 text-slate-600">
                La educación nutricional funciona mejor cuando cabe en la vida
                real: simple, visual y accionable.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {tips.map((tip, index) => (
                <div
                  key={tip.title}
                  data-reveal
                  style={{ "--reveal-delay": `${index * 90}ms` }}
                  className="rounded-lg border border-slate-100 bg-slate-50 p-5"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-lg text-sm font-black ${tip.color}`}
                  >
                    {tip.icon}
                  </div>
                  <h3 className="mt-5 font-black text-slate-950">
                    {tip.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {tip.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6">
          <div
            className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"
            data-reveal
          >
            <div>
              <p className="text-sm font-bold uppercase text-emerald-700">
                Comunidad
              </p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">
                Qué dicen nuestros usuarios
              </h2>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.map((item, index) => (
              <article
                key={item.name}
                data-reveal
                style={{ "--reveal-delay": `${index * 90}ms` }}
                className="rounded-lg border border-emerald-100 bg-white p-6 shadow-sm"
              >
                <p className="text-sm leading-6 text-slate-600">
                  “{item.text}”
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-black text-emerald-700">
                    {item.name[0]}
                  </div>
                  <div>
                    <p className="font-black text-slate-950">{item.name}</p>
                    <p className="text-xs font-medium text-slate-500">
                      {item.role}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="px-5 pb-16 sm:px-6">
          <div
            className="mx-auto grid max-w-7xl items-center gap-8 rounded-lg bg-emerald-950 p-8 text-white sm:p-10 lg:grid-cols-[1fr_auto]"
            data-reveal
          >
            <div>
              <p className="text-sm font-bold uppercase text-emerald-300">
                NutriEdu
              </p>
              <h2 className="mt-2 text-3xl font-black">
                Empieza a planificar con más calma.
              </h2>
              <p className="mt-3 max-w-2xl leading-7 text-slate-300">
                Crea tu cuenta y convierte tus restricciones en una guía clara
                para cocinar mejor.
              </p>
            </div>
            <button
              onClick={() => navigate("/register")}
              className="rounded-lg bg-white px-7 py-4 font-black text-emerald-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-50"
            >
              Registrarse ahora
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;
