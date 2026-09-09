import { Link } from "react-router-dom";
import { useState } from "react";
import api from "../services/api";
import { AuthField, AuthLayout, AuthSubmitButton } from "../components/AuthLayout";
import StatusMessage from "../components/StatusMessage";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [loading, setLoading] = useState(false);

  const requestReset = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      setLoading(true);
      const res = await api.post("/users/forgot-password", { email: email.trim().toLowerCase() });

      setMessage(res.data.message);
      setMessageType("success");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "No se pudo enviar el correo de restablecimiento"
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Recuperar contraseña"
      subtitle="Te enviaremos un enlace seguro para crear una nueva contraseña."
      footer={
        <>
          ¿Recordaste tu contraseña?{" "}
          <Link to="/login" className="font-semibold text-green-700 hover:text-green-800">
            Inicia sesión
          </Link>
        </>
      }
    >
      <StatusMessage message={message} type={messageType} />

      <form onSubmit={requestReset} className="space-y-5">
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

        <AuthSubmitButton loading={loading} loadingText="Enviando...">
          Enviar enlace
        </AuthSubmitButton>
      </form>
    </AuthLayout>
  );
}
