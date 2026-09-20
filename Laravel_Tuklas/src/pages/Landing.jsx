import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { useUser } from '../UserContext';
import SEO from '../components/SEO';

const SunIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>;
const MoonIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 15.4A8.5 8.5 0 0 1 8.6 3.2 9 9 0 1 0 20.8 15.4Z" /></svg>;
const ArrowIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>;

const services = [
  { number: '01', title: 'Map your direction', detail: 'Resume and certificate evidence becomes a clear set of career routes.', accent: 'mint' },
  { number: '02', title: 'Name the gaps', detail: 'See the skills between where you are and where the work is.', accent: 'ochre' },
  { number: '03', title: 'Build the next move', detail: 'Follow practical TESDA training and learning recommendations.', accent: 'coral' },
];

const pathways = [
  ['Technology', 'Web development', 'Systems support', 'Data operations'],
  ['Business', 'Bookkeeping', 'Office admin', 'Customer service'],
  ['Skilled work', 'Electrical', 'Automotive', 'Construction'],
  ['Care & hospitality', 'Caregiving', 'Cookery', 'Tourism'],
  ['And more fields', 'Explore additional career paths'],
];

const systemDetails = [
  { label: 'Laravel core', value: 'Laravel powers the application routes, controllers, validation, sessions, file workflows, error handling, and JSON API used by the Tuklas interface.' },
  { label: 'Frontend', value: 'React with JSX and TSX drives the product experience, Vite builds the assets, and React Router handles the authenticated application flow.' },
  { label: 'Jetstream security', value: 'Laravel Jetstream and Fortify provide profile management, password updates, two-factor authentication with recovery codes, session protection, API tokens, and account deletion.' },
  { label: 'Social access', value: 'Google and Facebook sign-in can create an account, then require the user to set a Tuklas password and complete their profile before using protected features.' },
  { label: 'Data layer', value: 'PostgreSQL stores users, profiles, scans, sessions, folders, tokens, and uploaded-document metadata through Laravel Eloquent migrations and models.' },
  { label: 'TuklasAI', value: 'The scanner turns uploaded resumes, certificates, documents, and images into evidence that can support skills, career paths, TESDA programs, learning resources, and next actions.' },
  { label: 'Career guidance', value: 'Results connect existing experience to realistic roles, explain why each path fits, and show practical skills or training to build next.' },
  { label: 'Deployment', value: 'The project includes a production Docker setup for Railway, with Laravel, PostgreSQL environment variables, asset building, migrations, storage, and long-running application services accounted for.' },
];

