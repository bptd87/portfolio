'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Project Detail Route Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
            <div className="max-w-md text-center">
                <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
                <p className="text-white/60 mb-6">
                    We couldn't load this project. It may have been moved or deleted.
                </p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => reset()}
                        className="px-4 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-white/90 transition-colors"
                    >
                        Try again
                    </button>
                    <a
                        href="/portfolio"
                        className="px-4 py-2 bg-white/10 text-white rounded-full text-sm font-medium hover:bg-white/20 transition-colors"
                    >
                        Back to Portfolio
                    </a>
                </div>
            </div>
        </div>
    );
}
