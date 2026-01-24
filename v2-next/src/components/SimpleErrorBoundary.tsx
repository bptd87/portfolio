import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class SimpleErrorBoundary extends React.Component<Props, State> {
  declare props: Props;
  declare state: State;
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/b7b0d02e-0d08-4275-9b3f-4f1c52ba0a51',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SimpleErrorBoundary.tsx:23',message:'ErrorBoundary caught error',data:{errorMessage:error.message,errorStack:error.stack,componentStack:errorInfo.componentStack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    console.error('SimpleErrorBoundary caught error:', error, errorInfo);
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
