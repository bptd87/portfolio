import React from 'react';
import Image from 'next/image';
import { Twitter, Linkedin, Mail } from 'lucide-react';

export function ArticleFooter() {
    return (
        <div className="mt-20 mb-12 relative overflow-hidden rounded-3xl bg-foreground/5 border border-white/10 p-8 md:p-12">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-brand/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12 text-center md:text-left">
                <div className="relative flex-shrink-0">
                    <div className="w-32 h-32 md:w-40 md:h-40 relative rounded-full overflow-hidden border-4 border-white/10 shadow-xl">
                        <Image
                            src="/images/brandon-with-cat.png"
                            alt="Brandon and his cat"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="absolute -bottom-2 -right-2 text-2xl">
                        🐈
                    </div>
                </div>

                <div className="flex-1">
                    <h3 className="text-2xl font-display font-medium mb-3">Thanks for reading!</h3>
                    <p className="text-lg opacity-70 mb-6 leading-relaxed max-w-xl">
                        I'm Brandon, a Scenic Designer and Creative Technologist. I write about the intersection of theatre, design, and code.
                    </p>

                    <div className="flex items-center justify-center md:justify-start gap-4">
                        <a
                            href="https://twitter.com/brandonptdavis"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                            aria-label="Twitter"
                        >
                            <Twitter className="w-5 h-5 opacity-70" />
                        </a>
                        <a
                            href="https://linkedin.com/in/brandonptdavis"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                            aria-label="LinkedIn"
                        >
                            <Linkedin className="w-5 h-5 opacity-70" />
                        </a>
                        <a
                            href="mailto:design@brandonptdavis.com"
                            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                            aria-label="Email"
                        >
                            <Mail className="w-5 h-5 opacity-70" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
