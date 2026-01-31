import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AccordionItem {
    title: string;
    content: string;
}

interface AccordionBlockProps {
    items: AccordionItem[];
    accentColor?: string;
}

export function AccordionBlock({ items, accentColor }: AccordionBlockProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="my-10 space-y-4">
            {items.map((item, index) => (
                <div key={index} className="border border-foreground/10 rounded-lg overflow-hidden">
                    <button
                        onClick={() => toggle(index)}
                        className="w-full flex items-center justify-between p-4 text-left bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-colors"
                    >
                        <span className="font-medium text-lg pr-4">{item.title}</span>
                        <ChevronDown
                            className={`w-5 h-5 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
                            style={{ color: accentColor || 'currentColor' }}
                        />
                    </button>

                    <AnimatePresence>
                        {openIndex === index && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                            >
                                <div
                                    className="p-4 pt-0 text-foreground/70 leading-relaxed border-t border-transparent"
                                    dangerouslySetInnerHTML={{ __html: item.content }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
}
