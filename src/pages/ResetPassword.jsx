import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import api from "../services/api";
import { AuthField, AuthLayout, AuthSubmitButton } from "../components/AuthLayout";
import StatusMessage from "../components/StatusMessage";
import PasswordRequirements from "../components/PasswordRequirements";
import { isPasswordValid } from "../utils/passwordPolicy";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const token = searchParams.get("token");

  const resetPassword = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!token) {
      setMessage("El enlace de restablecimiento no es válido");
      setMessageType("error");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Las contraseñas no coinciden");
      setMessageType("error");
      return;
    }

    if (!isPasswordValid(password)) {
      setMessage("Revisa los requisitos de la contraseña antes de continuar");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/users/reset-password", { token, password });

      setMessage(res.data.message);
      setMessageType("success");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "No se pudo restablecer la contraseña"
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Nueva contraseña"
      subtitle="Crea una contraseña segura para volver a entrar a NutriEdu."
      footer={
        <Link to="/login" className="font-semibold text-green-700 hover:text-green-800">
            Volver al inicio de sesión
        </Link>
      }
    >
      <StatusMessage message={message} type={messageType} />

      <form onSubmit={resetPassword} className="space-y-5">
        <AuthField
          label="Nueva contraseña"
          type="password"
          name="password"
          placeholder="********"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={10}
          maxLength={72}
          aria-invalid={password.length > 0 && !isPasswordValid(password)}
          required
        />

        <PasswordRequirements password={password} />

        <AuthField
          label="Confirmar contraseña"
          type="password"
          name="confirmPassword"
          placeholder="********"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          minLength={10}
          maxLength={72}
          aria-invalid={confirmPassword.length > 0 && password !== confirmPassword}
          required
        />

        {confirmPassword ? <p className={`text-sm font-medium ${password === confirmPassword ? "text-green-700" : "text-red-700"}`} aria-live="polite">{password === confirmPassword ? "Las contraseñas coinciden." : "Las contraseñas no coinciden."}</p> : null}

        <AuthSubmitButton
          loading={loading}
          loadingText="Guardando..."
          disabled={!token || !isPasswordValid(password) || password !== confirmPassword}
        >
          Guardar contraseña
        </AuthSubmitButton>
      </form>
    </AuthLayout>
  );
}
