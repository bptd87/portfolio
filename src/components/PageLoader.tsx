import React from 'react';

export function PageLoader() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#090d16] via-[#0d1322] to-[#080b12] text-white">
      <div
        className="absolute inset-0 opacity-40"
        style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(251,191,36,0.12), transparent 35%), radial-gradient(circle at 80% 0%, rgba(79,70,229,0.14), transparent 30%), radial-gradient(circle at 60% 70%, rgba(244,114,182,0.12), transparent 28%)' }}
        aria-hidden
      />

      <div
        className="absolute left-1/2 top-1/2 h-[120vmax] w-[120vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[conic-gradient(from_120deg,rgba(251,191,36,0.15),rgba(99,102,241,0.25),rgba(236,72,153,0.2),rgba(251,191,36,0.15))] blur-3xl animate-[spin_26s_linear_infinite]"
        aria-hidden
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_0,rgba(255,255,255,0)_55%)]" aria-hidden />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="mb-10 flex flex-col items-center gap-4">
          <div className="relative h-56 w-56">
            <div className="absolute inset-0 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_0_120px_rgba(251,191,36,0.16)]" />
            <div className="absolute inset-3 rounded-full bg-[#0a0f18]" />
            <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,rgba(251,191,36,0.5),rgba(99,102,241,0.5),rgba(236,72,153,0.5),rgba(251,191,36,0.5))] opacity-60 animate-[spin_14s_linear_infinite]" />
            <div className="absolute inset-4 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent_45%)]" />
            <div className="absolute inset-10 flex items-center justify-center rounded-full bg-black/80">
              <div className="relative h-14 w-14">
                <div className="absolute inset-0 rounded-full border border-amber-200/30 animate-spin" />
                <div className="absolute inset-2 rounded-full border border-white/20" />
                <div className="absolute inset-3 rounded-full bg-gradient-to-br from-amber-300/70 via-white/30 to-indigo-400/70" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-50/70">Brandon PT Davis</p>
            <p className="text-3xl font-display md:text-4xl">Staging the next scene</p>
            <p className="text-sm text-white/60 max-w-xl">Lighting the deck, pulling scenic layers, and setting focus for your next view.</p>
          </div>
        </div>

        <div className="relative w-full max-w-2xl overflow-hidden rounded-full border border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-[pulse_1.8s_ease-in-out_infinite]" aria-hidden />
          <div className="h-2 w-full bg-gradient-to-r from-amber-400/70 via-indigo-400/70 to-pink-400/70" />
        </div>

        <p className="mt-6 text-xs uppercase tracking-[0.3em] text-white/50">Loading</p>
      </div>
    </div>
  );
}
