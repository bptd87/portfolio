import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Mail, ArrowRight } from 'lucide-react';

interface AdminLoginProps {
    onLogin: (e: React.FormEvent) => Promise<void>;
    loading: boolean;
    error: string;
    email: string;
    setEmail: (email: string) => void;
    password: string;
    setPassword: (password: string) => void;
    onNavigate: (page: string) => void;
}

export function AdminLogin({
    onLogin,
    loading,
    error,
    email,
    setEmail,
    password,
    setPassword,
    onNavigate
}: AdminLoginProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[128px]" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[128px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Card Container */}
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">

                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/5 border border-white/10 rounded-2xl mb-6 shadow-inner">
                            <Lock className="w-6 h-6 text-white/80" />
                        </div>
                        <h1 className="font-display text-4xl text-white mb-3">Studio Access</h1>
                        <p className="font-mono text-[10px] tracking-widest uppercase text-white/40">Authorized Personnel Only</p>
                    </div>

                    <form onSubmit={onLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold tracking-widest uppercase text-white/40 ml-1">
                                Email Address
                            </label>
                            <div className="relative group">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:border-white/30 focus:bg-white/10 focus:outline-none transition-all text-white placeholder:text-white/20 font-sans"
                                    placeholder="name@scenic.studio"
                                    autoComplete="email"
                                    required
                                />
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-white/70 transition-colors pointer-events-none" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold tracking-widest uppercase text-white/40 ml-1">
                                Password
                            </label>
                            <div className="relative group">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl focus:border-white/30 focus:bg-white/10 focus:outline-none transition-all text-white placeholder:text-white/20 font-sans"
                                    placeholder="••••••••••••"
                                    autoComplete="current-password"
                                    required
                                />
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-white/70 transition-colors pointer-events-none" />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-white/30 hover:text-white/80 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                                <p className="text-red-200 text-xs leading-relaxed">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full relative group overflow-hidden px-6 py-4 bg-white text-black rounded-xl font-medium tracking-wide hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? 'Authenticating...' : 'Enter Studio'}
                                {!loading && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
                            </span>
                        </button>
                    </form>

                    <button
                        onClick={() => onNavigate('home')}
                        className="w-full mt-8 text-[10px] tracking-widest uppercase text-white/30 hover:text-white/60 transition-colors flex items-center justify-center gap-2 group"
                    >
                        <span className="group-hover:-translate-x-1 transition-transform">←</span> Return to Portfolio
                    </button>
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="font-mono text-[10px] text-white/20 uppercase tracking-widest">Secured System · v2.4.0</p>
                </div>
            </div>
        </div>
    );
}
