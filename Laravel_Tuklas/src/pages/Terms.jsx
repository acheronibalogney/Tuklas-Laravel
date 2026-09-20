import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

const ArrowIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>;

export default function Terms() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const { user, profileSettings } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentUserName = profileSettings?.displayName || user?.name || 'User';
  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <SEO
        title="Terms of Service — Tuklas"
        description="Read Tuklas's Terms of Service. Understand your rights and responsibilities when using our AI-powered career intelligence platform."
        url="/terms"
      />
      <div className="field-guide legal-page">
        <header className="field-header">
          <Link className="field-wordmark" to="/" aria-label="Tuklas home">Tuklas<span>.</span></Link>
          <div className="field-header-note">TERMS / PH</div>
          <nav className="field-nav" aria-label="Main navigation"><a href="/#method">Method</a><a href="/#pathways">Pathways</a><Link to="/team">About</Link></nav>
          <div className="field-actions">
            <button className="field-icon-button" onClick={toggle} title="Toggle theme" aria-label="Toggle theme">{theme === 'dark' ? <SunIcon /> : <MoonIcon />}</button>
            {user ? <button className="field-small-action" onClick={() => navigate('/app')}>{currentUserName} / OPEN DASHBOARD</button> : <button className="field-small-action" onClick={() => navigate('/auth')}>SIGN IN / JOIN</button>}
            <button className="field-menu-button" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">MENU</button>
          </div>
        </header>
        {mobileMenuOpen && <div className="field-mobile-menu" role="dialog" aria-label="Mobile navigation"><button className="field-mobile-close" onClick={closeMenu}>CLOSE x</button><a href="/#method" onClick={closeMenu}>Method</a><a href="/#pathways" onClick={closeMenu}>Pathways</a><Link to="/team" onClick={closeMenu}>About</Link><button onClick={() => { closeMenu(); navigate(user ? '/app' : '/auth'); }}>{user ? 'OPEN DASHBOARD' : 'SIGN IN / JOIN'}</button></div>}

        {/* Content */}
        <main className="legal-content">
          {/* Hero */}
          <div className="legal-hero">
            <div className="legal-eyebrow">LEGAL AGREEMENT / 16 SECTIONS</div>
            <div className="field-hero-grid">
              <div className="field-hero-index">T<br /><span>TERMS<br />OF<br />SERVICE</span></div>
              <div><p className="field-kicker">The agreement behind the platform</p><h1>Terms of<br /><em>Service</em>.</h1></div>
              <div className="field-hero-side"><p>Read the rules, responsibilities, and boundaries that shape how Tuklas works for every user.</p><button className="field-arrow-action" onClick={() => navigate('/')}>BACK TO HOME <ArrowIcon /></button></div>
            </div>
            <p>LAST UPDATED: AUGUST 19, 2026</p>
          </div>

          {/* Terms Content */}
          <div className="legal-document">
            <Section title="1. Agreement to Terms">
              <p>
                Welcome to Tuklas. By accessing or using our platform, you agree to be bound by these Terms of Service ("Terms"). Please read them carefully. If you do not agree with any part of these Terms, you may not use our service.
              </p>
              <p>
                These Terms constitute a legally binding agreement between you ("User" or "you") and Tuklas ("we," "us," or "our"). We reserve the right to modify these Terms at any time, and your continued use of the platform constitutes acceptance of any changes.
              </p>
            </Section>

            <Section title="2. Description of Service">
              <p>
                Tuklas is an AI-powered career intelligence platform that provides:
              </p>
              <ul>
                <li>Personalized career pathway recommendations</li>
                <li>Skills gap analysis and career readiness scoring</li>
                <li>TESDA training program suggestions</li>
                <li>Career guidance and job market insights</li>
                <li>Resume analysis and skill mapping</li>
              </ul>
              <p>
                Our service is provided free of charge to Filipino youth and job seekers. We use Claude AI and other technologies to analyze your profile and provide tailored recommendations.
              </p>
            </Section>

            <Section title="3. User Eligibility">
              <p>
                To use Tuklas, you must:
              </p>
              <ul>
                <li>Be at least 15 years of age</li>
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
              <p>
                Users under 18 should seek parental or guardian consent before using our platform.
              </p>
            </Section>

            <Section title="4. User Accounts and Responsibilities">
              <p><strong>Account Creation:</strong> You are responsible for maintaining the confidentiality of your account information, including your password. You agree to:</p>
              <ul>
                <li>Provide true, accurate, and complete information</li>
                <li>Update your information to keep it accurate</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Not share your account with others</li>
              </ul>
              <p><strong>Account Security:</strong> You are responsible for all activities that occur under your account. Tuklas is not liable for any loss or damage from unauthorized use of your account.</p>
            </Section>

            <Section title="5. Acceptable Use Policy">
              <p>You agree NOT to:</p>
              <ul>
                <li>Use the platform for any illegal or unauthorized purpose</li>
                <li>Violate any laws, regulations, or third-party rights</li>
                <li>Upload false, misleading, or fraudulent information</li>
                <li>Impersonate any person or entity</li>
                <li>Interfere with or disrupt the platform's operation</li>
                <li>Attempt to gain unauthorized access to any part of the system</li>
                <li>Use automated systems (bots, scrapers) without permission</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Share or sell your account access</li>
                <li>Reverse engineer or attempt to extract source code</li>
              </ul>
              <p>
                Violation of this policy may result in immediate account suspension or termination.
              </p>
            </Section>

            <Section title="6. Intellectual Property Rights">
              <p><strong>Our Content:</strong> All content on Tuklas, including text, graphics, logos, software, and AI-generated recommendations, is owned by or licensed to us and protected by intellectual property laws.</p>
              <p><strong>Your Content:</strong> You retain ownership of any content you upload (resumes, certificates, profile information). By uploading content, you grant us a non-exclusive, worldwide license to use, store, and process this content to provide our services.</p>
              <p><strong>TESDA Information:</strong> TESDA training information and program details are used for educational and informational purposes. We do not claim ownership of TESDA content and materials.</p>
            </Section>

            <Section title="7. AI-Generated Recommendations">
              <p>
                Tuklas uses artificial intelligence to generate career recommendations and insights. Important disclaimers:
              </p>
              <ul>
                <li><strong>Not Professional Advice:</strong> Our AI recommendations are for informational purposes only and do not constitute professional career counseling or legal advice</li>
                <li><strong>Accuracy:</strong> While we strive for accuracy, AI recommendations may not always be perfect or suitable for your specific situation</li>
                <li><strong>User Discretion:</strong> You are responsible for making your own career decisions based on multiple sources of information</li>
                <li><strong>No Guarantees:</strong> We do not guarantee job placement, training acceptance, or career success</li>
              </ul>
            </Section>

            <Section title="8. Third-Party Services and Links">
              <p>
                Our platform may contain links to third-party websites, services, or TESDA training providers. We are not responsible for:
              </p>
              <ul>
                <li>The content, accuracy, or practices of third-party sites</li>
                <li>Training quality or outcomes from TESDA programs</li>
                <li>Job application results or employer decisions</li>
                <li>Privacy practices of external organizations</li>
              </ul>
              <p>
                Your interactions with third parties are solely between you and them.
              </p>
            </Section>

            <Section title="9. Data Privacy and Security">
              <p>
                Your privacy is important to us. Our collection, use, and protection of your personal information is governed by our <a href="/privacy" onClick={(e) => { e.preventDefault(); navigate('/privacy'); }} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</a>, which is incorporated into these Terms by reference.
              </p>
              <p>
                We implement industry-standard security measures, but cannot guarantee absolute security. You use the platform at your own risk.
              </p>
            </Section>

            <Section title="10. Disclaimers and Limitation of Liability">
              <p><strong>Service "As Is":</strong> Tuklas is provided "as is" and "as available" without warranties of any kind, either express or implied, including but not limited to:</p>
              <ul>
                <li>Accuracy, reliability, or completeness of information</li>
                <li>Uninterrupted or error-free operation</li>
                <li>Fitness for a particular purpose</li>
                <li>Non-infringement of third-party rights</li>
              </ul>
              <p><strong>Limitation of Liability:</strong> To the maximum extent permitted by law, Tuklas and its team members shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:</p>
              <ul>
                <li>Lost profits or career opportunities</li>
                <li>Data loss or corruption</li>
                <li>Service interruptions</li>
                <li>Errors in AI recommendations</li>
              </ul>
              <p>
                Our total liability shall not exceed the amount paid by you to use our service (which is currently zero, as our service is free).
              </p>
            </Section>

            <Section title="11. Indemnification">
              <p>
                You agree to indemnify, defend, and hold harmless Tuklas, its officers, directors, employees, and partners from any claims, liabilities, damages, losses, and expenses arising from:
              </p>
              <ul>
                <li>Your use or misuse of the platform</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party rights</li>
                <li>Any content you upload or share</li>
              </ul>
            </Section>

            <Section title="12. Termination">
              <p><strong>By You:</strong> You may delete your account at any time through your account settings.</p>
              <p><strong>By Us:</strong> We reserve the right to suspend or terminate your account at any time, with or without cause, including for:</p>
              <ul>
                <li>Violation of these Terms</li>
                <li>Fraudulent or illegal activity</li>
                <li>Extended periods of inactivity</li>
                <li>Requests from law enforcement</li>
              </ul>
              <p>
                Upon termination, your right to use the platform ceases immediately. We may retain certain information as required by law or for legitimate business purposes.
              </p>
            </Section>

            <Section title="13. Governing Law and Dispute Resolution">
              <p>
                These Terms are governed by the laws of the Republic of the Philippines. Any disputes arising from these Terms or your use of Tuklas shall be resolved through:
              </p>
              <ul>
                <li><strong>Informal Resolution:</strong> We encourage you to contact us first to resolve any issues informally</li>
                <li><strong>Mediation:</strong> If informal resolution fails, disputes may be submitted to mediation</li>
                <li><strong>Jurisdiction:</strong> Courts of Pangasinan, Philippines shall have exclusive jurisdiction</li>
              </ul>
            </Section>

            <Section title="14. Changes to Terms">
              <p>
                We may modify these Terms at any time. Changes will be effective immediately upon posting to the platform. We will notify users of significant changes via email or platform notification. Your continued use after changes constitutes acceptance of the modified Terms.
              </p>
            </Section>

            <Section title="15. General Provisions">
              <p><strong>Severability:</strong> If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall remain in full effect.</p>
              <p><strong>Waiver:</strong> Our failure to enforce any right or provision shall not constitute a waiver of that right or provision.</p>
              <p><strong>Assignment:</strong> You may not assign or transfer these Terms without our consent. We may assign our rights and obligations without restriction.</p>
              <p><strong>Entire Agreement:</strong> These Terms and our Privacy Policy constitute the entire agreement between you and Tuklas.</p>
            </Section>

            <Section title="16. Contact Information">
              <p>
                For questions, concerns, or notices regarding these Terms of Service, please contact us:
              </p>
              <div style={{
                background: 'var(--bg-card)',
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                marginTop: 16
              }}>
                <p style={{ margin: '0 0 8px', color: 'var(--text-primary)', fontWeight: 600 }}>Tuklas Legal Team</p>
                <p style={{ margin: '4px 0', color: 'var(--text-secondary)' }}>Email: <a href="mailto:legal@tuklas.ph" style={{ color: 'var(--accent)', textDecoration: 'none' }}>legal@tuklas.ph</a></p>
                <p style={{ margin: '4px 0', color: 'var(--text-secondary)' }}>Address: Pangasinan, Philippines</p>
                <p style={{ margin: '4px 0', color: 'var(--text-secondary)' }}>Website: <a href="https://tuklas.ph" style={{ color: 'var(--accent)', textDecoration: 'none' }}>tuklas.ph</a></p>
              </div>
            </Section>

            <div style={{
              marginTop: 40,
              paddingTop: 24,
              borderTop: '1px solid var(--border)',
              textAlign: 'center'
            }}>
              <p style={{
                fontSize: 14,
                color: 'var(--text-muted)',
                margin: 0
              }}>
                By using Tuklas, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </div>
          </div>

          <div className="legal-contact-strip">
            <div className="legal-contact-copy">
              <div className="legal-contact-label">Need to reach us?</div>
              <h2>Questions about<br /><em>your terms.</em></h2>
            </div>
            <div className="legal-contact-actions">
              <p>Our legal team can help with questions or notices regarding these Terms of Service.</p>
              <div>
                <a href="mailto:legal@tuklas.ph">Contact Legal Team <span aria-hidden="true">→</span></a>
                <button type="button" onClick={() => navigate('/privacy')}>View Privacy Policy <span aria-hidden="true">→</span></button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{
        fontSize: 20,
        fontWeight: 700,
        fontFamily: 'var(--font-display)',
        color: 'var(--text-primary)',
        marginBottom: 16,
        lineHeight: 1.4
      }}>
        {title}
      </h2>
      <div style={{
        fontSize: 15,
        color: 'var(--text-secondary)',
        lineHeight: 1.8
      }}>
        {children}
      </div>
    </div>
  );
}
