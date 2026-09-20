import React from 'react';

function showOverlay(message) {
  try {
    let el = document.getElementById('error-overlay');
    if (!el) {
      el = document.createElement('div');
      el.id = 'error-overlay';
      el.style.position = 'fixed';
      el.style.inset = '12px';
      el.style.padding = '12px';
      el.style.background = 'rgba(255,255,255,0.98)';
      el.style.color = '#B33A3A';
      el.style.zIndex = 999999;
      el.style.border = '2px solid rgba(179,58,58,0.1)';
      el.style.borderRadius = '8px';
      el.style.fontFamily = 'Inter, sans-serif';
      el.style.fontSize = '13px';
      el.style.overflow = 'auto';
      el.style.maxHeight = '60vh';
      el.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)';
      document.body.appendChild(el);
    }
    el.innerText = message;
  } catch (err) {
    // ignore
  }
}

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    const msg = `React Error: ${error?.message || error}\n\n${info?.componentStack || ''}`;
    console.error(msg);
    showOverlay(msg);
  }

  render() {
    if (this.state.hasError) {
      return (
        React.createElement('div', { style: { padding: 24, fontFamily: 'Inter, sans-serif' } },
          React.createElement('h3', null, 'An error occurred'),
          React.createElement('pre', { style: { whiteSpace: 'pre-wrap', color: '#B33A3A' } }, this.state.error?.message || String(this.state.error))
        )
      );
    }
    return this.props.children;
  }
}

export function installGlobalErrorHandlers() {
  if (typeof window === 'undefined') return;
  window.addEventListener('error', (ev) => {
    try {
      // Ignore resource load errors (e.g. ad blockers / Brave Shields blocking GSI or analytics)
      if (ev.target && ev.target !== window) {
        return;
      }
      if (!ev.message && !ev.error) return;
      const msg = `Window error: ${ev.message || ev.error || ev.filename || ''}`;
      console.error(msg, ev.error || ev);
    } catch {}
  }, true);
  window.addEventListener('unhandledrejection', (ev) => {
    try {
      const reason = ev.reason && (ev.reason.message || JSON.stringify(ev.reason)) || String(ev.reason);
      const msg = `Unhandled promise rejection: ${reason}`;
      console.error(msg, ev.reason);
    } catch {}
  });
}


export default ErrorBoundary;
