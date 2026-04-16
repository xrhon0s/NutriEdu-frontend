import { useNavigate, useLocation } from "react-router-dom";

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const linkClass = (path) =>
    `px-3 py-2 rounded-xl text-sm font-medium transition ${
      location.pathname === path
        ? "bg-green-100 text-green-700"
        : "text-gray-600 hover:text-green-700 hover:bg-green-50"
    }`;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-green-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center font-bold shadow-md">
            N
          </div>

          <div>
            <h1 className="text-lg md:text-xl font-extrabold text-green-700 leading-none">
              NutriEdu
            </h1>
            <p className="text-xs text-gray-500 hidden sm:block">
              Nutrición personalizada
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <button onClick={() => navigate("/profile")} className={linkClass("/profile")}>
            Perfil
          </button>

          <button onClick={() => navigate("/recipes")} className={linkClass("/recipes")}>
            Recetas
          </button>

          <button onClick={() => navigate("/planner")} className={linkClass("/planner")}>
            Planificador
          </button>

          <button
            onClick={() => navigate("/shopping-list")}
            className={linkClass("/shopping-list")}
          >
            Compras
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-gray-800">
              {user?.nombre || "Usuario"}
            </p>
            <p className="text-xs text-gray-500">
              Sesión activa
            </p>
          </div>

          <button
            onClick={logout}
            className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition text-sm font-medium"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </nav>
  );
}