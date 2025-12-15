import { useState, useEffect } from 'react';
import { ArrowLeft, User, MessageSquare, Plus, Mail, Phone, Pencil, Trash2, Save, FileText } from 'lucide-react';
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
    const [activeTab, setActiveTab] = useState<'contacts' | 'interactions' | 'notes'>('contacts');

    // Company Notes State
    const [companyNotes, setCompanyNotes] = useState(company.notes || '');
    const [isSavingNotes, setIsSavingNotes] = useState(false);

    // Add/Edit Contact Form State
    const [showContactForm, setShowContactForm] = useState(false);
    const [editingContactId, setEditingContactId] = useState<string | null>(null);
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
        // @ts-ignore
        const { data } = await supabase.from('crm_contacts').select('*').eq('company_id', company.id);
        setContacts(data || []);
    };

    const fetchInteractions = async () => {
        const supabase = createClient();
        const { data } = await supabase.from('interactions').select('*').eq('company_id', company.id).order('date', { ascending: false });
        setInteractions(data || []);
    };

    const handleSaveCompanyNotes = async () => {
        try {
            setIsSavingNotes(true);
            const supabase = createClient();
            const { error } = await supabase
                .from('companies')
                .update({ notes: companyNotes } as any)
                .eq('id', company.id);

            if (error) throw error;
            toast.success('Notes saved');
        } catch (error) {
            console.error('Error saving notes:', error);
            toast.error('Failed to save notes');
        } finally {
            setIsSavingNotes(false);
        }
    };

    const handleSaveContact = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!newContact.name) {
                toast.error('Name is required');
                return;
            }

            const supabase = createClient();

            if (editingContactId) {
                // Update
                const { error } = await supabase.from('crm_contacts').update({
                    name: newContact.name,
                    email: newContact.email,
                    phone: newContact.phone,
                    role: newContact.role,
                    notes: newContact.notes,
                    is_primary: newContact.is_primary
                } as any).eq('id', editingContactId);

                if (error) throw error;
                toast.success('Contact updated');
            } else {
                // Insert
                // @ts-ignore
                const { error } = await supabase.from('crm_contacts').insert([{
                    company_id: company.id,
                    name: newContact.name,
                    email: newContact.email,
                    phone: newContact.phone,
                    role: newContact.role,
                    notes: newContact.notes,
                    is_primary: newContact.is_primary || false
                }] as any);

                if (error) throw error;
                toast.success('Contact added');
            }

            setShowContactForm(false);
            setEditingContactId(null);
            setNewContact({ is_primary: false });
            fetchContacts();
        } catch (error) {
            console.error('Error saving contact:', error);
            toast.error('Failed to save contact');
        }
    };

    const handleEditClick = (contact: Contact) => {
        setNewContact({
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
            role: contact.role,
            notes: contact.notes,
            is_primary: contact.is_primary
        });
        setEditingContactId(contact.id);
        setShowContactForm(true);
    };

    const handleDeleteContact = async (id: string) => {
        if (!confirm('Are you sure you want to delete this contact?')) return;

        try {
            const supabase = createClient();
            const { error } = await supabase.from('crm_contacts').delete().eq('id', id);
            if (error) throw error;

            toast.success('Contact deleted');
            fetchContacts();
        } catch (error) {
            console.error('Error deleting contact:', error);
            toast.error('Failed to delete contact');
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
                <button
                    onClick={() => setActiveTab('notes')}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'notes' ? 'text-white border-white' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}
                >
                    Notes
                </button>
            </div>

            {/* Content */}
            {activeTab === 'contacts' ? (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium text-zinc-400">People ({contacts.length})</h3>
                        <PrimaryButton onClick={() => {
                            setEditingContactId(null);
                            setNewContact({ is_primary: false });
                            setShowContactForm(true);
                        }}>
                            <Plus className="w-4 h-4" /> Add Person
                        </PrimaryButton>
                    </div>

                    {showContactForm && (
                        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg mb-4">
                            <h4 className="text-sm font-medium text-white mb-3">{editingContactId ? 'Edit Contact' : 'New Contact'}</h4>
                            <form onSubmit={handleSaveContact} className="grid grid-cols-2 gap-3">
                                <input
                                    placeholder="Full Name *"
                                    aria-label="Full Name"
                                    className={`${AdminTokens.input.base} col-span-2`}
                                    value={newContact.name || ''}
                                    onChange={e => setNewContact({ ...newContact, name: e.target.value })}
                                />
                                <input
                                    placeholder="Role / Title"
                                    aria-label="Role or Title"
                                    className={AdminTokens.input.base}
                                    value={newContact.role || ''}
                                    onChange={e => setNewContact({ ...newContact, role: e.target.value })}
                                />
                                <input
                                    placeholder="Email"
                                    aria-label="Email"
                                    className={AdminTokens.input.base}
                                    value={newContact.email || ''}
                                    onChange={e => setNewContact({ ...newContact, email: e.target.value })}
                                />
                                <input
                                    placeholder="Phone"
                                    aria-label="Phone"
                                    className={AdminTokens.input.base}
                                    value={newContact.phone || ''}
                                    onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                                />
                                <textarea
                                    placeholder="Contact Notes"
                                    aria-label="Contact Notes"
                                    className={`${AdminTokens.input.base} col-span-2 h-20`}
                                    value={newContact.notes || ''}
                                    onChange={e => setNewContact({ ...newContact, notes: e.target.value })}
                                />

                                <div className="flex items-center gap-2 col-span-2">
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
                                    <SecondaryButton type="button" onClick={() => setShowInteractionForm(false)}>Cancel</SecondaryButton>
                                    <PrimaryButton type="submit">{editingContactId ? 'Update' : 'Save'} Contact</PrimaryButton>
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
                                                <h4 className="text-white font-medium">{contact.name}</h4>
                                                {contact.is_primary && <span className="text-[10px] bg-brand-500/20 text-brand-300 px-1.5 rounded">Primary</span>}
                                            </div>
                                            <p className="text-xs text-zinc-500">{contact.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        {contact.notes && (
                                            <div className="relative group/note mr-2">
                                                <FileText className="w-4 h-4 text-zinc-600" />
                                                <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-black border border-white/20 rounded text-xs text-white invisible group-hover/note:visible z-50">
                                                    {contact.notes}
                                                </div>
                                            </div>
                                        )}
                                        {contact.email && (
                                            <IconButton onClick={() => window.open(`mailto:${contact.email}`)} aria-label="Send email">
                                                <Mail className="w-4 h-4" />
                                            </IconButton>
                                        )}
                                        {contact.phone && (
                                            <IconButton onClick={() => window.open(`tel:${contact.phone}`)} aria-label="Call contact">
                                                <Phone className="w-4 h-4" />
                                            </IconButton>
                                        )}
                                        <div className="w-px h-4 bg-zinc-800 mx-1 self-center" />
                                        <IconButton onClick={() => handleEditClick(contact)} className="hover:text-blue-400" aria-label="Edit contact">
                                            <Pencil className="w-4 h-4" />
                                        </IconButton>
                                        <IconButton onClick={() => handleDeleteContact(contact.id)} className="hover:text-red-400" aria-label="Delete contact">
                                            <Trash2 className="w-4 h-4" />
                                        </IconButton>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : activeTab === 'notes' ? (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium text-zinc-400">Company Notes</h3>
                        <PrimaryButton onClick={handleSaveCompanyNotes} disabled={isSavingNotes}>
                            <Save className="w-4 h-4 mr-2" />
                            {isSavingNotes ? 'Saving...' : 'Save Notes'}
                        </PrimaryButton>
                    </div>
                    <textarea
                        className="w-full h-96 bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-zinc-300 focus:outline-none focus:border-zinc-700 resize-none font-mono text-sm leading-relaxed"
                        placeholder="Add general notes, tech specs, or details about the company..."
                        value={companyNotes}
                        onChange={(e) => setCompanyNotes(e.target.value)}
                    />
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium text-zinc-400">Activities ({interactions.length})</h3>
                        <PrimaryButton onClick={() => setShowInteractionForm(true)}>
                            <Plus className="w-4 h-4" /> Log Activity
                        </PrimaryButton>
                    </div>

                    {showInteractionForm && (
                        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg mb-4">
                            <h4 className="text-sm font-medium text-white mb-3">Log New Activity</h4>
                            <form onSubmit={handleLogInteraction} className="grid grid-cols-2 gap-3">
                                <select
                                    className={AdminTokens.input.base}
                                    value={newInteraction.type}
                                    aria-label="Interaction type"
                                    onChange={e => setNewInteraction({ ...newInteraction, type: e.target.value as 'email' | 'call' | 'meeting' | 'note' })}
                                >
                                    <option value="email">Email</option>
                                    <option value="call">Call</option>
                                    <option value="meeting">Meeting</option>
                                    <option value="note">Note</option>
                                </select>
                                <input
                                    type="date"
                                    aria-label="Interaction date"
                                    className={AdminTokens.input.base}
                                    value={newInteraction.date}
                                    onChange={e => setNewInteraction({ ...newInteraction, date: e.target.value })}
                                />
                                <textarea
                                    placeholder="Summary *"
                                    className={`${AdminTokens.input.base} col-span-2`}
                                    value={newInteraction.summary}
                                    onChange={e => setNewInteraction({ ...newInteraction, summary: e.target.value })}
                                />
                                <input
                                    placeholder="Next Step"
                                    className={AdminTokens.input.base}
                                    value={newInteraction.next_step || ''}
                                    onChange={e => setNewInteraction({ ...newInteraction, next_step: e.target.value })}
                                />
                                <input
                                    type="date"
                                    placeholder="Next Step Date"
                                    className={AdminTokens.input.base}
                                    value={newInteraction.next_step_date || ''}
                                    onChange={e => setNewInteraction({ ...newInteraction, next_step_date: e.target.value })}
                                />
                                <div className="col-span-2 flex justify-end gap-2 mt-2">
                                    <SecondaryButton type="button" onClick={() => setShowInteractionForm(false)}>Cancel</SecondaryButton>
                                    <PrimaryButton type="submit">Log Activity</PrimaryButton>
                                </div>
                            </form>
                        </div>
                    )}

                    {interactions.length === 0 && !showInteractionForm ? (
                        <p className="text-zinc-500 text-sm italic">No interactions logged.</p>
                    ) : (
                        <div className="grid gap-3">
                            {interactions.map(interaction => (
                                <div key={interaction.id} className="flex gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                                    <div className="mt-1">
                                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                                            <MessageSquare className="w-4 h-4 text-zinc-400" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
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
