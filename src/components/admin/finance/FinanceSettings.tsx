import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { createClient } from '../../../utils/supabase/client';
import { toast } from 'sonner';
import { Save, Upload } from 'lucide-react';
import { AdminTokens } from '../../../styles/admin-tokens';
import { PrimaryButton } from '../AdminButtons';

interface AppSettings {
    id: number;
    invoice_prefix: string;
    next_invoice_seq: number;
    default_payment_info: string;
    default_payment_qr_url: string;
    business_name: string;
    business_website: string;
    invoice_footer_note: string;
    default_hourly_rate: number;
    business_address: {
        street: string;
        city: string;
        state: string;
        zip: string;
        country: string;
    };
}

interface FinanceSettingsProps {
    onClose?: () => void;
}

export function FinanceSettings({ onClose }: FinanceSettingsProps) {
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, setValue, watch } = useForm<AppSettings>();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        const supabase = createClient();
        const { data, error } = await supabase.from('app_settings').select('*').eq('id', 1).single();

        if (data) {
            setValue('invoice_prefix', data.invoice_prefix);
            setValue('next_invoice_seq', data.next_invoice_seq);
            setValue('default_payment_info', data.default_payment_info);
            setValue('default_payment_qr_url', data.default_payment_qr_url);
            setValue('business_name', data.business_name || 'BRANDON P. DAVIS');
            setValue('business_website', data.business_website || 'www.brandonptdavis.com');
            setValue('invoice_footer_note', data.invoice_footer_note || 'Thank you for your business.');
            setValue('default_hourly_rate', data.default_hourly_rate || 100);
            setValue('business_address', data.business_address || { street: '', city: '', state: '', zip: '', country: 'USA' });
        } else if (!error) {
            // Initialize
            await supabase.from('app_settings').insert([{ id: 1, invoice_prefix: 'INV-', next_invoice_seq: 1000 }]);
            fetchSettings();
        }
    };

    const onSubmit = async (data: AppSettings) => {
        setLoading(true);
        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('app_settings')
                .update({
                    invoice_prefix: data.invoice_prefix,
                    next_invoice_seq: data.next_invoice_seq,
                    default_payment_info: data.default_payment_info,
                    default_payment_qr_url: data.default_payment_qr_url,
                    business_name: data.business_name,
                    business_website: data.business_website,
                    invoice_footer_note: data.invoice_footer_note,
                    business_address: data.business_address,
                    default_hourly_rate: data.default_hourly_rate
                } as any)
                .eq('id', 1);

            if (error) throw error;
            toast.success('Settings saved');
            if (onClose) onClose();
        } catch (error) {
            console.error(error);
            toast.error('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    const qrUrl = watch('default_payment_qr_url');

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-white">Invoice Configuration</h2>
                    {onClose && (
                        <button onClick={onClose} className="text-zinc-500 hover:text-white">
                            <span className="sr-only">Close</span>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    )}
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    {/* Branding Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-white border-b border-zinc-800 pb-2">Business Identity</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase">Business Name</label>
                                <input {...register('business_name')} className={AdminTokens.input.base} placeholder="BRANDON P. DAVIS" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase">Website</label>
                                <input {...register('business_website')} className={AdminTokens.input.base} placeholder="www.example.com" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase">Address</label>
                            <input {...register('business_address.street')} className={`${AdminTokens.input.base} mb-2`} placeholder="Street Address" />
                            <div className="grid grid-cols-6 gap-2">
                                <input {...register('business_address.city')} className={`${AdminTokens.input.base} col-span-3`} placeholder="City" />
                                <input {...register('business_address.state')} className={`${AdminTokens.input.base} col-span-1`} placeholder="State" />
                                <input {...register('business_address.zip')} className={`${AdminTokens.input.base} col-span-2`} placeholder="ZIP" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6 pt-4 border-t border-zinc-800">
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase">Invoice Prefix</label>
                            <input {...register('invoice_prefix')} className={AdminTokens.input.base} placeholder="INV-" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase">Next Seq</label>
                            <input type="number" {...register('next_invoice_seq')} className={AdminTokens.input.base} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-emerald-400 mb-1 uppercase">Hourly Rate ($)</label>
                            <input type="number" step="0.01" {...register('default_hourly_rate')} className={`${AdminTokens.input.base} border-emerald-500/30 focus:border-emerald-500`} placeholder="100.00" />
                        </div>
                    </div>

                    <div className="border-t border-zinc-800 pt-6">
                        <h3 className="text-sm font-medium text-white mb-4">Default Payment Details</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase">Zelle / Payment ID</label>
                                <input {...register('default_payment_info')} className={AdminTokens.input.base} placeholder="e.g. brandon@example.com" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase">Footer Note</label>
                                <input {...register('invoice_footer_note')} className={AdminTokens.input.base} placeholder="Thank you for your business." />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-1 uppercase">Master QR Code</label>
                                <div className="flex gap-4 items-start">
                                    {qrUrl && (
                                        <div className="w-24 h-24 bg-white p-1 rounded-lg">
                                            <img src={qrUrl} className="w-full h-full object-contain" alt="QR Preview" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <label className={`${AdminTokens.button.secondary} cursor-pointer inline-flex items-center gap-2`}>
                                            <Upload className="w-4 h-4" />
                                            <span>Upload QR Image</span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    try {
                                                        toast.loading('Uploading...');
                                                        const supabase = createClient();
                                                        const fileName = `settings-qr-${Date.now()}.${file.name.split('.').pop()}`;
                                                        const { error } = await supabase.storage.from('media').upload(fileName, file);
                                                        if (error) throw error;
                                                        const { data } = supabase.storage.from('media').getPublicUrl(fileName);
                                                        setValue('default_payment_qr_url', data.publicUrl);
                                                        toast.dismiss();
                                                        toast.success('Uploaded');
                                                    } catch (err) {
                                                        toast.error('Upload failed');
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-zinc-800 gap-3">
                        {onClose && <button type="button" onClick={onClose} className="text-sm text-zinc-400 hover:text-white px-4">Cancel</button>}
                        <PrimaryButton type="submit" disabled={loading}>
                            <Save className="w-4 h-4" />
                            <span>Save Configuration</span>
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </div>
    );
}
