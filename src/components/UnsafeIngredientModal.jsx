import React, { useState, useEffect } from "react";

export default function UnsafeIngredientModal({ isOpen, onClose, unsafeIngredients, substitutes, recipeName }) {
  const [chosenSubs, setChosenSubs] = useState({});
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => setAnimate((prev) => !prev), 700);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (original, selected) => {
    setChosenSubs({ ...chosenSubs, [original]: selected });
  };

  const handleConfirm = () => {
    onClose(chosenSubs); // devuelve sustituciones seleccionadas
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-700 bg-opacity-80">
      <div className="bg-white rounded-xl p-6 max-w-xl w-full shadow-lg border-4 border-red-600">
        <h2 className="text-2xl font-bold text-red-800 mb-4">
          ⚠️ Ingredientes no seguros en "{recipeName}"
        </h2>
        <p className="text-gray-700 mb-6">
          La receta contiene ingredientes que no son seguros según tu perfil. Selecciona sustitutos si deseas.
        </p>

        {unsafeIngredients.map((ing, idx) => (
          <div key={idx} className={`mb-4 p-2 rounded transition-all ${animate ? "bg-red-100" : "bg-red-200"}`}>
            <p className="font-semibold text-red-700">{ing.nombre}</p>
            <select
              className="w-full border p-2 rounded mt-1"
              onChange={(e) => handleChange(ing.nombre, e.target.value)}
              value={chosenSubs[ing.nombre] || ""}
            >
              <option value="">-- Mantener --</option>
              {substitutes[idx].opciones.map((s) => (
                <option key={s.id} value={s.nombre}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>
        ))}

        <button
          className="mt-4 w-full py-3 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition"
          onClick={handleConfirm}
        >
          Confirmar y cerrar
        </button>
      </div>
    </div>
  );
}