export default function Landing() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const { user, profileSettings } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentUserName = profileSettings?.displayName || user?.name || 'User';
  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <SEO title="Tuklas — Career Intelligence for Filipino Youth" description="Find your next career direction with AI guidance, skills gap analysis, and TESDA-aligned training recommendations." url="/" keywords="career guidance Philippines, TESDA training, AI career matching, Philippine jobs" />
      <div className="field-guide field-guide--landing">
        <header className="field-header">
          <Link className="field-wordmark" to="/" aria-label="Tuklas home">Tuklas<span>.</span></Link>
          <div className="field-header-note">CAREER INTELLIGENCE / PH</div>
          <nav className="field-nav" aria-label="Main navigation"><a href="#method">Method</a><a href="#pathways">Pathways</a><Link to="/team">About</Link></nav>
          <div className="field-actions">
            <button className="field-icon-button" onClick={toggle} title="Toggle theme" aria-label="Toggle theme">{theme === 'dark' ? <SunIcon /> : <MoonIcon />}</button>
            {user ? <button className="field-small-action" onClick={() => navigate('/app')}>{currentUserName} / OPEN DASHBOARD</button> : <button className="field-small-action" onClick={() => navigate('/auth')}>SIGN IN / JOIN</button>}
            <button className="field-menu-button" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">MENU</button>
          </div>
        </header>
        {mobileMenuOpen && <div className="field-mobile-menu" role="dialog" aria-label="Mobile navigation"><button className="field-mobile-close" onClick={closeMenu}>CLOSE ×</button><a href="#method" onClick={closeMenu}>Method</a><a href="#pathways" onClick={closeMenu}>Pathways</a><Link to="/team" onClick={closeMenu}>About</Link><button onClick={() => { closeMenu(); navigate(user ? '/app' : '/auth'); }}>{user ? 'OPEN DASHBOARD' : 'SIGN IN / JOIN'}</button></div>}

        <main>
          <section className="field-hero">
            <div className="field-hero-meta"><span>VOL. 01</span><span>2026 EDITION</span><span>PANGASINAN / PHILIPPINES</span></div>
            <div className="field-hero-grid"><div className="field-hero-index">A<br /><span>PERSONAL<br />DIRECTION<br />SYSTEM</span></div><div><p className="field-kicker">A practical guide to what comes next</p><h1>Make your<br /><em>next move</em><br />visible.</h1></div><div className="field-hero-side"><p>Tuklas reads the experience you already have and turns it into a plan you can act on.</p><button className="field-arrow-action" onClick={() => navigate('/onboarding')}>START YOUR MAP <ArrowIcon /></button></div></div>
            <div className="field-hero-foot"><span>TESDA-ALIGNED</span><span>AI-ASSISTED</span><span>BUILT FOR FILIPINO YOUTH</span><span className="field-scroll-mark">SCROLL ↓</span></div>
          </section>
          <section className="field-statement"><div className="field-section-label">WHY CHOOSE TUKLAS <span>01 — 03</span></div><div className="field-statement-copy"><p>Good work starts with a clear view of your strengths.</p><span>We connect your proof, your ambition, and the opportunities around you.</span></div></section>
          <section className="field-system" id="system"><div className="field-section-label">THE SYSTEM <span>TOOLS + TRUST</span></div><h2>What makes<br /><em>it work.</em></h2><div className="field-system-list">{systemDetails.map(detail => <div className="field-system-item" key={detail.label}><strong>{detail.label}</strong><p>{detail.value}</p></div>)}</div></section>
          <section className="field-services" id="method"><div className="field-section-label">THE METHOD <span>THREE USEFUL QUESTIONS</span></div>{services.map(service => <article className={`field-service-row field-service-row--${service.accent}`} key={service.number}><div className="field-service-number">{service.number}</div><h2>{service.title}</h2><p>{service.detail}</p><ArrowIcon /></article>)}</section>
          <section className="field-pathways" id="pathways"><div className="field-section-label">THE FIELD <span>CAREER AREAS TO EXPLORE</span></div><div className="field-pathway-intro"><h2>There is more<br />than one <em>good</em> route.</h2><p>Start from your skills. Compare the paths. Choose the next useful step.</p></div><div className="field-pathway-grid">{pathways.map(([area, ...roles], index) => <div className="field-pathway-column" key={area}><div className="field-pathway-index">0{index + 1}</div><h3>{area}</h3>{roles.map(role => <div className="field-role" key={role}>{role}<span>↗</span></div>)}</div>)}</div></section>
          <section className="field-callout"><div><span className="field-callout-label">YOUR WORKING FILE</span><h2>Put your experience<br /><em>to work.</em></h2></div><div className="field-callout-action"><p>Upload a resume or certificate. Get a grounded view of your skills, gaps, training options, and career matches.</p><button className="field-dark-action" onClick={() => navigate('/onboarding')}>OPEN YOUR CAREER FILE <ArrowIcon /></button></div></section>
        </main>
        <footer className="field-footer"><div className="field-footer-brand"><Link className="field-wordmark" to="/" aria-label="Tuklas home">Tuklas<span>.</span></Link><p>Career intelligence for the next generation of Filipino work.</p></div><div className="field-footer-column"><strong>EXPLORE</strong><a href="#method">The method</a><a href="#pathways">Career pathways</a><Link to="/mobile">Mobile demo</Link></div><div className="field-footer-column"><strong>CONNECT</strong><a href="mailto:support@tuklas.ph">support@tuklas.ph</a><span>Pangasinan, Philippines</span><span>EST. 2026</span></div><div className="field-footer-column field-footer-legal"><strong>LEGAL</strong><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><Link to="/team">Team</Link></div></footer>
      </div>
    </>
  );
}
