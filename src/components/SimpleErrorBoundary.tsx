import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class SimpleErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-900/20 text-white border border-red-500 rounded-xl m-4">
          <h2 className="text-xl font-bold mb-2 text-red-400">Something went wrong.</h2>
          <p className="mb-4 text-sm opacity-80">The component crashed with the following error:</p>
          <pre className="bg-black/50 p-4 rounded text-xs font-mono overflow-auto">
            {this.state.error?.toString()}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}
