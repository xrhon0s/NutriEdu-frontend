import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/navBar";


export default function Profile() {

  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const restricciones = [
    { id: 1, nombre: "Sin gluten" },
    { id: 2, nombre: "Sin lactosa" },
    { id: 3, nombre: "Diabetes" },
    { id: 4, nombre: "Frutos secos" }
  ];

  const toggleRestriction = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(r => r !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const saveRestrictions = async () => {
    try {
      await api.post("/users/restrictions", {
        userId: user.id,
        restricciones: selected
      });

      alert("Restricciones guardadas");
    navigate("/recipes");
    } catch (error) {
      alert("Error guardando restricciones");
    }
  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-100 to-white">

  <NavBar />

  <div className="p-6">
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-100 to-white p-6">

      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-8">

        <h2 className="text-3xl font-bold text-green-700 mb-4">
          Perfil clínico
        </h2>

        <p className="text-gray-600 mb-6">
          Selecciona tus restricciones alimentarias
        </p>

        <div className="grid grid-cols-2 gap-4">
          {restricciones.map((r) => (
            <button
              key={r.id}
              onClick={() => toggleRestriction(r.id)}
              className={`p-4 rounded-xl border transition ${
                selected.includes(r.id)
                  ? "bg-green-600 text-white"
                  : "bg-white border-gray-200 hover:bg-green-50"
              }`}
            >
              {r.nombre}
            </button>
          ))}
        </div>

        <button
          onClick={saveRestrictions}
          className="w-full mt-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700"
        >
          Guardar restricciones
        </button>

      </div>

    </div>
  </div>

</div>
    
    
  );
}