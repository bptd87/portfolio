import { useState, useEffect } from 'react';
import { useForm, useFieldArray, useWatch, Control } from 'react-hook-form';
import { Plus, Trash2, Save, ArrowLeft, Calculator } from 'lucide-react';
import { createClient } from '../../../utils/supabase/client';
import { Company } from '../../../types/business';
import { AdminTokens } from '../../../styles/admin-tokens';
import { PrimaryButton, SecondaryButton } from '../AdminButtons';
import { toast } from 'sonner';

interface InvoiceBuilderProps {
    onCancel: () => void;
    onSave: () => void;
}

interface InvoiceFormValues {
    number: string;
    company_id: string;
    issue_date: string;
    due_date: string;
    status: 'draft' | 'sent' | 'paid';
    zelle_id?: string;
    qr_url?: string;
    items: {
        description: string;
        quantity: number;
        unit_price: number;
        amount: number;
    }[];
}

// Helper to calculate totals based on watched values
function TotalCalculator({ control }: { control: Control<InvoiceFormValues> }) {
    const items = useWatch({
        control,
        name: "items"
    });

    const total = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

    return (
        <div className="flex justify-end pt-4">
            <div className="w-64 space-y-2">
                <div className="flex justify-between text-zinc-400">
                    <span>Subtotal:</span>
                    <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-white border-t border-zinc-700 pt-2">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
}

export function InvoiceBuilder({ onCancel, onSave }: InvoiceBuilderProps) {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(false);
    const [unbilledTime, setUnbilledTime] = useState<any[]>([]); // Using any for TimeEntry compatibility if type not perfect
    const [showTimeModal, setShowTimeModal] = useState(false);
    const [selectedTimeIds, setSelectedTimeIds] = useState<Set<string>>(new Set());

    const [defaultRate, setDefaultRate] = useState(100);

    const { register, control, handleSubmit, setValue, watch, formState: { errors } } = useForm<InvoiceFormValues>({
        defaultValues: {
            number: `INV-${Date.now().toString().slice(-6)}`,
            issue_date: new Date().toISOString().split('T')[0],
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'draft',
            items: [{ description: 'Service', quantity: 1, unit_price: 100, amount: 100 }]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    });

    // Watch items to auto-calculate row amounts
    const items = watch("items");
    const watchCompanyId = watch("company_id");

    useEffect(() => {
        items.forEach((item, index) => {
            const calculated = item.quantity * item.unit_price;
            if (calculated !== item.amount) {
                setValue(`items.${index}.amount`, calculated);
            }
        });
    }, [items, setValue]);

    useEffect(() => {
        const fetchDefaults = async () => {
            const supabase = createClient();
            const { data: companiesData } = await supabase.from('crm_companies' as any).select('id, name').order('name');
            setCompanies(companiesData || []);

            const { data: settings } = await supabase.from('finance_settings' as any).select('*').eq('id', 1).single() as any;
            if (settings) {
                const seq = settings.next_invoice_seq || 1000;
                const prefix = settings.invoice_prefix || 'INV-';
                const nextNumber = `${prefix}${seq}`;
                setValue('number', nextNumber);
                setValue('zelle_id', settings.default_payment_info);
                setValue('qr_url', settings.default_payment_qr_url);
                if (settings.default_hourly_rate) {
                    setDefaultRate(settings.default_hourly_rate);
                    // Update default item too if untouched
                    const currentItems = watch('items');
                    if (currentItems.length === 1 && currentItems[0].unit_price === 100) {
                        setValue('items.0.unit_price', settings.default_hourly_rate);
                        setValue('items.0.amount', currentItems[0].quantity * settings.default_hourly_rate);
                    }
                }
            }
        };
        fetchDefaults();
    }, [setValue, watch]);

    // Fetch unbilled time for selected company
    useEffect(() => {
        if (!watchCompanyId) {
            setUnbilledTime([]);
            return;
        }
        const fetchUnbilled = async () => {
            const supabase = createClient();
            const { data } = await supabase
                .from('time_entries')
                .select('*')
                .eq('company_id', watchCompanyId)
                .eq('billable', true)
                .eq('status', 'unbilled')
                .order('date', { ascending: false });
            setUnbilledTime(data || []);
        };
        fetchUnbilled();
    }, [watchCompanyId]);

    const handleImportTime = () => {
        const selectedEntries = unbilledTime.filter(t => selectedTimeIds.has(t.id));
        selectedEntries.forEach(entry => {
            const rate = entry.rate || defaultRate;
            append({
                description: `${entry.description} (${entry.date})`,
                quantity: entry.hours,
                unit_price: rate,
                amount: entry.hours * rate
            });
        });
        setShowTimeModal(false);
        toast.success(`Imported ${selectedEntries.length} time entries`);
    };

    const onSubmit = async (data: InvoiceFormValues) => {
        setLoading(true);
        try {
            const supabase = createClient();
            const total = data.items.reduce((sum, item) => sum + item.amount, 0);

            // 1. Create Invoice
            const { data: invoice, error: invError } = await supabase
                .from('invoices' as any)
                .insert({
                    company_id: data.company_id,
                    issue_date: data.issue_date,
                    due_date: data.due_date,
                    status: data.status,
                    total_amount: total,
                    number: data.number,
                    payment_info: data.zelle_id,
                    payment_qr_url: data.qr_url
                } as any)
                .select()
                .single() as any;

            if (invError) throw invError;

            // 2. Create Items
            const invoiceItems = data.items.map(item => ({
                invoice_id: invoice.id,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unit_price,
                amount: item.amount
            }));

            const { error: itemsError } = await supabase.from('invoice_items' as any).insert(invoiceItems as any);
            if (itemsError) throw itemsError;

            // 3. Link Time Entries (Mark as billed)
            if (selectedTimeIds.size > 0) {
                const { error: timeError } = await supabase
                    .from('time_entries')
                    .update({
                        status: 'billed',
                        invoice_id: invoice.id
                    } as any)
                    .in('id', Array.from(selectedTimeIds));

                if (timeError) console.error("Failed to update time status", timeError);
            }

            // 4. Update Sequence
            const { data: currentSettings } = await supabase.from('finance_settings' as any).select('next_invoice_seq').eq('id', 1).single() as any;
            if (currentSettings) {
                await supabase.from('finance_settings' as any).update({ next_invoice_seq: currentSettings.next_invoice_seq + 1 } as any).eq('id', 1);
            }

            toast.success('Invoice created successfully');
            onSave();

        } catch (error: any) {
            console.error(error);
            toast.error('Failed to create invoice: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden relative">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <button onClick={onCancel} aria-label="Go back" className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-medium text-white">New Invoice</h2>
                </div>
                <div className="text-xs text-zinc-500 font-mono">Draft Mode</div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
                {/* Header Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase">Client</label>
                            <select {...register('company_id', { required: true })} className={AdminTokens.input.base}>
                                <option value="">Select a Client...</option>
                                {companies.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            {errors.company_id && <span className="text-red-500 text-xs">Client is required</span>}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase">Invoice Number</label>
                            <input {...register('number', { required: true })} className={AdminTokens.input.base} placeholder="e.g. INV-001" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase">Issue Date</label>
                            <input type="date" {...register('issue_date')} className={AdminTokens.input.base} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase">Due Date</label>
                            <input type="date" {...register('due_date')} className={AdminTokens.input.base} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase">Zelle ID (Optional)</label>
                        <input {...register('zelle_id')} className={AdminTokens.input.base} placeholder="e.g. email@domain.com" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase">Upload QR Image (Optional)</label>
                        <input
                            type="file"
                            accept="image/*"
                            id="qr-upload"
                            title="Upload QR Image"
                            aria-label="Upload QR Image"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                    toast.loading('Uploading QR...');
                                    const supabase = createClient();
                                    const fileExt = file.name.split('.').pop();
                                    const fileName = `qr-${Date.now()}.${fileExt}`;
                                    const { error: uploadError } = await supabase.storage.from('media').upload(fileName, file);
                                    if (uploadError) throw uploadError;
                                    const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fileName);
                                    setValue('qr_url', publicUrl);
                                    toast.dismiss();
                                    toast.success('QR Image Uploaded');
                                } catch (err) {
                                    console.error(err);
                                    toast.error('Upload failed');
                                }
                            }}
                            className="block w-full text-xs text-zinc-400 bg-zinc-950 border border-zinc-800 rounded p-1"
                        />
                    </div>
                </div>

                {/* Line Items */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-medium text-zinc-300">Line Items</h3>
                        <div className="flex gap-2">
                            <SecondaryButton
                                type="button"
                                onClick={() => setShowTimeModal(true)}
                                disabled={unbilledTime.length === 0}
                                className={`
                                    ${unbilledTime.length > 0 ? 'text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10' : 'text-zinc-600 border-zinc-800 cursor-not-allowed opacity-50'}
                                `}
                                title={unbilledTime.length === 0 ? "No unbilled time entries found for selected client" : `Import ${unbilledTime.length} unbilled time entries`}
                            >
                                <Calculator className="w-3 h-3" />
                                {unbilledTime.length > 0 ? `Import Time (${unbilledTime.length})` : 'Import Time'}
                            </SecondaryButton>
                            <SecondaryButton type="button" onClick={() => append({ description: '', quantity: 1, unit_price: 0, amount: 0 })}>
                                <Plus className="w-3 h-3" /> Add Item
                            </SecondaryButton>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="grid grid-cols-12 gap-4 px-3 py-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                            <div className="col-span-6">Description</div>
                            <div className="col-span-2 text-right">Qty / Hrs</div>
                            <div className="col-span-2 text-right">Rate / Price</div>
                            <div className="col-span-2 text-right">Amount</div>
                        </div>

                        {fields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-12 gap-4 items-start bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50 group hover:border-zinc-700 transition-colors">
                                <div className="col-span-6 flex gap-2">
                                    <button type="button" onClick={() => remove(index)} className="mt-2 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all" aria-label="Remove item">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <div className="flex-1">
                                        <input
                                            {...register(`items.${index}.description`, { required: true })}
                                            className="w-full bg-transparent border-none p-2 text-sm text-white focus:ring-0 placeholder:text-zinc-700"
                                            placeholder="Item description"
                                        />
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <input
                                        type="number"
                                        step="0.1"
                                        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-right text-sm text-zinc-300 focus:border-indigo-500 focus:outline-none"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register(`items.${index}.unit_price`, { valueAsNumber: true })}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-right text-sm text-zinc-300 focus:border-indigo-500 focus:outline-none"
                                    />
                                </div>
                                <div className="col-span-2 flex items-center justify-end">
                                    <span className="text-sm font-mono text-zinc-400 pt-1.5">
                                        ${(watch(`items.${index}.quantity`) * watch(`items.${index}.unit_price`)).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <TotalCalculator control={control} />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-zinc-800">
                    <SecondaryButton type="button" onClick={onCancel}>Cancel</SecondaryButton>
                    <PrimaryButton type="submit" disabled={loading}>
                        <Save className="w-4 h-4" />
                        {loading ? 'Generating...' : 'Create Invoice'}
                    </PrimaryButton>
                </div>
            </form>

            {/* Import Time Modal Overlay */}
            {showTimeModal && (
                <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[80vh]">
                        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
                            <h3 className="font-medium text-white flex items-center gap-2">
                                <Calculator className="w-4 h-4 text-emerald-500" />
                                Import Unbilled Time
                            </h3>
                            <button onClick={() => setShowTimeModal(false)} className="text-zinc-500 hover:text-white">Close</button>
                        </div>

                        {/* Modal Header */}
                        <div className="grid grid-cols-12 gap-4 px-6 py-2 text-xs font-medium text-zinc-500 uppercase tracking-wider bg-zinc-950/50 border-b border-zinc-800">
                            <div className="col-span-1"></div>
                            <div className="col-span-5">Description</div>
                            <div className="col-span-2 text-right">Hrs</div>
                            <div className="col-span-2 text-right">Rate</div>
                            <div className="col-span-2 text-right">Total</div>
                        </div>

                        <div className="p-2 overflow-y-auto flex-1 space-y-1 bg-zinc-900">
                            {unbilledTime.map(entry => {
                                const rate = entry.rate || defaultRate;
                                const total = entry.hours * rate;
                                return (
                                    <label key={entry.id} className="grid grid-cols-12 gap-4 items-center p-3 hover:bg-zinc-800/50 rounded-lg cursor-pointer border border-transparent hover:border-zinc-700 transition-colors mx-2">
                                        <div className="col-span-1 flex justify-center">
                                            <input
                                                type="checkbox"
                                                className="rounded border-zinc-600 bg-zinc-800 text-emerald-500 focus:ring-emerald-500/50"
                                                checked={selectedTimeIds.has(entry.id)}
                                                onChange={(e) => {
                                                    const newSet = new Set(selectedTimeIds);
                                                    if (e.target.checked) newSet.add(entry.id);
                                                    else newSet.delete(entry.id);
                                                    setSelectedTimeIds(newSet);
                                                }}
                                            />
                                        </div>
                                        <div className="col-span-5">
                                            <div className="text-sm text-zinc-200 font-medium truncate" title={entry.description}>{entry.description}</div>
                                            <div className="text-xs text-zinc-500">{entry.date}</div>
                                        </div>
                                        <div className="col-span-2 text-right text-sm text-zinc-400 font-mono">
                                            {entry.hours}h
                                        </div>
                                        <div className="col-span-2 text-right text-sm text-zinc-500 font-mono">
                                            ${rate}
                                        </div>
                                        <div className="col-span-2 text-right text-sm text-emerald-400 font-mono font-medium">
                                            ${total.toFixed(2)}
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                        <div className="p-4 border-t border-zinc-800 bg-zinc-900 flex justify-between items-center">
                            <span className="text-sm text-zinc-400">{selectedTimeIds.size} selected</span>
                            <PrimaryButton type="button" onClick={handleImportTime} disabled={selectedTimeIds.size === 0}>
                                Import as Line Items
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
