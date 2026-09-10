export default function PageHeader({ title, subtitle, actions = null }) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-3xl font-bold text-[var(--color-text)]">{title}</h1>
        {subtitle ? <p className="mt-2 max-w-3xl leading-6 text-[var(--color-text-muted)]">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
