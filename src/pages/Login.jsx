import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../services/api";
import { AuthField, AuthLayout, AuthSubmitButton } from "../components/AuthLayout";
import StatusMessage from "../components/StatusMessage";

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

      const normalizedEmail = email.trim().toLowerCase();
      const res = await api.post("/users/login", { email: normalizedEmail, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      try {
        const restrictionsRes = await api.get(`/users/restrictions/${res.data.user.id}`);
        if (restrictionsRes.data.hasRestrictions) {
          navigate("/recipes");
        } else {
          navigate("/profile");
        }
      } catch {
        navigate("/profile");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Error en login");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Iniciar sesión"
      subtitle="Bienvenido de nuevo. Continúa con tu perfil nutricional personalizado."
      footer={
        <>
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="font-semibold text-green-700 hover:text-green-800">
            Regístrate
          </Link>
        </>
      }
    >
      <StatusMessage message={message} type={messageType} />

      <div className="space-y-5">
        <form onSubmit={loginUser} className="space-y-5">
          <AuthField
            label="Correo electrónico"
            type="email"
            name="email"
            placeholder="correo@email.com"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <AuthField
            label="Contraseña"
            type="password"
            name="password"
            placeholder="********"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <AuthSubmitButton loading={loading} loadingText="Ingresando...">
            Iniciar sesión
          </AuthSubmitButton>
        </form>

        <div className="text-center">
          <Link
            to="/forgot-password"
            className="text-sm font-semibold text-green-700 hover:text-green-800"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
