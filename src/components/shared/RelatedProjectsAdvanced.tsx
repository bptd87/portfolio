import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, MapPin, Tag } from 'lucide-react';
import Link from 'next/link';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface Project {
    id: string;
    slug: string;
    title: string;
    category?: string;
    venue?: string;
    year?: number;
    month?: string;
    tags?: string[];
    cardImage?: string;
    coverImage?: string;
    image_url?: string;
}

interface RelatedProjectsAdvancedProps {
    currentProject: Project;
    allProjects: Project[];
    onNavigate: (path: string) => void;
}

export function RelatedProjectsAdvanced({
    currentProject,
    allProjects,
    onNavigate,
}: RelatedProjectsAdvancedProps) {
    // Smart Selection Logic
    const relatedProjects = useMemo(() => {
        if (!allProjects || allProjects.length === 0) return [];

        // 1. Filter out current project
        const candidates = allProjects.filter((p) => p.id !== currentProject.id);

        // 2. Score each candidate
        const scored = candidates.map((p) => {
            let score = 0;

            // Category Match (Highest Priority - specifically for Scenic Design)
            if (p.category === currentProject.category) score += 10;

            // Venue Match
            if (p.venue && currentProject.venue && p.venue === currentProject.venue) score += 3;

            // Tag Matches
            const commonTags = p.tags?.filter((t) => currentProject.tags?.includes(t)) || [];
            score += commonTags.length * 2;

            // Era Match (Year)
            if (p.year === currentProject.year) score += 1;

            return { project: p, score, commonTags };
        });

        // 3. Sort by Score DESC, then Date DESC (assuming allProjects comes in date sorted, otherwise need sort)
        scored.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            // Fallback to year if scores tie
            return (b.project.year || 0) - (a.project.year || 0);
        });

        // 4. Take top 3
        return scored.slice(0, 3);
    }, [currentProject, allProjects]);

    if (relatedProjects.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-24 pt-12 border-t border-neutral-200 dark:border-white/10"
        >
            <div className="flex items-center justify-between mb-8">
                <h3 className="font-pixel text-xs tracking-[0.3em] uppercase text-neutral-500 dark:text-white/60">
                    Related Projects
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedProjects.map(({ project, commonTags }, index) => (
                    <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 block"
                    >
                        <Link href={`/project/${project.slug}`} className="block h-full cursor-pointer">
                            {/* Image First Container - Poster Style */}
                            <div className="relative aspect-[3/4] bg-neutral-900 border border-white/10">
                                <ImageWithFallback
                                    src={project.cardImage || project.coverImage || project.image_url || ''}
                                    alt={project.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                                    optimize="card"
                                    lazy
                                />

                                {/* Permanent Gradient Overlay for Legibility */}
                                <div className="absolute inset-x-0 bottom-0 top-1/3 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90 transition-opacity duration-300" />

                                {/* Hover Overlay - Additional darkening */}
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                {/* Content Overlay - All White Text */}
                                <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end h-full">
                                    {/* Top Badges (Tags/Year) */}
                                    <div className="absolute top-4 right-4 flex flex-col items-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                        {project.year && (
                                            <div className="px-2 py-1 rounded-md bg-white/10 backdrop-blur-md border border-white/10 text-white text-[10px] font-mono">
                                                {project.year}
                                            </div>
                                        )}
                                    </div>

                                    {/* Main Text Content */}
                                    <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                        {/* Category */}
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-pixel text-[9px] tracking-[0.2em] text-purple-300 uppercase">
                                                {project.category}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h4 className="font-display text-2xl leading-none text-white mb-3 tracking-tight drop-shadow-lg">
                                            {project.title}
                                        </h4>

                                        {/* Context / Venue */}
                                        <div className="flex flex-col gap-1.5 border-t border-white/10 pt-3 mt-3">
                                            {project.venue && (
                                                <p className="text-xs text-white/80 flex items-center gap-2 font-medium">
                                                    <MapPin className="w-3.5 h-3.5 text-purple-400" />
                                                    <span className="truncate">{project.venue}</span>
                                                </p>
                                            )}

                                            {commonTags.length > 0 && (
                                                <p className="text-[10px] text-white/50 flex items-center gap-1.5">
                                                    <span className="w-1 h-1 rounded-full bg-purple-400" />
                                                    also uses <span className="text-white/80">{commonTags[0]}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
