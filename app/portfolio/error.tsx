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
        // Log the error to an error reporting service
        console.error('Portfolio Route Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
            <div className="max-w-md text-center">
                <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
                <p className="text-white/60 mb-6">
                    We couldn't load the portfolio. This might be a temporary issue.
                </p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={
                            // Attempt to recover by trying to re-render the segment
                            () => reset()
                        }
                        className="px-4 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-white/90 transition-colors"
                    >
                        Try again
                    </button>
                    <a
                        href="/"
                        className="px-4 py-2 bg-white/10 text-white rounded-full text-sm font-medium hover:bg-white/20 transition-colors"
                    >
                        Go Home
                    </a>
                </div>
            </div>
        </div>
    );
}
