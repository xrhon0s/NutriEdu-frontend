import { useNavigate } from "react-router-dom";

export default function NavBar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav className="w-full bg-white border-b border-green-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <h1
          onClick={() => navigate("/")}
          className="text-xl font-bold text-green-700 cursor-pointer"
        >
          NutriEdu
        </h1>

        {/* Links */}
        <div className="flex items-center gap-6">

          <button
            onClick={() => navigate("/profile")}
            className="text-gray-600 hover:text-green-700 font-medium"
          >
            Perfil
          </button>

          <button
            onClick={() => navigate("/recipes")}
            className="text-gray-600 hover:text-green-700 font-medium"
          >
            Recetas
          </button>

        </div>

        {/* Usuario + logout */}
        <div className="flex items-center gap-4">

          <span className="text-sm text-gray-600">
            {user?.nombre}
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