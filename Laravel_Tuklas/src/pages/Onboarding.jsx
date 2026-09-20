import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { useUser } from '../UserContext';

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

const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
    <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, flexShrink: 0 }}>
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const CAREERS = [
  'Software Engineer', 'Electrician', 'Bookkeeper', 'Web Developer',
  'Healthcare Worker', 'Entrepreneur', 'Graphic Designer', 'TESDA Trainer',
];

const EDUCATION_OPTIONS = ['High School Graduate', 'College Undergraduate', 'College Graduate', 'Vocational Graduate'];
const STATUS_OPTIONS = ['Student', 'Unemployed', 'Underemployed', 'First-time jobseeker'];

const splitName = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] || '', lastName: parts.slice(1).join(' ') };
};

const getAge = (birthDate) => {
  if (!birthDate) return '';
  const date = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const hasHadBirthday = today.getMonth() > date.getMonth() || (today.getMonth() === date.getMonth() && today.getDate() >= date.getDate());
  if (!hasHadBirthday) age -= 1;
  return age >= 0 ? age : '';
};

const SETUP_ITEMS = [
  'Tell us about yourself',
  'Set your dream career',
  'Upload your resume',
  'Upload your certificates',
];

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function TuklasDatePicker({ value, onChange }) {
  const initialDate = value ? new Date(`${value}T00:00:00`) : new Date();
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(initialDate);
  const [selector, setSelector] = useState(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: days }, (_, index) => index + 1)];
  while (cells.length % 7) cells.push(null);

  const selectDay = day => {
    if (!day) return;
    const monthValue = String(month + 1).padStart(2, '0');
    const dayValue = String(day).padStart(2, '0');
    onChange(`${year}-${monthValue}-${dayValue}`);
    setOpen(false);
    setSelector(null);
  };

  return <div className="tuklas-date-picker">
    <button type="button" className={`tuklas-date-input${open ? ' is-open' : ''}`} onClick={() => setOpen(current => !current)}>
      {value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Select your birth date'}
      <span aria-hidden="true">▣</span>
    </button>
    {open && <div className="tuklas-calendar" role="dialog" aria-label="Choose birth date">
      <div className="tuklas-calendar-heading">
        <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))} aria-label="Previous month">‹</button>
        <div className="tuklas-calendar-selectors">
          <button type="button" onClick={() => setSelector(selector === 'month' ? null : 'month')}>{MONTH_NAMES[month]}</button>
          <button type="button" onClick={() => setSelector(selector === 'year' ? null : 'year')}>{year}</button>
        </div>
        <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))} aria-label="Next month">›</button>
      </div>
      {selector === 'month' && <div className="tuklas-calendar-picker-grid">{MONTH_NAMES.map((name, index) => <button type="button" className={index === month ? 'is-selected' : ''} key={name} onClick={() => { setViewDate(new Date(year, index, 1)); setSelector(null); }}>{name.slice(0, 3)}</button>)}</div>}
      {selector === 'year' && <div className="tuklas-calendar-picker-grid tuklas-year-grid">{Array.from({ length: 12 }, (_, index) => year - 5 + index).map(option => <button type="button" className={option === year ? 'is-selected' : ''} key={option} onClick={() => { setViewDate(new Date(option, month, 1)); setSelector(null); }}>{option}</button>)}</div>}
      {!selector && <>
        <div className="tuklas-calendar-weekdays">{WEEKDAY_NAMES.map(day => <span key={day}>{day}</span>)}</div>
        <div className="tuklas-calendar-days">{cells.map((day, index) => <button type="button" key={`${day}-${index}`} className={day && value === `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` ? 'is-selected' : ''} disabled={!day} onClick={() => selectDay(day)}>{day || ''}</button>)}</div>
      </>}
      <div className="tuklas-calendar-footer"><button type="button" onClick={() => { onChange(''); setOpen(false); }}>Clear</button><button type="button" onClick={() => { const today = new Date(); setViewDate(today); onChange(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`); setOpen(false); }}>Today</button></div>
    </div>}
  </div>;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const { user, profileSettings, updateProfileSettings, saveDocuments } = useUser();
  const [step, setStep] = useState(1);
  const [career, setCareer] = useState('');
  const [careerSearch, setCareerSearch] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [certFiles, setCertFiles] = useState([]);
  const [socialPassword, setSocialPassword] = useState('');
  const [socialPasswordConfirmation, setSocialPasswordConfirmation] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const savedName = splitName(profileSettings?.displayName || user?.name || '');
  const syncedLocation = [profileSettings?.streetAddress, profileSettings?.barangay, profileSettings?.municipality].filter(Boolean).join(', ') || profileSettings?.location || user?.location || '';
  const [basicInfo, setBasicInfo] = useState(() => ({
    firstName: profileSettings?.firstName || savedName.firstName,
    lastName: profileSettings?.lastName || savedName.lastName,
    birthDate: profileSettings?.birthDate || user?.birthDate || '',
    location: syncedLocation,
    highestEducation: profileSettings?.highestEducation || user?.highestEducation || '',
    currentStatus: profileSettings?.currentStatus || user?.currentStatus || '',
  }));
  const resumeRef = useRef();
  const certRef = useRef();

  // profileSettings is hydrated after the first render for returning users.
  // Keep onboarding fields synchronized so saved profile data is not replaced
  // by the empty initial state while the request is still loading.
  useEffect(() => {
    const name = splitName(profileSettings?.displayName || user?.name || '');
    const location = [profileSettings?.streetAddress, profileSettings?.barangay, profileSettings?.municipality].filter(Boolean).join(', ') || profileSettings?.location || user?.location || '';
    setBasicInfo(current => ({
      ...current,
      firstName: profileSettings?.firstName || name.firstName || current.firstName,
      lastName: profileSettings?.lastName || name.lastName || current.lastName,
      birthDate: profileSettings?.birthDate || user?.birthDate || current.birthDate,
      location: location || current.location,
      highestEducation: profileSettings?.highestEducation || user?.highestEducation || current.highestEducation,
      currentStatus: profileSettings?.currentStatus || user?.currentStatus || current.currentStatus,
    }));

    const savedCareer = Array.isArray(profileSettings?.targetRole) ? profileSettings.targetRole[0] : '';
    if (savedCareer) {
      setCareer(savedCareer);
      setCareerSearch(savedCareer);
    }
  }, [profileSettings, user]);

  const progress = ((step - 1) / 4) * 100;

  const saveBasicInfo = () => {
    const displayName = [basicInfo.firstName, basicInfo.lastName].map(value => value.trim()).filter(Boolean).join(' ');
    updateProfileSettings?.({
      displayName,
      firstName: basicInfo.firstName.trim(),
      lastName: basicInfo.lastName.trim(),
      birthDate: basicInfo.birthDate,
      location: basicInfo.location,
      highestEducation: basicInfo.highestEducation,
      currentStatus: basicInfo.currentStatus,
    });
  };

  const handleFinish = async () => {
    const onboardingFiles = [resumeFile, ...certFiles].filter(Boolean);
    await saveDocuments?.(onboardingFiles, 'onboarding-upload');
    saveBasicInfo();
    updateProfileSettings?.({ targetRole: career.trim() ? [career.trim()] : (Array.isArray(profileSettings?.targetRole) ? profileSettings.targetRole : []) });
    navigate('/app');
  };

  const filteredCareers = CAREERS.filter(c =>
    c.toLowerCase().includes(careerSearch.toLowerCase())
  );

  const finishSocialPasswordSetup = async () => {
    setPasswordError('');
    if (socialPassword.length < 8 || socialPassword !== socialPasswordConfirmation) {
      setPasswordError('Use at least 8 characters and make sure both passwords match.');
      return;
    }
    const response = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update-password', newPassword: socialPassword, newPassword_confirmation: socialPasswordConfirmation }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) { setPasswordError(result.error || 'Unable to create your password.'); return; }
    window.location.reload();
  };

  if (user?.needsPasswordSetup) {
    return <div className="social-password-screen">
      <header className="social-password-header">
        <div className="social-password-wordmark">Tuklas<span>.</span></div>
        <div className="social-password-header-note">CAREER INTELLIGENCE / ACCOUNT SECURITY</div>
        <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme">{theme === 'dark' ? <SunIcon /> : <MoonIcon />}</button>
      </header>
      <main className="social-password-main">
        <div className="social-password-kicker">SECURE YOUR ACCOUNT</div>
        <h1>Create your Tuklas password.</h1>
        <p className="social-password-copy">You signed in with Google or Facebook. Create a password first so you can also sign in directly and protect your account.</p>
        <div className="social-password-form">
          <div className="social-password-field"><label htmlFor="social-new-password">New password</label><input id="social-new-password" type="password" value={socialPassword} onChange={event => setSocialPassword(event.target.value)} autoComplete="new-password" placeholder="At least 8 characters" /></div>
          <div className="social-password-field"><label htmlFor="social-confirm-password">Confirm password</label><input id="social-confirm-password" type="password" value={socialPasswordConfirmation} onChange={event => setSocialPasswordConfirmation(event.target.value)} autoComplete="new-password" placeholder="Repeat your password" /></div>
          {passwordError && <div className="social-password-error">{passwordError}</div>}
          <button className="social-password-submit" onClick={finishSocialPasswordSetup}>Continue to profile →</button>
        </div>
      </main>
    </div>;
  }

  return (
    <div className="onboarding-shell">
      {/* Fixed progress bar */}
      <div className="progress-bar-fixed">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Top bar */}
      <div style={{
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800 }}>
          <span className="grad-text">Tuklas</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="step-indicator" style={{ margin: 0 }}>Step {step} of 4</div>
          <button className="theme-toggle" onClick={toggle}>
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>

      <div className="onboarding-inner">
        <div className="onboarding-panel">

          {/* ── STEP 1: WELCOME ── */}
          {step === 1 && (
            <div className="ob-step">
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: 12 }}>
                Welcome to Tuklas,{' '}
                <span className="grad-text">{basicInfo.firstName || 'there'}.</span>
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 28 }}>
                Let's set up your profile so we can find the best career path for you. This takes about 2 minutes.
              </p>
              <div className="checklist">
                {SETUP_ITEMS.map((item, i) => (
                  <div key={item} className="checklist-item">
                    <div className={`check-circle${i < step - 1 ? ' done' : ''}`}>
                      {i < step - 1 && <CheckIcon />}
                    </div>
                    {item}
                  </div>
                ))}
              </div>
              <button className="btn-full" onClick={() => setStep(2)}>Let's Go →</button>
            </div>
          )}

          {/* ── STEP 2: BASIC INFO ── */}
          {step === 2 && (
            <div className="ob-step">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
                Tell us about yourself.
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 36 }}>
                This helps us personalise your career recommendations.
              </p>

              <div className="profile-settings-name-grid">
                <div className="form-field"><label className="form-label">First Name</label><input className="form-input" type="text" value={basicInfo.firstName} onChange={event => setBasicInfo(current => ({ ...current, firstName: event.target.value }))} autoComplete="given-name" placeholder="First name" /></div>
                <div className="form-field"><label className="form-label">Last Name</label><input className="form-input" type="text" value={basicInfo.lastName} onChange={event => setBasicInfo(current => ({ ...current, lastName: event.target.value }))} autoComplete="family-name" placeholder="Last name" /></div>
              </div>
              <div className="form-field">
                <label className="form-label">Birth Date</label>
                <TuklasDatePicker value={basicInfo.birthDate} onChange={birthDate => setBasicInfo(current => ({ ...current, birthDate }))} />
              </div>
              <div className="form-field">
                <label className="form-label">Age</label>
                <input className="form-input" type="text" value={basicInfo.birthDate ? `${getAge(basicInfo.birthDate)} years old` : ''} placeholder="Auto-filled from birth date" readOnly />
              </div>
              <div className="form-field">
                <label className="form-label">Location</label>
                <input className="form-input" type="text" value={basicInfo.location} placeholder="Set your address in Profile" readOnly />
              </div>
              <div className="form-field">
                <label className="form-label">Highest Education</label>
                <select className="form-input" value={basicInfo.highestEducation} onChange={event => setBasicInfo(current => ({ ...current, highestEducation: event.target.value }))}>
                  <option value="">Select education level</option>
                  {EDUCATION_OPTIONS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Current Status</label>
                <select className="form-input" value={basicInfo.currentStatus} onChange={event => setBasicInfo(current => ({ ...current, currentStatus: event.target.value }))}>
                  <option value="">Select your status</option>
                  {STATUS_OPTIONS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>

              <div className="ob-nav">
                <button className="btn-back" onClick={() => setStep(1)}>← Back</button>
                <button className="cta-primary" style={{ height: 44, padding: '0 28px', fontSize: 14 }} onClick={() => { saveBasicInfo(); setStep(3); }}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: CAREER GOAL ── */}
          {step === 3 && (
            <div className="ob-step">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
                Where do you want to go?
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28 }}>
                Pick a dream career. You can change this anytime.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 24 }}>
                <SearchIcon />
                <input
                  style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 15, color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}
                  placeholder="Search a career..."
                  value={careerSearch}
                  onChange={e => setCareerSearch(e.target.value)}
                />
              </div>

              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                Popular Careers
              </div>

              <div className="career-pills">
                {filteredCareers.map(c => (
                  <button
                    key={c}
                    className={`career-pill${career === c ? ' selected' : ''}`}
                    onClick={() => { setCareer(c); setCareerSearch(c); }}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div className="ob-nav">
                <button className="btn-back" onClick={() => setStep(2)}>← Back</button>
                <button className="cta-primary" style={{ height: 44, padding: '0 28px', fontSize: 14 }} onClick={() => { updateProfileSettings?.({ targetRole: career.trim() ? [career.trim()] : (Array.isArray(profileSettings?.targetRole) ? profileSettings.targetRole : []) }); setStep(4); }}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 4: UPLOAD ── */}
          {step === 4 && (
            <div className="ob-step">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
                Upload your documents.
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28 }}>
                We'll use these to analyse your skills and generate your career readiness score.
              </p>

              {/* Resume */}
              <div
                className={`upload-zone${resumeFile ? ' has-file' : ''}`}
                onClick={() => !resumeFile && resumeRef.current?.click()}
              >
                <input
                  ref={resumeRef} type="file" accept=".pdf,.docx" hidden
                  onChange={e => setResumeFile(e.target.files[0])}
                />
                {resumeFile ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>{resumeFile.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{(resumeFile.size / 1024).toFixed(0)} KB</div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); setResumeFile(null); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>×</button>
                  </div>
                ) : (
                  <>
                    <div className="upload-icon"><UploadIcon /></div>
                    <div className="upload-label">Drop your resume here or <span className="upload-link">browse</span></div>
                    <div className="upload-hint">PDF or DOCX · max 5MB</div>
                  </>
                )}
              </div>

              {/* Certificates */}
              <div
                className={`upload-zone${certFiles.length > 0 ? ' has-file' : ''}`}
                onClick={() => certRef.current?.click()}
              >
                <input
                  ref={certRef} type="file" accept=".pdf,.jpg,.png" multiple hidden
                  onChange={e => setCertFiles(prev => [...prev, ...Array.from(e.target.files)])}
                />
                {certFiles.length > 0 ? (
                  <div style={{ width: '100%', textAlign: 'left' }}>
                    <div style={{ fontSize: 12, color: 'var(--accent)', fontFamily: 'var(--font-mono)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {certFiles.length} certificate{certFiles.length > 1 ? 's' : ''} added
                    </div>
                    {certFiles.map((f, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 13, color: 'var(--text-secondary)' }}>
                        <span>{f.name}</span>
                        <button onClick={e => { e.stopPropagation(); setCertFiles(prev => prev.filter((_, j) => j !== i)); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>×</button>
                      </div>
                    ))}
                    <div style={{ marginTop: 10, fontSize: 12, color: 'var(--accent)', cursor: 'pointer' }}>+ Add more</div>
                  </div>
                ) : (
                  <>
                    <div className="upload-icon"><UploadIcon /></div>
                    <div className="upload-label">Drop your TESDA certificates here or <span className="upload-link">browse</span></div>
                    <div className="upload-hint">PDF or image · multiple files supported</div>
                  </>
                )}
              </div>

              <div style={{ textAlign: 'center', marginBottom: 8 }}>
                <button onClick={handleFinish} style={{ background: 'transparent', border: 'none', fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                  Skip for now →
                </button>
              </div>

              <button
                className="btn-full"
                style={{ opacity: (resumeFile || certFiles.length > 0) ? 1 : 0.45, cursor: (resumeFile || certFiles.length > 0) ? 'pointer' : 'not-allowed' }}
                onClick={handleFinish}
                disabled={!resumeFile && certFiles.length === 0}
              >
                Finish Setup &amp; Analyse →
              </button>

              <div className="ob-nav" style={{ marginTop: 16 }}>
                <button className="btn-back" onClick={() => setStep(3)}>← Back</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// TEMP MARKER FOR SEO IMPORT
