import { useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import SEO from '../components/SEO';

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);

export default function NotFound() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

  const quickLinks = [
    { label: 'Home', path: '/', icon: <HomeIcon /> },
    { label: 'Sign In', path: '/auth', icon: <SearchIcon /> },
    { label: 'Get Started', path: '/onboarding', icon: <SearchIcon /> },
    { label: 'Mobile Demo', path: '/mobile', icon: <SearchIcon /> },
    { label: 'Team', path: '/team', icon: <SearchIcon /> },
  ];

  return (
    <>
      <SEO
        title="Page Not Found — Tuklas"
        description="The page you're looking for doesn't exist. Return to Tuklas homepage or explore our career intelligence platform."
        url="/404"
      />
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-page)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Theme Toggle */}
        <div style={{ position: 'absolute', top: 24, right: 24, zIndex: 10 }}>
          <button className="theme-toggle" onClick={toggle} title="Toggle theme">
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>

        {/* Main Content */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
          textAlign: 'center',
          position: 'relative'
        }}>
          {/* 404 Illustration */}
          <div style={{
            position: 'relative',
            marginBottom: 32,
            animation: 'float 3s ease-in-out infinite'
          }}>
            <div style={{
              fontSize: 'clamp(120px, 20vw, 200px)',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              background: 'var(--grad-text)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1,
              marginBottom: 16
            }}>
              404
            </div>
            
            {/* Decorative circles */}
            <div style={{
              position: 'absolute',
              top: '10%',
              left: '-20%',
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'var(--accent-light)',
              opacity: 0.6,
              animation: 'pulse 2s ease-in-out infinite'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '20%',
              right: '-15%',
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'var(--accent-light-blue)',
              opacity: 0.6,
              animation: 'pulse 2s ease-in-out infinite 0.5s'
            }} />
          </div>

          {/* Content */}
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <h1 style={{
              fontSize: 'clamp(28px, 5vw, 42px)',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              color: 'var(--text-primary)',
              marginBottom: 16,
              lineHeight: 1.2
            }}>
              Page Not Found
            </h1>
            <p style={{
              fontSize: 16,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: 32,
              maxWidth: 480,
              margin: '0 auto 32px'
            }}>
              The page you're looking for doesn't exist or has been moved. Let's get you back on track with your career journey.
            </p>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: 48
            }}>
              <button
                className="cta-primary"
                onClick={() => navigate('/')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 24px',
                  fontSize: 15
                }}
              >
                <HomeIcon />
                Back to Home
              </button>
              <button
                className="cta-secondary"
                onClick={() => navigate(-1)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 24px',
                  fontSize: 15
                }}
              >
                <ArrowLeftIcon />
                Go Back
              </button>
            </div>

            {/* Quick Links */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              maxWidth: 400,
              margin: '0 auto'
            }}>
              <h3 style={{
                fontSize: 14,
                fontWeight: 700,
                fontFamily: 'var(--font-display)',
                color: 'var(--text-primary)',
                marginBottom: 16,
                textAlign: 'left'
              }}>
                Quick Links
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}>
                {quickLinks.map((link) => (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      background: 'transparent',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-secondary)',
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--accent-light)';
                      e.currentTarget.style.borderColor = 'var(--accent)';
                      e.currentTarget.style.color = 'var(--accent)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                  >
                    <div style={{ width: 16, height: 16 }}>
                      {link.icon}
                    </div>
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '24px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: 13,
          borderTop: '1px solid var(--border)'
        }}>
          <p style={{ margin: 0 }}>
            &copy; 2026 Tuklas. All rights reserved.
          </p>
        </div>
      </div>
    </>
  );
}
