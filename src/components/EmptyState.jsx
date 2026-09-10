import { Salad } from "lucide-react";

export default function EmptyState({ title, description, action = null, icon: Icon = Salad }) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--color-border)] bg-white px-6 py-10 text-center">
      <Icon aria-hidden="true" className="mx-auto mb-3 text-[var(--color-primary)]" size={30} strokeWidth={1.8} />
      <h3 className="text-lg font-bold text-[var(--color-text)]">{title}</h3>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[var(--color-text-muted)]">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
