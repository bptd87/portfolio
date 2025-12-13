import { useState, useEffect } from 'react';
import { ArrowLeft, User, MessageSquare, Plus, Mail, Phone } from 'lucide-react';
import { Company, Contact, Interaction } from '../../../types/business';
import { createClient } from '../../../utils/supabase/client';
import { AdminTokens } from '../../../styles/admin-tokens';
import { PrimaryButton, IconButton, SecondaryButton } from '../AdminButtons';
import { toast } from 'sonner';

interface CompanyDetailViewProps {
    company: Company;
    onBack: () => void;
}

export function CompanyDetailView({ company, onBack }: CompanyDetailViewProps) {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [interactions, setInteractions] = useState<Interaction[]>([]);
    const [activeTab, setActiveTab] = useState<'contacts' | 'interactions'>('contacts');

    // Add Contact Form State
    const [showContactForm, setShowContactForm] = useState(false);
    const [newContact, setNewContact] = useState<Partial<Contact>>({ is_primary: false });

    // Interaction Form State
    const [showInteractionForm, setShowInteractionForm] = useState(false);
    const [newInteraction, setNewInteraction] = useState<Partial<Interaction>>({
        type: 'email',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchContacts();
        fetchInteractions();
    }, [company.id]);

    const fetchContacts = async () => {
        const supabase = createClient();
        const { data } = await supabase.from('contacts').select('*').eq('company_id', company.id);
        setContacts(data || []);
    };

    const fetchInteractions = async () => {
        const supabase = createClient();
        const { data } = await supabase.from('interactions').select('*').eq('company_id', company.id).order('date', { ascending: false });
        setInteractions(data || []);
    };

    const handleAddContact = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!newContact.first_name) {
                toast.error('First Name is required');
                return;
            }

            const supabase = createClient();
            const { error } = await supabase.from('contacts').insert([{
                company_id: company.id,
                first_name: newContact.first_name,
                last_name: newContact.last_name,
                email: newContact.email,
                phone: newContact.phone,
                role: newContact.role,
                is_primary: newContact.is_primary || false
            }] as any);

            if (error) throw error;

            toast.success('Contact added');
            setShowContactForm(false);
            setNewContact({ is_primary: false });
            fetchContacts();
        } catch (error) {
            console.error('Error adding contact:', error);
            toast.error('Failed to add contact');
        }
    };

    const handleLogInteraction = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!newInteraction.summary) {
                toast.error('Summary is required');
                return;
            }

            const supabase = createClient();
            const { error } = await supabase.from('interactions').insert([{
                company_id: company.id,
                type: newInteraction.type,
                date: newInteraction.date,
                summary: newInteraction.summary,
                next_step: newInteraction.next_step,
                next_step_date: newInteraction.next_step_date
            }] as any);

            if (error) throw error;

            toast.success('Activity logged');
            setShowInteractionForm(false);
            setNewInteraction({ type: 'email', date: new Date().toISOString().split('T')[0] });
            fetchInteractions();
        } catch (error) {
            console.error('Error logging interaction:', error);
            toast.error('Failed to log activity');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 -ml-2 text-zinc-400 hover:text-white transition-colors" title="Back to List">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-white">{company.name}</h1>
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <span className="capitalize">{company.status}</span>
                        <span>•</span>
                        <span className="capitalize">{company.type}</span>
                        {company.address?.city && <span>• {company.address.city}, {company.address.state}</span>}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-zinc-800">
                <button
                    onClick={() => setActiveTab('contacts')}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'contacts' ? 'text-white border-white' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
                >
                    Contacts
                </button>
                <button
                    onClick={() => setActiveTab('interactions')}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'interactions' ? 'text-white border-white' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
                >
                    Interactions
                </button>
            </div>

            {/* Content */}
            {activeTab === 'contacts' ? (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium text-zinc-400">People ({contacts.length})</h3>
                        <PrimaryButton onClick={() => setShowContactForm(true)}>
                            <Plus className="w-4 h-4" /> Add Person
                        </PrimaryButton>
                    </div>

                    {showContactForm && (
                        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg mb-4">
                            <h4 className="text-sm font-medium text-white mb-3">New Contact</h4>
                            <form onSubmit={handleAddContact} className="grid grid-cols-2 gap-3">
                                <input
                                    placeholder="First Name *"
                                    className={AdminTokens.input.base}
                                    value={newContact.first_name || ''}
                                    onChange={e => setNewContact({ ...newContact, first_name: e.target.value })}
                                />
                                <input
                                    placeholder="Last Name"
                                    className={AdminTokens.input.base}
                                    value={newContact.last_name || ''}
                                    onChange={e => setNewContact({ ...newContact, last_name: e.target.value })}
                                />
                                <input
                                    placeholder="Role / Title"
                                    className={AdminTokens.input.base}
                                    value={newContact.role || ''}
                                    onChange={e => setNewContact({ ...newContact, role: e.target.value })}
                                />
                                <input
                                    placeholder="Email"
                                    className={AdminTokens.input.base}
                                    value={newContact.email || ''}
                                    onChange={e => setNewContact({ ...newContact, email: e.target.value })}
                                />
                                <input
                                    placeholder="Phone"
                                    className={AdminTokens.input.base}
                                    value={newContact.phone || ''}
                                    onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                                />
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isPrimary"
                                        checked={newContact.is_primary}
                                        onChange={e => setNewContact({ ...newContact, is_primary: e.target.checked })}
                                        className="rounded border-zinc-700 bg-zinc-800 text-brand-500"
                                    />
                                    <label htmlFor="isPrimary" className="text-sm text-zinc-400">Primary Contact</label>
                                </div>
                                <div className="col-span-2 flex justify-end gap-2 mt-2">
                                    <SecondaryButton type="button" onClick={() => setShowContactForm(false)}>Cancel</SecondaryButton>
                                    <PrimaryButton type="submit">Save Contact</PrimaryButton>
                                </div>
                            </form>
                        </div>
                    )}

                    {contacts.length === 0 && !showContactForm ? (
                        <p className="text-zinc-500 text-sm italic">No contacts listed.</p>
                    ) : (
                        <div className="grid gap-3">
                            {contacts.map(contact => (
                                <div key={contact.id} className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-lg group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 border border-zinc-700">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-white font-medium">{contact.first_name} {contact.last_name}</h4>
                                                {contact.is_primary && <span className="text-[10px] bg-brand-500/20 text-brand-300 px-1.5 rounded">Primary</span>}
                                            </div>
                                            <p className="text-xs text-zinc-500">{contact.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        {contact.email && (
                                            <IconButton onClick={() => window.open(`mailto:${contact.email}`)}>
                                                <Mail className="w-4 h-4" />
                                            </IconButton>
                                        )}
                                        {contact.phone && (
                                            <IconButton onClick={() => window.open(`tel:${contact.phone}`)}>
                                                <Phone className="w-4 h-4" />
                                            </IconButton>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium text-zinc-400">Activity Log ({interactions.length})</h3>
                        <PrimaryButton onClick={() => setShowInteractionForm(true)}>
                            <Plus className="w-4 h-4" /> Log Activity
                        </PrimaryButton>
                    </div>

                    {showInteractionForm && (
                        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg mb-4">
                            <h4 className="text-sm font-medium text-white mb-3">Log Interaction</h4>
                            <form onSubmit={handleLogInteraction} className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-zinc-500 mb-1 block">Type</label>
                                        <select
                                            className={AdminTokens.input.base}
                                            value={newInteraction.type}
                                            onChange={e => setNewInteraction({ ...newInteraction, type: e.target.value as any })}
                                            aria-label="Interaction Type"
                                            title="Interaction Type"
                                        >
                                            <option value="email">Email</option>
                                            <option value="call">Call</option>
                                            <option value="meeting">Meeting</option>
                                            <option value="site_visit">Site Visit</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-zinc-500 mb-1 block">Date</label>
                                        <input
                                            type="date"
                                            className={AdminTokens.input.base}
                                            value={newInteraction.date}
                                            onChange={e => setNewInteraction({ ...newInteraction, date: e.target.value })}
                                            aria-label="Interaction Date"
                                            title="Interaction Date"
                                        />
                                    </div>
                                </div>
                                <textarea
                                    placeholder="Summary of interaction..."
                                    className={`${AdminTokens.input.base} h-24 resize-none`}
                                    value={newInteraction.summary || ''}
                                    onChange={e => setNewInteraction({ ...newInteraction, summary: e.target.value })}
                                    aria-label="Interaction Summary"
                                    title="Interaction Summary"
                                />
                                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded">
                                    <h5 className="text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wide">Follow Up</h5>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            placeholder="Next Step (e.g. Send Proposal)"
                                            className={AdminTokens.input.base}
                                            value={newInteraction.next_step || ''}
                                            onChange={e => setNewInteraction({ ...newInteraction, next_step: e.target.value })}
                                            aria-label="Next Step Action"
                                            title="Next Step Action"
                                        />
                                        <input
                                            type="date"
                                            className={AdminTokens.input.base}
                                            value={newInteraction.next_step_date || ''}
                                            onChange={e => setNewInteraction({ ...newInteraction, next_step_date: e.target.value })}
                                            aria-label="Next Step Date"
                                            title="Next Step Date"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 mt-2">
                                    <SecondaryButton type="button" onClick={() => setShowInteractionForm(false)}>Cancel</SecondaryButton>
                                    <PrimaryButton type="submit">Log Activity</PrimaryButton>
                                </div>
                            </form>
                        </div>
                    )}

                    {interactions.length === 0 && !showInteractionForm ? (
                        <p className="text-zinc-500 text-sm italic">No interactions logged.</p>
                    ) : (
                        <div className="space-y-4">
                            {interactions.map(interaction => (
                                <div key={interaction.id} className="flex gap-4">
                                    <div className="mt-1">
                                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                                            <MessageSquare className="w-4 h-4 text-zinc-400" />
                                        </div>
                                    </div>
                                    <div className="flex-1 pb-4 border-b border-zinc-800/50">
                                        <div className="flex justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-white capitalize">{interaction.type}</span>
                                                <span className="text-xs text-zinc-500">{new Date(interaction.date).toLocaleDateString()}</span>
                                            </div>
                                            {interaction.next_step && (
                                                <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                                                    Next: {interaction.next_step} {interaction.next_step_date ? `(${new Date(interaction.next_step_date).toLocaleDateString()})` : ''}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-zinc-400">{interaction.summary}</p>
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
