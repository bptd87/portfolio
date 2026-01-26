import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-static";

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-black via-neutral-900 to-black z-0" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[128px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[128px]" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl">
        {/* Connection to "Backstage" metaphor */}
        <div className="mb-8 relative w-64 h-64 md:w-80 md:h-80 grayscale hover:grayscale-0 transition-all duration-700 ease-in-out">
          <Image
            src="/images/brandon-with-cat.png"
            alt="Brandon and his cat looking confused"
            fill
            className="object-cover rounded-full border-2 border-white/10 shadow-2xl"
            priority
          />
          <div className="absolute inset-0 rounded-full ring-1 ring-white/20 ring-offset-4 ring-offset-black" />
        </div>

        <h1 className="font-display text-8xl md:text-9xl text-white mb-2 opacity-90">
          404
        </h1>

        <div className="space-y-4 mb-10">
          <h2 className="font-serif italic text-3xl md:text-4xl text-white/90">
            You've wandered off the set.
          </h2>
          <p className="font-mono text-sm text-white/50 tracking-widest uppercase">
            SCENE MISSING · CAMERA DARK · CHECK SCRIPT
          </p>
          <p className="text-lg text-white/70 max-w-md mx-auto leading-relaxed">
            The page you're looking for seems to have been cut from the final edit (or never existed).
          </p>
        </div>

        <Link
          href="/"
          className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-medium tracking-wide hover:bg-neutral-200 transition-colors"
        >
          <span>RETURN TO STAGE</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>

      {/* Footer minimal */}
      <div className="absolute bottom-8 text-white/20 font-mono text-[10px] uppercase tracking-[0.2em]">
        Error Code: 404_NOT_FOUND
      </div>
    </div>
  );
}
