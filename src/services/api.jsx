import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api", // backend
});

api.interceptors.request.use((config) => {
  // Enviar token si existe
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Enviar automáticamente el ID del usuario para el middleware admin
  const user = JSON.parse(localStorage.getItem("user"));
  if (user?.id) {
    config.headers["x-user-id"] = user.id; // <-- esto permite que verifyAdmin funcione
  }

  return config;
});

export default api;