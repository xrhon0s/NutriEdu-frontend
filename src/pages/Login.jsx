import { Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginUser = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:3000/api/users/login",
        { email, password }
      );

      localStorage.setItem("token", res.data.token);

      alert("Login exitoso");
    } catch (error) {
      alert("Error en login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-100 to-white px-4">
      <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-md border border-green-100">
        <h2 className="text-3xl font-bold text-center text-green-700">
          Iniciar sesión
        </h2>

        <p className="text-gray-500 text-center mt-2 mb-8">
          Bienvenido de nuevo a NutriEdu
        </p>

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
            className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition"
          >
            Iniciar sesión
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