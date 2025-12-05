import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Heart } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface Project {
  id: string;
  title: string;
  category: string;
  year: number;
  cardImage?: string;
  slug: string;
  tags?: string[];
  views?: number;
  likes?: number;
}

interface RelatedProjectsProps {
  currentProject: Project;
  allProjects: Project[];
  maxResults?: number;
}

export function RelatedProjects({
  currentProject,
  allProjects,
  maxResults = 3,
}: RelatedProjectsProps) {
  const [relatedProjects, setRelatedProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Calculate similarity score for each project
    const scoredProjects = allProjects
      .filter((p) => p.id !== currentProject.id) // Exclude current project
      .map((project) => {
        let score = 0;

        // Same category: +10 points
        if (project.category === currentProject.category) {
          score += 10;
        }

        // Similar tags: +2 points per matching tag
        const currentTags = currentProject.tags || [];
        const projectTags = project.tags || [];
        const matchingTags = currentTags.filter((tag) =>
          projectTags.includes(tag)
        );
        score += matchingTags.length * 2;

        // Similar year: +5 points if within 2 years
        const yearDiff = Math.abs(project.year - currentProject.year);
        if (yearDiff <= 2) {
          score += 5;
        }

        // Popularity bonus: +1 point per 100 views
        if (project.views) {
          score += Math.floor(project.views / 100);
        }

        return { project, score };
      })
      .sort((a, b) => b.score - a.score) // Sort by score descending
      .slice(0, maxResults) // Take top N
      .map((item) => item.project);

    setRelatedProjects(scoredProjects);
  }, [currentProject, allProjects, maxResults]);

  if (relatedProjects.length === 0) {
    return null;
  }

  return (
    <div className="mt-16 pt-16 border-t border-border">
      <h2 className="text-2xl tracking-tight mb-8">Related Projects</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedProjects.map((project) => (
          <Link
            key={project.id}
            to={`/project/${project.slug}`}
            className="group block bg-card border border-border hover:border-accent-brand transition-colors"
          >
            {/* Image */}
            {project.cardImage && (
              <div className="aspect-[4/3] bg-muted overflow-hidden">
                <ImageWithFallback
                  src={project.cardImage}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            )}

            {/* Info */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs tracking-wider uppercase opacity-60">
                  {project.category}
                </span>
                <span className="text-xs opacity-40">{project.year}</span>
              </div>

              <h3 className="tracking-tight group-hover:text-accent-brand transition-colors">
                {project.title}
              </h3>

              {/* Engagement */}
              {(project.views || project.likes) && (
                <div className="flex items-center gap-4 mt-3 text-xs opacity-40">
                  {project.views && (
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{project.views.toLocaleString()}</span>
                    </div>
                  )}
                  {project.likes && (
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span>{project.likes.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
