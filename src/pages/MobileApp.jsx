import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const TargetIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const BookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
);

const ChevronLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const BatteryIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <rect x="1" y="6" width="18" height="12" rx="2" ry="2"/><line x1="23" y1="13" x2="23" y2="11"/>
  </svg>
);

const WifiIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>
  </svg>
);

function StatusBar() {
  return (
    <div className="status-bar">
      <span>9:41</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <WifiIcon />
        <BatteryIcon />
      </div>
    </div>
  );
}

function TabBar({ active = 0 }) {
  const tabs = [
    { label: 'Home', icon: <HomeIcon /> },
    { label: 'Path', icon: <TargetIcon /> },
    { label: 'Skills', icon: <StarIcon /> },
    { label: 'Train', icon: <BookIcon /> },
    { label: 'Profile', icon: <UserIcon /> },
  ];
  return (
    <div className="tab-bar">
      {tabs.map((t, i) => (
        <div key={t.label} className={`tab-bar-item${active === i ? ' active' : ''}`}>
          {t.icon}
          {t.label}
        </div>
      ))}
    </div>
  );
}

/* ── SCREEN 1: HOME / DASHBOARD ── */
function Screen1() {
  return (
    <div className="phone-screen">
      <StatusBar />
      <div className="phone-content">
        {/* Topbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800 }}>
            <span className="grad-text">Tuklas</span>
          </div>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 600, color: '#050D0F' }}>
            JD
          </div>
        </div>

        {/* Welcome */}
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>Hi, Juan.</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>Thursday, Apr 30</div>
        </div>

        {/* Readiness card */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 12 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Career Readiness</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700 }} className="grad-text">72</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>/ 100</span>
          </div>
          <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '72%', background: 'var(--grad-primary)', borderRadius: 3 }} />
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, background: 'var(--grad-primary)', color: '#050D0F', borderRadius: 8, padding: '8px 10px', fontSize: 11, fontWeight: 600, textAlign: 'center', fontFamily: 'var(--font-body)' }}>
            Analyse Resume
          </div>
          <div style={{ flex: 1, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: 8, padding: '8px 10px', fontSize: 11, textAlign: 'center' }}>
            View Path
          </div>
        </div>

        {/* Recent matches */}
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Top Matches</div>
          {[
            { name: 'Software Engineer', match: '94%', color: 'badge-green' },
            { name: 'Web Developer', match: '81%', color: 'badge-blue' },
          ].map(r => (
            <div key={r.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 11, color: 'var(--text-primary)', fontWeight: 500 }}>{r.name}</span>
              <span className={`badge ${r.color}`} style={{ fontSize: 9 }}>{r.match}</span>
            </div>
          ))}
        </div>
      </div>
      <TabBar active={0} />
    </div>
  );
}

