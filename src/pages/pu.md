<div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-100 to-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-green-700">
            Recetas seguras
          </h1>
          <p className="text-gray-600 mt-2">
            Estas recetas son compatibles con tus restricciones alimentarias.
          </p>
        </div>

        {recipes.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-md p-8 text-center">
            <p className="text-gray-500">
              No se encontraron recetas seguras para este usuario.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-white rounded-3xl shadow-md p-6 border border-green-100 hover:shadow-xl hover:-translate-y-1 transition"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center text-2xl shrink-0">
                    🥗
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getHealthColor(
                      recipe.nivel_salud
                    )}`}
                  >
                    {getHealthLabel(recipe.nivel_salud)}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  {recipe.nombre}
                </h2>

                <p className="text-gray-600 text-sm mb-5 min-h-[60px]">
                  {recipe.descripcion}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 rounded-2xl p-3">
                    <p className="text-xs text-gray-500">Calorías</p>
                    <p className="font-semibold text-gray-800">
                      {recipe.calorias} kcal
                    </p>
                  </div>

                  <div className="bg-green-50 rounded-2xl p-3">
                    <p className="text-xs text-gray-500">Tiempo</p>
                    <p className="font-semibold text-gray-800">
                      {recipe.tiempo_preparacion
                        ? `${recipe.tiempo_preparacion} min`
                        : "No definido"}
                    </p>
                  </div>

                  <div className="bg-green-50 rounded-2xl p-3 col-span-2">
                    <p className="text-xs text-gray-500">Nivel de salud</p>
                    <p className="font-semibold text-gray-800">
                      {recipe.nivel_salud}/5
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    Segura para ti
                  </span>

                  <button className="text-green-700 font-semibold text-sm hover:underline">
                    Ver más
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>