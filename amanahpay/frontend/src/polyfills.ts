// Polyfill for process.env in browser
if (typeof window !== 'undefined' && typeof window.process === 'undefined') {
  window.process = {
    env: {
      NODE_ENV: import.meta.env.MODE || 'development',
      REACT_APP_API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
      // Add any other environment variables here that your app needs
    },
  } as any;
}

// Polyfill for global
if (typeof window !== 'undefined' && typeof window.global === 'undefined') {
  window.global = window;
}

export {}; 