/* ── SCREEN 2: CAREER PATH ── */
function Screen2() {
  return (
    <div className="phone-screen">
      <StatusBar />
      <div className="phone-content">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ChevronLeft />
          <div style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Career Path</div>
          <div style={{ width: 14 }} />
        </div>

        {/* Career */}
        <div style={{ textAlign: 'center', padding: '4px 0 8px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Software Engineer</div>
          <span className="badge badge-green" style={{ fontSize: 9 }}>94% Match</span>
        </div>

        {/* Pathway steps */}
        <div style={{ position: 'relative', paddingLeft: 32 }}>
          {/* Connecting line */}
          <div style={{ position: 'absolute', left: 14, top: 16, bottom: 16, width: 1, borderLeft: '1px dashed var(--border)' }} />
          {[
            { n: '1', title: 'NC II Programming', status: 'Completed', active: true },
            { n: '2', title: 'Web Dev Certificate', status: 'In Progress', active: true },
            { n: '3', title: 'Fullstack Training', status: 'Not Started', active: false },
          ].map(s => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16, position: 'relative' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: s.active ? 'var(--grad-primary)' : 'var(--bg-card)',
                border: s.active ? 'none' : '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
                color: s.active ? '#050D0F' : 'var(--text-muted)',
                flexShrink: 0, position: 'relative', zIndex: 1,
              }}>
                {s.n}
              </div>
              <div style={{ paddingTop: 4 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: 3 }}>{s.title}</div>
                <span className={`badge ${s.status === 'Completed' ? 'badge-green' : s.status === 'In Progress' ? 'badge-blue' : 'badge-muted'}`} style={{ fontSize: 9 }}>{s.status}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--accent-light)', borderRadius: 8, padding: '10px 12px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Next Step</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Complete Web Dev Certificate to unlock Fullstack training.</div>
        </div>
      </div>
      <TabBar active={1} />
    </div>
  );
}

/* ── SCREEN 3: SKILLS GAP ── */
function Screen3() {
  const [tab, setTab] = useState('need');

  const haveSkills = ['HTML/CSS', 'JavaScript', 'Git'];
  const needSkills = ['React.js', 'Node.js', 'SQL', 'REST APIs'];

  return (
    <div className="phone-screen">
      <StatusBar />
      <div className="phone-content">
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Skills Gap</div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[{ key: 'have', label: 'You Have' }, { key: 'need', label: 'You Need' }].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1, padding: '6px 10px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600,
                background: tab === t.key ? 'var(--grad-primary)' : 'var(--bg-surface)',
                color: tab === t.key ? '#050D0F' : 'var(--text-secondary)',
                border: tab !== t.key ? '1px solid var(--border)' : 'none',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Skills list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {(tab === 'have' ? haveSkills : needSkills).map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: tab === 'have' ? 'var(--accent)' : '#E85D24', flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: 'var(--text-primary)', fontWeight: 500 }}>{s}</span>
              </div>
              {tab === 'need' && (
                <span style={{ fontSize: 10, color: 'var(--accent)', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>Find Training →</span>
              )}
            </div>
          ))}
        </div>
      </div>
      <TabBar active={2} />
    </div>
  );
}

/* ── SCREEN 4: UPLOAD ── */
function Screen4() {
  return (
    <div className="phone-screen">
      <StatusBar />
      <div className="phone-content">
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Upload</div>

        {/* Resume zone */}
        <div style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: 16, textAlign: 'center', marginBottom: 10 }}>
          <div style={{ color: 'var(--accent)', marginBottom: 6 }}><UploadIcon /></div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 3 }}>Drop your resume</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>PDF or DOCX · max 5MB</div>
        </div>

        {/* Cert zone */}
        <div style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: 16, textAlign: 'center', marginBottom: 10 }}>
          <div style={{ color: 'var(--accent)', marginBottom: 6 }}><UploadIcon /></div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 3 }}>TESDA Certificates</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>Multiple files supported</div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 10 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', cursor: 'pointer' }}>Skip for now →</span>
        </div>

        <div style={{ background: 'var(--grad-primary)', borderRadius: 10, padding: '10px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#050D0F', fontFamily: 'var(--font-body)' }}>
          Analyse →
        </div>
      </div>
      <TabBar active={3} />
    </div>
  );
}



export default function MobileApp() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

  const screens = [
    { label: 'Home', component: <Screen1 /> },
    { label: 'Career Path', component: <Screen2 /> },
    { label: 'Skills Gap', component: <Screen3 /> },
    { label: 'Upload', component: <Screen4 /> },
  ];

  return (
    <div className="mobile-page">
      {/* Nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 56, maxWidth: 1100, margin: '0 auto 56px' }}>
        <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <ChevronLeft /> Back to Landing
        </button>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800 }}>
          <span className="grad-text">Tuklas</span>
        </div>
        <button className="theme-toggle" onClick={toggle}>
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>

      {/* Header */}
      <div className="mobile-page-header">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>
          Mobile App
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14, lineHeight: 1.15 }}>
          Tuklas in your pocket.
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto' }}>
          Available on web and mobile — your career intelligence, anywhere.
        </p>
      </div>

      {/* Phone screens */}
      <div className="phone-row" style={{ marginBottom: 48 }}>
        {screens.map((s, i) => (
          <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="phone-frame" style={{ animationDelay: `${i * 80}ms` }}>
              {s.component}
            </div>
            <div className="phone-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Download strip */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16, fontFamily: 'var(--font-mono)' }}>
          Tuklas is a free web and mobile platform.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '10px 24px', fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
            Available on Web
          </div>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '10px 24px', fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
            Mobile-Optimised
          </div>
        </div>
      </div>
    </div>
  );
}
