import { useState, useEffect } from 'react';
import { InfoBanner } from '../InfoBanner';
import { createClient } from '../../../utils/supabase/client';
import { Invoice, TimeEntry } from '../../../types/business';
import { Plus, DollarSign, FileText, Search, Settings } from 'lucide-react';
import { AdminTokens } from '../../../styles/admin-tokens';
import { PrimaryButton } from '../AdminButtons';
import { toast } from 'sonner';
import { generateInvoicePDF } from '../../../utils/invoiceGenerator';
import { InvoiceBuilder } from './InvoiceBuilder';
import { FinanceSettings } from './FinanceSettings';
import { ExpensesManager } from './ExpensesManager';
import { TimeTracker } from './TimeTracker';

export function FinanceManager() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [view, setView] = useState<'invoices' | 'time' | 'expenses' | 'settings' | 'create'>('invoices');
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

        setLoading(false);
    };

    const totalIncome = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total_amount || 0), 0);

    if (view === 'create') {
        return (
            <div className="space-y-6">
                <InfoBanner
                    title="Invoice Builder"
                    description="Create detailed invoices for your clients."
                    icon="📝"
                />
                <InvoiceBuilder
                    onCancel={() => setView('invoices')}
                    onSave={() => {
                        setView('invoices');
                        fetchFinanceData();
                    }}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <InfoBanner
                title="Finance & Operations"
                description="Manage revenue, expenses, and configuration."
                icon="💸"
            />

            {/* View Toggle */}
            <div className="flex space-x-4 border-b border-zinc-800 overflow-x-auto">
                <button onClick={() => setView('invoices')} className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap px-2 ${view === 'invoices' ? 'text-white border-white' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}>
                    Invoices
                </button>
                <button onClick={() => setView('expenses')} className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap px-2 ${view === 'expenses' ? 'text-white border-white' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}>
                    Expenses & Profit
                </button>
                <button onClick={() => setView('time')} className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap px-2 ${view === 'time' ? 'text-white border-white' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}>
                    Time Tracking
                </button>
                <button onClick={() => setView('settings')} className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap px-2 ml-auto flex items-center gap-1 ${view === 'settings' ? 'text-white border-white' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}>
                    <Settings className="w-3.5 h-3.5" /> Config
                </button>
            </div>

            {/* --- INVOICES VIEW --- */}
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
                        <PrimaryButton onClick={() => setView('create')}>
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
                                    <div className="text-right flex flex-col items-end gap-2">
                                        <span className="block text-white font-mono font-medium">${inv.total_amount?.toFixed(2)}</span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                    inv.status === 'sent' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                        'bg-zinc-800 text-zinc-500 border-zinc-700'
                                                    } hover:opacity-80 transition-opacity`}
                                                title="Toggle Status (Draft -> Sent -> Paid)"
                                                onClick={async () => {
                                                    const nextStatus = inv.status === 'draft' ? 'sent' : inv.status === 'sent' ? 'paid' : 'draft';
                                                    const supabase = createClient();
                                                    await supabase.from('invoices').update({ status: nextStatus }).eq('id', inv.id);
                                                    fetchFinanceData();
                                                }}
                                            >
                                                {inv.status}
                                            </button>

                                            <div className="h-4 w-px bg-zinc-800 mx-1"></div>

                                            <button
                                                onClick={() => generateInvoicePDF(inv, (inv.company as any)?.name || 'Valued Client', (inv as any).payment_info, (inv as any).payment_qr_url)}
                                                className="text-xs text-zinc-400 hover:text-white underline"
                                            >
                                                PDF
                                            </button>

                                            <button
                                                onClick={async () => {
                                                    if (!confirm('Delete this invoice?')) return;
                                                    const supabase = createClient();
                                                    await supabase.from('invoices').delete().eq('id', inv.id);
                                                    toast.success('Invoice deleted');
                                                    fetchFinanceData();
                                                }}
                                                className="p-1 text-zinc-600 hover:text-red-400 transition-colors"
                                                title="Delete Invoice"
                                            >
                                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* --- EXPENSES VIEW --- */}
            {view === 'expenses' && <ExpensesManager totalIncome={totalIncome} />}

            {/* --- SETTINGS VIEW --- */}
            {view === 'settings' && <FinanceSettings onClose={() => setView('invoices')} />}

            {/* --- TIME TRACKING VIEW --- */}
            {view === 'time' && <TimeTracker />}
        </div>
    );
}
