export default function StatusMessage({ message, type = "success" }) {
  if (!message) return null;

  const styles =
    type === "success"
      ? "bg-green-100 text-green-700 border-green-200"
      : "bg-red-100 text-red-700 border-red-200";

  return (
    <div className={`mb-6 px-4 py-3 rounded-xl border text-sm font-medium ${styles}`}>
      {message}
    </div>
  );
}