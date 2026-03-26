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
    `font-medium transition ${
      location.pathname === path
        ? "text-green-700"
        : "text-gray-600 hover:text-green-700"
    }`;

  return (
    <nav className="w-full bg-white/90 backdrop-blur-md border-b border-green-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1
          onClick={() => navigate("/")}
          className="text-xl md:text-2xl font-extrabold text-green-700 cursor-pointer"
        >
          NutriEdu
        </h1>

        <div className="flex items-center gap-6">
          <button onClick={() => navigate("/profile")} className={linkClass("/profile")}>
            Perfil
          </button>

          <button onClick={() => navigate("/recipes")} className={linkClass("/recipes")}>
            Recetas
          </button>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-sm text-gray-600">
            {user?.nombre || "Usuario"}
          </span>

          <button
            onClick={logout}
            className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition text-sm"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </nav>
  );
}