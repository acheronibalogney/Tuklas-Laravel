import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../UserContext';
import { PANGASINAN_LOCATIONS, fetchPangasinanBarangays } from '../pangasinanLocations';
import SEO from '../components/SEO';

const EyeIcon = ({ style }) => (
  <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' style={{ width: 16, height: 16, ...style }}>
    <path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' />
    <circle cx='12' cy='12' r='3' />
  </svg>
);

const EyeOffIcon = ({ style }) => (
  <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' style={{ width: 16, height: 16, ...style }}>
    <path d='M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19' />
    <line x1='1' y1='1' x2='23' y2='23' />
  </svg>
);

const ChevronIcon = () => (
  <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
    <polyline points='6 9 12 15 18 9' />
  </svg>
);

const formatDate = (value) => {
  if (!value) return 'mm/dd/yyyy';
  const [year, month, day] = value.split('-');
  return `${month}/${day}/${year}`;
};

const toDateValue = (date) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');

function StyledSelect({ value, onChange, options, placeholder, disabled = false, openUp = false }) {
  const [open, setOpen] = useState(false);
  const selectRef = useRef(null);
  const selected = options.find(option => option.value === value);

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!selectRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  return (
    <div className={`styled-select${open ? ' is-open' : ''}${disabled ? ' is-disabled' : ''}${openUp ? ' opens-up' : ''}`} ref={selectRef}>
      <button type='button' className='styled-select-trigger' onClick={() => !disabled && setOpen(current => !current)} disabled={disabled} aria-haspopup='listbox' aria-expanded={open}>
        <span>{selected?.label || placeholder}</span>
        <ChevronIcon />
      </button>
      {open && (
        <div className='styled-select-menu' role='listbox' aria-label={placeholder}>
          {options.map(option => (
            <button
              key={option.value}
              type='button'
              role='option'
              aria-selected={option.value === value}
              className={option.value === value ? 'is-selected' : ''}
              onClick={() => { onChange(option.value); setOpen(false); }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DatePicker({ value, onChange }) {
  const selectedDate = value ? new Date(`${value}T00:00:00`) : null;
  const [open, setOpen] = useState(false);
  const [shownMonth, setShownMonth] = useState(() => selectedDate || new Date());
  const pickerRef = useRef(null);
  const monthStart = new Date(shownMonth.getFullYear(), shownMonth.getMonth(), 1);
  const calendarStart = new Date(shownMonth.getFullYear(), shownMonth.getMonth(), 1 - monthStart.getDay());
  const days = Array.from({ length: 42 }, (_, index) => new Date(calendarStart.getFullYear(), calendarStart.getMonth(), calendarStart.getDate() + index));

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!pickerRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  const chooseDate = (date) => {
    onChange(toDateValue(date));
    setOpen(false);
  };

  return (
    <div className={`date-picker${open ? ' is-open' : ''}`} ref={pickerRef}>
      <button type='button' className='date-picker-trigger' onClick={() => setOpen(current => !current)} aria-haspopup='dialog' aria-expanded={open}>
        <span className={value ? '' : 'is-placeholder'}>{formatDate(value)}</span>
        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'><rect x='3' y='4' width='18' height='17' rx='2' /><line x1='16' y1='2' x2='16' y2='6' /><line x1='8' y1='2' x2='8' y2='6' /><line x1='3' y1='10' x2='21' y2='10' /></svg>
      </button>
      {open && (
        <div className='date-picker-popover' role='dialog' aria-label='Choose date of birth'>
          <div className='date-picker-header'>
            <button type='button' aria-label='Previous month' onClick={() => setShownMonth(current => new Date(current.getFullYear(), current.getMonth() - 1, 1))}>‹</button>
            <strong>{shownMonth.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}</strong>
            <button type='button' aria-label='Next month' onClick={() => setShownMonth(current => new Date(current.getFullYear(), current.getMonth() + 1, 1))}>›</button>
          </div>
          <div className='date-picker-weekdays'>{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => <span key={day}>{day}</span>)}</div>
          <div className='date-picker-days'>
            {days.map(date => {
              const dateValue = toDateValue(date);
              const isCurrentMonth = date.getMonth() === shownMonth.getMonth();
              const isToday = dateValue === toDateValue(new Date());
              return <button key={dateValue} type='button' className={`${!isCurrentMonth ? 'is-outside ' : ''}${dateValue === value ? 'is-selected ' : ''}${isToday ? 'is-today' : ''}`} onClick={() => chooseDate(date)}>{date.getDate()}</button>;
            })}
          </div>
          <div className='date-picker-footer'>
            <button type='button' onClick={() => { onChange(''); setOpen(false); }}>Clear</button>
            <button type='button' onClick={() => { const today = new Date(); setShownMonth(today); chooseDate(today); }}>Today</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Auth() {
  const navigate = useNavigate();
  const { login, verifyLoginOtp, signup, user, loginWithSocial, logout } = useUser();
  const [mode, setMode] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [otpChallenge, setOtpChallenge] = useState(null);
  const [otpCode, setOtpCode] = useState('');
  const [trustDevice, setTrustDevice] = useState(true);
  const [otpLoading, setOtpLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobile: '',
    dob: '',
    gender: '',
    employment: '',
    municipality: '',
    barangay: '',
    streetAddress: '',
    agree: false,
  });
  const [errors, setErrors] = useState({});
  const [fade, setFade] = useState(true);
  const fadeTimer = useRef(null);
  const [socialProvider, setSocialProvider] = useState(null);
  const [socialOptions, setSocialOptions] = useState({ google: [], facebook: [] });
  const [barangays, setBarangays] = useState([]);
  useEffect(() => {
    let active = true;
    const location = PANGASINAN_LOCATIONS.find(item => item.name === formData.municipality);
    if (!location) { setBarangays([]); return undefined; }
    fetchPangasinanBarangays(location.code).then(items => { if (active) setBarangays(items); }).catch(() => { if (active) setBarangays([]); });
    return () => { active = false; };
  }, [formData.municipality]);

  const handleSocialAccountChoice = async (account) => {
    setLoginError('');
    const result = await loginWithSocial(account);
    if (result.success) {
      navigate('/app');
    } else {
      setLoginError(result.error || 'Social login failed.');
    }
  };

  // Test accounts for display
  const TEST_ACCOUNTS = [
    { email: 'juan@tuklas.ph', password: 'password123', name: 'Juan Dela Cruz' },
    { email: 'maria@tuklas.ph', password: 'password123', name: 'Maria Santos' },
    { email: 'test@test.com', password: 'test1234', name: 'Test User' },
    { email: 'admin@tuklas.ph', password: 'admin123', name: 'Admin User' },
  ];


  useEffect(() => {
    console.log('Auth mounted', { user, href: window.location.href, hash: window.location.hash, search: window.location.search });
    return () => {
      if (fadeTimer.current) {
        clearTimeout(fadeTimer.current);
      }
    };
  }, []);

  const isSignUp = mode === 'signup';

  const handleModeChange = (nextMode) => {
    if (nextMode === mode) return;
    setFade(false);
    if (fadeTimer.current) {
      clearTimeout(fadeTimer.current);
    }
    fadeTimer.current = window.setTimeout(() => {
      setMode(nextMode);
      setErrors({});
      setOtpChallenge(null);
      setOtpCode('');
      setTrustDevice(true);
      setLoginError('');
      setFade(true);
    }, 120);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleValueChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const next = {};

    if (!formData.email) {
      next.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      next.email = 'Enter a valid email address.';
    }

    if (!formData.password) {
      next.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      next.password = 'Password must be at least 8 characters.';
    }

    if (isSignUp) {
      if (!formData.firstName) next.firstName = 'First name is required.';
      if (!formData.lastName) next.lastName = 'Last name is required.';
      if (!formData.confirmPassword) next.confirmPassword = 'Confirm your password.';
      if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
        next.confirmPassword = 'Passwords must match.';
      }
      if (!formData.mobile) next.mobile = 'Mobile number is required.';
      if (!formData.dob) next.dob = 'Date of birth is required.';
      if (!formData.gender) next.gender = 'Please select a gender option.';
      if (!formData.employment) next.employment = 'Please select your employment status.';
      if (!formData.municipality) next.municipality = 'Please select your municipality or city.';
      if (!formData.barangay) next.barangay = 'Please select your barangay.';
      if (!formData.streetAddress) next.streetAddress = 'Street, no., block, and lot is required.';
      if (!formData.agree) next.agree = 'You must agree to the Terms and Privacy Policy.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoginError('');

    if (!validate()) return;

    if (!isSignUp) {
      const result = await login(formData.email, formData.password);
      if (result.requiresOtp) {
        setOtpChallenge(result);
        setOtpCode('');
      } else if (result.success) {
        navigate('/app');
      } else {
        setLoginError(result.error || 'Invalid email or password. Try one of the test accounts below.');
      }
    } else {
      const result = await signup(formData);
      if (result.success) {
        navigate('/onboarding');
      } else {
        setLoginError(result.error || 'Sign up failed.');
      }
    }
  };

  const handleOtpSubmit = async (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otpCode)) {
      setLoginError('Enter the 6-digit verification code from your email.');
      return;
    }
    setOtpLoading(true);
    setLoginError('');
    const result = await verifyLoginOtp(otpChallenge.challengeToken, otpCode, trustDevice);
    setOtpLoading(false);
    if (result.success) {
      navigate('/app');
    } else {
      setLoginError(result.error || 'Verification failed.');
    }
  };

  const handleSocialLogin = (provider) => {
    setLoginError('');
    const configuredRedirectUri = String(import.meta.env.VITE_AUTH_REDIRECT_URI || '').trim();
    const isLocalLaravel = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    const redirectUrl = isLocalLaravel
      ? new URL('/auth', window.location.origin)
      : (configuredRedirectUri ? new URL(configuredRedirectUri, window.location.origin) : new URL('/auth', window.location.origin));
    const redirectUri = `${redirectUrl.origin}${redirectUrl.pathname.replace(/\/$/, '')}${redirectUrl.search}`;

    if (provider === 'google') {
      const clientId = String(import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();
      if (!clientId) {
        setLoginError('Google login is not configured. Set VITE_GOOGLE_CLIENT_ID in your environment and rebuild the frontend.');
        return;
      }
      const nonce = `${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
      const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=id_token&scope=${encodeURIComponent('openid email profile')}&prompt=select_account&nonce=${encodeURIComponent(nonce)}&state=google`;
      window.location.href = googleUrl;
      return;
    }

    if (provider === 'facebook') {
      const appId = import.meta.env.VITE_FACEBOOK_APP_ID || '';
      if (!appId) {
        setLoginError('Facebook login is not configured. Please set VITE_FACEBOOK_APP_ID in your environment.');
        return;
      }
      const facebookUrl = `https://www.facebook.com/v17.0/dialog/oauth?client_id=${encodeURIComponent(appId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent('email,public_profile')}&auth_type=rerequest&state=facebook`;
      window.location.href = facebookUrl;
      return;
    }
  };

  useEffect(() => {
    const parseHash = (hashString) => {
      const cleaned = hashString.replace(/^#/, '');
      const params = cleaned.includes('?') ? cleaned.slice(cleaned.indexOf('?') + 1) : cleaned;
      return new URLSearchParams(params);
    };
    const parseSearch = (searchString) => new URLSearchParams(searchString.replace(/^\?/, ''));

    const handleGoogleResponse = async (idToken) => {
      try {
        const payload = JSON.parse(atob(idToken.split('.')[1]));
        const account = {
          email: payload.email,
          name: payload.name || payload.email.split('@')[0],
          picture: payload.picture || '',
          provider: 'Google',
        };
        const result = await loginWithSocial(account);
        if (result.success) {
          window.history.replaceState({}, document.title, '/auth');
          navigate(result.needsPasswordSetup ? '/onboarding' : '/app');
        }
      } catch (err) {
        console.error('Google response decode failed', err);
        setLoginError('Google login failed. Please try again.');
      }
    };

    const handleFacebookResponse = async (accessToken) => {
      try {
        const response = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${encodeURIComponent(accessToken)}`);
        const data = await response.json();
        if (!response.ok || !data.email) {
          throw new Error(data.error?.message || 'Facebook login failed');
        }
        const account = {
          email: data.email,
          name: data.name || data.email.split('@')[0],
          picture: data.picture?.data?.url || '',
          provider: 'Facebook',
        };
        const result = await loginWithSocial(account);
        if (result.success) {
          window.history.replaceState({}, document.title, '/auth');
          navigate(result.needsPasswordSetup ? '/onboarding' : '/app');
        }
      } catch (err) {
        console.error('Facebook response failed', err);
        setLoginError('Facebook login failed. Please try again.');
      }
    };

    const hashParams = parseHash(window.location.hash);
    const searchParams = parseSearch(window.location.search);
    const state = hashParams.get('state') || searchParams.get('state');
    const idToken = hashParams.get('id_token');
    const accessToken = hashParams.get('access_token') || searchParams.get('access_token');

    if (state === 'google' && idToken) {
      handleGoogleResponse(idToken);
    } else if (state === 'facebook' && accessToken) {
      handleFacebookResponse(accessToken);
    }
  }, [loginWithSocial, navigate]);

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    if (!forgotEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) { setForgotError('Enter a valid email address.'); return; }
    setForgotLoading(true);
    try {
      const response = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'forgot-password', email: forgotEmail }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to send the reset email.');
      setForgotSent(true);
    } catch (error) {
      setForgotError(error instanceof Error ? error.message : 'Unable to send the reset email.');
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotEmail('');
    setForgotSent(false);
    setForgotError('');
    setForgotLoading(false);
  };

  return (
    <>
      <SEO
        title={isSignUp ? "Sign Up — Tuklas" : "Sign In — Tuklas"}
        description={isSignUp ? "Create your free account and start your career journey with AI-powered recommendations and TESDA training matches." : "Sign in to your Tuklas account to access personalized career pathways and training recommendations."}
        url="/auth"
      />
      <div className={`auth-screen${isSignUp ? ' auth-screen--signup' : ''}`}>
      <header className="field-header auth-field-header">
        <Link className="field-wordmark" to="/" aria-label="Tuklas home">Tuklas<span>.</span></Link>
        <div className="field-header-note">CAREER INTELLIGENCE / PH</div>
        <nav className="field-nav" aria-label="Auth navigation"><a href="/#method">Method</a><a href="/#pathways">Pathways</a><Link to="/team">About</Link></nav>
        <div className="field-actions"><Link className="field-small-action" to="/">BACK TO HOME</Link></div>
      </header>
      <style>{`
        .auth-screen {
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          display: flex;
          justify-content: center;
          align-items: stretch;
          background: var(--bg-page);
          color: var(--text-primary);
        }

        .auth-shell {
          width: 100%;
          height: 100%;
          display: flex;
          min-height: 100vh;
        }

        .auth-panel {
          width: 50%;
          min-height: 100vh;
          overflow-y: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px;
        }

        .auth-panel--left {
          background: var(--bg-page);
          color: var(--text-primary);
        }

        .auth-panel--right {
          background: linear-gradient(135deg, #1C00A8 0%, #00B27A 100%);
          background-image: radial-gradient(circle at 20% 20%, rgba(0, 245, 170, 0.25) 0%, transparent 50%),
                            radial-gradient(circle at 80% 80%, rgba(59, 0, 255, 0.35) 0%, transparent 60%),
                            linear-gradient(135deg, #2E00C7 0%, #048C62 100%);
          color: #FFFFFF;
          padding: 40px 36px;
          position: relative;
        }

        [data-theme="dark"] .auth-panel--right {
          background-image: radial-gradient(circle at 20% 20%, rgba(0, 245, 170, 0.18) 0%, transparent 50%),
                            radial-gradient(circle at 80% 80%, rgba(59, 0, 255, 0.25) 0%, transparent 60%),
                            linear-gradient(135deg, #120A30 0%, #06231E 100%);
          border-left: 1px solid var(--border);
        }

        .form-shell {
          width: 100%;
          max-width: 540px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100%;
        }

        .form-panel {
          width: 100%;
          transition: opacity 180ms ease;
          opacity: 1;
        }

        .form-panel.hidden {
          opacity: 0;
        }

        .auth-brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: var(--bg-card);
          color: var(--accent);
          font-weight: 700;
          letter-spacing: 0.03em;
          font-size: 13px;
          margin-bottom: 16px;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .auth-brand-badge:hover {
          border-color: var(--border-strong);
          background: var(--accent-light);
        }

        .mode-toggle {
          display: inline-flex;
          gap: 4px;
          border-radius: 999px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          padding: 4px;
          margin-bottom: 16px;
        }

        .mode-pill {
          border: none;
          border-radius: 999px;
          padding: 8px 18px;
          font-size: 13px;
          font-weight: 700;
          color: var(--text-secondary);
          background: transparent;
          cursor: pointer;
          transition: background 180ms ease, color 180ms ease, box-shadow 180ms ease;
        }

        .mode-pill:hover {
          color: var(--text-primary);
        }

        .mode-pill.active {
          background: var(--grad-primary);
          color: #050D0F;
          box-shadow: 0 2px 10px rgba(0, 245, 170, 0.25);
        }

        .auth-heading {
          margin: 0 0 10px;
          font-size: 30px;
          line-height: 1.05;
          color: var(--text-primary);
          font-weight: 800;
          font-family: var(--font-display);
        }

        .auth-copy {
          margin: 0 0 18px;
          color: var(--text-secondary);
          line-height: 1.6;
          font-size: 14px;
          max-width: 460px;
        }

        .social-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }

        .social-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          height: 42px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--bg-card);
          color: var(--text-primary);
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
        }

        .social-button:hover {
          transform: translateY(-1px);
          border-color: var(--accent);
          background: var(--accent-light);
          color: var(--text-primary);
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 18px 0;
          color: var(--text-muted);
          font-size: 13px;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border);
        }

        .form-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
        }

        .field-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .field-group label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .auth-screen input,
        .auth-screen select {
          width: 100%;
          min-height: 40px;
          border-radius: 10px;
          border: 1px solid var(--border);
          padding: 10px 12px;
          font-size: 14px;
          background: var(--bg-card);
          color: var(--text-primary);
          transition: border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
        }

        .auth-screen input::placeholder,
        .auth-screen select::placeholder {
          color: var(--text-muted);
        }

        .auth-screen input:focus,
        .auth-screen select:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(0, 245, 170, 0.18);
        }

        .styled-select,
        .date-picker {
          position: relative;
          width: 100%;
        }

        .styled-select-trigger,
        .date-picker-trigger {
          width: 100%;
          min-height: 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 10px 12px;
          border: 1px solid var(--border);
          border-radius: 10px;
          background: var(--bg-card);
          color: var(--text-primary);
          font: inherit;
          font-size: 14px;
          text-align: left;
        }

        .styled-select-trigger svg,
        .date-picker-trigger svg {
          width: 16px;
          height: 16px;
          flex: 0 0 auto;
          color: var(--text-muted);
          transition: transform 160ms ease;
        }

        .styled-select.is-open .styled-select-trigger,
        .date-picker.is-open .date-picker-trigger {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(0, 245, 170, 0.18);
        }

        .styled-select.is-open .styled-select-trigger svg {
          transform: rotate(180deg);
        }

        .styled-select.is-disabled .styled-select-trigger {
          cursor: not-allowed;
          opacity: 0.58;
        }

        .date-picker-trigger .is-placeholder {
          color: var(--text-muted);
        }

        .styled-select-menu,
        .date-picker-popover {
          position: absolute;
          z-index: 20;
          top: calc(100% + 7px);
          left: 0;
          width: 100%;
          overflow: auto;
          border: 1px solid var(--border-strong);
          border-radius: 12px;
          background: var(--bg-surface);
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
        }

        .styled-select-menu {
          max-height: 210px;
          padding: 6px;
          scrollbar-width: none;
        }

        .styled-select-menu::-webkit-scrollbar {
          display: none;
        }

        .styled-select.opens-up .styled-select-menu {
          top: auto;
          bottom: calc(100% + 7px);
        }

        .styled-select-menu button {
          width: 100%;
          display: block;
          padding: 9px 10px;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: var(--text-primary);
          font: inherit;
          font-size: 13px;
          text-align: left;
        }

        .styled-select-menu button:hover,
        .styled-select-menu button.is-selected {
          background: var(--accent-light);
          color: var(--accent);
        }

        .date-picker-popover {
          width: 280px;
          padding: 12px;
        }

        .date-picker-header,
        .date-picker-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .date-picker-header {
          margin-bottom: 10px;
          color: var(--text-primary);
          font-size: 13px;
        }

        .date-picker-header button,
        .date-picker-footer button {
          border: 0;
          background: transparent;
          color: var(--accent);
          font: inherit;
          font-weight: 700;
          cursor: pointer;
        }

        .date-picker-header button {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          font-size: 22px;
          line-height: 1;
        }

        .date-picker-header button:hover,
        .date-picker-footer button:hover {
          background: var(--accent-light);
        }

        .date-picker-weekdays,
        .date-picker-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
        }

        .date-picker-weekdays {
          margin-bottom: 4px;
          color: var(--text-muted);
          font-size: 10px;
          font-weight: 700;
        }

        .date-picker-days button {
          width: 32px;
          height: 30px;
          justify-self: center;
          border: 0;
          border-radius: 7px;
          background: transparent;
          color: var(--text-primary);
          font: inherit;
          font-size: 12px;
          cursor: pointer;
        }

        .date-picker-days button:hover,
        .date-picker-days button.is-today {
          background: var(--accent-light);
          color: var(--accent);
        }

        .date-picker-days button.is-selected {
          background: var(--accent);
          color: #050D0F;
          font-weight: 700;
        }

        .date-picker-days button.is-outside {
          color: var(--text-muted);
          opacity: 0.4;
        }

        .date-picker-footer {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid var(--border);
          font-size: 12px;
        }

        .password-field {
          position: relative;
        }

        .toggle-password {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          border: none;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.15s ease;
        }

        .toggle-password:hover {
          color: var(--accent);
        }

        .field-note {
          font-size: 13px;
          color: var(--text-secondary);
        }

        .error-text {
          color: #EB5757;
          font-size: 12px;
          line-height: 1.3;
        }

        .link-row {
          display: flex;
          justify-content: flex-end;
          margin-top: -2px;
          margin-bottom: 10px;
        }

        .link-button,
        .text-link {
          border: none;
          background: none;
          color: var(--accent);
          font-weight: 700;
          cursor: pointer;
          padding: 0;
          font-size: 13px;
        }

        .link-button:hover,
        .text-link:hover {
          text-decoration: underline;
        }

        .primary-action {
          width: 100%;
          height: 44px;
          border: none;
          border-radius: 12px;
          padding: 0 16px;
          font-size: 15px;
          font-weight: 700;
          color: #050D0F;
          background: var(--grad-primary);
          box-shadow: 0 8px 20px rgba(0, 245, 170, 0.25);
          cursor: pointer;
          transition: transform 180ms ease, box-shadow 180ms ease;
        }

        .primary-action:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 24px rgba(0, 245, 170, 0.35);
        }

        .primary-action:disabled {
          cursor: wait;
          opacity: 0.65;
          transform: none;
        }

        .otp-panel {
          padding: 24px;
          border: 1px solid var(--border);
          border-radius: 18px;
          background: var(--bg-card);
          box-shadow: 0 18px 42px rgba(0, 0, 0, 0.08);
        }

        .otp-panel-mark {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: var(--accent-light);
          color: var(--accent);
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.05em;
          margin-bottom: 18px;
        }

        .otp-panel-title {
          margin: 0 0 8px;
          color: var(--text-primary);
          font-family: var(--font-display);
          font-size: 23px;
        }

        .otp-panel-copy {
          margin: 0 0 22px;
          color: var(--text-secondary);
          font-size: 13px;
          line-height: 1.6;
        }

        .otp-panel input {
          text-align: center;
          font-family: var(--font-mono);
          font-size: 24px;
          font-weight: 700;
          letter-spacing: 0.28em;
        }

        .footer-text {
          margin-top: 14px;
          color: var(--text-secondary);
          font-size: 13px;
          line-height: 1.6;
        }

        .footer-text strong {
          color: var(--accent);
          cursor: pointer;
        }

        .checkbox-row {
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }

        .checkbox-row input[type='checkbox'] {
          accent-color: var(--accent);
          width: 16px;
          height: 16px;
          margin-top: 4px;
        }

        .right-brand {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          min-height: 100%;
          width: 100%;
          padding: 16px 8px;
        }

        .right-logo-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }

        .right-logo-image {
          max-width: 220px;
          max-height: 64px;
          height: auto;
          object-fit: contain;
          filter: drop-shadow(0 6px 18px rgba(0, 0, 0, 0.3));
        }

        .tagline {
          font-size: 34px;
          line-height: 1.12;
          text-align: center;
          max-width: 420px;
          margin: 0 auto 16px;
          font-weight: 800;
          font-family: var(--font-display);
        }

        .tagline-sub {
          font-size: 15px;
          opacity: 0.88;
          text-align: center;
          max-width: 360px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* Test accounts card */
        .test-accounts-box {
          background: var(--bg-card);
          border: 1px dashed var(--border-strong);
          border-radius: 12px;
          padding: 14px 16px;
          margin-top: 6px;
        }

        .test-accounts-header {
          font-size: 11px;
          font-weight: 800;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 8px;
        }

        .test-account-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 5px 8px;
          border-radius: 6px;
          transition: background 0.15s ease;
        }

        .test-account-row:hover {
          background: var(--accent-light);
        }

        .test-account-name {
          font-weight: 700;
          color: var(--text-primary);
        }

        .test-account-email {
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          color: var(--text-muted);
        }

        .test-accounts-footer {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 8px;
        }

        .test-accounts-code {
          background: var(--accent-light);
          color: var(--accent);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
          font-family: var(--font-mono, monospace);
          border: 1px solid var(--border);
        }

        .auth-error-alert {
          background: rgba(235, 87, 87, 0.12);
          border: 1px solid rgba(235, 87, 87, 0.35);
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13px;
          color: #FF7070;
          line-height: 1.5;
        }

        /* Social Chooser */
        .social-chooser {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 18px;
          margin: 16px 0;
        }

        .chooser-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .chooser-header h3 {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .chooser-back {
          background: transparent;
          border: none;
          color: var(--accent);
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
        }

        .chooser-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .chooser-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 10px;
          cursor: pointer;
          text-align: left;
          color: var(--text-primary);
          transition: border-color 0.15s ease;
        }

        .chooser-option:hover {
          border-color: var(--accent);
        }

        .chooser-option div div {
          font-size: 11px;
          color: var(--text-muted);
        }

        /* Forgot Password Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 180ms ease;
        }

        .modal-box {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 36px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.4);
          position: relative;
          animation: slideUp 250ms ease;
          color: var(--text-primary);
        }

        .modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: transparent;
          border: none;
          font-size: 20px;
          color: var(--text-muted);
          cursor: pointer;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .modal-close:hover {
          background: var(--accent-light);
          color: var(--accent);
        }

        .modal-title {
          font-size: 22px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .modal-desc {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .modal-input {
          width: 100%;
          min-height: 44px;
          border-radius: 12px;
          border: 1px solid var(--border);
          padding: 12px 14px;
          font-size: 14px;
          background: var(--bg-card);
          color: var(--text-primary);
          margin-bottom: 16px;
          transition: border-color 180ms ease, box-shadow 180ms ease;
        }

        .modal-input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(0, 245, 170, 0.2);
        }

        .modal-btn {
          width: 100%;
          height: 44px;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          color: #050D0F;
          background: var(--grad-primary);
          cursor: pointer;
          transition: transform 180ms ease;
        }

        .modal-btn:hover {
          transform: translateY(-1px);
        }

        .modal-success {
          text-align: center;
          padding: 16px 0;
        }

        .modal-success-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--accent-light);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 900px) {
          .auth-shell {
            flex-direction: column;
          }
          .auth-panel {
            width: 100%;
            min-height: auto;
          }
          .auth-panel--right {
            display: none;
          }
        }

        /* Keep the complete sign-up form visible on desktop without an internal scrollbar. */
        @media (min-width: 901px) {
          .auth-screen--signup .auth-panel {
            overflow-y: hidden;
            padding-block: 18px;
          }

          .auth-screen--signup .auth-brand-badge {
            display: none;
          }

          .auth-screen--signup .mode-toggle {
            margin-bottom: 10px;
            padding: 3px;
          }

          .auth-screen--signup .mode-pill {
            padding: 6px 14px;
          }

          .auth-screen--signup .auth-heading {
            margin-bottom: 4px;
            font-size: 24px;
          }

          .auth-screen--signup .auth-copy {
            margin-bottom: 8px;
            line-height: 1.35;
          }

          .auth-screen--signup .social-row {
            margin-bottom: 8px;
          }

          .auth-screen--signup .social-button {
            height: 34px;
          }

          .auth-screen--signup .divider {
            margin: 8px 0;
          }

          .auth-screen--signup .form-content {
            gap: 6px;
          }

          .auth-screen--signup .field-row {
            gap: 10px;
          }

          .auth-screen--signup .field-group {
            gap: 3px;
          }

          .auth-screen--signup label,
          .auth-screen--signup .field-note {
            font-size: 11.5px;
          }

          .auth-screen--signup input,
          .auth-screen--signup select,
          .auth-screen--signup .styled-select-trigger,
          .auth-screen--signup .date-picker-trigger {
            min-height: 32px;
            padding: 6px 10px;
            font-size: 13px;
          }

          .auth-screen--signup .checkbox-row input[type='checkbox'] {
            min-height: 14px;
            padding: 0;
          }

          .auth-screen--signup .primary-action {
            height: 36px;
            font-size: 14px;
          }

          .auth-screen--signup .footer-text {
            margin-top: 6px;
          }
        }

        @media (min-width: 901px) and (max-height: 860px) {
          .auth-screen--signup .form-panel {
            zoom: 0.82;
          }
        }

        /* Tuklas field-guide auth treatment */
        .auth-screen {
          --auth-paper: #eee7d5;
          --auth-ink: #17242b;
          --auth-muted: #65716e;
          --auth-rule: rgba(23, 36, 43, 0.32);
          --auth-mint: #2b726b;
          --auth-coral: #b9583f;
          background: var(--auth-paper);
          color: var(--auth-ink);
          font-family: 'Courier New', monospace;
          display: block;
          width: 100%;
          min-height: 100vh;
          height: auto;
          padding: 0 20px 48px;
          background-image: linear-gradient(rgba(255,255,255,.12), rgba(255,255,255,.12)), repeating-linear-gradient(0deg, transparent 0, transparent 31px, rgba(23,36,43,.025) 32px);
        }
        .auth-field-header { max-width: 1110px; margin: 0 auto 36px; }
        .auth-shell { max-width: 1110px; height: auto; min-height: calc(100vh - 170px); margin: 0 auto; overflow: hidden; border-top: 1px solid var(--auth-ink); border-bottom: 1px solid var(--auth-rule); }
        .auth-panel { padding: 48px; }
        .auth-panel--left { width: 62%; background: var(--auth-paper); color: var(--auth-ink); }
        .auth-panel--right { width: 38%; background: var(--auth-mint); color: var(--auth-paper); padding: 56px 44px; }
        .form-shell { max-width: 540px; }
        .auth-brand-badge { display: none; padding: 0 0 14px; margin-bottom: 28px; border: 0; border-bottom: 1px solid var(--auth-rule); border-radius: 0; background: transparent; color: var(--auth-ink); font: 700 30px/.8 Georgia, serif; letter-spacing: -.06em; }
        .auth-brand-badge img { display: none; }
        .auth-brand-badge span::after { content: '.'; color: var(--auth-coral); }
        .mode-toggle { gap: 0; padding: 0; margin-bottom: 30px; border: 0; border-radius: 0; background: transparent; }
        .mode-pill { padding: 8px 18px; border: 1px solid var(--auth-rule); border-radius: 0; color: var(--auth-muted); background: transparent; font: 700 10px 'Courier New', monospace; letter-spacing: .1em; text-transform: uppercase; }
        .mode-pill + .mode-pill { border-left: 0; }
        .mode-pill.active { background: var(--auth-ink); color: var(--auth-paper); box-shadow: none; }
        .auth-heading { margin-bottom: 12px; color: var(--auth-ink); font: 700 48px/.92 Georgia, serif; letter-spacing: -.04em; }
        .auth-copy { margin-bottom: 28px; color: var(--auth-muted); font: 15px/1.55 Georgia, serif; }
        .social-row { gap: 10px; margin-bottom: 22px; }
        .social-button { height: 42px; border: 1px solid var(--auth-rule); border-radius: 0; background: transparent; color: var(--auth-ink); font: 700 10px 'Courier New', monospace; text-transform: uppercase; letter-spacing: .04em; }
        .social-button:hover { transform: none; border-color: var(--auth-ink); background: rgba(23, 36, 43, .06); color: var(--auth-ink); }
        .divider { margin: 22px 0; color: var(--auth-muted); font-size: 10px; letter-spacing: .08em; text-transform: uppercase; }
        .form-content { gap: 16px; }
        .field-group { gap: 7px; }
        .field-group label { color: var(--auth-ink); font: 700 10px 'Courier New', monospace; letter-spacing: .08em; text-transform: uppercase; }
        .auth-screen input, .auth-screen select, .styled-select-trigger, .date-picker-trigger { min-height: 42px; border: 0; border-bottom: 1px solid var(--auth-rule); border-radius: 0; padding: 9px 0; background: transparent; color: var(--auth-ink); }
        .auth-screen input:focus, .auth-screen select:focus, .styled-select.is-open .styled-select-trigger, .date-picker.is-open .date-picker-trigger { border-color: var(--auth-mint); box-shadow: none; outline: none; }
        .styled-select-trigger, .date-picker-trigger { padding: 9px 0; }
        .styled-select-menu, .date-picker-popover { border: 1px solid var(--auth-rule); border-radius: 0; background: var(--auth-paper); box-shadow: 8px 8px 0 rgba(23, 36, 43, .08); }
        .primary-action, .modal-btn { height: 48px; border: 0; border-radius: 0; color: var(--auth-paper); background: var(--auth-ink); box-shadow: none; font: 700 10px 'Courier New', monospace; letter-spacing: .1em; text-transform: uppercase; }
        .primary-action:hover, .modal-btn:hover { transform: none; background: var(--auth-coral); box-shadow: none; }
        .footer-text { color: var(--auth-muted); }
        .footer-text strong, .link-button, .text-link { color: var(--auth-coral); }
        .test-accounts-box, .otp-panel { border: 1px solid var(--auth-rule); border-radius: 0; background: rgba(255, 255, 255, .16); box-shadow: none; }
        .right-brand { align-items: flex-start; padding: 0; }
        .right-logo-wrap { justify-content: flex-start; margin-bottom: auto; }
        .right-logo-wrap img { display: none; }
        .right-logo-wrap::after { content: none; }
        .tagline { max-width: 360px; margin: 0 0 22px; text-align: left; color: var(--auth-paper); font: 700 clamp(42px, 4.4vw, 64px)/.9 Georgia, serif; letter-spacing: -.04em; }
        .tagline-sub { max-width: 360px; margin: 0; text-align: left; color: #d8ede6; font: 16px/1.55 Georgia, serif; }
        @media (max-width: 900px) {
          .auth-screen { height: auto; min-height: 100vh; overflow: auto; padding: 0 16px 32px; background: var(--auth-paper); }
          .auth-field-header { margin-bottom: 20px; }
          .auth-field-header .field-nav, .auth-field-header .field-header-note { display: none; }
          .auth-field-header .field-actions { margin-left: auto; }
          .auth-shell { min-height: 100vh; }
          .auth-panel--left { width: 100%; min-height: 100vh; padding: 28px 22px 40px; }
          .auth-heading { font-size: clamp(42px, 12vw, 60px); }
        }
        @media (min-width: 901px) {
          .auth-screen--signup .auth-panel { padding-block: 28px; }
          .auth-screen--signup .auth-brand-badge { display: inline-flex; }
          .auth-screen--signup .form-panel { zoom: 0.9; }
        }

        /* Reference composition: compact form beside an image-led panel. */
        .auth-screen { display: block; height: 100vh; min-height: 0; padding: 0; overflow: hidden; background: var(--auth-paper); }
        .auth-field-header { display: none; }
        .auth-shell { width: 100%; max-width: none; height: 100%; min-height: 0; box-shadow: none; border: 0; }
        .auth-panel { min-height: 100%; }
        .auth-panel--left { width: 38%; align-items: flex-start; overflow-y: auto; padding: 48px clamp(28px, 5vw, 76px); background: var(--auth-paper); }
        .auth-panel--right { width: 62%; overflow: hidden; padding: 0; background-color: var(--auth-paper); background-image: linear-gradient(0deg, rgba(238, 231, 213, .72), rgba(43, 114, 107, .18) 68%), url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1600&q=85'); background-position: center; background-size: cover; border-left: 1px solid var(--auth-rule); }
        .form-shell { max-width: 390px; margin: auto 0; }
        .auth-brand-badge { display: inline-flex; margin-bottom: 48px; padding: 0; border: 0; }
        .auth-heading { font-size: clamp(42px, 4vw, 64px); }
        .auth-copy { max-width: 320px; }
        .social-row { grid-template-columns: 1fr 1fr; }
        .right-brand { position: relative; z-index: 1; justify-content: space-between; align-items: flex-start; min-height: 100%; padding: 48px; }
        .right-logo-wrap { margin: 0; }
        .right-logo-wrap::after { content: none; }
        .tagline { max-width: 560px; margin: 0 0 16px; color: var(--auth-ink); font-size: clamp(44px, 5vw, 78px); }
        .tagline-sub { max-width: 390px; color: var(--auth-muted); }
        .right-brand > div:last-child { color: var(--auth-ink); font-family: 'Courier New', monospace; text-transform: uppercase; }
        .auth-screen,
        .auth-screen button,
        .auth-screen input,
        .auth-screen select { font-family: 'Courier New', monospace !important; }
        .auth-screen h1,
        .auth-screen h2,
        .auth-screen h3,
        .auth-screen .auth-brand-badge,
        .auth-screen .tagline { font-family: Georgia, serif !important; }
        .auth-screen .auth-heading,
        .auth-screen .auth-copy,
        .auth-screen .field-group label,
        .auth-screen .footer-text,
        .auth-screen .field-note { color: var(--auth-ink) !important; }
        .auth-screen .auth-copy,
        .auth-screen .footer-text { color: var(--auth-muted) !important; }
        .auth-screen input,
        .auth-screen select,
        .auth-screen .styled-select-trigger,
        .auth-screen .date-picker-trigger { color: var(--auth-ink) !important; caret-color: var(--auth-coral); }
        .auth-screen input::placeholder { color: var(--auth-muted) !important; opacity: 1; }
        .auth-screen .social-button,
        .auth-screen .mode-pill,
        .auth-screen .link-button,
        .auth-screen .text-link { color: var(--auth-ink); }
        .auth-screen .mode-pill.active,
        .auth-screen .primary-action,
        .auth-screen .modal-btn { color: var(--auth-paper) !important; }
        .auth-screen .tagline,
        .auth-screen .tagline-sub,
        .auth-screen .right-brand > div:last-child { text-shadow: 0 1px 2px rgba(238, 231, 213, .45); }
        .auth-screen .auth-panel--right,
        [data-theme="dark"] .auth-screen .auth-panel--right { background-color: #eee7d5 !important; background-image: linear-gradient(0deg, rgba(238, 231, 213, .72), rgba(43, 114, 107, .18) 68%), url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1600&q=85') !important; }
        .auth-screen .auth-panel--right .tagline,
        .auth-screen .auth-panel--right .tagline-sub,
        .auth-screen .auth-panel--right .right-brand > div:last-child,
        .auth-screen .auth-panel--right .right-logo-wrap::after { color: #17242b !important; }
        .auth-screen .test-account-row { color: var(--auth-ink) !important; }
        .auth-screen .test-account-name { color: var(--auth-ink) !important; }
        .auth-screen .test-account-email,
        .auth-screen .test-accounts-footer { color: var(--auth-muted) !important; }
        .auth-screen .test-accounts-box { margin-top: 8px; padding: 16px; border: 1px solid var(--auth-rule); border-radius: 0; background: transparent; }
        .auth-screen .test-accounts-header { margin-bottom: 10px; color: var(--auth-mint) !important; font: 700 10px 'Courier New', monospace; letter-spacing: .1em; }
        .auth-screen .test-account-row { padding: 7px 8px; border-radius: 0; }
        .auth-screen .test-account-row:hover { background: rgba(43, 114, 107, .12); }
        .auth-screen .test-accounts-code { color: var(--auth-paper) !important; background: var(--auth-mint); border: 0; border-radius: 0; padding: 3px 6px; }
        [data-theme="dark"] .auth-screen {
          --auth-paper: #081719;
          --auth-ink: #f0eade;
          --auth-muted: #9bb5ae;
          --auth-rule: rgba(240, 234, 222, .28);
          --auth-mint: #2b726b;
          --auth-coral: #e4866c;
        }
        [data-theme="dark"] .auth-screen .auth-panel--right { background-color: #eee7d5 !important; background-image: linear-gradient(0deg, rgba(238, 231, 213, .72), rgba(43, 114, 107, .18) 68%), url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1600&q=85') !important; }
        [data-theme="dark"] .auth-screen .auth-panel--right .tagline,
        [data-theme="dark"] .auth-screen .auth-panel--right .tagline-sub,
        [data-theme="dark"] .auth-screen .auth-panel--right .right-brand > div:last-child,
        [data-theme="dark"] .auth-screen .auth-panel--right .right-logo-wrap::after { color: #17242b !important; }
        .auth-screen .auth-brand-badge { display: none !important; }
        .auth-screen .form-shell { max-width: 440px; }
        .auth-screen--signup .form-panel { zoom: 1 !important; }
        .auth-screen--signup .auth-heading { font-size: 38px !important; margin-bottom: 10px; }
        .auth-screen--signup .auth-copy { font-size: 14px; margin-bottom: 18px; }
        @media (max-width: 900px) {
          .auth-screen { height: auto; min-height: 100vh; overflow: auto; }
          .auth-shell { min-height: 100vh; }
          .auth-panel--left { width: 100%; min-height: 100vh; padding: 28px 22px 40px; }
          .form-shell { margin: 0 auto; }
        }
      `}</style>

      <div className='auth-shell'>
        {/* Left Panel — Form */}
        <div className='auth-panel auth-panel--left'>
          <div className='form-shell'>
            <div className={`form-panel${fade ? '' : ' hidden'}`}>
              {/* Mode Toggle */}
              <div className='mode-toggle'>
                <button
                  className={`mode-pill${mode === 'signin' ? ' active' : ''}`}
                  onClick={() => handleModeChange('signin')}
                >
                  Sign In
                </button>
                <button
                  className={`mode-pill${mode === 'signup' ? ' active' : ''}`}
                  onClick={() => handleModeChange('signup')}
                >
                  Sign Up
                </button>
              </div>

              <h1 className='auth-heading'>
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className='auth-copy'>
                {isSignUp
                  ? 'Join Tuklas and discover your ideal career path with AI-powered guidance.'
                  : 'Sign in to continue your career journey with Tuklas.'}
              </p>

              {/* Social Buttons */}
              <div className='social-row'>
                <button className='social-button' onClick={() => handleSocialLogin('google')} type='button'>
                  <svg width='16' height='16' viewBox='0 0 24 24'>
                    <path d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' fill='#4285F4' />
                    <path d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' fill='#34A853' />
                    <path d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z' fill='#FBBC05' />
                    <path d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' fill='#EA4335' />
                  </svg>
                  Sign in with Google
                </button>
                <button className='social-button' onClick={() => handleSocialLogin('facebook')} type='button'>
                  <svg width='16' height='16' viewBox='0 0 24 24' fill='#1877F2'>
                    <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
                  </svg>
                  Facebook
                </button>
              </div>

              <div className='divider'>or continue with email</div>

              {otpChallenge ? (
                <div className='otp-panel'>
                  <div className='otp-panel-mark'>2FA</div>
                  <h2 className='otp-panel-title'>Check your email</h2>
                  <p className='otp-panel-copy'>We sent a 6-digit verification code to <strong>{otpChallenge.maskedEmail}</strong>. It expires in 5 minutes.</p>
                  <form onSubmit={handleOtpSubmit}>
                    <div className='field-group'>
                      <label htmlFor='login-otp'>Verification code</label>
                      <input
                        id='login-otp'
                        inputMode='numeric'
                        autoComplete='one-time-code'
                        maxLength={6}
                        pattern='[0-9]{6}'
                        value={otpCode}
                        onChange={event => setOtpCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder='000000'
                        autoFocus
                      />
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0 18px', fontSize: 12, color: 'var(--text-secondary)' }}>
                      <input type='checkbox' checked={trustDevice} onChange={event => setTrustDevice(event.target.checked)} />
                      Trust this device for 30 days
                    </label>
                    <button type='submit' className='primary-action' disabled={otpLoading}>
                      {otpLoading ? 'Verifying...' : 'Verify and continue'}
                    </button>
                    {loginError && <div className='auth-error-alert'>{loginError}</div>}
                    <button type='button' className='link-button' style={{ display: 'block', margin: '16px auto 0' }} onClick={() => { setOtpChallenge(null); setOtpCode(''); setLoginError(''); }}>
                      Back to sign in
                    </button>
                  </form>
                </div>
              ) : socialProvider ? (
                <div className='social-chooser'>
                  <div className='chooser-header'>
                    <h3>Choose a {socialProvider === 'google' ? 'Google' : 'Facebook'} account</h3>
                    <button className='chooser-back' type='button' onClick={() => setSocialProvider(null)}>
                      Back
                    </button>
                  </div>
                  <div className='chooser-list'>
                    {socialOptions[socialProvider]?.map((account) => (
                      <button
                        key={account.email}
                        type='button'
                        className='chooser-option'
                        onClick={() => handleSocialAccountChoice(account)}
                      >
                        <div>
                          <strong>{account.name}</strong>
                          <div>{account.email}</div>
                        </div>
                        <span>{socialProvider === 'google' ? 'Google' : 'Facebook'}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <form onSubmit={handleSubmit}>
                    <div className='form-content'>
                      {/* Name fields (sign up only) */}
                      {isSignUp && (
                        <div className='field-row'>
                          <div className='field-group'>
                            <label>First Name</label>
                            <input
                              name='firstName'
                              value={formData.firstName}
                              onChange={handleChange}
                              placeholder='First and middle/given names'
                            />
                            {errors.firstName && <span className='error-text'>{errors.firstName}</span>}
                          </div>
                          <div className='field-group'>
                            <label>Last Name</label>
                            <input
                              name='lastName'
                              value={formData.lastName}
                              onChange={handleChange}
                              placeholder='Family name'
                            />
                            {errors.lastName && <span className='error-text'>{errors.lastName}</span>}
                          </div>
                        </div>
                      )}

                      {/* Email */}
                      <div className='field-group'>
                        <label>Email Address</label>
                        <input
                          name='email'
                          type='email'
                          value={formData.email}
                          onChange={handleChange}
                          placeholder='you@example.com'
                        />
                        {errors.email && <span className='error-text'>{errors.email}</span>}
                      </div>

                      {/* Password */}
                      <div className='field-group'>
                        <label>Password</label>
                        <div className='password-field'>
                          <input
                            name='password'
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
                            placeholder='At least 8 characters'
                          />
                          <button type='button' className='toggle-password' onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                          </button>
                        </div>
                        {errors.password && <span className='error-text'>{errors.password}</span>}
                      </div>

                      {/* Confirm Password (sign up only) */}
                      {isSignUp && (
                        <div className='field-group'>
                          <label>Confirm Password</label>
                          <div className='password-field'>
                            <input
                              name='confirmPassword'
                              type={showConfirm ? 'text' : 'password'}
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              placeholder='Re-enter your password'
                            />
                            <button type='button' className='toggle-password' onClick={() => setShowConfirm(!showConfirm)}>
                              {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                          </div>
                          {errors.confirmPassword && <span className='error-text'>{errors.confirmPassword}</span>}
                        </div>
                      )}

                      {/* Mobile (sign up only) */}
                      {isSignUp && (
                        <div className='field-group'>
                          <label>Mobile Number</label>
                          <input
                            name='mobile'
                            type='tel'
                            value={formData.mobile}
                            onChange={handleChange}
                            placeholder='+63 9XX XXX XXXX'
                          />
                          {errors.mobile && <span className='error-text'>{errors.mobile}</span>}
                        </div>
                      )}

                      {/* DOB & Gender (sign up only) */}
                      {isSignUp && (
                        <div className='field-row'>
                          <div className='field-group'>
                            <label>Date of Birth</label>
                            <DatePicker value={formData.dob} onChange={(value) => handleValueChange('dob', value)} />
                            {errors.dob && <span className='error-text'>{errors.dob}</span>}
                          </div>
                          <div className='field-group'>
                            <label>Gender</label>
                            <StyledSelect
                              value={formData.gender}
                              onChange={(value) => handleValueChange('gender', value)}
                              placeholder='Select'
                              options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Prefer not to say' }]}
                            />
                            {errors.gender && <span className='error-text'>{errors.gender}</span>}
                          </div>
                        </div>
                      )}

                      {/* Employment (sign up only) */}
                      {isSignUp && (
                        <div className='field-group'>
                          <label>Employment Status</label>
                          <StyledSelect
                            value={formData.employment}
                            onChange={(value) => handleValueChange('employment', value)}
                            placeholder='Select your status'
                            options={[{ value: 'student', label: 'Student' }, { value: 'unemployed', label: 'Unemployed' }, { value: 'underemployed', label: 'Underemployed' }, { value: 'first-time', label: 'First-time Jobseeker' }, { value: 'employed', label: 'Employed' }]}
                          />
                          {errors.employment && <span className='error-text'>{errors.employment}</span>}
                        </div>
                      )}

                      {isSignUp && (
                        <>
                          <div className='field-row'>
                            <div className='field-group'>
                              <label>Municipality / City</label>
                              <StyledSelect
                                value={formData.municipality}
                                onChange={(value) => handleValueChange('municipality', value)}
                                placeholder='Select municipality or city'
                                options={PANGASINAN_LOCATIONS.map(item => ({ value: item.name, label: item.name }))}
                                openUp
                              />
                              {errors.municipality && <span className='error-text'>{errors.municipality}</span>}
                            </div>
                            <div className='field-group'>
                              <label>Barangay</label>
                              <StyledSelect
                                value={formData.barangay}
                                onChange={(value) => handleValueChange('barangay', value)}
                                placeholder={formData.municipality ? 'Select barangay' : 'Choose municipality first'}
                                disabled={!formData.municipality}
                                options={barangays.map(name => ({ value: name, label: name }))}
                                openUp
                              />
                              {errors.barangay && <span className='error-text'>{errors.barangay}</span>}
                            </div>
                          </div>
                          <div className='field-group'>
                            <label>Street, No., Blk., Lot</label>
                            <input name='streetAddress' value={formData.streetAddress} onChange={handleChange} placeholder='House no., street, block and lot' />
                            {errors.streetAddress && <span className='error-text'>{errors.streetAddress}</span>}
                          </div>
                        </>
                      )}

                      {/* Forgot password (sign in only) */}
                      {!isSignUp && (
                        <div className='link-row'>
                          <button type='button' className='link-button' onClick={() => setShowForgotModal(true)}>Forgot password?</button>
                        </div>
                      )}

                      {/* Terms checkbox (sign up only) */}
                      {isSignUp && (
                        <div className='checkbox-row'>
                          <input
                            type='checkbox'
                            name='agree'
                            checked={formData.agree}
                            onChange={handleChange}
                          />
                          <span className='field-note'>
                            I agree to the <span className='text-link'>Terms of Service</span> and <span className='text-link'>Privacy Policy</span>.
                          </span>
                        </div>
                      )}
                      {errors.agree && <span className='error-text'>{errors.agree}</span>}

                      {/* Submit */}
                      <button type='submit' className='primary-action'>
                        {isSignUp ? 'Create Account' : 'Sign In'}
                      </button>

                      {/* Login error */}
                      {loginError && (
                        <div className='auth-error-alert'>
                          {loginError}
                        </div>
                      )}

                      {/* Test accounts hint (sign in only) */}
                      {!isSignUp && (
                        <div className='test-accounts-box'>
                          <div className='test-accounts-header'>
                            Test Accounts
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {TEST_ACCOUNTS.map(acc => (
                              <div
                                key={acc.email}
                                className='test-account-row'
                                onClick={() => { setFormData(prev => ({ ...prev, email: acc.email, password: acc.password })); setLoginError(''); }}
                              >
                                <span className='test-account-name'>{acc.name}</span>
                                <span className='test-account-email'>{acc.email}</span>
                              </div>
                            ))}
                          </div>
                          <div className='test-accounts-footer'>
                            Password for all: <code className='test-accounts-code'>password123</code> (or <code className='test-accounts-code'>test1234</code> for test@test.com)
                          </div>
                        </div>
                      )}
                    </div>
                  </form>
                </div>
              )}

              <p className='footer-text'>
                {isSignUp ? (
                  <>Already have an account? <strong onClick={() => handleModeChange('signin')}>Sign In</strong></>
                ) : (
                  <>Don&apos;t have an account? <strong onClick={() => handleModeChange('signup')}>Sign Up Free</strong></>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel — Branding */}
        <div className='auth-panel auth-panel--right'>
          <div className='right-brand'>
            <div className='right-logo-wrap'>
              <Link to="/" aria-label="Tuklas Home">
                <div className="field-wordmark" aria-label="Tuklas">Tuklas<span>.</span></div>
              </Link>
            </div>
            <div>
              <div className='tagline'>Your Career Path, Powered by AI.</div>
              <p className='tagline-sub'>
                Join thousands of Filipino youth mapping their future with AI-powered career intelligence.
              </p>
            </div>
            <div style={{ fontSize: 12, opacity: 0.75, letterSpacing: '0.04em' }}>TESDA-Aligned · Free to Use · Filipino-Built</div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className='modal-overlay' onClick={closeForgotModal}>
          <div className='modal-box' onClick={e => e.stopPropagation()}>
            <button className='modal-close' onClick={closeForgotModal}>✕</button>

            {!forgotSent ? (
              <>
                <div className='modal-title'>Reset your password</div>
                <p className='modal-desc'>
                  Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
                </p>
                <form onSubmit={handleForgotSubmit}>
                  <input
                    className='modal-input'
                    type='email'
                    placeholder='Enter your email address'
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    autoFocus
                  />
                  {forgotError && <div className='modal-error'>{forgotError}</div>}
                  <button type='submit' className='modal-btn' disabled={forgotLoading}>{forgotLoading ? 'Sending...' : 'Send Reset Link'}</button>
                </form>
              </>
            ) : (
              <div className='modal-success'>
                <div className='modal-success-icon'>
                  <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='#3B00FF' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                    <polyline points='20 6 9 17 4 12' />
                  </svg>
                </div>
                <div className='modal-title'>Check your email</div>
                <p className='modal-desc'>
                  We&apos;ve sent a password reset link to <strong style={{ color: '#3B00FF' }}>{forgotEmail}</strong>. Please check your inbox.
                </p>
                <button className='modal-btn' onClick={closeForgotModal}>Back to Sign In</button>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </>
  );
}
