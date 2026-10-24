import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="state-center-box" role="alert" style={{ minHeight: '50vh' }}>
          <div className="empty-icon-box" style={{ background: 'var(--color-error-bg)', borderColor: 'var(--color-error-border)' }}>
            <AlertTriangle size={28} color="var(--color-error)" aria-hidden="true" />
          </div>
          <h2>System Rendering Error</h2>
          <p style={{ maxWidth: '500px', color: 'var(--color-text-muted)', margin: 'var(--space-2) 0 var(--space-4)' }}>
            An unexpected error occurred in the frequent flyer portal interface. Your locally stored data remains safe.
          </p>
          <button type="button" className="btn btn-primary" onClick={this.handleReset}>
            <RefreshCw size={16} aria-hidden="true" />
            <span>Reload Application</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
