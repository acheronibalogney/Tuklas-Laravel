export function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizes = {
    sm: 20,
    md: 40,
    lg: 60
  };

  const spinnerSize = sizes[size] || sizes.md;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      padding: 20
    }}>
      <div
        style={{
          width: spinnerSize,
          height: spinnerSize,
          border: '3px solid var(--border)',
          borderTop: '3px solid var(--accent)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}
      />
      {text && (
        <p style={{
          fontSize: 14,
          color: 'var(--text-secondary)',
          margin: 0,
          fontFamily: 'var(--font-body)'
        }}>
          {text}
        </p>
      )}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export function LoadingOverlay({ text = 'Loading...' }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      animation: 'fadeIn 0.2s ease'
    }}>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: '32px 48px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  );
}

export function SkeletonLoader({ width = '100%', height = 20, borderRadius = 6 }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: 'var(--bg-card)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, transparent, var(--border), transparent)',
          animation: 'shimmer 1.5s infinite'
        }}
      />
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

export function LoadingDots() {
  return (
    <div style={{
      display: 'flex',
      gap: 6,
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'var(--accent)',
            animation: `bounce 1.4s infinite ease-in-out ${i * 0.16}s`
          }}
        />
      ))}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { 
            transform: scale(0);
            opacity: 0.5;
          }
          40% { 
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
