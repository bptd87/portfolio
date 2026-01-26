import React from 'react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Twitter, Linkedin, Instagram, Mail } from 'lucide-react';

interface AuthorProfileProps {
    name?: string;
    role?: string;
    bio?: string;
    image?: string;
    socials?: {
        twitter?: string;
        linkedin?: string;
        instagram?: string;
        email?: string;
    };
    className?: string;
}

export function AuthorProfile({
    name = "Brandon PT Davis",
    role = "Scenic & Experiential Designer",
    bio = "Brandon PT Davis is a Scenic and Experiential Designer based in Los Angeles. His work explores the intersection of physical space, digital technology, and narrative storytelling.",
    image = "/images/author-brandon.png",
    socials = {
        linkedin: "https://www.linkedin.com/in/brandonptdavis/",
        instagram: "https://www.instagram.com/brandonptdavis/",
        email: "mailto:design@brandonptdavis.com"
    },
    className = ""
}: AuthorProfileProps) {
    return (
        <div className={`flex flex-col md:flex-row items-center md:items-start gap-8 ${className}`}>
            {/* Avatar */}
            <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-full overflow-hidden border border-black/10 dark:border-white/10 relative">
                    <ImageWithFallback
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover"
                        width={96}
                        height={96}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 text-center md:text-left">
                <h3 className="font-display text-2xl mb-1">{name}</h3>
                <div className="font-pixel text-[10px] tracking-[0.2em] text-accent-brand uppercase mb-4">
                    {role}
                </div>
                <p className="text-muted-foreground leading-relaxed mb-6 max-w-2xl">
                    {bio}
                </p>

                {/* Social Links */}
                <div className="flex items-center justify-center md:justify-start gap-4">
                    {socials.linkedin && (
                        <a
                            href={socials.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="LinkedIn"
                        >
                            <Linkedin className="w-4 h-4" />
                        </a>
                    )}
                    {socials.instagram && (
                        <a
                            href={socials.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Instagram"
                        >
                            <Instagram className="w-4 h-4" />
                        </a>
                    )}
                    {socials.twitter && (
                        <a
                            href={socials.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Twitter"
                        >
                            <Twitter className="w-4 h-4" />
                        </a>
                    )}
                    {socials.email && (
                        <a
                            href={socials.email}
                            className="p-2 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Email"
                        >
                            <Mail className="w-4 h-4" />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
