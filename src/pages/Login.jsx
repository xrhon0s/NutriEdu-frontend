import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const loginUser = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      setLoading(true);

      const res = await api.post("/users/login", { email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      const restrictionsRes = await api.get(`/users/restrictions/${res.data.user.id}`);

      setMessage("Login exitoso");
      setMessageType("success");

      setTimeout(() => {
        if (restrictionsRes.data.hasRestrictions) {
          navigate("/recipes");
        } else {
          navigate("/profile");
        }
}, 800);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error en login");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 via-emerald-100 to-white px-4">
      <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-md border border-green-100">
        <h2 className="text-3xl font-bold text-center text-green-700">
          Iniciar sesión
        </h2>

        <p className="text-gray-500 text-center mt-2 mb-8">
          Bienvenido de nuevo a <Link
            to="/"
            className="text-green-600 font-semibold hover:underline"
          >NutriEdu</Link>
        </p>

        {message && (
          <div
            className={`mb-5 px-4 py-3 rounded-xl text-sm font-medium ${
              messageType === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={loginUser} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-600">
              Correo electrónico
            </label>

            <input
              type="email"
              name="email"
              placeholder="correo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">
              Contraseña
            </label>

            <input
              type="password"
              name="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition disabled:opacity-70"
          >
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6 text-sm">
          ¿No tienes cuenta?{" "}
          <Link
            to="/register"
            className="text-green-600 font-semibold hover:underline"
          >
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}