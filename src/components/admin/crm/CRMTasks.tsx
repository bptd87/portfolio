import { useState, useEffect } from 'react';
import { createClient } from '../../../utils/supabase/client';
import { Company } from '../../../types/business';
import { AdminTokens } from '../../../styles/admin-tokens';
import { Plus, CheckCircle2, Circle, Building, X } from 'lucide-react';
import { toast } from 'sonner';

interface Task {
    id: string;
    description: string;
    due_date?: string;
    company_id?: string;
    completed: boolean;
    priority: 'high' | 'normal' | 'low';
}

interface CRMTasksProps {
    companies: Company[];
}

export function CRMTasks({ companies }: CRMTasksProps) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState('');
    const [selectedCompany, setSelectedCompany] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('crm_tasks')
                .select('*')
                .order('completed', { ascending: true }) // Incomplete first
                .order('due_date', { ascending: true }); // Earliest due first

            if (error) throw error;
            setTasks(data || []);
        } catch (error) {
            console.error('Error fetching tasks', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        try {
            const supabase = createClient();
            const taskData = {
                description: newTask,
                company_id: selectedCompany || null,
                completed: false,
                priority: 'normal'
            };

            const { data, error } = await supabase
                .from('crm_tasks')
                // @ts-ignore
                .insert([taskData] as any)
                .select()
                .single();

            if (error) throw error;

            setTasks(prev => [data, ...prev]);
            setNewTask('');
            setSelectedCompany('');
            toast.success('Task added');
        } catch (error) {
            console.error(error);
            toast.error('Failed to add task');
        }
    };

    const toggleComplete = async (task: Task) => {
        // Optimistic
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));

        try {
            const supabase = createClient();
            // @ts-ignore
            await supabase.from('crm_tasks').update({ completed: !task.completed }).eq('id', task.id);
        } catch (error) {
            fetchTasks(); // Revert
        }
    };

    const deleteTask = async (id: string) => {
        if (!confirm("Delete this task?")) return;
        setTasks(prev => prev.filter(t => t.id !== id));
        const supabase = createClient();
        await supabase.from('crm_tasks').delete().eq('id', id);
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Quick Add Form */}
            <form onSubmit={handleAddTask} className="flex flex-wrap gap-2 mb-8 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="What needs to be done?"
                    aria-label="Task description"
                    className={`${AdminTokens.input.base} flex-1`}
                />
                <select
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    aria-label="Link company"
                    className={`${AdminTokens.input.base} w-48`}
                >
                    <option value="">Link Company (Opt)</option>
                    {companies.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
                <button type="submit" className={AdminTokens.button.primary}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                </button>
            </form>

            <div className="space-y-4">
                {tasks.length === 0 && !loading && (
                    <div className="text-center py-12 text-zinc-500">
                        <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p>No tasks yet. Stay organized!</p>
                    </div>
                )}

                {tasks.map(task => {
                    const linkedCompany = companies.find(c => c.id === task.company_id);

                    return (
                        <div key={task.id} className={`
                            group flex items-center gap-4 p-4 rounded-xl border transition-all
                            ${task.completed ? 'bg-zinc-900/30 border-zinc-800/50 opacity-60' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}
                        `}>
                            <button onClick={() => toggleComplete(task)} aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"} className="text-zinc-500 hover:text-emerald-400">
                                {task.completed ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5" />}
                            </button>

                            <div className="flex-1">
                                <p className={`font-medium ${task.completed ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                                    {task.description}
                                </p>
                                {linkedCompany && (
                                    <div className="flex items-center gap-1 text-xs text-zinc-500 mt-1">
                                        <Building className="w-3 h-3" />
                                        <span>{linkedCompany.name}</span>
                                    </div>
                                )}
                            </div>

                            <button onClick={() => deleteTask(task.id)} aria-label="Delete task" className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-opacity p-2">
                                <X className="w-4 h-4" /> {/* Wait, assuming X is imported from lucide above. Wait, I should import X */}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Need to update imports
