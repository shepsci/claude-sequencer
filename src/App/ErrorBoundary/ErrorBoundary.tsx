import React, { ReactNode } from 'react';
import { logger } from 'utils/logger';
import type { ErrorBoundaryState, ErrorHandlerProps } from 'types/components';

interface ErrorBoundaryProps {
  children: ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logger.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    return this.state.hasError ? <ErrorHandler error={this.state.error} /> : this.props.children;
  }
}
export default ErrorBoundary;

const ErrorHandler: React.FC<ErrorHandlerProps> = ({ error }) => {
  const topPortal = document.getElementById('preparingPortalTop');
  if (topPortal) topPortal.style.display = 'none';

  const reloadApp = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  return (
    <div id="errorHandler">
      <div className="container">
        <p>Oops!</p>
        <p>Something went wrong :(</p>
        <button className="btn" onClick={reloadApp}>
          Reload app
        </button>
      </div>
    </div>
  );
};
