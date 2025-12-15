import { useState, useEffect } from 'react';
import { createClient } from '../../../utils/supabase/client';
import { AdminTokens } from '../../../styles/admin-tokens';
import { PrimaryButton } from '../AdminButtons';
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign, Receipt, RefreshCw, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';

interface Expense {
    id: string;
    date: string;
    description: string;
    amount: number;
    category: string;
    receipt_url?: string;
}

interface RecurringExpense {
    id: string;
    description: string;
    amount: number;
    category: string;
    frequency: 'monthly' | 'yearly';
    day_of_month: number;
    last_generated_date?: string;
}

export function ExpensesManager({ totalIncome }: { totalIncome: number }) {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [recurring, setRecurring] = useState<RecurringExpense[]>([]);
    const [view, setView] = useState<'list' | 'recurring'>('list');
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const { register, handleSubmit, reset, setValue } = useForm<Expense>();
    const { register: registerRect, handleSubmit: handleSubmitRect, reset: resetRect } = useForm<RecurringExpense>();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const supabase = createClient();

        // Fetch Expenses
        const { data: expData } = await supabase.from('expenses').select('*').order('date', { ascending: false });
        setExpenses(expData || []);

        // Fetch Recurring Rules
        const { data: recData } = await supabase.from('recurring_expenses').select('*');
        setRecurring(recData || []);

        // Client-Side Recurring Check
        if (recData) {
            checkRecurring(recData);
        }

        setLoading(false);
    };

    const checkRecurring = async (rules: RecurringExpense[]) => {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const currentDay = today.getDate();

        // Simple check: If day_of_month passed and last_generated is not this month (or null)
        // Optimization: In a real app we'd track last_generated_date more precisely.
        // For V1: We'll assume if last_generated_date month < currentMonth, it's due.

        const supabase = createClient();
        let created = 0;

        for (const rule of rules) {
            const lastDate = rule.last_generated_date ? new Date(rule.last_generated_date) : null;
            const isDue = !lastDate || (lastDate.getMonth() !== currentMonth && currentDay >= rule.day_of_month);

            if (isDue) {
                // Generate Expense
                await supabase.from('expenses').insert({
                    description: `${rule.description} (Auto)`,
                    amount: rule.amount,
                    category: rule.category,
                    date: new Date().toISOString().split('T')[0]
                });
                // Update Rule
                await supabase.from('recurring_expenses').update({
                    last_generated_date: new Date().toISOString().split('T')[0]
                }).eq('id', rule.id);
                created++;
            }
        }

        if (created > 0) {
            toast.success(`Generated ${created} recurring expenses`);
            // Refresh expenses
            const { data } = await supabase.from('expenses').select('*').order('date', { ascending: false });
            setExpenses(data || []);
        }
    };

    const onSubmitExpense = async (data: Expense) => {
        try {
            const supabase = createClient();
            const { error } = await supabase.from('expenses').insert([data]);
            if (error) throw error;
            toast.success('Expense added');
            setShowForm(false);
            reset();
            fetchData();
        } catch (e) {
            toast.error('Failed to add expense');
        }
    };

    const onSubmitRecurring = async (data: RecurringExpense) => {
        try {
            const supabase = createClient();
            const { error } = await supabase.from('recurring_expenses').insert([data]);
            if (error) throw error;
            toast.success('Recurring rule added');
            resetRect();
            fetchData();
        } catch (e) {
            toast.error('Failed to add rule');
        }
    };

    const deleteExpense = async (id: string) => {
        if (!confirm('Delete expense?')) return;
        const supabase = createClient();
        await supabase.from('expenses').delete().eq('id', id);
        toast.success('Deleted');
        fetchData();
    };

    const deleteRecurring = async (id: string) => {
        if (!confirm('Delete recurring rule?')) return;
        const supabase = createClient();
        await supabase.from('recurring_expenses').delete().eq('id', id);
        toast.success('Deleted');
        fetchData();
    };

    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const profit = totalIncome - totalExpenses;

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                        <span className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Total Income</span>
                    </div>
                    <div className="text-2xl font-bold text-white">${totalIncome.toFixed(2)}</div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded bg-red-500/10 text-red-500 flex items-center justify-center">
                            <TrendingDown className="w-4 h-4" />
                        </div>
                        <span className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Total Expenses</span>
                    </div>
                    <div className="text-2xl font-bold text-white">${totalExpenses.toFixed(2)}</div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded bg-blue-500/10 text-blue-500 flex items-center justify-center">
                            <DollarSign className="w-4 h-4" />
                        </div>
                        <span className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Net Profit</span>
                    </div>
                    <div className={`text-2xl font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        ${profit.toFixed(2)}
                    </div>
                </div>
            </div>

            {/* Toggle View */}
            <div className="flex space-x-4 border-b border-zinc-800">
                <button onClick={() => setView('list')} className={`pb-3 text-sm font-medium border-b-2 transition-colors ${view === 'list' ? 'text-white border-white' : 'text-zinc-500 border-transparent'}`}>One-Time Expenses</button>
                <button onClick={() => setView('recurring')} className={`pb-3 text-sm font-medium border-b-2 transition-colors ${view === 'recurring' ? 'text-white border-white' : 'text-zinc-500 border-transparent'}`}>Recurring Rules</button>
            </div>

            {view === 'list' ? (
                <>
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-white">Expense History</h3>
                        <PrimaryButton onClick={() => setShowForm(!showForm)}>
                            <Plus className="w-4 h-4" /> Add One-Time
                        </PrimaryButton>
                    </div>

                    {showForm && (
                        <form onSubmit={handleSubmit(onSubmitExpense)} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <input {...register('date', { required: true })} type="date" className={AdminTokens.input.base} defaultValue={new Date().toISOString().split('T')[0]} />
                                <input {...register('description', { required: true })} className={AdminTokens.input.base} placeholder="Description" />
                                <input {...register('category')} className={AdminTokens.input.base} placeholder="Category" list="expense-categories" />
                                <datalist id="expense-categories">
                                    <option value="Office Supplies" />
                                    <option value="Software Subscription" />
                                    <option value="Travel" />
                                    <option value="Meals & Entertainment" />
                                    <option value="Contract Labor" />
                                    <option value="Advertising" />
                                    <option value="Rent/Lease" />
                                    <option value="Utilities" />
                                    <option value="Professional Services" />
                                    <option value="Equipment" />
                                </datalist>
                                <input {...register('amount', { required: true })} type="number" step="0.01" className={AdminTokens.input.base} placeholder="Amount" />
                            </div>
                            <div className="flex items-center justify-between">
                                {/* Upload Receipt */}
                                <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer hover:text-white">
                                    <Upload className="w-4 h-4" />
                                    <span>Upload Receipt (Image)</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        try {
                                            toast.loading('Uploading receipt...');
                                            const supabase = createClient();
                                            const fileName = `receipts-${Date.now()}.${file.name.split('.').pop()}`;
                                            await supabase.storage.from('media').upload(fileName, file);
                                            const { data } = supabase.storage.from('media').getPublicUrl(fileName);
                                            setValue('receipt_url', data.publicUrl);
                                            toast.dismiss();
                                            toast.success('Attached');
                                        } catch (e) { toast.error('Upload failed'); }
                                    }} />
                                </label>
                                <PrimaryButton type="submit">Save Expense</PrimaryButton>
                            </div>
                        </form>
                    )}

                    <div className="space-y-2">
                        {expenses.map(expense => (
                            <div key={expense.id} className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-lg group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-zinc-500">
                                        <Receipt className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-white">{expense.description}</span>
                                            {expense.receipt_url && (
                                                <a href={expense.receipt_url} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-zinc-800 px-1 rounded text-blue-400 hover:underline">
                                                    View Receipt
                                                </a>
                                            )}
                                        </div>
                                        <div className="text-xs text-zinc-500">{expense.date} • {expense.category}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-mono text-white text-sm">${Number(expense.amount).toFixed(2)}</span>
                                    <button onClick={() => deleteExpense(expense.id)} aria-label="Delete expense" className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <>
                    <form onSubmit={handleSubmitRect(onSubmitRecurring)} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl space-y-4 mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            <RefreshCw className="w-4 h-4 text-zinc-400" />
                            <h3 className="text-sm font-medium text-white">New Recurring Rule</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="col-span-2">
                                <input {...registerRect('description', { required: true })} className={AdminTokens.input.base} placeholder="Description (e.g. Monthly Server)" />
                            </div>
                            <input {...registerRect('category')} className={AdminTokens.input.base} placeholder="Category" />
                            <input {...registerRect('amount', { required: true })} type="number" step="0.01" className={AdminTokens.input.base} placeholder="Amount" />
                            <div className="flex gap-2">
                                <select {...registerRect('frequency')} className={AdminTokens.input.base}>
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                                <input {...registerRect('day_of_month', { required: true, min: 1, max: 31 })} type="number" className={AdminTokens.input.base} placeholder="Day" />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <PrimaryButton type="submit">Create Rule</PrimaryButton>
                        </div>
                    </form>

                    <div className="space-y-2">
                        {recurring.map(rule => (
                            <div key={rule.id} className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-lg group">
                                <div>
                                    <div className="text-sm font-medium text-white">{rule.description}</div>
                                    <div className="text-xs text-zinc-500">
                                        Runs {rule.frequency} on day {rule.day_of_month} • Last run: {rule.last_generated_date || 'Never'}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-mono text-white text-sm">${Number(rule.amount).toFixed(2)} / mo</span>
                                    <button onClick={() => deleteRecurring(rule.id)} aria-label="Delete recurring rule" className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
