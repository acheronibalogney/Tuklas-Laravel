import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../UserContext';

const RocketIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function MobileCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();

  // Pages where CTA should NOT show
  const hiddenPaths = ['/auth', '/onboarding', '/app', '/dashboard', '/admin', '/thank-you'];

  useEffect(() => {
    // Check if on a hidden path
    const shouldHide = hiddenPaths.some(path => location.pathname.startsWith(path));
    if (shouldHide || user) {
      setIsVisible(false);
      return;
    }

    // Show CTA after scrolling down a bit
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Also show after 3 seconds on mobile
    const timer = setTimeout(() => {
      if (window.innerWidth <= 768) {
        setIsVisible(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, [location.pathname, user]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
  };

  const handleCTA = () => {
    if (user) {
      navigate('/app');
    } else {
      navigate('/onboarding');
    }
  };

  // Only show on mobile devices
  if (typeof window !== 'undefined' && window.innerWidth > 768) {
    return null;
  }

  if (!isVisible || isDismissed) {
    return null;
  }

  return (
    <>
      <div
        style={{
          position: 'fixed',
          bottom: 16,
          left: 16,
          right: 16,
          zIndex: 9000,
          animation: 'slideUpBounce 0.5s ease both',
          maxWidth: 600,
          margin: '0 auto'
        }}
      >
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {/* Gradient accent bar */}
          <div style={{
            height: 3,
            background: 'var(--grad-primary)'
          }} />

          <div style={{
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            {/* Icon */}
            <div style={{
              flexShrink: 0,
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'var(--grad-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <RocketIcon />
            </div>

            {/* Text */}
            <div style={{
              flex: 1,
              minWidth: 0
            }}>
              <div style={{
                fontSize: 14,
                fontWeight: 700,
                fontFamily: 'var(--font-display)',
                color: 'var(--text-primary)',
                marginBottom: 2,
                lineHeight: 1.3
              }}>
                Start Your Career Journey
              </div>
              <div style={{
                fontSize: 12,
                color: 'var(--text-secondary)',
                lineHeight: 1.4
              }}>
                Get AI-powered career recommendations
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleCTA}
              style={{
                flexShrink: 0,
                padding: '10px 20px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: 'var(--grad-primary)',
                color: '#050D0F',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 12px rgba(0, 245, 170, 0.2)',
                transition: 'transform 0.2s ease'
              }}
              onTouchStart={(e) => {
                e.currentTarget.style.transform = 'scale(0.95)';
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Get Started
            </button>

            {/* Dismiss Button */}
            <button
              onClick={handleDismiss}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 24,
                height: 24,
                borderRadius: '50%',
                border: 'none',
                background: 'var(--bg-card)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0
              }}
              aria-label="Dismiss"
            >
              <CloseIcon />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUpBounce {
          0% {
            transform: translateY(100px);
            opacity: 0;
          }
          60% {
            transform: translateY(-5px);
            opacity: 1;
          }
          80% {
            transform: translateY(2px);
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @media (min-width: 769px) {
          .mobile-cta-bar {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
