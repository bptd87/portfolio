import React from 'react';
import {
    DndContext,
    rectIntersection,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    DragStartEvent,
    DragEndEvent,
    useDroppable,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Company } from '../../../types/business';
import { MapPin, Pencil, Trash2 } from 'lucide-react';
import { AdminTokens } from '../../../styles/admin-tokens';

const COLUMNS = {
    prospect: 'Prospects',
    active: 'Active',
    past: 'Past',
    dormant: 'Dormant'
};

interface SortableCompanyItemProps {
    company: Company;
    onEdit: (company: Company) => void;
    onDelete: (id: string) => void;
}

function SortableCompanyItem({ company, onEdit, onDelete }: SortableCompanyItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: company.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        touchAction: 'none',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`group relative mb-3 touch-none z-10 hover:-translate-y-1 transition-transform duration-300 ${AdminTokens.card.glass} ${AdminTokens.card.glassHover} !p-4 border-zinc-500/20`}
        >
            <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded bg-zinc-700 flex items-center justify-center text-xs overflow-hidden">
                    {company.logo_url ? <img src={company.logo_url} className="w-full h-full object-cover" alt="" /> : '🏢'}
                </div>
                <span className="font-medium text-sm text-zinc-200 truncate flex-1">{company.name}</span>
            </div>

            <div className="flex items-center text-[10px] text-zinc-500 mb-1">
                <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">{company.address?.city || 'Unknown'}, {company.address?.state}</span>
            </div>

            <div
                className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onPointerDown={(e) => e.stopPropagation()}
            >
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(company); }}
                    aria-label="Edit company"
                    className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded"
                >
                    <Pencil className="w-3 h-3" />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(company.id); }}
                    aria-label="Delete company"
                    className="p-1 text-zinc-400 hover:text-red-400 hover:bg-zinc-700 rounded"
                >
                    <Trash2 className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
}

// Separate component for Column to use useDroppable hook
function CRMColumn({ status, title, companies, onEdit, onDelete }: { status: string, title: string, companies: Company[], onEdit: any, onDelete: any }) {
    const { setNodeRef } = useDroppable({
        id: status,
    });

    return (
        <div ref={setNodeRef} className="flex flex-col h-full min-w-[280px] bg-zinc-900/30 backdrop-blur-md rounded-2xl border border-white/5 shadow-inner">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-medium text-zinc-300 text-sm">{title}</h3>
                <span className="text-xs bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded">{companies.length}</span>
            </div>

            <SortableContext
                id={status}
                items={companies.map(c => c.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="flex-1 p-2 overflow-y-auto min-h-[100px]">
                    {companies.map((company) => (
                        <SortableCompanyItem
                            key={company.id}
                            company={company}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                    {companies.length === 0 && (
                        <div className="h-24 flex items-center justify-center border-2 border-dashed border-white/5 rounded-xl m-2 pointer-events-none bg-white/5">
                            <span className="text-xs text-zinc-600">Drop here</span>
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
}

interface CRMBoardViewProps {
    companies: Company[];
    onStatusChange: (companyId: string, newStatus: string) => void;
    onEdit: (company: Company) => void;
    onDelete: (id: string) => void;
}

export function CRMBoardView({ companies, onStatusChange, onEdit, onDelete }: CRMBoardViewProps) {
    const [activeId, setActiveId] = React.useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeCompany = companies.find(c => c.id === active.id);
        const overId = over.id as string;

        if (!activeCompany) return;

        // Drop on Column
        if (Object.keys(COLUMNS).includes(overId)) {
            if (activeCompany.status !== overId) {
                onStatusChange(activeCompany.id, overId);
            }
        }
        // Drop on Item
        else {
            const overCompany = companies.find(c => c.id === overId);
            if (overCompany && activeCompany.status !== overCompany.status) {
                onStatusChange(activeCompany.id, overCompany.status);
            }
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full overflow-x-auto pb-4">
                {Object.entries(COLUMNS).map(([status, title]) => (
                    <CRMColumn
                        key={status}
                        status={status}
                        title={title}
                        companies={companies.filter(c => c.status === status)}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeId ? (
                    <div className={`p-4 rounded-xl shadow-2xl opacity-90 rotate-3 cursor-grabbing w-[220px] backdrop-blur-xl bg-zinc-900/90 border border-white/20`}>
                        {(() => {
                            const c = companies.find(i => i.id === activeId);
                            if (!c) return null;
                            return (
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 rounded bg-zinc-700 flex items-center justify-center text-xs overflow-hidden">
                                        {c.logo_url ? <img src={c.logo_url} className="w-full h-full object-cover" alt="" /> : '🏢'}
                                    </div>
                                    <span className="font-medium text-sm text-zinc-200 truncate">{c.name}</span>
                                </div>
                            )
                        })()}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
