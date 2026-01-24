import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);

        // Auto-reload on chunk load errors (deployment updates)
        if (error.message.includes('Loading chunk') || error.message.includes('Importing a module script failed')) {
            console.log('Reloading page due to chunk load error...');
            window.location.reload();
        }
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
                    <div className="max-w-md text-center">
                        <h1 className="text-2xl font-serif mb-4">Something went wrong</h1>
                        <p className="text-white/60 mb-8">
                            We encountered an unexpected error. This might be due to a new update.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-white text-black rounded-full font-pixel text-xs font-bold tracking-widest hover:bg-neutral-200 transition-colors"
                        >
                            RELOAD PAGE
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
