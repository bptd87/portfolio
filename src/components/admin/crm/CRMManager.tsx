import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Search, MapPin, Mail, Phone, Building, X, Save } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '../../../utils/supabase/client';
import { Company } from '../../../types/business';
import { AdminTokens } from '../../../styles/admin-tokens';
import { InfoBanner } from '../InfoBanner';
import { PrimaryButton, SecondaryButton, IconButton } from '../AdminButtons';
import { CompanyDetailView } from './CompanyDetailView';

export function CRMManager() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'detail'>('list');
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const { register, handleSubmit, reset } = useForm<Company>();

    // Fetch Companies
    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        setLoading(true);
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('companies')
                .select('*')
                .order('name');

            if (error) throw error;
            setCompanies(data || []);
        } catch (error) {
            console.error('Error fetching companies:', error);
            toast.error('Failed to load companies');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: Company) => {
        try {
            const supabase = createClient();
            // Cast to any to bypass strict typing issues with generated types vs manual interfaces
            const { error } = await supabase
                .from('companies')
                .insert([data] as any);

            if (error) throw error;

            toast.success('Company added successfully');
            setShowForm(false);
            reset();
            fetchCompanies();
        } catch (error) {
            console.error('Error saving company:', error);
            toast.error('Failed to save company');
        }
    };

    const filteredCompanies = companies.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const labelClass = "block text-xs font-medium text-zinc-400 mb-1 uppercase tracking-wider";

    if (view === 'detail' && selectedCompanyId) {
        const selectedCompany = companies.find(c => c.id === selectedCompanyId);
        if (selectedCompany) {
            // Lazy load or import DetailView at top? Importing at top efficiently.
            // For now, I'll inline render or use the imported component.
            // I need to import it first. 
            // Wait, I can't import inside replace. I'll assume I can add the import statement in a separate call or just return the component logic here if I didn't separate it.
            // I DID separate it in previous step. So I need to add import too.
            // I'll do this in two chunks or one large replace if I can access top of file.
            // This tool call limits me. I'll return the View here and then do another call to add the import.
            return (
                <CompanyDetailView
                    company={selectedCompany}
                    onBack={() => { setView('list'); setSelectedCompanyId(null); }}
                />
            );
        }
    }

    return (
        <div className="space-y-6">
            <InfoBanner
                title="Theatre CRM"
                description="Manage relationships with theaters, agencies, and contacts."
                icon="🎭"
            />

            {/* Toolbar */}
            <div className={AdminTokens.flexBetween}>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search companies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`${AdminTokens.input.base} pl-9 w-64`}
                    />
                </div>
                <PrimaryButton onClick={() => setShowForm(true)}>
                    <Plus className="w-4 h-4" />
                    <span>Add Company</span>
                </PrimaryButton>
            </div>

            {/* Company Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCompanies.length === 0 && !loading && (
                    <div className="col-span-full py-12 text-center border border-dashed border-zinc-800 rounded-xl">
                        <Building className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                        <h3 className="text-zinc-300 font-medium">No companies found</h3>
                        <p className="text-zinc-500 text-sm mt-1">Get started by adding a new theatre or client.</p>
                    </div>
                )}

                {filteredCompanies.map(company => (
                    <div
                        key={company.id}
                        className={`${AdminTokens.card.hover} group cursor-pointer`}
                        onClick={() => { setSelectedCompanyId(company.id); setView('detail'); }}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-xl overflow-hidden">
                                {company.logo_url ? <img src={company.logo_url} className="w-full h-full object-cover" alt={`${company.name} Logo`} /> : '🏢'}
                            </div>
                            <span className={`
                text-[10px] uppercase tracking-wider font-medium px-2 py-1 rounded-full border
                ${company.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : ''}
                ${company.status === 'prospect' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : ''}
                ${company.status === 'past' ? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' : ''}
                ${company.status === 'dormant' ? 'bg-red-500/10 text-red-400 border-red-500/20' : ''}
              `}>
                                {company.status}
                            </span>
                        </div>

                        <h3 className="font-medium text-zinc-100 mb-1">{company.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-4">
                            <MapPin className="w-3 h-3" />
                            <span>{company.address?.city || 'Unknown City'}, {company.address?.state || ''}</span>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                            <div className="flex gap-2">
                                <IconButton className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800" title="Email Company">
                                    <Mail className="w-3 h-3" />
                                </IconButton>
                                <IconButton className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800" title="Call Company">
                                    <Phone className="w-3 h-3" />
                                </IconButton>
                            </div>
                            <span className="text-xs text-zinc-600 font-medium capitalize">{company.type}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Form */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
                            <h2 className="text-lg font-medium text-white">Add New Company</h2>
                            <button onClick={() => setShowForm(false)} className="text-zinc-400 hover:text-white" title="Close">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                            <div>
                                <label className={labelClass}>Company Name</label>
                                <input {...register('name', { required: true })} className={AdminTokens.input.base} placeholder="e.g. Paper Mill Playhouse" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Type</label>
                                    <select {...register('type')} className={AdminTokens.input.base}>
                                        <option value="theater">Theater</option>
                                        <option value="agency">Agency</option>
                                        <option value="client">Client</option>
                                        <option value="vendor">Vendor</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Status</label>
                                    <select {...register('status')} className={AdminTokens.input.base}>
                                        <option value="prospect">Prospect</option>
                                        <option value="active">Active</option>
                                        <option value="past">Past</option>
                                        <option value="dormant">Dormant</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Website</label>
                                <input {...register('website')} className={AdminTokens.input.base} placeholder="https://..." />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>City</label>
                                    <input {...register('address.city')} className={AdminTokens.input.base} placeholder="City" />
                                </div>
                                <div>
                                    <label className={labelClass}>State</label>
                                    <input {...register('address.state')} className={AdminTokens.input.base} placeholder="State" />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <SecondaryButton onClick={() => setShowForm(false)} type="button">Cancel</SecondaryButton>
                                <PrimaryButton type="submit">
                                    <Save className="w-4 h-4" />
                                    <span>Save Company</span>
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
