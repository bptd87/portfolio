import { useState, useEffect } from 'react';
import { InfoBanner } from '../InfoBanner';
import { createClient } from '../../../utils/supabase/client';
import { Invoice, TimeEntry } from '../../../types/business';
import { Plus, DollarSign, Clock, FileText, Search } from 'lucide-react';
import { AdminTokens } from '../../../styles/admin-tokens';
import { PrimaryButton } from '../AdminButtons';
import { toast } from 'sonner';

export function FinanceManager() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
    const [view, setView] = useState<'invoices' | 'time'>('invoices');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFinanceData();
    }, []);

    const fetchFinanceData = async () => {
        setLoading(true);
        const supabase = createClient();

        // Fetch Invoices
        const { data: invData } = await supabase.from('invoices').select('*, companies(name)').order('issue_date', { ascending: false });
        setInvoices(invData || []);

        // Fetch Time Entries (mock or real if table exists)
        // Assuming table 'time_entries' exists from migration
        const { data: timeData } = await supabase.from('time_entries').select('*').order('date', { ascending: false });
        setTimeEntries(timeData || []);

        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <InfoBanner
                title="Finance & Hours"
                description="Manage invoices, payments, and track billable hours."
                icon="💸"
            />

            {loading && <div className="text-zinc-500 text-sm">Loading finance data...</div>}

            {/* Toggle View */}
            <div className="flex space-x-4 border-b border-zinc-800">
                <button
                    onClick={() => setView('invoices')}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors ${view === 'invoices' ? 'text-white border-white' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
                >
                    Invoices
                </button>
                <button
                    onClick={() => setView('time')}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors ${view === 'time' ? 'text-white border-white' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
                >
                    Time Tracking
                </button>
            </div>

            {view === 'invoices' && (
                <div className="space-y-4">
                    <div className={AdminTokens.flexBetween}>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search invoices..."
                                className={`${AdminTokens.input.base} pl-9 w-64`}
                            />
                        </div>
                        <PrimaryButton onClick={() => toast.info('Create Invoice - Coming Next')}>
                            <Plus className="w-4 h-4" />
                            <span>New Invoice</span>
                        </PrimaryButton>
                    </div>

                    {invoices.length === 0 ? (
                        <div className="py-12 text-center border border-dashed border-zinc-800 rounded-xl">
                            <FileText className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                            <h3 className="text-zinc-300 font-medium">No invoices found</h3>
                            <p className="text-zinc-500 text-sm mt-1">Create your first invoice to get started.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {invoices.map(inv => (
                                <div key={inv.id} className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-emerald-900/20 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                                            <DollarSign className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-medium">{inv.number}</h4>
                                            <p className="text-xs text-zinc-400">{(inv.company as any)?.name || 'Unknown Client'} • {inv.issue_date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-white font-mono font-medium">${inv.total_amount?.toFixed(2)}</span>
                                        <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            inv.status === 'sent' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                'bg-zinc-800 text-zinc-500 border-zinc-700'
                                            }`}>
                                            {inv.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {view === 'time' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium text-zinc-400">Recent Entries</h3>
                        <PrimaryButton onClick={() => toast.info('Log Time - Coming Next')}>
                            <Plus className="w-4 h-4" /> Log Hours
                        </PrimaryButton>
                    </div>

                    {timeEntries.length === 0 ? (
                        <div className="py-12 text-center border border-dashed border-zinc-800 rounded-xl">
                            <Clock className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                            <h3 className="text-zinc-300 font-medium">No time entries</h3>
                            <p className="text-zinc-500 text-sm mt-1">Log your work hours to generate invoices.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {timeEntries.map(entry => (
                                <div key={entry.id} className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                                    <div className="flex justify-between">
                                        <span className="text-white font-medium">{entry.description}</span>
                                        <span className="text-zinc-400 font-mono">{entry.hours}h</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
