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

export default function Privacy() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const { user, profileSettings } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentUserName = profileSettings?.displayName || user?.name || 'User';
  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <SEO
        title="Privacy Policy — Tuklas"
        description="Learn how Tuklas protects your privacy and handles your personal information. Our commitment to data security and user privacy."
        url="/privacy"
      />
      <div className="field-guide legal-page">
        <header className="field-header">
          <Link className="field-wordmark" to="/" aria-label="Tuklas home">Tuklas<span>.</span></Link>
          <div className="field-header-note">PRIVACY / PH</div>
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
            <div className="legal-eyebrow">LEGAL DOCUMENT / 13 SECTIONS</div>
            <div className="field-hero-grid">
              <div className="field-hero-index">P<br /><span>PRIVACY<br />POLICY<br />TUKLAS</span></div>
              <div><p className="field-kicker">The promise behind your data</p><h1>Privacy<br /><em>Policy</em>.</h1></div>
              <div className="field-hero-side"><p>Understand what we collect, why we use it, and the choices you have when using Tuklas.</p><button className="field-arrow-action" onClick={() => navigate('/')}>BACK TO HOME <ArrowIcon /></button></div>
            </div>
            <p>LAST UPDATED: AUGUST 19, 2026</p>
          </div>

          {/* Policy Content */}
          <div className="legal-document">
            <Section title="1. Introduction">
              <p>
                Welcome to Tuklas ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our career intelligence platform.
              </p>
              <p>
                By using Tuklas, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our service.
              </p>
            </Section>

            <Section title="2. Information We Collect">
              <p><strong>Personal Information:</strong> We collect information that you provide directly to us, including:</p>
              <ul>
                <li>Name, email address, and contact details</li>
                <li>Date of birth and gender</li>
                <li>Location information (municipality, barangay, address)</li>
                <li>Employment status and career goals</li>
                <li>Educational background and certifications</li>
                <li>Resume and skills information</li>
                <li>TESDA training records (if you choose to share them)</li>
              </ul>
              <p><strong>Usage Data:</strong> We automatically collect information about your interaction with our platform, including:</p>
              <ul>
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Pages visited and time spent on pages</li>
                <li>Career pathways explored and training recommendations viewed</li>
                <li>Search queries and feature usage</li>
              </ul>
            </Section>

            <Section title="3. How We Use Your Information">
              <p>We use the information we collect to:</p>
              <ul>
                <li><strong>Provide our services:</strong> Match you with career pathways, analyze skills gaps, and recommend TESDA training programs</li>
                <li><strong>Improve our platform:</strong> Analyze usage patterns to enhance AI recommendations and user experience</li>
                <li><strong>Communicate with you:</strong> Send important updates, training opportunities, and career guidance</li>
                <li><strong>Ensure security:</strong> Detect and prevent fraud, abuse, and security incidents</li>
                <li><strong>Comply with legal obligations:</strong> Meet regulatory requirements and respond to legal requests</li>
                <li><strong>Research and analytics:</strong> Understand career trends and improve our AI algorithms (with anonymized data)</li>
              </ul>
            </Section>

            <Section title="4. AI and Data Processing">
              <p>
                TuklasAI and other artificial intelligence technologies analyze your skills, experience, and career goals. Your data is processed to generate personalized career recommendations and training suggestions. We ensure that:
              </p>
              <ul>
                <li>AI processing is done securely and in compliance with data protection standards</li>
                <li>Your personal information is not used to train external AI models without your explicit consent</li>
                <li>You can request to opt-out of AI-powered features at any time</li>
              </ul>
            </Section>

            <Section title="5. Information Sharing and Disclosure">
              <p>We do not sell your personal information. We may share your information only in the following circumstances:</p>
              <ul>
                <li><strong>With your consent:</strong> When you explicitly authorize us to share information</li>
                <li><strong>Service providers:</strong> With trusted third-party vendors who help us operate our platform (hosting, analytics, AI services)</li>
                <li><strong>TESDA partnerships:</strong> If you apply for training programs, we may share relevant information with TESDA-accredited institutions</li>
                <li><strong>Legal requirements:</strong> When required by law, regulation, or legal process</li>
                <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              </ul>
            </Section>

            <Section title="6. Data Security">
              <p>
                We implement appropriate technical and organizational security measures to protect your personal information, including:
              </p>
              <ul>
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Employee training on data protection practices</li>
              </ul>
              <p>
                However, no method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </Section>

            <Section title="7. Your Rights and Choices">
              <p>You have the following rights regarding your personal information:</p>
              <ul>
                <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal obligations)</li>
                <li><strong>Data portability:</strong> Receive your data in a structured, machine-readable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Withdraw consent:</strong> Revoke consent for data processing where applicable</li>
              </ul>
              <p>
                To exercise these rights, please contact us at <a href="mailto:privacy@tuklas.ph" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>privacy@tuklas.ph</a>
              </p>
            </Section>

            <Section title="8. Children's Privacy">
              <p>
                Tuklas is intended for users aged 15 and above. We do not knowingly collect personal information from children under 15. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
              </p>
            </Section>

            <Section title="9. Cookies and Tracking Technologies">
              <p>
                We use cookies and similar tracking technologies to enhance your experience, analyze usage, and deliver personalized content. You can control cookie preferences through your browser settings. Note that disabling cookies may affect platform functionality.
              </p>
            </Section>

            <Section title="10. Changes to This Privacy Policy">
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of significant changes by posting the new policy on our platform and updating the "Last updated" date. Your continued use of Tuklas after changes constitutes acceptance of the updated policy.
              </p>
            </Section>

            <Section title="11. Contact Us">
              <p>
                If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <div style={{
                background: 'var(--bg-card)',
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                marginTop: 16
              }}>
                <p style={{ margin: '0 0 8px', color: 'var(--text-primary)', fontWeight: 600 }}>Tuklas Support</p>
                <p style={{ margin: '4px 0', color: 'var(--text-secondary)' }}>Email: <a href="mailto:privacy@tuklas.ph" style={{ color: 'var(--accent)', textDecoration: 'none' }}>privacy@tuklas.ph</a></p>
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
                This Privacy Policy is effective as of August 19, 2026, and applies to all users of Tuklas.
              </p>
            </div>
          </div>

          {/* Contact strip */}
          <div className="legal-contact-strip">
            <div className="legal-contact-copy">
              <div className="legal-contact-label">Need to reach us?</div>
              <h2>Questions about<br /><em>your privacy.</em></h2>
            </div>
            <div className="legal-contact-actions">
              <p>Our privacy team can help with requests, corrections, or questions about how Tuklas handles your information.</p>
              <div>
                <a href="mailto:privacy@tuklas.ph">Contact Privacy Team <span aria-hidden="true">→</span></a>
                <button type="button" onClick={() => navigate('/terms')}>View Terms of Service <span aria-hidden="true">→</span></button>
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
