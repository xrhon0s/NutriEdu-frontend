import NavBar from "./navBar";

export default function LoadingScreen({ text = "Cargando..." }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-100 to-white">
      <NavBar />
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-12 h-12 rounded-full border-4 border-green-200 border-t-green-600 animate-spin mb-4"></div>
        <p className="text-gray-600 text-lg">{text}</p>
      </div>
    </div>
  );
}