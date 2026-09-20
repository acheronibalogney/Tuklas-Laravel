import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { useUser } from '../UserContext';
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

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const SparklesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v4m0 10v4M3 12h4m10 0h4M5.6 5.6l2.8 2.8m7.2 7.2l2.8 2.8M5.6 18.4l2.8-2.8m7.2-7.2l2.8-2.8"/>
  </svg>
);

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const TargetIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);

export default function ThankYou() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const { user, profileSettings } = useUser();
  const [searchParams] = useSearchParams();
  const [confettiVisible, setConfettiVisible] = useState(false);

  // Get action type from URL params
  const action = searchParams.get('action') || 'signup';
  
  const currentUserName = profileSettings?.displayName || user?.name || 'there';

  useEffect(() => {
    // Trigger confetti animation
    setConfettiVisible(true);
    const timer = setTimeout(() => setConfettiVisible(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Configure content based on action type
  const getContent = () => {
    switch (action) {
      case 'onboarding':
        return {
          title: 'Profile Complete!',
          message: `Great job, ${currentUserName}! Your career profile is set up and ready.`,
          description: 'We\'ve analyzed your skills and experience. Let\'s explore your personalized career pathways.',
          primaryCta: 'View My Dashboard',
          primaryPath: '/app',
          secondaryCta: 'Explore Career Paths',
          secondaryPath: '/app'
        };
      case 'signup':
        return {
          title: 'Welcome to Tuklas!',
          message: `Thanks for joining us, ${currentUserName}!`,
          description: 'Your account has been created successfully. Let\'s complete your profile to get personalized career recommendations.',
          primaryCta: 'Complete Your Profile',
          primaryPath: '/onboarding',
          secondaryCta: 'Explore Platform',
          secondaryPath: '/'
        };
      case 'contact':
        return {
          title: 'Message Sent!',
          message: 'We\'ve received your message.',
          description: 'Our team will get back to you within 24-48 hours. In the meantime, explore our career intelligence features.',
          primaryCta: 'Back to Home',
          primaryPath: '/',
          secondaryCta: 'View Resources',
          secondaryPath: '/mobile'
        };
      case 'application':
        return {
          title: 'Application Submitted!',
          message: 'Your training application has been submitted.',
          description: 'The TESDA training provider will review your application and contact you with next steps.',
          primaryCta: 'View My Applications',
          primaryPath: '/app',
          secondaryCta: 'Find More Training',
          secondaryPath: '/app'
        };
      default:
        return {
          title: 'Success!',
          message: 'Action completed successfully.',
          description: 'Continue exploring Tuklas to unlock your career potential.',
          primaryCta: 'Go to Dashboard',
          primaryPath: '/app',
          secondaryCta: 'Back to Home',
          secondaryPath: '/'
        };
    }
  };

  const content = getContent();

  const nextSteps = [
    { icon: <TargetIcon />, title: 'Explore Career Paths', description: 'Discover careers that match your skills and goals' },
    { icon: <SparklesIcon />, title: 'Get AI Recommendations', description: 'Receive personalized training and job suggestions' },
    { icon: <CheckCircleIcon />, title: 'Track Your Progress', description: 'Monitor your career readiness score and achievements' }
  ];

  return (
    <>
      <SEO
        title="Thank You — Tuklas"
        description="Thank you for using Tuklas. Continue your career journey with AI-powered recommendations and training opportunities."
        url="/thank-you"
      />
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-page)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Confetti Effect */}
        {confettiVisible && (
          <div style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 9999
          }}>
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: 10,
                  height: 10,
                  background: ['var(--accent)', 'var(--accent-alt)', '#00F5AA', '#3B00FF'][i % 4],
                  top: '-10px',
                  left: `${Math.random() * 100}%`,
                  animation: `confettiFall ${2 + Math.random() * 2}s linear forwards`,
                  opacity: 0.8,
                  borderRadius: i % 2 === 0 ? '50%' : '2px'
                }}
              />
            ))}
          </div>
        )}

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
          textAlign: 'center'
        }}>
          {/* Success Icon */}
          <div style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'var(--grad-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
            animation: 'bounceIn 0.6s ease',
            boxShadow: 'var(--glow-primary)'
          }}>
            <div style={{
              width: 60,
              height: 60,
              color: '#fff'
            }}>
              <CheckCircleIcon />
            </div>
          </div>

          {/* Content */}
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <h1 style={{
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              color: 'var(--text-primary)',
              marginBottom: 16,
              lineHeight: 1.2,
              animation: 'fadeUp 0.5s ease 0.2s both'
            }}>
              {content.title}
            </h1>
            <p style={{
              fontSize: 18,
              color: 'var(--text-secondary)',
              marginBottom: 12,
              fontWeight: 500,
              animation: 'fadeUp 0.5s ease 0.3s both'
            }}>
              {content.message}
            </p>
            <p style={{
              fontSize: 15,
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              marginBottom: 40,
              maxWidth: 480,
              margin: '0 auto 40px',
              animation: 'fadeUp 0.5s ease 0.4s both'
            }}>
              {content.description}
            </p>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: 60,
              animation: 'fadeUp 0.5s ease 0.5s both'
            }}>
              <button
                className="cta-primary"
                onClick={() => navigate(content.primaryPath)}
                style={{
                  padding: '14px 28px',
                  fontSize: 15
                }}
              >
                {content.primaryCta}
              </button>
              <button
                className="cta-secondary"
                onClick={() => navigate(content.secondaryPath)}
                style={{
                  padding: '14px 28px',
                  fontSize: 15
                }}
              >
                {content.secondaryCta}
              </button>
            </div>

            {/* Next Steps */}
            <div style={{
              maxWidth: 700,
              margin: '0 auto',
              animation: 'fadeUp 0.5s ease 0.6s both'
            }}>
              <h3 style={{
                fontSize: 16,
                fontWeight: 700,
                fontFamily: 'var(--font-display)',
                color: 'var(--text-primary)',
                marginBottom: 24,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontSize: 13
              }}>
                What's Next?
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 16
              }}>
                {nextSteps.map((step, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '20px',
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                      animation: `fadeUp 0.4s ease ${0.7 + i * 0.1}s both`
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.borderColor = 'var(--accent)';
                      e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 245, 170, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      width: 40,
                      height: 40,
                      margin: '0 auto 12px',
                      borderRadius: '50%',
                      background: 'var(--accent-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent)'
                    }}>
                      {step.icon}
                    </div>
                    <div style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      marginBottom: 6
                    }}>
                      {step.title}
                    </div>
                    <div style={{
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5
                    }}>
                      {step.description}
                    </div>
                  </div>
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
            Need help? <a href="mailto:support@tuklas.ph" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Contact Support</a>
          </p>
        </div>

        {/* Keyframe Animations */}
        <style>{`
          @keyframes confettiFall {
            0% {
              transform: translateY(-10px) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(720deg);
              opacity: 0;
            }
          }
        `}</style>
      </div>
    </>
  );
}
