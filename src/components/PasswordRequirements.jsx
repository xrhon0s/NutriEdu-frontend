import { passwordChecks } from "../utils/passwordPolicy";

const requirements = [
  ["minLength", "Al menos 10 caracteres"],
  ["maxLength", "Máximo 72 caracteres"],
  ["uppercase", "Una letra mayúscula"],
  ["lowercase", "Una letra minúscula"],
  ["number", "Un número"],
  ["symbol", "Un símbolo, por ejemplo ! @ # $"],
];

export default function PasswordRequirements({ password }) {
  const checks = passwordChecks(password);
  const complete = password.length > 0 && Object.values(checks).every(Boolean);

  return (
    <div className={`rounded-lg border p-3 text-sm ${complete ? "border-green-200 bg-green-50" : "border-slate-200 bg-slate-50"}`} aria-live="polite">
      <p className={`font-semibold ${complete ? "text-green-700" : "text-slate-700"}`}>
        {complete ? "La contraseña cumple todos los requisitos." : "Tu contraseña debe incluir:"}
      </p>
      <ul className="mt-2 grid gap-1 sm:grid-cols-2">
        {requirements.map(([key, label]) => (
          <li key={key} className={checks[key] ? "text-green-700" : "text-slate-500"}>
            <span aria-hidden="true" className="mr-2 font-bold">{checks[key] ? "✓" : "○"}</span>{label}
          </li>
        ))}
      </ul>
    </div>
  );
}
