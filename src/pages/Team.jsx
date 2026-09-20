import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { useUser } from '../UserContext';
import SEO from '../components/SEO';

const SunIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>;
const MoonIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 15.4A8.5 8.5 0 0 1 8.6 3.2 9 9 0 1 0 20.8 15.4Z" /></svg>;
const ArrowIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>;

const teamMembers = [
  {
    name: 'James Bernard Chua',
    role: 'Tuklas Lead Developer',
    description: 'Main Developer of the Tuklas platform, responsible for building the core architecture, implementing AI integrations, and ensuring a seamless user experience.',
    skills: ['Skill 1', 'Skill 2', 'Skill 3', 'Skill 4'],
    initials: 'FN',
  },
  {
    name: 'Kevin Lance Victorio',
    role: '',
    description: 'Short description of what this person does on the team.',
    skills: ['Skill 1', 'Skill 2', 'Skill 3', 'Skill 4'],
    initials: 'FN',
  },
  {
    name: 'Full Name',
    role: 'Role',
    description: 'Short description of what this person does on the team.',
    skills: ['Skill 1', 'Skill 2', 'Skill 3', 'Skill 4'],
    initials: 'FN',
  },
  {
    name: 'Full Name',
    role: 'Role',
    description: 'Short description of what this person does on the team.',
    skills: ['Skill 1', 'Skill 2', 'Skill 3', 'Skill 4'],
    initials: 'FN',
  },
  {
    name: 'Full Name',
    role: 'Role',
    description: 'Short description of what this person does on the team.',
    skills: ['Skill 1', 'Skill 2', 'Skill 3', 'Skill 4'],
    initials: 'FN',
  },
];

const stats = [
  { num: '5', label: 'Team Members' },
  { num: '3', label: 'Months Development' },
  { num: '95', label: 'TESDA Programs Mapped' },
  { num: '100%', label: 'Filipino-Built' },
];

