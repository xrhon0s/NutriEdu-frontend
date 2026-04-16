export default function EmptyState({ title, description }) {
  return (
    <div className="bg-white border border-green-100 rounded-3xl shadow-sm p-8 text-center">
      <div className="text-4xl mb-3">🌿</div>
      <h3 className="text-xl font-bold text-gray-800">{title}</h3>
      <p className="text-gray-500 mt-2">{description}</p>
    </div>
  );
}