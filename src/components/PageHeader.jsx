export default function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-green-700">{title}</h1>
      {subtitle && (
        <p className="text-gray-600 mt-2 max-w-2xl">{subtitle}</p>
      )}
    </div>
  );
}