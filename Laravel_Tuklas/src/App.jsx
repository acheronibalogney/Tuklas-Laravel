import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ThemeProvider } from './ThemeContext';
import { UserProvider, useUser } from './UserContext';
import CookieConsent from './components/CookieConsent';
import MobileCTA from './components/MobileCTA';
import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import MobileApp from './pages/MobileApp';
import Team from './pages/Team';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import AiScanner from './pages/AiScanner';
import NotFound from './pages/NotFound';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import ThankYou from './pages/ThankYou';
import './index.css';

function PasswordSetupGate() {
  const { user, authReady } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const setupRequired = user?.needsPasswordSetup === true;
  const isSetupRoute = location.pathname === '/onboarding';
  const isPublicRoute = ['/', '/auth', '/privacy', '/terms', '/thank-you'].includes(location.pathname);

  useEffect(() => {
    if (authReady && setupRequired && !isSetupRoute && !isPublicRoute) navigate('/onboarding', { replace: true });
  }, [authReady, setupRequired, isSetupRoute, isPublicRoute, navigate]);

  return null;
}

function ProtectedPage({ children }) {
  const { user, authReady } = useUser();
  if (!authReady) return null;
  if (user?.needsPasswordSetup) return <Navigate to="/onboarding" replace />;
  return children;
}

export default function App() {
  return (
    <UserProvider>
      <ThemeProvider>
        <BrowserRouter>
          <PasswordSetupGate />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/app" element={<ProtectedPage><Dashboard /></ProtectedPage>} />
            <Route path="/dashboard" element={<ProtectedPage><Dashboard /></ProtectedPage>} />
            <Route path="/admin" element={<ProtectedPage><Admin /></ProtectedPage>} />
            <Route path="/scanner" element={<ProtectedPage><AiScanner /></ProtectedPage>} />
            <Route path="/mobile" element={<ProtectedPage><MobileApp /></ProtectedPage>} />
            <Route path="/team" element={<ProtectedPage><Team /></ProtectedPage>} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <CookieConsent />
          <MobileCTA />
        </BrowserRouter>
      </ThemeProvider>
    </UserProvider>
  );
}
