import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Search, MapPin, Mail, Phone, Building, X, Save, Pencil, FileDown, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '../../../utils/supabase/client';
import { Company } from '../../../types/business';
import { AdminTokens } from '../../../styles/admin-tokens';
import { InfoBanner } from '../InfoBanner';
import { PrimaryButton, SecondaryButton, IconButton } from '../AdminButtons';
import { CompanyDetailView } from './CompanyDetailView';
import { CRMTasks } from './CRMTasks';
import { CRMBoardView } from './CRMBoardView';
import { CRMResearch } from './CRMResearch';

export function CRMManager() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'detail' | 'board' | 'tasks' | 'research'>('board'); // Default to board for visibility
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

    const [editingCompany, setEditingCompany] = useState<Company | null>(null);

    const handleStatusUpdate = async (companyId: string, newStatus: string) => {
        // Optimistic update
        setCompanies(prev => prev.map(c =>
            c.id === companyId ? { ...c, status: newStatus as any } : c
        ));

        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('companies')
                // @ts-ignore
                .update({ status: newStatus } as any)
                .eq('id', companyId);

            if (error) throw error;
            toast.success('Status updated');
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
            fetchCompanies(); // Revert on error
        }
    };

    const handleEdit = (company: Company) => {
        setEditingCompany(company);
        reset(company); // Populate form
        setShowForm(true);
    };

    const onSubmit = async (data: Company) => {
        try {
            const supabase = createClient();

            if (editingCompany) {
                // UPDATE
                const { error } = await supabase
                    .from('companies')
                    .update({
                        name: data.name,
                        type: data.type,
                        status: data.status,
                        website: data.website,
                        address: data.address
                    } as any)
                    .eq('id', editingCompany.id);

                if (error) throw error;
                toast.success('Company updated successfully');
            } else {
                // INSERT
                const { error } = await supabase
                    .from('companies')
                    // @ts-ignore
                    .insert([data] as any);

                if (error) throw error;
                toast.success('Company added successfully');
            }

            setShowForm(false);
            setEditingCompany(null);
            reset({ name: '', website: '', address: { city: '', state: '' } } as any); // Clear form properly
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

            {/* Toolbar (Kept as is from previous step) */}
            {/* Toolbar */}
            <div className={`flex flex-wrap items-center justify-between gap-4 mb-6 ${AdminTokens.card.glass}`}>
                <div className="relative flex-1 min-w-[250px] max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search companies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`${AdminTokens.input.base} pl-10 w-full bg-zinc-950/50`}
                    />
                </div>
                <div className="flex flex-wrap gap-3">
                    <SecondaryButton onClick={() => {
                        import('jspdf').then(jsPDF => {
                            import('jspdf-autotable').then(autoTable => {
                                const doc = new jsPDF.default();
                                autoTable.default(doc, {
                                    head: [['Name', 'Status', 'Type', 'City', 'State']],
                                    body: companies.map(c => [c.name, c.status, c.type, c.address?.city || '', c.address?.state || '']),
                                });
                                doc.save('theatre-crm-companies.pdf');
                                toast.success('Exported PDF');
                            });
                        });
                    }} className="whitespace-nowrap flex items-center gap-2">
                        <FileDown className="w-4 h-4" />
                        <span>Export PDF</span>
                    </SecondaryButton>
                    <PrimaryButton onClick={() => { setEditingCompany(null); reset({ name: '', website: '', address: { city: '', state: '' } } as any); setShowForm(true); }} className="whitespace-nowrap flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        <span>Add Company</span>
                    </PrimaryButton>
                </div>
            </div>

            {/* View Toggle & Content */}
            {/* View Toggle */}
            <div className="flex gap-8 border-b border-zinc-800 mb-6">
                <button
                    onClick={() => setView('list')}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors px-2 ${view === 'list' ? 'text-white border-white' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
                >
                    List View
                </button>
                <button
                    onClick={() => setView('board')}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors ${view === 'board' ? 'text-white border-white' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
                >
                    Board View
                </button>
                <button
                    onClick={() => setView('tasks')}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors px-2 ${view === 'tasks' ? 'text-white border-white' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
                >
                    Tasks
                </button>
                <button
                    onClick={() => setView('research')}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors px-2 flex items-center gap-2 ${view === 'research' ? 'text-indigo-400 border-indigo-500' : 'text-zinc-500 border-transparent hover:text-indigo-300'}`}
                >
                    <Sparkles className="w-3 h-3" />
                    AI Research
                </button>
            </div>

            {view === 'tasks' ? (
                <CRMTasks companies={companies} />
            ) : view === 'research' ? (
                <CRMResearch onCompanyAdded={fetchCompanies} />
            ) : view === 'board' ? (
                <CRMBoardView
                    companies={filteredCompanies}
                    onStatusChange={handleStatusUpdate}
                    onEdit={handleEdit}
                    onDelete={async (id) => {
                        if (!confirm('Are you sure you want to delete this company?')) return;
                        const supabase = createClient();
                        await supabase.from('companies').delete().eq('id', id);
                        toast.success('Company deleted');
                        fetchCompanies();
                    }}
                />
            ) : (
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
                            className={`${AdminTokens.card.glass} ${AdminTokens.card.glassHover} group cursor-pointer border-zinc-500/20`}
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
                                    <IconButton
                                        onClick={(e) => { e.stopPropagation(); handleEdit(company); }}
                                        className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 hover:text-white" title="Edit Company"
                                    >
                                        <Pencil className="w-3 h-3" />
                                    </IconButton>
                                </div>
                                <span className="text-xs text-zinc-600 font-medium capitalize">{company.type}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Form */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
                            <h2 className="text-lg font-medium text-white">{editingCompany ? 'Edit Company' : 'Add New Company'}</h2>
                            <button onClick={() => { setShowForm(false); setEditingCompany(null); reset({ name: '', website: '', address: { city: '', state: '' } } as any); }} className="text-zinc-400 hover:text-white" title="Close">
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

                            <div className="space-y-4">
                                <div>
                                    <label className={labelClass}>Street Address</label>
                                    <input {...register('address.street')} className={AdminTokens.input.base} placeholder="123 Broadway" />
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
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Zip Code</label>
                                        <input {...register('address.zip')} className={AdminTokens.input.base} placeholder="Zip" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Country</label>
                                        <input {...register('address.country')} className={AdminTokens.input.base} placeholder="Country" defaultValue="USA" />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-between gap-3">
                                {editingCompany && (
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            if (!confirm('Are you sure you want to delete this company?')) return;
                                            try {
                                                const supabase = createClient();
                                                const { error } = await supabase.from('companies').delete().eq('id', editingCompany.id);
                                                if (error) throw error;
                                                toast.success('Company deleted');
                                                setShowForm(false);
                                                setEditingCompany(null);
                                                fetchCompanies();
                                            } catch (e) {
                                                console.error(e);
                                                toast.error('Failed to delete');
                                            }
                                        }}
                                        className="text-red-400 hover:text-red-300 text-sm font-medium px-3 py-2 rounded hover:bg-red-500/10 transition-colors"
                                    >
                                        Delete
                                    </button>
                                )}
                                <div className="flex gap-3 ml-auto">
                                    <SecondaryButton onClick={() => setShowForm(false)} type="button">Cancel</SecondaryButton>
                                    <PrimaryButton type="submit">
                                        <Save className="w-4 h-4" />
                                        <span>Save Company</span>
                                    </PrimaryButton>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
