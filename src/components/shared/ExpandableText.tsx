'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ExpandableTextProps {
    text: string;
    maxLines?: number;
    className?: string;
}

export function ExpandableText({ text, maxLines = 4, className = "" }: ExpandableTextProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [shouldShowButton, setShouldShowButton] = useState(false);
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (textRef.current) {
            const { scrollHeight, offsetHeight } = textRef.current;
            // Use a small buffer for measurement accuracy
            setShouldShowButton(scrollHeight > offsetHeight + 2);
        }
    }, [text, maxLines]);

    return (
        <div className={`group relative ${className}`}>
            <motion.div
                ref={textRef}
                initial={false}
                animate={{
                    maxHeight: isExpanded ? '2000px' : `${maxLines * 1.6}em`,
                }}
                className="overflow-hidden transition-all duration-700 ease-in-out whitespace-pre-line"
            >
                {text}
            </motion.div>

            {shouldShowButton && (
                <div className="mt-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsExpanded(!isExpanded);
                        }}
                        className="text-[8px] font-pixel tracking-[0.2em] uppercase text-white/30 hover:text-white/60 transition-colors inline-flex items-center"
                    >
                        {!isExpanded && <span className="mr-2 opacity-50">...</span>}
                        <span>{isExpanded ? 'Show Less' : 'Read More'}</span>
                    </button>
                </div>
            )}
        </div>
    );
}

