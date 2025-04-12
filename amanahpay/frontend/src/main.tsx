// Import polyfills first
import './polyfills';
import { createRoot } from 'react-dom/client'
import './index.css'
import React from 'react';

// Add this to help with process.env debugging
console.log('Environment mode:', import.meta.env.MODE);

// Clear loading spinner when app starts initializing
const clearInitialLoader = () => {
  try {
    const loadingEl = document.querySelector('.app-loading');
    if (loadingEl && loadingEl.parentNode) {
      loadingEl.parentNode.removeChild(loadingEl);
    }
  } catch (e) {
    console.error('Failed to clear loader:', e);
  }
};

// Simple component to show while App is loading
const SimpleApp = () => (
  <div style={{ 
    padding: '20px', 
    margin: '20px', 
    fontFamily: 'system-ui, sans-serif' 
  }}>
    <h1>AmanahPay</h1>
    <p>Loading application components...</p>
  </div>
);

// Error boundary component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          margin: '20px', 
          background: '#fff', 
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ color: '#e63946' }}>Something went wrong.</h1>
          <p>The application encountered an error. Please try refreshing the page.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: '#457b9d',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '16px'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Render a basic app first to show we're alive
try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element with ID 'root' not found");
  }

  const root = createRoot(rootElement);
  
  // First render a simple component to show progress
  clearInitialLoader();
  root.render(
    <ErrorBoundary>
      <SimpleApp />
    </ErrorBoundary>
  );
  
  // Then dynamically import the actual App
  import('./App.tsx')
    .then(({ default: App }) => {
      // Replace SimpleApp with the real App once it's loaded
      root.render(
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      );
    })
    .catch(error => {
      console.error("Failed to load App component:", error);
      root.render(
        <div style={{ 
          padding: '20px', 
          margin: '20px', 
          background: '#fff', 
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ color: '#e63946' }}>App Loading Error</h1>
          <p>Failed to load the application components.</p>
          <p style={{ fontFamily: 'monospace', background: '#f1f1f1', padding: '10px', borderRadius: '4px' }}>
            {error instanceof Error ? error.message : String(error)}
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: '#457b9d',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '16px'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    });
} catch (error) {
  console.error("Failed to render application:", error);
  
  // Create a fallback UI if normal rendering fails
  const rootElement = document.getElementById("root") || document.body;
  const errorDiv = document.createElement("div");
  errorDiv.innerHTML = `
    <div style="padding: 20px; margin: 20px; background: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1)">
      <h1 style="color: #e63946">Application Failed to Start</h1>
      <p>The application could not be loaded. Please check your console for errors.</p>
      <p style="font-family: monospace; background: #f1f1f1; padding: 10px; border-radius: 4px; margin-top: 10px; color: #d62828">
        ${error instanceof Error ? error.message : String(error)}
      </p>
      <button onclick="window.location.reload()" 
        style="background: #457b9d; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-top: 16px">
        Refresh Page
      </button>
    </div>
  `;
  rootElement.appendChild(errorDiv);
}
