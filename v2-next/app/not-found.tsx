export const dynamic = "force-static";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-serif">Page not found</h1>
        <p className="text-white/60">The page you are looking for doesn’t exist.</p>
      </div>
    </div>
  );
}
