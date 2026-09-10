import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

export default function StatusMessage({ message, type = "success" }) {
  if (!message) return null;

  const variants = {
    success: { className: "border-green-200 bg-green-50 text-green-800", Icon: CheckCircle2 },
    error: { className: "border-red-200 bg-red-50 text-red-800", Icon: AlertTriangle },
    info: { className: "border-sky-200 bg-sky-50 text-sky-800", Icon: Info },
    warning: { className: "border-amber-200 bg-amber-50 text-amber-900", Icon: AlertTriangle },
  };
  const variant = variants[type] || variants.info;
  const Icon = variant.Icon;

  return (
    <div className={`mb-6 flex items-start gap-3 rounded-lg border px-4 py-3 text-sm font-medium ${variant.className}`} role={type === "error" ? "alert" : "status"}>
      <Icon aria-hidden="true" className="mt-0.5 shrink-0" size={18} />
      <span>{message}</span>
    </div>
  );
}