export default function Team() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const { user, profileSettings } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentUserName = profileSettings?.displayName || user?.name || 'User';
  const closeMenu = () => setMobileMenuOpen(false);
  const cardRefs = useRef([]);

  useEffect(() => {
    const observers = [];
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => { el.style.animationDelay = `${i * 0.1}s`; el.classList.add('animate-fade-up'); }, 50);
        }
      }, { threshold: 0.1 });
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  return (
    <>
      <SEO title="Team — Tuklas" description="Meet Tour de Force, the team behind Tuklas: a career intelligence platform for Filipino youth." url="/team" keywords="Tuklas team, career guidance Philippines" />
      <div className="field-guide">
        <header className="field-header">
          <Link className="field-wordmark" to="/" aria-label="Tuklas home">Tuklas<span>.</span></Link>
          <div className="field-header-note">THE TEAM / PH</div>
          <nav className="field-nav" aria-label="Main navigation"><a href="/#method">Method</a><a href="/#pathways">Pathways</a><Link to="/team">About</Link></nav>
          <div className="field-actions">
            <button className="field-icon-button" onClick={toggle} title="Toggle theme" aria-label="Toggle theme">{theme === 'dark' ? <SunIcon /> : <MoonIcon />}</button>
            {user ? <button className="field-small-action" onClick={() => navigate('/app')}>{currentUserName} / OPEN DASHBOARD</button> : <button className="field-small-action" onClick={() => navigate('/auth')}>SIGN IN / JOIN</button>}
            <button className="field-menu-button" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">MENU</button>
          </div>
        </header>
        {mobileMenuOpen && <div className="field-mobile-menu" role="dialog" aria-label="Mobile navigation"><button className="field-mobile-close" onClick={closeMenu}>CLOSE ×</button><a href="/#method" onClick={closeMenu}>Method</a><a href="/#pathways" onClick={closeMenu}>Pathways</a><Link to="/team" onClick={closeMenu}>About</Link><button onClick={() => { closeMenu(); navigate(user ? '/app' : '/auth'); }}>{user ? 'OPEN DASHBOARD' : 'SIGN IN / JOIN'}</button></div>}

        <main>
          <section className="field-hero">
            <div className="field-hero-meta"><span>VOL. 01</span><span>2026 EDITION</span><span>PANGASINAN / PHILIPPINES</span></div>
            <div className="field-hero-grid"><div className="field-hero-index">5<br /><span>PEOPLE<br />BEHIND<br />TUKLAS</span></div><div><p className="field-kicker">The people behind the platform</p><h1>Meet<br /><em>Tour de Force</em>.</h1></div><div className="field-hero-side"><p>Five creators blending product strategy, design, and engineering to build a career intelligence platform for Filipino youth.</p><button className="field-arrow-action" onClick={() => navigate('/')}>BACK TO HOME <ArrowIcon /></button></div></div>
          </section>

          <section className="field-team" id="team">
            <style>{`
              .field-team {
                max-width: 1110px;
                margin: 0 auto;
                padding: 86px 20px;
                border-bottom: 1px solid var(--field-rule);
              }
              .field-team-grid {
                display: grid;
                grid-template-columns: repeat(5, minmax(0, 1fr));
                gap: 1px;
                background: var(--field-rule);
                border: 1px solid var(--field-rule);
                margin-top: 24px;
              }
              .field-team-card {
                background: var(--field-paper);
                color: var(--field-ink);
                padding: 28px 24px;
                display: flex;
                flex-direction: column;
                gap: 12px;
                min-width: 0;
              }
              .field-team-card h2 { margin: 0; font: 700 22px/1 Georgia, serif; }
              .field-team-role { margin: 0; color: var(--field-muted); text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em; }
              .field-team-desc { margin: 0; color: var(--field-ink); font-size: 14px; line-height: 1.6; }
              .field-team-skills { display: flex; flex-wrap: wrap; gap: 8px; margin-top: auto; }
              .field-badge { color: var(--field-ink); font-size: 11px; padding: 4px 10px; border: 1px solid var(--field-rule); border-radius: 999px; }
              .field-stat-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
              @media (max-width: 640px) {
                .field-team-grid, .field-stat-grid { grid-template-columns: 1fr; }
                .field-team { padding: 58px 20px; }
              }
            `}</style>
            <div className="field-section-label">THE TEAM <span>FIVE CONTRIBUTORS</span></div>
            <div className="field-team-grid">
              {teamMembers.map((member, i) => (
                <article
                  className="field-team-card"
                  key={`${member.name}-${i}`}
                  ref={el => cardRefs.current[i] = el}
                >
                  <div className="field-service-number">{member.initials}</div>
                  <h2>{member.name}</h2>
                  <p className="field-team-role">{member.role}</p>
                  <p className="field-team-desc">{member.description}</p>
                  <div className="field-team-skills">
                    {member.skills.map(s => <span className="field-badge" key={s}>{s}</span>)}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="field-pathways" id="stats">
            <div className="field-section-label">BY THE NUMBERS <span>PROJECT STATS</span></div>
            <div className="field-pathway-grid field-stat-grid">
              {stats.map(stat => (
                <div className="field-pathway-column field-stat" key={stat.label}>
                  <div className="field-stat-number">{stat.num}</div>
                  <div className="field-stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>
        </main>

        <footer className="field-footer"><div className="field-footer-brand"><Link className="field-wordmark" to="/" aria-label="Tuklas home">Tuklas<span>.</span></Link><p>Career intelligence for the next generation of Filipino work.</p></div><div className="field-footer-column"><strong>EXPLORE</strong><a href="/#method">The method</a><a href="/#pathways">Career pathways</a><Link to="/mobile">Mobile demo</Link></div><div className="field-footer-column"><strong>CONNECT</strong><a href="mailto:support@tuklas.ph">support@tuklas.ph</a><span>Pangasinan, Philippines</span><span>EST. 2026</span></div><div className="field-footer-column field-footer-legal"><strong>LEGAL</strong><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><Link to="/team">Team</Link></div></footer>
      </div>
    </>
  );
}
