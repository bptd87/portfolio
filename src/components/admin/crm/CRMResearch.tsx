import { useState } from 'react';
import { AdminTokens } from '../../../styles/admin-tokens';
import { Search, MapPin, Globe, Sparkles, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '../../../utils/supabase/client';

interface CRMResearchProps {
    onCompanyAdded?: () => void;
}

export function CRMResearch({ onCompanyAdded }: CRMResearchProps) {
    const [city, setCity] = useState('');
    const [radius, setRadius] = useState('50');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any[]>([]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResults([]);

        try {
            const supabase = createClient();

            // 120 second timeout for Extreme Latency
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Search timed out (AI is taking too long)')), 120000)
            );

            const { data, error } = await Promise.race([
                supabase.functions.invoke('research-theatres', {
                    body: { city, radius }
                }),
                timeoutPromise
            ]) as any;

            if (error) throw error;
            setResults(data);
        } catch (error: any) {
            console.error('Search failed:', error);

            // Specific handling for Auth errors
            if (error.message?.includes('auth') || error.status === 401 || error.status === 403) {
                toast.error('Session expired. Please sign out and log in again.');
            } else if (error.message?.includes('timed out')) {
                toast.error('Search timed out. Please try again (Cold Start).');
            } else {
                toast.error('AI Connection failed. Using simulation.');
            }

            // Fallback simulation so the UI doesn't break if function isn't deployed yet
            setTimeout(() => {
                setResults([
                    {
                        name: 'South Coast Repertory',
                        city: 'Costa Mesa',
                        state: 'CA',
                        website: 'www.scr.org',
                        reason: 'Fallback Result: Major LORT Theatre',
                        contacts: [{ role: 'Artistic Director', name: 'David Ivers', email: 'david@scr.org' }]
                    }
                ]);
            }, 1000);
        } finally {
            setLoading(false);
        }
    };

    const addToCRM = async (theatre: any) => {
        try {
            const supabase = createClient();

            // 1. Insert Company
            const { data: company, error } = await supabase.from('companies').insert([{
                name: theatre.name,
                status: 'prospect',
                type: 'theater',
                website: theatre.website,
                address: { city: theatre.city, state: theatre.state, country: 'USA' }
            } as any]).select().single() as { data: any, error: any };

            if (error) throw error;

            // 2. Insert Contacts 
            if (theatre.contacts && theatre.contacts.length > 0) {
                const contactsToInsert = theatre.contacts.map((c: any) => ({
                    company_id: company.id,
                    name: c.name,
                    role: c.role,
                    email: c.email
                }));

                // @ts-ignore
                const { error: contactError } = await supabase.from('crm_contacts').insert(contactsToInsert);

                if (contactError) {
                    console.error('Contact save error:', contactError);
                    toast.warning('Company saved, but contacts failed (Table might not exist yet?)');
                } else {
                    toast.success(`Imported ${theatre.name} + ${theatre.contacts.length} contacts`);
                }
            } else {
                toast.success(`Imported ${theatre.name}`);
            }

            // Refresh parent list
            if (onCompanyAdded) onCompanyAdded();

        } catch (err) {
            console.error(err);
            toast.error('Failed to import');
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-full mb-4">
                    <Sparkles className="w-6 h-6 text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">AI Theatre Finder</h2>
                <p className="text-zinc-400">Find new theatre leads and key staff contacts.</p>
            </div>

            <form onSubmit={handleSearch} className="flex gap-4 mb-8 bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 border-indigo-500/20 shadow-lg shadow-indigo-500/5">
                <div className="flex-1">
                    <label className="block text-xs font-medium text-zinc-500 mb-1">Target City</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="e.g. Irvine, CA"
                            className={`${AdminTokens.input.base} pl-10 w-full`}
                            required
                        />
                    </div>
                </div>
                <div className="w-32">
                    <label className="block text-xs font-medium text-zinc-500 mb-1">Radius (mi)</label>
                    <select
                        value={radius}
                        onChange={(e) => setRadius(e.target.value)}
                        className={AdminTokens.input.base}
                        aria-label="Search Radius"
                    >
                        <option value="10">10 miles</option>
                        <option value="25">25 miles</option>
                        <option value="50">50 miles</option>
                        <option value="100">100 miles</option>
                    </select>
                </div>
                <div className="flex items-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`${AdminTokens.button.primary} bg-indigo-600 hover:bg-indigo-500 min-w-[140px]`}
                        title="Search for Theatres"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Search className="w-4 h-4 mr-2" />
                                Find Leads
                            </>
                        )}
                    </button>
                </div>
            </form>

            <div className="space-y-3">
                {results.map((r, i) => (
                    <div key={i} className="flex items-start justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${i * 100}ms` }}>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-lg mt-1">
                                🎭
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-200 text-lg">{r.name}</h3>

                                <div className="flex items-center gap-4 text-sm text-zinc-400 mt-1 mb-3">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {r.city}, {r.state}
                                    </span>
                                    {r.website && (
                                        <a
                                            href={`https://${r.website}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors hover:underline"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Globe className="w-3 h-3" />
                                            {r.website}
                                        </a>
                                    )}
                                </div>

                                <div className="mb-3 text-xs text-zinc-300 bg-indigo-500/10 inline-block px-2 py-1 rounded border border-indigo-500/20">
                                    <Sparkles className="w-3 h-3 inline mr-1 text-indigo-400" />
                                    {r.reason}
                                </div>

                                {r.contacts && r.contacts.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Key Contacts found:</p>
                                        {r.contacts.map((c: any, idx: number) => (
                                            <div key={idx} className="flex items-center gap-2 text-sm text-zinc-300">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                <span className="text-zinc-500 w-32 truncate">{c.role}</span>
                                                <span className="font-medium">{c.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => addToCRM(r)}
                            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors bg-zinc-800/50 border border-zinc-700"
                            title="Add to CRM"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
