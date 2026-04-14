import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import NavBar from "../components/navBar";

export default function Profile() {
  const [selected, setSelected] = useState([]);
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const restricciones = [
    { id: 1, nombre: "Sin gluten" },
    { id: 2, nombre: "Sin lactosa" },
    { id: 3, nombre: "Diabetes" },
    { id: 4, nombre: "Frutos secos" }
  ];

  useEffect(() => {
    const loadRestrictions = async () => {
      try {
        const res = await api.get(`/users/restrictions/${user.id}`);

        if (res.data.hasRestrictions) {
          const ids = res.data.restrictions.map((r) => r.restriccion_id);
          setSelected(ids);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setChecking(false);
      }
    };

    if (user?.id) {
      loadRestrictions();
    }
  }, [user?.id]);

  const toggleRestriction = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((r) => r !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const saveRestrictions = async () => {
    try {
      setSaving(true);
      setMessage("");

      await api.post("/users/restrictions", {
        userId: user.id,
        restricciones: selected
      });

      setMessage("Restricciones guardadas correctamente");
      setMessageType("success");

      setTimeout(() => {
        navigate("/recipes");
      }, 800);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error guardando restricciones");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-100 to-white">
        <NavBar />
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-600">Cargando perfil clínico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-100 to-white">
      <NavBar />

      <div className="p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-green-700 mb-4">
            Perfil clínico
          </h2>

          <p className="text-gray-600 mb-6">
            Selecciona o actualiza tus restricciones alimentarias
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

          <div className="grid grid-cols-2 gap-4">
            {restricciones.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => toggleRestriction(r.id)}
                className={`p-4 rounded-xl border transition ${
                  selected.includes(r.id)
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white border-gray-200 hover:bg-green-50"
                }`}
              >
                {r.nombre}
              </button>
            ))}
          </div>

          <button
            onClick={saveRestrictions}
            disabled={saving}
            className="w-full mt-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition disabled:opacity-70"
          >
            {saving ? "Guardando..." : "Guardar restricciones"}
          </button>
        </div>
      </div>
    </div>
  );
}