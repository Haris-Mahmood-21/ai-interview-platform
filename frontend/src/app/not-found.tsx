import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <p className="text-6xl font-bold text-gray-800 mb-4">404</p>
        <p className="text-white font-medium mb-2">Page not found</p>
        <p className="text-gray-500 text-sm mb-6">
          The page you're looking for doesn't exist.
        </p>
        <Link
          href="/dashboard"
          className="text-indigo-400 hover:text-indigo-300 text-sm border border-indigo-800 px-4 py-2 rounded-lg transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}