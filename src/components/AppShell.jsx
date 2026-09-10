import NavBar from "./navBar";

export default function AppShell({ children, className = "" }) {
  return (
    <div className="min-h-screen bg-[var(--color-canvas)]">
      <NavBar />
      <main className={`mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 ${className}`}>
        {children}
      </main>
    </div>
  );
}
