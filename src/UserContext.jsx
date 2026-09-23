import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const UserContext = createContext();

async function saveUserRecord(email, updates) {
  if (!email) return;
  const response = await fetch('/api/users', {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, ...updates }),
  });
  if (!response.ok) throw new Error('Unable to save user data');
}

async function saveScanRecord(email, analysis) {
  if (!email || !analysis) return;
  const response = await fetch('/api/scans', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, analysis }),
  });
  if (!response.ok) throw new Error('Unable to save scan data');
}

async function saveDocumentRecords(email, files, category) {
  if (!email || !files?.length) return;
  const toBase64 = async (file) => {
    if (!file.arrayBuffer) return undefined;
    const bytes = new Uint8Array(await file.arrayBuffer());
    let binary = '';
    const chunkSize = 8192;
    for (let index = 0; index < bytes.length; index += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
    }
    return btoa(binary);
  };
  const response = await fetch('/api/documents', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      files: await Promise.all(files.map(async file => ({
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        category,
        status: 'scanned',
        data: await toBase64(file),
      }))),
    }),
  });
  if (!response.ok) throw new Error('Unable to save uploaded documents');
}

function getDefaultProfile(user) {
  const nameParts = (user?.name || '').trim().split(/\s+/).filter(Boolean);
  return {
    displayName: user?.name || '',
    firstName: user?.firstName || nameParts[0] || '',
    lastName: user?.lastName || nameParts.slice(1).join(' '),
    email: user?.email || '',
    bio: '',
    location: user?.location || '',
    municipality: user?.municipality || '',
    barangay: user?.barangay || '',
    streetAddress: user?.streetAddress || '',
    targetRole: [],
    birthDate: user?.birthDate || '',
    highestEducation: user?.highestEducation || '',
    currentStatus: user?.currentStatus || '',
    picture: user?.picture || '',
  };
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);

  // Per-user data — loaded based on current user
  const [notifications, setNotifications] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [profileSettings, setProfileSettings] = useState(() => getDefaultProfile(user));
  const [profileStorageReady, setProfileStorageReady] = useState(false);
  const [userDataReady, setUserDataReady] = useState(false);
  const [databaseReady, setDatabaseReady] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    fetch('/api/auth', { credentials: 'include' })
      .then(response => response.ok ? response.json() : null)
      .then(sessionUser => { if (sessionUser) setUser(sessionUser); })
      .catch(() => {})
      .finally(() => setAuthReady(true));
  }, []);

  useEffect(() => {
    if (!user?.email || user.role !== 'admin') {
      setAllUsers([]);
      setDatabaseReady(true);
      return undefined;
    }
    let active = true;
    fetch('/api/users')
      .then(response => response.ok ? response.json() : Promise.reject(new Error('Users API unavailable')))
      .then(records => {
        if (!active || !Array.isArray(records) || records.length === 0) return;
        setAllUsers(records);
      })
      .catch(() => {})
      .finally(() => { if (active) setDatabaseReady(true); });
  }, [user?.email, user?.role]);

  // Load user-specific data when user changes
  useEffect(() => {
    setProfileStorageReady(false);
    setUserDataReady(false);
    if (user?.email) {
      setNotifications([]);
      setAnalysisResult(null);
      setProfileSettings(getDefaultProfile(user));
      setProfileStorageReady(true);

      const encodedEmail = encodeURIComponent(user.email);
      Promise.all([
        fetch(`/api/users?email=${encodedEmail}`).then(response => response.ok ? response.json() : Promise.reject(new Error('User API unavailable'))),
        fetch(`/api/scans?email=${encodedEmail}`).then(response => response.ok ? response.json() : Promise.reject(new Error('Scans API unavailable'))),
      ])
        .then(([record, scans]) => {
          if (record?.notifications) setNotifications(record.notifications);
          if (record?.analysis) setAnalysisResult(record.analysis);
          else if (Array.isArray(scans) && scans[0]?.analysis) setAnalysisResult(scans[0].analysis);
          if (record?.profile) setProfileSettings({ ...getDefaultProfile(user), ...record.profile });
        })
        .catch(() => {})
        .finally(() => setUserDataReady(true));
    } else {
      setNotifications([]);
      setAnalysisResult(null);
      setProfileSettings(getDefaultProfile(null));
      setProfileStorageReady(false);
      setUserDataReady(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) saveUserRecord(user.email, { account: user }).catch(() => {});
  }, [user]);

  // Save per-user notifications
  useEffect(() => {
    if (user?.email && userDataReady) {
      saveUserRecord(user.email, { notifications }).catch(() => {});
    }
  }, [notifications, user?.email, userDataReady]);

  // Save per-user analysis
  useEffect(() => {
    if (user?.email && userDataReady) {
      if (analysisResult) {
        saveUserRecord(user.email, { analysis: analysisResult }).catch(() => {});
        saveScanRecord(user.email, analysisResult).catch(() => {});
      } else {
        saveUserRecord(user.email, { analysis: null }).catch(() => {});
      }
    }
  }, [analysisResult, user?.email, userDataReady]);

  // Save per-user profile settings
  useEffect(() => {
    if (user?.email && profileStorageReady) {
      saveUserRecord(user.email, { profile: profileSettings }).catch(() => {});
    }
  }, [profileSettings, profileStorageReady, user?.email]);

  // Save all users list
  useEffect(() => {
    if (databaseReady) {
      allUsers.forEach(account => saveUserRecord(account.email, account).catch(() => {}));
    }
  }, [allUsers, databaseReady]);

  const addNotification = useCallback((text) => {
    setNotifications(prev => [{ id: Date.now(), text, time: 'Just now', read: false }, ...prev]);
  }, []);

  const updateProfileSettings = useCallback((updates) => {
    setProfileSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const saveDocuments = useCallback((files, category = 'scan') => {
    return saveDocumentRecords(user?.email, files, category);
  }, [user?.email]);

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password }),
      });
      const result = await response.json();
      if (!response.ok) return { success: false, error: result.error || 'Invalid email or password.' };
      if (result.requiresOtp) return result;
      setUser(result);
      return { success: true };
    } catch {
      return { success: false, error: 'Unable to connect to the database.' };
    }
  };

  const verifyLoginOtp = async (challengeToken, code, trustDevice = true) => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify-otp', challengeToken, code, trustDevice }),
      });
      const result = await response.json();
      if (!response.ok) return { success: false, error: result.error || 'Verification failed.' };
      setUser(result);
      return { success: true, needsPasswordSetup: result.needsPasswordSetup };
    } catch {
      return { success: false, error: 'Unable to connect to the database.' };
    }
  };

  const resendLoginOtp = async (challengeToken) => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resend-otp', challengeToken }),
      });
      const result = await response.json();
      if (!response.ok) return { success: false, error: result.error || 'Unable to resend the verification code.' };
      return { success: true, challenge: result };
    } catch {
      return { success: false, error: 'Unable to connect to the database.' };
    }
  };

  const loginWithGoogle = (googleUser) => loginWithSocial(googleUser);

  const loginWithSocial = async (account) => {
    if (!account?.email) return { success: false, error: 'No account selected.' };
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'social', email: account.email, name: account.name, picture: account.picture, provider: account.provider }),
      });
      const result = await response.json();
      if (!response.ok) return { success: false, error: result.error || 'Social login failed.' };
      if (result.requiresOtp) return result;
      setUser(result);
      return { success: true, needsPasswordSetup: result.needsPasswordSetup };
    } catch {
      return { success: false, error: 'Unable to connect to the database.' };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'signup',
          email: userData.email,
          password: userData.password,
          name: `${userData.firstName} ${userData.lastName}`,
          ...userData,
        }),
      });
      const result = await response.json();
      if (!response.ok) return { success: false, error: result.error || 'Sign up failed.' };
      setUser(result);
      return { success: true };
    } catch {
      return { success: false, error: 'Unable to connect to the database.' };
    }
  };

  const logout = () => {
    fetch('/api/auth', { method: 'DELETE', credentials: 'include' }).catch(() => {}).finally(() => setUser(null));
  };

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // AI Resume Analysis (simulated)
  const analyzeResume = (fileName) => {
    const skills = ['HTML/CSS', 'JavaScript', 'React.js', 'Git', 'Communication', 'Problem Solving', 'Teamwork', 'Microsoft Office', 'Data Entry', 'Customer Service', 'Time Management', 'Adaptability'];
    const randomSkills = skills.sort(() => 0.5 - Math.random()).slice(0, 6 + Math.floor(Math.random() * 5));
    const result = {
      fileName,
      extractedSkills: randomSkills,
      readinessScore: 55 + Math.floor(Math.random() * 35),
      recommendedCareers: [
        { name: 'Software Engineer', match: '94%' },
        { name: 'Web Developer', match: '81%' },
        { name: 'IT Support Specialist', match: '72%' },
      ],
      analyzedAt: new Date().toLocaleString(),
    };
    setAnalysisResult(previous => ({
      ...result,
      fileName: [...new Set([...(previous?.fileName?.split(', ') || []), fileName])].join(', '),
      extractedSkills: [...new Set([...(previous?.extractedSkills || []), ...randomSkills])],
      recommendedCareers: [...(previous?.recommendedCareers || []), ...result.recommendedCareers]
        .filter((career, index, careers) => careers.findIndex(item => item.name === career.name) === index),
      readinessScore: Math.max(previous?.readinessScore || 0, result.readinessScore),
    }));
    addNotification(`Resume "${fileName}" analysed — ${randomSkills.length} skills extracted`);
    return result;
  };

  const analyzeCertificate = (fileName) => {
    const certs = ['NC II Programming', 'NC II Computer Systems Servicing', 'NC II Electrical Installation', 'NC III Web Development', 'NC II Cookery', 'NC II Automotive Servicing'];
    const detected = certs[Math.floor(Math.random() * certs.length)];
    addNotification(`Certificate "${fileName}" verified — ${detected} detected`);
    if (analysisResult) {
      setAnalysisResult(prev => ({
        ...prev,
        extractedSkills: [...new Set([...prev.extractedSkills, detected])],
        readinessScore: Math.min(100, prev.readinessScore + 5),
      }));
    } else {
      setAnalysisResult({
        fileName,
        extractedSkills: [detected],
        readinessScore: 30,
        recommendedCareers: [
          { name: 'TESDA Trainer', match: '79%' },
          { name: 'Electrician', match: '65%' },
        ],
        analyzedAt: new Date().toLocaleString(),
      });
    }
    return { detected };
  };

  const analyzeFiles = (files) => {
    const fileNames = files.map(file => typeof file === 'string' ? file : file.name).filter(Boolean);
    if (!fileNames.length) return null;

    const skillPool = ['HTML/CSS', 'JavaScript', 'React.js', 'Git', 'Communication', 'Problem Solving', 'Teamwork', 'Microsoft Office', 'Data Entry', 'Customer Service', 'Time Management', 'Adaptability', 'Digital Literacy', 'Documentation'];
    const extractedSkills = [...new Set(fileNames.flatMap((_, index) => skillPool.slice((index * 3) % skillPool.length, ((index * 3) % skillPool.length) + 5)))];

    setAnalysisResult(previous => {
      const combinedSkills = [...new Set([...(previous?.extractedSkills || []), ...extractedSkills])];
      return {
        ...previous,
        fileName: [...new Set([...(previous?.fileName?.split(', ') || []), ...fileNames])].join(', '),
        extractedSkills: combinedSkills,
        readinessScore: Math.min(100, Math.max(previous?.readinessScore || 45, 48 + combinedSkills.length * 4)),
        recommendedCareers: previous?.recommendedCareers?.length ? previous.recommendedCareers : [
          { name: 'Software Engineer', match: '94%' },
          { name: 'Web Developer', match: '81%' },
          { name: 'IT Support Specialist', match: '72%' },
        ],
        analyzedAt: new Date().toLocaleString(),
        scanSummary: `${fileNames.length} file${fileNames.length === 1 ? '' : 's'} scanned individually and combined into one skills summary.`,
      };
    });
    addNotification(`${fileNames.length} file${fileNames.length === 1 ? '' : 's'} scanned and combined into your skills summary.`);
    return { fileNames, extractedSkills };
  };

  const syncScanAnalysis = ({ fileNames = [], resultText = '', model = '', analysis = {} }) => {
    const dedupeStrings = (arr) => {
      const seen = new Set();
      return (arr || []).filter(Boolean).filter(s => {
        // normalise: lowercase, strip leading bullet/dash chars
        const k = String(s).toLowerCase().replace(/^[-–•·\s]+/, '').replace(/\s+/g, ' ').trim();
        if (!k || seen.has(k)) return false;
        seen.add(k);
        return true;
      });
    };

    const dedupeObjects = (arr, key) => {
      const seen = new Set();
      return (arr || []).filter(item => {
        const k = String(item?.[key] || '').toLowerCase().replace(/^[-–•·\s]+/, '').replace(/\s+/g, ' ').trim();
        if (!k || seen.has(k)) return false;
        seen.add(k);
        return true;
      });
    };

    const newSkills     = Array.isArray(analysis.skillsDetected) ? analysis.skillsDetected.filter(Boolean) : [];
    const newCareers    = Array.isArray(analysis.careerMatches)  ? analysis.careerMatches  : [];
    const newGaps       = Array.isArray(analysis.skillGaps)      ? analysis.skillGaps      : [];
    const newTesda      = Array.isArray(analysis.tesdaRecommendations) ? analysis.tesdaRecommendations : [];
    const newLearning   = Array.isArray(analysis.learningRecommendations) ? analysis.learningRecommendations : [];
    const newJobs       = Array.isArray(analysis.jobRecommendations) ? analysis.jobRecommendations : [];
    const newActions    = Array.isArray(analysis.nextActions)   ? analysis.nextActions    : [];

    setAnalysisResult(prev => {
      const prevSkills   = prev?.extractedSkills    || [];
      const prevCareers  = prev?.recommendedCareers || [];
      const prevGaps     = prev?.skillGaps          || [];
      const prevTesda    = prev?.tesdaRecommendations || [];
      const prevLearning = prev?.learningRecommendations || [];
      const prevJobs     = prev?.jobRecommendations || [];
      const prevActions  = prev?.nextActions        || [];
      const prevNames    = prev?.fileName ? prev.fileName.split(', ') : [];

      const mergedSkills   = dedupeStrings([...prevSkills,  ...newSkills]);
      const mergedCareers  = dedupeObjects([...prevCareers, ...newCareers], 'name');
      const mergedGaps     = dedupeStrings([...prevGaps,    ...newGaps]);
      const mergedTesda    = dedupeStrings([...prevTesda,   ...newTesda]);
      const mergedLearning = dedupeObjects([...prevLearning,...newLearning], 'title');
      const mergedJobs     = dedupeObjects([...prevJobs,    ...newJobs], 'title');
      const mergedActions  = dedupeStrings([...prevActions, ...newActions]);
      const mergedNames    = [...new Set([...prevNames, ...(fileNames || [])])].filter(Boolean);

      const readinessScore = Math.min(96, Math.max(35,
        45 + mergedSkills.length * 6 - mergedGaps.length * 2
      ));

      const merged = {
        fileName:  mergedNames.join(', ') || 'AI scan upload',
        extractedSkills:    mergedSkills,
        readinessScore,
        recommendedCareers: mergedCareers,
        jobRecommendations: mergedJobs,
        skillGaps:          mergedGaps,
        tesdaRecommendations: mergedTesda,
        learningRecommendations: mergedLearning,
        nextActions:        mergedActions,
        scanSummary:        analysis.summary || prev?.scanSummary || '',
        scanResultText:     resultText || prev?.scanResultText || '',
        scanModel:          model || prev?.scanModel || '',
        analyzedAt:         new Date().toLocaleString(),
        source:             'AI Scanner',
      };

      addNotification(
        `AI scan synced "${mergedNames.slice(-1)[0] || 'file'}" — ${mergedSkills.length} skills total, ${mergedGaps.length} gaps identified`
      );
      return merged;
    });
  };

  // Admin functions
  const deleteUser = (email) => {
    setAllUsers(prev => prev.filter(u => u.email !== email));
    // Also clean up their stored data
    fetch(`/api/users?email=${encodeURIComponent(email)}`, { method: 'DELETE' }).catch(() => {});
  };

  const toggleUserStatus = (email) => {
    setAllUsers(prev => prev.map(u => u.email === email ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u));
  };

  const createUser = ({ firstName, lastName, email, role = 'user' }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const name = `${firstName || ''} ${lastName || ''}`.trim();
    if (!name || !normalizedEmail) return { success: false, error: 'Name and email are required.' };
    if (allUsers.some(account => account.email.toLowerCase() === normalizedEmail)) return { success: false, error: 'Email already registered.' };

    setAllUsers(prev => [...prev, {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      name,
      email: normalizedEmail,
      password: '',
      role,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      lastActiveAt: '',
    }]);
    return { success: true };
  };

  const updateUser = (email, updates) => {
    setAllUsers(prev => prev.map(account => {
      if (account.email !== email) return account;
      const firstName = updates.firstName?.trim() ?? account.firstName ?? account.name?.split(' ')[0] ?? '';
      const lastName = updates.lastName?.trim() ?? account.lastName ?? account.name?.split(' ').slice(1).join(' ') ?? '';
      return { ...account, ...updates, firstName, lastName, name: `${firstName} ${lastName}`.trim() };
    }));
  };

  const getUserActivity = (email) => {
    const account = allUsers.find(userRecord => userRecord.email === email);
    return {
      hasProfile: Boolean(account?.profile?.displayName || account?.profile?.firstName || account?.profile?.targetRole),
      lastScan: account?.analysis?.analyzedAt || 'No scan yet',
      skillsFound: account?.analysis?.extractedSkills?.length || 0,
    };
  };

  // Admin: change or reset a user's password
  const resetPassword = (email, newPassword) => {
    if (!email || !newPassword) return { success: false, error: 'Email and new password are required.' };
    const exists = allUsers.some(a => a.email === email);
    if (!exists) return { success: false, error: 'User not found.' };
    setAllUsers(prev => prev.map(a => a.email === email ? { ...a, password: newPassword } : a));
    return { success: true };
  };

  return (
    <UserContext.Provider value={{
      user, authReady, login, verifyLoginOtp, resendLoginOtp, loginWithGoogle, loginWithSocial, signup, logout,
      notifications, markNotificationRead, clearAllNotifications, addNotification,
      analyzeResume, analyzeCertificate, analyzeFiles, syncScanAnalysis, analysisResult, saveDocuments,
      profileSettings, updateProfileSettings,
      allUsers, createUser, updateUser, deleteUser, toggleUserStatus, getUserActivity,
      resetPassword,
      isAdmin: user?.role === 'admin',
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
}
