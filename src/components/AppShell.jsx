import NavBar from "./navBar";

export default function AppShell({ children, className = "" }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-100 to-white">
      <NavBar />
      <main className={`max-w-7xl mx-auto px-6 py-10 ${className}`}>
        {children}
      </main>
    </div>
  );
}