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

      {!token ? (
        <div className="space-y-5">
          <StatusMessage message="Este enlace no contiene un token de recuperación válido. Solicita uno nuevo." type="error" />
          <Link to="/forgot-password" className="flex min-h-12 items-center justify-center rounded-lg border border-[var(--color-border)] px-4 py-3 font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-primary-soft)]">
            Solicitar otro enlace
          </Link>
        </div>
      ) : (
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
          aria-describedby="reset-password-requirements"
          required
        />

        <PasswordRequirements password={password} id="reset-password-requirements" />

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
          error={confirmPassword && password !== confirmPassword ? "Las contraseñas no coinciden." : ""}
          hint={confirmPassword && password === confirmPassword ? "Las contraseñas coinciden." : ""}
          required
        />

        <AuthSubmitButton
          loading={loading}
          loadingText="Guardando..."
          disabled={!token || !isPasswordValid(password) || password !== confirmPassword}
        >
          Guardar contraseña
        </AuthSubmitButton>
      </form>
      )}
    </AuthLayout>
  );
}
