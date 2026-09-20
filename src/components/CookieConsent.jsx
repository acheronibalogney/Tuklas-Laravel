import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CookieIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="1" fill="currentColor"/>
    <circle cx="8" cy="8" r="1" fill="currentColor"/>
    <circle cx="16" cy="9" r="1" fill="currentColor"/>
    <circle cx="9" cy="16" r="1" fill="currentColor"/>
    <circle cx="15" cy="15" r="1" fill="currentColor"/>
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (window.localStorage.getItem('tuklas-cookie-consent')) return undefined;
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    handleClose();
  };

  const handleDecline = () => {
    handleClose();
  };


  const handleClose = () => {
    window.localStorage.setItem('tuklas-cookie-consent', 'accepted');
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 300);
  };

  const handleCustomize = () => {
    // For now, just accept with default settings
    // In a full implementation, this would open a modal with detailed cookie preferences
    handleAccept();
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.18)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 9998,
          animation: isClosing ? 'fadeOut 0.3s ease' : 'fadeIn 0.3s ease',
          pointerEvents: 'none'
        }}
        onClick={handleClose}
      />

      {/* Cookie Banner */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          padding: '16px',
          animation: isClosing ? 'slideDown 0.3s ease' : 'slideUp 0.3s ease'
        }}
      >
        <div className="cookie-consent-panel" style={{
          maxWidth: 1200,
          margin: '0 auto',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: 0
        }}>
          {/* Top accent bar */}
          <div style={{
            height: 4,
            background: 'var(--grad-primary)'
          }} />

          <div style={{
            padding: 'clamp(20px, 4vw, 28px)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'clamp(16px, 3vw, 24px)',
            flexWrap: 'wrap'
          }}>
            {/* Icon */}
            <div className="cookie-consent-icon" style={{
              flexShrink: 0,
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'var(--accent-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent)'
            }}>
              <CookieIcon />
            </div>

            {/* Content */}
            <div className="cookie-consent-actions" style={{
              flex: '1 1 300px',
              minWidth: 0
            }}>
              <h3 style={{
                fontSize: 18,
                fontWeight: 700,
                fontFamily: 'var(--font-display)',
                color: 'var(--text-primary)',
                marginBottom: 8,
                lineHeight: 1.3
              }}>
                We Value Your Privacy
              </h3>
              <p style={{
                fontSize: 14,
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                marginBottom: 0
              }}>
                We use cookies to enhance your experience, analyze platform usage, and provide personalized career recommendations. 
                By clicking "Accept All", you consent to our use of cookies. You can manage your preferences at any time.{' '}
                <a
                  href="/privacy"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/privacy');
                  }}
                  style={{
                    color: 'var(--accent)',
                    textDecoration: 'none',
                    fontWeight: 600
                  }}
                  onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                >
                  Learn more
                </a>
              </p>
            </div>

            {/* Actions */}
            <div style={{
              flexShrink: 0,
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              <button className="cookie-consent-action"
                onClick={handleDecline}
                style={{
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--bg-card)';
                  e.target.style.borderColor = 'var(--accent)';
                  e.target.style.color = 'var(--accent)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = 'var(--border)';
                  e.target.style.color = 'var(--text-secondary)';
                }}
              >
                Accept Necessary
              </button>
              <button className="cookie-consent-action"
                onClick={handleCustomize}
                style={{
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--accent-light)';
                  e.target.style.borderColor = 'var(--accent)';
                  e.target.style.color = 'var(--accent)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'var(--bg-card)';
                  e.target.style.borderColor = 'var(--border)';
                  e.target.style.color = 'var(--text-primary)';
                }}
              >
                Customize
              </button>
              <button className="cookie-consent-action cookie-consent-action--primary"
                onClick={handleAccept}
                style={{
                  padding: '10px 24px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: 'var(--grad-primary)',
                  color: '#050D0F',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(0, 245, 170, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(0, 245, 170, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0, 245, 170, 0.2)';
                }}
              >
                Accept All
              </button>
            </div>

            {/* Close Button */}
            <button className="cookie-consent-close"
              onClick={handleClose}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--bg-card)';
                e.target.style.borderColor = 'var(--accent)';
                e.target.style.color = 'var(--accent)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.borderColor = 'var(--border)';
                e.target.style.color = 'var(--text-muted)';
              }}
              aria-label="Close cookie banner"
            >
              <CloseIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes slideDown {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(100%);
            opacity: 0;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .cookie-consent-actions {
            flex-direction: column;
            width: 100%;
          }
          .cookie-consent-actions button {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
