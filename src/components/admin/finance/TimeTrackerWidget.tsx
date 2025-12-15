import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Clock, ChevronUp, ChevronDown, Save } from 'lucide-react';
import { createClient } from '../../../utils/supabase/client';
import { toast } from 'sonner';

export function TimeTrackerWidget() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [elapsed, setElapsed] = useState(0);
    const [description, setDescription] = useState('');

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Load state from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('bt_tracker_state');
        if (saved) {
            const state = JSON.parse(saved);
            setIsRunning(state.isRunning);
            setStartTime(state.startTime);
            setDescription(state.description);

            if (state.isRunning && state.startTime) {
                // Calculate elapsed time correctly including time while away
                setElapsed(Date.now() - state.startTime);
            } else {
                setElapsed(state.elapsed || 0);
            }
        }
    }, []);

    // Save state to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem('bt_tracker_state', JSON.stringify({
            isRunning,
            startTime,
            elapsed,
            description
        }));
    }, [isRunning, startTime, elapsed, description]);

    // Timer logic
    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(() => {
                if (startTime) {
                    setElapsed(Date.now() - startTime);
                }
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning, startTime]);

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleStart = () => {
        if (!isRunning) {
            // If resuming, adjust start time so elapsed calculation remains correct relative to now
            // current elapsed = now - startTime  => startTime = now - current elapsed 
            const newStart = Date.now() - elapsed;
            setStartTime(newStart);
            setIsRunning(true);
            setIsExpanded(true);
        }
    };

    const handlePause = () => {
        setIsRunning(false);
        // elapsed is already updated by interval
    };

    const handleSave = async () => {
        if (!description.trim()) {
            toast.error('Please enter a description');
            return;
        }

        setIsRunning(false);
        const hours = elapsed / (1000 * 60 * 60);

        try {
            const supabase = createClient();
            const { error } = await supabase.from('time_entries').insert([{
                description,
                hours: Number(hours.toFixed(2)),
                date: new Date().toISOString().split('T')[0],
                billable: true
            }]);

            if (error) throw error;

            toast.success('Time logged successfully');
            // Reset
            setElapsed(0);
            setStartTime(null);
            setDescription('');
            setIsExpanded(false);
            localStorage.removeItem('bt_tracker_state');
        } catch (err) {
            toast.error('Failed to save time entry');
            console.error(err);
        }
    };

    const handleDiscard = () => {
        if (confirm('Discard this timer?')) {
            setIsRunning(false);
            setElapsed(0);
            setStartTime(null);
            setDescription('');
            localStorage.removeItem('bt_tracker_state');
        }
    }

    return (
        <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${isExpanded ? 'w-80' : 'w-auto'}`}>
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden">
                {/* Header / Mini View */}
                <div
                    className={`p-3 flex items-center justify-between cursor-pointer ${isRunning ? 'bg-amber-900/20' : 'bg-zinc-800/50'}`}
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-amber-500 animate-pulse' : 'bg-zinc-600'}`} />
                        <span className="font-mono text-lg font-medium text-white tracking-widest">
                            {formatTime(elapsed)}
                        </span>
                    </div>
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronUp className="w-4 h-4 text-zinc-400" />}
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                    <div className="p-4 border-t border-zinc-800 space-y-4">
                        <div>
                            <input
                                type="text"
                                placeholder="What are you working on?"
                                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none placeholder:text-zinc-600"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center justify-between gap-2">
                            <div className="flex gap-2">
                                {!isRunning ? (
                                    <button onClick={(e) => { e.stopPropagation(); handleStart(); }} className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors" title="Start">
                                        <Play className="w-4 h-4 fill-current" />
                                    </button>
                                ) : (
                                    <button onClick={(e) => { e.stopPropagation(); handlePause(); }} className="p-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors" title="Pause">
                                        <Pause className="w-4 h-4 fill-current" />
                                    </button>
                                )}
                                <button onClick={handleDiscard} className="p-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded-lg transition-colors" title="Discard">
                                    <Square className="w-4 h-4 fill-current" />
                                </button>
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={elapsed < 60000} // Minimum 1 minute
                                className="flex items-center gap-2 px-3 py-2 bg-zinc-100 hover:bg-white text-zinc-900 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="w-4 h-4" />
                                <span>Log Time</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
