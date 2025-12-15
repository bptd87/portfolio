import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Play, Square, Plus, Clock, Save, Trash2, Calendar, Briefcase, DollarSign, Pencil, X } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '../../../utils/supabase/client';
import { TimeEntry, Company } from '../../../types/business';
import { AdminTokens } from '../../../styles/admin-tokens';
import { PrimaryButton, SecondaryButton, IconButton } from '../AdminButtons';

export function TimeTracker() {
    const [entries, setEntries] = useState<TimeEntry[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTimer, setActiveTimer] = useState<{ start: number, description: string } | null>(null);
    const [elapsed, setElapsed] = useState(0);
    const [editingId, setEditingId] = useState<string | null>(null);

    const { register, handleSubmit, reset, setValue } = useForm<Partial<TimeEntry>>();

    // Load Data
    useEffect(() => {
        fetchData();
        // Check for active timer in local storage to persist across reloads
        const savedTimer = localStorage.getItem('active_timer');
        if (savedTimer) {
            const parsed = JSON.parse(savedTimer);
            setActiveTimer(parsed);
        }
    }, []);

    // Timer Ticker
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (activeTimer) {
            interval = setInterval(() => {
                setElapsed(Math.floor((Date.now() - activeTimer.start) / 1000));
            }, 1000);
        } else {
            setElapsed(0);
        }
        return () => clearInterval(interval);
    }, [activeTimer]);

    const fetchData = async () => {
        try {
            const supabase = createClient();
            const [timeRes, compRes] = await Promise.all([
                supabase.from('time_entries').select('*').order('date', { ascending: false }),
                supabase.from('companies').select('id, name').order('name')
            ]);

            if (timeRes.data) setEntries(timeRes.data as any);
            if (compRes.data) setCompanies(compRes.data as any);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const toggleTimer = () => {
        if (activeTimer) {
            // STOP
            const hours = elapsed / 3600;
            // Pop modal or save directly? Saving as draft entry.
            saveEntry({
                date: new Date().toISOString().split('T')[0],
                hours: parseFloat(hours.toFixed(2)),
                description: activeTimer.description || 'Tracked Time',
                billable: true,
                status: 'unbilled'
            } as any);
            setActiveTimer(null);
            localStorage.removeItem('active_timer');
            setElapsed(0);
        } else {
            // START
            const now = Date.now();
            const newTimer = { start: now, description: '' };
            setActiveTimer(newTimer);
            localStorage.setItem('active_timer', JSON.stringify(newTimer));
        }
    };

    const saveEntry = async (data: Partial<TimeEntry>) => {
        try {
            const supabase = createClient();

            if (editingId) {
                const { error } = await supabase.from('time_entries').update({
                    ...data,
                    company_id: data.company_id || null,
                }).eq('id', editingId);
                if (error) throw error;
                toast.success('Time log updated');
                setEditingId(null);
            } else {
                const { error } = await supabase.from('time_entries').insert([{
                    ...data,
                    company_id: data.company_id || null, // Handle empty string from select
                    date: data.date || new Date().toISOString().split('T')[0],
                    status: 'unbilled'
                }]);
                if (error) throw error;
                toast.success('Time log saved');
            }

            reset();
            fetchData();
        } catch (e) {
            console.error(e);
            toast.error('Failed to save time');
        }
    };

    const handleEdit = (entry: TimeEntry) => {
        setEditingId(entry.id);
        setValue('description', entry.description);
        setValue('hours', entry.hours);
        setValue('date', entry.date);
        setValue('company_id', entry.company_id);
        setValue('billable', entry.billable);

        // Scroll to form (optional, but good UX)
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        reset();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this entry?')) return;
        const supabase = createClient();
        await supabase.from('time_entries').delete().eq('id', id);
        fetchData();
        toast.success('Deleted');
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="space-y-6">
            {/* Top Bar: Timer & Quick Add */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Timer Card */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                    <div className="text-4xl font-mono text-white mb-4 tracking-widest font-bold">
                        {formatTime(elapsed)}
                    </div>
                    <div className="flex gap-4 w-full">
                        {activeTimer ? (
                            <button
                                onClick={toggleTimer}
                                className="flex-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors border border-red-500/20"
                            >
                                <Square className="w-5 h-5 fill-current" />
                                <span>Stop Timer</span>
                            </button>
                        ) : (
                            <button
                                onClick={toggleTimer}
                                className="flex-1 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors border border-emerald-500/20"
                            >
                                <Play className="w-5 h-5 fill-current" />
                                <span>Start Timer</span>
                            </button>
                        )}
                    </div>
                    {activeTimer && (
                        <input
                            className="mt-4 bg-transparent text-center text-sm text-zinc-400 focus:text-white outline-none w-full"
                            placeholder="What are you working on?"
                            value={activeTimer.description}
                            onChange={(e) => {
                                const newT = { ...activeTimer, description: e.target.value };
                                setActiveTimer(newT);
                                localStorage.setItem('active_timer', JSON.stringify(newT));
                            }}
                        />
                    )}
                </div>

                {/* Manual Entry Form */}
                <div className={`lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6 relative ${editingId ? 'ring-1 ring-emerald-500' : ''}`}>
                    <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                        {editingId ? <Pencil className="w-4 h-4 text-emerald-500" /> : <Plus className="w-4 h-4 text-emerald-500" />}
                        {editingId ? 'Edit Time Entry' : 'Log Hours Manually'}
                    </h3>

                    {editingId && (
                        <button
                            onClick={cancelEdit}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-white"
                            title="Cancel Edit"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}

                    <form onSubmit={handleSubmit(saveEntry)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-1">Description</label>
                                <input {...register('description', { required: true })} className={AdminTokens.input.base} placeholder="e.g. Website Redesign" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-1">Client</label>
                                <select {...register('company_id')} className={AdminTokens.input.base}>
                                    <option value="">-- No Client --</option>
                                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-1">Date</label>
                                <input type="date" {...register('date')} defaultValue={new Date().toISOString().split('T')[0]} className={AdminTokens.input.base} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-1">Hours</label>
                                <input type="number" step="0.25" {...register('hours', { required: true })} className={AdminTokens.input.base} placeholder="0.00" />
                            </div>
                            <div className="flex items-center gap-3 pt-6">
                                <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                                    <input type="checkbox" {...register('billable')} defaultChecked className="rounded border-zinc-700 bg-zinc-800 text-emerald-500" />
                                    Billable
                                </label>
                                <PrimaryButton type="submit" className="flex-1 ml-auto">
                                    <Save className="w-4 h-4" />
                                    <span>{editingId ? 'Update Log' : 'Log Time'}</span>
                                </PrimaryButton>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Recent Entries */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                    <h3 className="font-medium text-white flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-400" />
                        Recent Activity
                    </h3>
                    <span className="text-xs text-zinc-500">Last 30 days</span>
                </div>

                <div className="divide-y divide-zinc-800/50">
                    {loading ? (
                        <div className="p-8 text-center text-zinc-500">Loading activity...</div>
                    ) : entries.length === 0 ? (
                        <div className="p-8 text-center text-zinc-500">No time logged yet. Start the timer!</div>
                    ) : (
                        entries.map(entry => (
                            <div key={entry.id} className={`p-4 hover:bg-zinc-800/30 transition-colors flex items-center justify-between group ${editingId === entry.id ? 'bg-emerald-900/10 border-l-2 border-emerald-500' : ''}`}>
                                <div className="flex items-start gap-4">
                                    <div className={`mt-1 w-2 h-2 rounded-full ${entry.billable ? 'bg-emerald-500' : 'bg-zinc-600'}`} title={entry.billable ? 'Billable' : 'Non-Billable'} />
                                    <div>
                                        <p className="text-sm font-medium text-zinc-200">{entry.description || 'No Description'}</p>
                                        <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {entry.date}
                                            </span>
                                            {entry.company_id && (
                                                <span className="flex items-center gap-1 text-zinc-400">
                                                    <Briefcase className="w-3 h-3" />
                                                    {companies.find(c => c.id === entry.company_id)?.name || 'Unknown Client'}
                                                </span>
                                            )}
                                            {entry.billable && <span className="text-emerald-500/70 border border-emerald-500/20 px-1.5 rounded-[4px] text-[10px] uppercase">Billable</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <span className="block text-lg font-mono font-medium text-white">{entry.hours}h</span>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(entry)}
                                            className="text-zinc-600 hover:text-white transition-colors"
                                            title="Edit Entry"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(entry.id)}
                                            className="text-zinc-600 hover:text-red-400 transition-colors"
                                            title="Delete Entry"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
