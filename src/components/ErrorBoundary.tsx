/**
 * React Error Boundary - Catches and displays React errors gracefully
 * Prevents entire app from crashing on component errors
 */

import React, { Component, ReactNode } from 'react';
import { log } from '../utils/Logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    log.error('React Error Boundary caught error', { 
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack 
    });
    
    this.setState({ errorInfo });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
          padding: '40px',
          fontFamily: 'monospace',
          overflow: 'auto',
          zIndex: 9999
        }}>
          <h1 style={{ color: '#E53E3E', marginBottom: '20px' }}>
            ⚠️ Something went wrong
          </h1>
          <div style={{ 
            backgroundColor: '#2d2d2d',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <h2 style={{ color: '#D69E2E', marginBottom: '10px' }}>Error:</h2>
            <pre style={{ 
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              color: '#E53E3E'
            }}>
              {this.state.error?.message}
            </pre>
          </div>
          {this.state.error?.stack && (
            <div style={{ 
              backgroundColor: '#2d2d2d',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <h2 style={{ color: '#D69E2E', marginBottom: '10px' }}>Stack Trace:</h2>
              <pre style={{ 
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontSize: '12px',
                color: '#A0AEC0'
              }}>
                {this.state.error.stack}
              </pre>
            </div>
          )}
          {this.state.errorInfo?.componentStack && (
            <div style={{ 
              backgroundColor: '#2d2d2d',
              padding: '20px',
              borderRadius: '8px'
            }}>
              <h2 style={{ color: '#D69E2E', marginBottom: '10px' }}>Component Stack:</h2>
              <pre style={{ 
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontSize: '12px',
                color: '#A0AEC0'
              }}>
                {this.state.errorInfo.componentStack}
              </pre>
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              backgroundColor: '#38A169',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            🔄 Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
