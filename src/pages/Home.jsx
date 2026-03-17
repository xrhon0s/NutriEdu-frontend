import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-100 to-white text-gray-800">
      <header className="w-full border-b border-green-100 bg-white/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-green-700 tracking-tight">
            NutriEdu
          </h1>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 rounded-xl border border-green-600 text-green-700 font-medium hover:bg-green-50 transition"
            >
              Iniciar sesión
            </button>

            <button
              onClick={() => navigate("/register")}
              className="px-4 py-2 rounded-xl bg-green-600 text-white font-medium shadow-md hover:bg-green-700 transition"
            >
              Registrarse
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block px-4 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold mb-6">
              Alimentación segura y personalizada
            </span>

            <h2 className="text-4xl md:text-6xl font-extrabold leading-tight text-gray-900">
              Encuentra recetas seguras para tu{" "}
              <span className="text-green-600">salud y estilo de vida</span>
            </h2>

            <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-xl">
              Plataforma educativa para ayudarte a encontrar recetas seguras
              según tus restricciones alimentarias.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate("/register")}
                className="px-6 py-3 rounded-2xl bg-green-600 text-white font-semibold shadow-lg hover:bg-green-700 transition text-center"
              >
                Empezar ahora
              </button>

              <button
                onClick={() => navigate("/login")}
                className="px-6 py-3 rounded-2xl border border-green-600 text-green-700 font-semibold hover:bg-green-50 transition text-center"
              >
                Ya tengo cuenta
              </button>
            </div>

            <div className="mt-10 flex items-center gap-8 text-sm text-gray-500">
              <div>
                <p className="text-2xl font-bold text-green-700">+100</p>
                <p>Recetas saludables</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">Fácil</p>
                <p>de usar</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">Seguro</p>
                <p>para restricciones</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-green-200 rounded-full blur-3xl opacity-60"></div>
            <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-emerald-300 rounded-full blur-3xl opacity-50"></div>

            <div className="relative bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white p-8">
              <div className="rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white shadow-lg">
                <p className="text-sm opacity-90">Recomendación del día</p>
                <h3 className="text-2xl font-bold mt-2">Ensalada nutritiva</h3>
                <p className="mt-2 text-sm opacity-90">
                  Ideal para personas que buscan opciones frescas, equilibradas
                  y adaptables a restricciones alimentarias.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-green-50 rounded-2xl p-4">
                  <p className="text-sm text-gray-500">Sin gluten</p>
                  <p className="font-semibold text-gray-800 mt-1">Apto</p>
                </div>
                <div className="bg-green-50 rounded-2xl p-4">
                  <p className="text-sm text-gray-500">Sin lactosa</p>
                  <p className="font-semibold text-gray-800 mt-1">Apto</p>
                </div>
                <div className="bg-green-50 rounded-2xl p-4">
                  <p className="text-sm text-gray-500">Tiempo</p>
                  <p className="font-semibold text-gray-800 mt-1">20 min</p>
                </div>
                <div className="bg-green-50 rounded-2xl p-4">
                  <p className="text-sm text-gray-500">Nivel</p>
                  <p className="font-semibold text-gray-800 mt-1">Fácil</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;