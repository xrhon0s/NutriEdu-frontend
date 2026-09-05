import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../services/api";
import { AuthField, AuthLayout, AuthSubmitButton } from "../components/AuthLayout";
import StatusMessage from "../components/StatusMessage";
import PasswordRequirements from "../components/PasswordRequirements";
import { isPasswordValid } from "../utils/passwordPolicy";

export default function Register() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const registerUser = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!isPasswordValid(password)) {
      setMessage("Revisa los requisitos de la contraseña antes de continuar");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      await api.post("/users/register", { nombre, email, password });

      setMessage("Usuario registrado correctamente");
      setMessageType("success");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error en registro");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Crear cuenta"
      subtitle="Empieza con tu perfil para recibir recetas más seguras para ti."
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="font-semibold text-green-700 hover:text-green-800">
            Inicia sesión
          </Link>
        </>
      }
    >
      <StatusMessage message={message} type={messageType} />

      <form onSubmit={registerUser} className="space-y-5">
        <AuthField
          label="Nombre"
          type="text"
          name="nombre"
          placeholder="Tu nombre"
          autoComplete="name"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />

        <AuthField
          label="Correo electrónico"
          type="email"
          name="email"
          placeholder="correo@email.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <AuthField
          label="Contraseña"
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

        <AuthSubmitButton loading={loading} loadingText="Registrando..." disabled={!isPasswordValid(password)}>
          Registrarse
        </AuthSubmitButton>
      </form>
    </AuthLayout>
  );
}
