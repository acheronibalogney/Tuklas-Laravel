import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';
import { MAX_SCAN_FILES, MAX_SCAN_TOTAL_BYTES, scanFiles } from '../scan';

const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const ScanIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    <line x1="7" y1="12" x2="17" y2="12" />
  </svg>
);

const FileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const WarningIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18, flexShrink: 0 }}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const TargetIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const BookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

const fileId = (file, index) => `${file.name}-${file.lastModified}-${index}`;
function matchColour(matchStr) {
  const pct = parseInt(matchStr, 10) || 0;
  if (pct >= 85) return { bar: 'var(--accent)', badge: 'badge-green' };
  if (pct >= 70) return { bar: '#3B00FF', badge: 'badge-blue' };
  return { bar: 'var(--text-muted)', badge: 'badge-muted' };
}

function workplaceList(value) {
  if (Array.isArray(value)) return value.filter(item => typeof item === 'string' || typeof item === 'number').map(String);
  return typeof value === 'string' && value.trim() ? [value.trim()] : [];
}

// ── Merge two analysis objects — accumulate without duplication ──────────────
// Normalise a string for dedup comparison: lowercase, trim, strip leading dashes/bullets
const normKey = (s) => String(s || '').toLowerCase().replace(/^[-–•·\s]+/, '').replace(/\s+/g, ' ').trim();

function mergeAnalyses(prev, next) {
  if (!prev) return next;

  // Dedupe plain string arrays (case-insensitive, strip bullet prefixes)
  const uniqueStrings = (arr) => {
    const seen = new Set();
    return (arr || []).filter(Boolean).filter(s => {
      const k = normKey(s);
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };

  // Dedupe object arrays by a string key field
  const uniqueObjects = (arr, key) => {
    const seen = new Set();
    return (arr || []).filter(item => {
      const k = normKey(item?.[key]);
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };

  return {
    summary: [prev.summary, next.summary].filter(Boolean).join('\n\n'),
    skillsDetected:       uniqueStrings([...(prev.skillsDetected  || []), ...(next.skillsDetected  || [])]),
    careerMatches:        uniqueObjects([...(prev.careerMatches   || []), ...(next.careerMatches   || [])], 'name'),
    jobRecommendations:   uniqueObjects([...(prev.jobRecommendations || []), ...(next.jobRecommendations || [])], 'title'),
    skillGaps:            uniqueStrings([...(prev.skillGaps       || []), ...(next.skillGaps       || [])]),
    tesdaRecommendations: uniqueStrings([...(prev.tesdaRecommendations || []), ...(next.tesdaRecommendations || [])]),
    learningRecommendations: uniqueObjects([...(prev.learningRecommendations || []), ...(next.learningRecommendations || [])], 'title'),
    nextActions:          uniqueStrings([...(prev.nextActions     || []), ...(next.nextActions     || [])]),
  };
}

// ── Structured results renderer ──────────────────────────────────────────────
function ScanResults({ analysis, syncedAt, lastScannedFull, scanCount }) {
  if (!analysis) return null;

  const {
    summary,
    skillsDetected = [],
    careerMatches = [],
    skillGaps = [],
    tesdaRecommendations = [],
    learningRecommendations = [],
    nextActions = [],
  } = analysis;
  const jobRecommendations = Array.isArray(analysis.jobRecommendations)
    ? analysis.jobRecommendations.filter(job => job && typeof job === 'object' && !Array.isArray(job))
    : [];

  return (
    <div className="scanner-results-stack" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Last scanned timestamp ────────────────────────────────────────── */}
      {lastScannedFull && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
          fontSize: 12, color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
        }}>
          <ClockIcon />
          <span>Last scanned: {lastScannedFull}</span>
          {syncedAt && <span style={{ color: 'var(--accent)' }}>· Synced at {syncedAt}</span>}
          {scanCount > 1 && (
            <span style={{
              background: 'var(--accent-light)', color: 'var(--accent)',
              padding: '2px 8px', borderRadius: 999, fontWeight: 700,
            }}>
              {scanCount} scans accumulated
            </span>
          )}
        </div>
      )}

      {/* ── Summary ───────────────────────────────────────────────────────── */}
      {summary && (
        <div className="scanner-summary" style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '16px 20px',
        }}>
          <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            {scanCount > 1 ? `Cumulative Summary (${scanCount} Scans)` : 'Summary'}
          </div>
          {/* Each paragraph = one scan's summary */}
          {summary.split('\n\n').filter(Boolean).map((para, i) => (
            <p key={i} style={{
              fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0,
              paddingTop: i > 0 ? 10 : 0, borderTop: i > 0 ? '1px solid var(--border)' : 'none',
              marginTop: i > 0 ? 10 : 0,
            }}>
              {scanCount > 1 && <span style={{ fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-mono)', marginRight: 6 }}>Scan {i + 1}:</span>}
              {para}
            </p>
          ))}
        </div>
      )}

      {/* ── Skills detected ───────────────────────────────────────────────── */}
      {skillsDetected.length > 0 && (
        <ResultCard title="Skills Detected" count={skillsDetected.length}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {skillsDetected.map((skill, i) => (
              <span key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', borderRadius: 999,
                background: 'var(--accent-light)', color: 'var(--accent)',
                fontSize: 13, fontWeight: 500,
              }}>
                <CheckIcon />{skill}
              </span>
            ))}
          </div>
        </ResultCard>
      )}

      {/* ── Career path matches ─── MULTIPLE CARDS ─────────────────────── */}
      {careerMatches.length > 0 && (
        <ResultCard title="Career Path Matches" count={careerMatches.length} icon={<TargetIcon />}>
          <div className="scanner-career-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {careerMatches.map((career, i) => {
              const pct = parseInt(career.match, 10) || 0;
              const { bar, badge } = matchColour(career.match);
              return (
                <div key={i} style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)', padding: '14px 16px',
                  transition: 'border-color 0.2s, transform 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                      {career.name}
                    </span>
                    <span className={`badge ${badge}`} style={{ flexShrink: 0, marginLeft: 8 }}>{career.match}</span>
                  </div>
                  {/* match bar */}
                  <div style={{ height: 4, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: bar, borderRadius: 999, transition: 'width 0.8s ease' }} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, fontFamily: 'var(--font-mono)' }}>
                    {pct >= 85 ? 'Strong Match' : pct >= 70 ? 'Good Match' : 'Partial Match'}
                  </div>
                </div>
              );
            })}
          </div>
        </ResultCard>
      )}

      {/* ── Job Recommendations ────────────────────────────────────────────── */}
      {jobRecommendations.length > 0 && (
        <ResultCard title="Job Recommendations" count={jobRecommendations.length} icon={<BriefcaseIcon />}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {jobRecommendations.map((job, i) => {
              const workplaces = workplaceList(job?.workplaces);
              return (
              <div key={i} className="scanner-skill-gap-item" style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', padding: '14px 16px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4, gap: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{job?.title || 'Job recommendation'}</div>
                  {job.searchTerms && (
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(job.searchTerms)}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'none', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)', flexShrink: 0 }}
                    >Search →</a>
                  )}
                </div>
                {job.reason && <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6, lineHeight: 1.5 }}>{job.reason}</div>}
                {workplaces.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {workplaces.map((w, wi) => (
                      <span key={wi} className="badge badge-muted">{w}</span>
                    ))}
                  </div>
                )}
              </div>
              );
            })}
          </div>
        </ResultCard>
      )}

      {/* ── Skill Gaps ─────────────────────────────────────────────────────── */}
      {skillGaps.length > 0 && (
        <ResultCard title="Skill Gaps to Address" count={skillGaps.length}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {skillGaps.map((gap, i) => (
              <div key={i} className="scanner-tesda-item" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--text-secondary)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#E85D24', flexShrink: 0 }} />
                  {gap}
                </div>
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(gap + ' free course Philippines 2024')}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'none', fontFamily: 'var(--font-mono)', flexShrink: 0, marginLeft: 8 }}
                >Find course →</a>
              </div>
            ))}
          </div>
        </ResultCard>
      )}

      {/* ── TESDA Recommendations ─────────────────────────────────────────── */}
      {tesdaRecommendations.length > 0 && (
        <ResultCard title="TESDA Training Recommendations" count={tesdaRecommendations.length} icon={<BookIcon />}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tesdaRecommendations.map((course, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px',
                background: 'var(--accent-light)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', fontSize: 13, gap: 8,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="badge badge-green" style={{ flexShrink: 0 }}>TESDA</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{course}</span>
                </div>
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(course + ' TESDA free enrollment Philippines etesda')}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'none', fontFamily: 'var(--font-mono)', flexShrink: 0 }}
                >Enroll →</a>
              </div>
            ))}
          </div>
        </ResultCard>
      )}

      {/* ── Learning Recommendations ──────────────────────────────────────── */}
      {learningRecommendations.length > 0 && (
        <ResultCard title="Learning Plan" count={learningRecommendations.length} icon={<StarIcon />}>
          <div className="scanner-learning-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {learningRecommendations.map((item, i) => (
              <div key={i} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', padding: '14px 16px',
                display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.3 }}>{item.title}</span>
                  <span className={`badge ${item.type === 'TESDA' ? 'badge-green' : item.type === 'Self-learning' ? 'badge-muted' : 'badge-blue'}`} style={{ flexShrink: 0 }}>{item.type}</span>
                </div>
                {item.reason && <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{item.reason}</p>}
                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {item.learningSite && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      📚 {item.learningSite}
                    </div>
                  )}
                  {/* Prefer direct URL; fall back to Google search only when no direct URL */}
                  {(item.directUrl || item.searchTerms) && (
                    <a
                      href={item.directUrl || `https://www.google.com/search?q=${encodeURIComponent(item.searchTerms)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: 12, color: 'var(--accent)', textDecoration: 'none',
                        fontWeight: 600, fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {item.directUrl ? 'Go to resource →' : 'Search on Google →'}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ResultCard>
      )}
      {nextActions.length > 0 && (
        <ResultCard title="Suggested Next Actions">
          <ol style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {nextActions.map((action, i) => (
              <li key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{action}</li>
            ))}
          </ol>
        </ResultCard>
      )}
    </div>
  );
}

function ResultCard({ title, count, icon, children }) {
  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', overflow: 'hidden',
    }}>
      <div className="scanner-result-card-header" style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '12px 20px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-card)',
      }}>
        {icon && <span style={{ color: 'var(--accent)', display: 'flex' }}>{icon}</span>}
        <span style={{ fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{title}</span>
        {count !== undefined && (
          <span className="badge badge-muted" style={{ marginLeft: 'auto' }}>{count}</span>
        )}
      </div>
      <div className="scanner-result-card-body" style={{ padding: '16px 20px' }}>{children}</div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AiScanner({ embedded = false, initialGoal = '', autoRun = false }) {
  const navigate = useNavigate();
  const { user, syncScanAnalysis, saveDocuments, profileSettings } = useUser();
  const [files, setFiles] = useState([]);
  const [goal, setGoal] = useState(initialGoal);
  const [error, setError] = useState('');
  const [syncedAt, setSyncedAt] = useState('');
  const [lastScannedFull, setLastScannedFull] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [fileProgress, setFileProgress] = useState({});
  const [scanAnalysis, setScanAnalysis] = useState(null);  // accumulated across all scans
  const [scanCount, setScanCount] = useState(0);           // how many scans done this session
  const [now, setNow] = useState(() => new Date());

  const profile = useMemo(() => {
    const address = [profileSettings?.streetAddress, profileSettings?.barangay, profileSettings?.municipality].filter(Boolean).join(', ');
    return {
      name: profileSettings?.displayName || user?.name || '',
      email: profileSettings?.email || user?.email || '',
      location: address || profileSettings?.location || user?.location || '',
      role: Array.isArray(profileSettings?.targetRole)
        ? profileSettings.targetRole.join(', ')
        : profileSettings?.targetRole || '',
      photo: profileSettings?.picture || user?.picture || '',
    };
  }, [profileSettings, user]);

  const previews = useMemo(() => files.map((file) => ({
    file,
    url: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
  })), [files]);

  useEffect(() => () => {
    previews.forEach(({ url }) => { if (url) URL.revokeObjectURL(url); });
  }, [previews]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const handleFiles = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    const newFiles = selectedFiles.filter((file) => !files.some((existing) => (
      existing.name === file.name && existing.size === file.size && existing.lastModified === file.lastModified
    )));
    const combinedFiles = [...files, ...newFiles];
    if (combinedFiles.length > MAX_SCAN_FILES) {
      setError(`You can upload up to ${MAX_SCAN_FILES} files per scan. ${files.length} already selected.`);
      event.target.value = '';
      return;
    }
    if (combinedFiles.reduce((total, file) => total + file.size, 0) > MAX_SCAN_TOTAL_BYTES) {
      setError('Selected files exceed the 18 MB total limit. Remove a file and try again.');
      event.target.value = '';
      return;
    }
    setFiles(combinedFiles);
    // Only clear file-pick error — DO NOT reset results or goal
    setError('');
    event.target.value = '';
  };

  const handleRemoveFile = (indexToRemove) => {
    setFiles(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleClearAll = () => {
    setFiles([]);
    setScanAnalysis(null);
    setScanCount(0);
    setSyncedAt('');
    setLastScannedFull('');
    setScanProgress(0);
    setFileProgress({});
    setError('');
    // goal intentionally preserved
  };

  const handleScan = async () => {
    if (!files.length && !goal.trim()) { setError('Type a question or choose at least one file to scan.'); return; }
    setIsScanning(true);
    setScanProgress(8);
    setFileProgress({});
    setError('');
    // NOTE: do NOT clear scanAnalysis here — we keep the old results visible

    try {
      const profileContext = [
        profile.name && `Name: ${profile.name}`,
        profile.email && `Email: ${profile.email}`,
        profile.location && `Location: ${profile.location}`,
        profile.role && `Target role: ${profile.role}`,
      ].filter(Boolean).join('\n');
      const userGoal = goal.trim();
      const effectiveGoal = userGoal || 'Comprehensive resume and career scan with TESDA training recommendations and Philippine job matching';

      // Pass previous scan summary as context so AI gives MORE and different recommendations
      const previousContext = !userGoal && scanAnalysis?.summary
        ? `\n\nPrevious scan findings (do NOT repeat these, give additional recommendations beyond these):\nSkills already detected: ${(scanAnalysis.skillsDetected || []).join(', ')}\nCareers already matched: ${(scanAnalysis.careerMatches || []).map(c => c.name).join(', ')}\nGaps already identified: ${(scanAnalysis.skillGaps || []).join(', ')}`
        : '';

      const scanGoal = [
        profileContext && `User profile:\n${profileContext}`,
        userGoal ? `User's specific request:\n${userGoal}` : effectiveGoal,
        previousContext,
      ].filter(Boolean).join('\n\n');

      const scanPayload = await scanFiles({
        files,
        goal: scanGoal,
        mode: files.length ? (userGoal ? 'prompt-scan' : 'document-scan') : 'career-path',
        onFileProgress: ({ file, index, total, percent, status }) => {
          setFileProgress((current) => ({
            ...current,
            [fileId(file, index)]: { percent, status },
          }));
          if (status === 'complete') setScanProgress(100);
          else if (status === 'scanning') setScanProgress(90);
          else setScanProgress(Math.min(85, Math.round(((index * 100) + percent) / total)));
        },
      });

      await saveDocuments?.(files, 'ai-scan');

      // Prompted scans show the requested answer; blank prompts keep cumulative results.
      setScanAnalysis(prev => userGoal ? scanPayload.analysis : mergeAnalyses(prev, scanPayload.analysis));
      setScanCount(prev => userGoal ? 1 : prev + 1);

      syncScanAnalysis?.({
        fileNames: files.map((file) => file.name),
        resultText: scanPayload.result,
        model: scanPayload.model,
        analysis: scanPayload.analysis,
      });

      const ts = new Date();
      setSyncedAt(ts.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: false }));
      setLastScannedFull(ts.toLocaleString('en-PH', {
        timeZone: 'Asia/Manila',
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false,
      }));
      setScanProgress(100);
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : 'Unable to scan these files.');
      setScanProgress(0);
      setFileProgress({});
    } finally {
      window.setTimeout(() => setIsScanning(false), 450);
    }
  };

  useEffect(() => {
    if (autoRun && initialGoal.trim() && !isScanning) handleScan();
  }, [autoRun]);

  const formattedTime = now.toLocaleTimeString('en-PH', { timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const formattedDate = now.toLocaleDateString('en-PH', { timeZone: 'Asia/Manila', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className={`scanner-page${embedded ? ' scanner-page--embedded' : ''}`}>
      {!embedded && (
        <header className="scanner-topbar">
          <button type="button" className="scanner-logo" onClick={() => navigate('/')}>
            <span className="grad-text">Tuklas</span>
          </button>
          <div className="scanner-clock" aria-label="Current Manila date and time">
            <strong>{formattedTime}</strong>
            <span>{formattedDate}</span>
          </div>
        </header>
      )}

      <main className={`scanner-shell${embedded ? ' scanner-shell--embedded' : ''}`}>
        {isScanning && (
          <div className="scanner-loading-state" role="status" aria-live="polite">
            <span className="scanner-loading-orbit" aria-hidden="true"><span /></span>
            <div>
              <strong>Building your career pathway</strong>
              <span>Reading your evidence and matching the next useful skills.</span>
            </div>
            <span className="scanner-loading-dots" aria-hidden="true">...</span>
          </div>
        )}
        <section className="scanner-hero">
          <div>
            <div className="eyebrow">TuklasAI File Scanner</div>
            <h1 className="dashboard-scanner-title">Scan your files. Find your <em>next move.</em></h1>
            <p>Upload resumes, certificates, screenshots, PDFs, and text files. The AI uses the evidence in them, plus your target role and scan goal, to suggest career paths, learning websites, online courses, self-study, and TESDA options when they fit.</p>
          </div>
          <div className="scanner-privacy">
            <div className="scanner-privacy-row">
              <ShieldIcon />
              <div>
                <strong>User consent required</strong>
                <span>Browsers cannot scan private device folders automatically. Users must choose each file before analysis.</span>
              </div>
            </div>
            <div className="scanner-ai-warning">
              <WarningIcon />
              <div>
                <strong>AI can make mistakes</strong>
                <span className="scanner-ai-disclaimer">Double-check recommendations, course details, and career information before making decisions.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="scanner-grid">
          <div className="scanner-panel">
            <label className="scanner-label" htmlFor="scan-goal">Scan goal</label>
            <textarea
              id="scan-goal"
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
              rows={3}
              className="scanner-textarea"
              placeholder="Optional: Specify your scan goal (e.g. 'Target Software Developer roles', 'Find TESDA scholarships for Culinary'). Leave empty to run a full comprehensive scan."
            />
            <label className="scanner-dropzone">
              <input type="file" multiple accept="image/*,.pdf,.txt,.md,.csv,.json" onChange={handleFiles} />
              <span className="scanner-upload-icon"><UploadIcon /></span>
              <strong>Choose files or pictures</strong>
              <small>Add up to {MAX_SCAN_FILES} files. Previously scanned results stay intact when you add more.</small>
            </label>
            <button
              className="btn-primary scanner-action"
              onClick={handleScan}
              disabled={isScanning || (!files.length && !goal.trim())}
            >
              <ScanIcon />
              {isScanning ? 'Scanning...' : scanCount > 0 ? 'Scan & Add to Results' : 'Scan with Secure AI'}
            </button>
            {(isScanning || scanProgress > 0) && (
              <div className="scanner-progress" aria-label="Scan progress">
                <div className="scanner-progress-head">
                  <span>{isScanning ? (scanProgress >= 90 ? 'AI is analyzing your files' : 'Preparing selected files') : error ? 'Scan failed' : 'Scan complete'}</span>
                  <strong>{scanProgress}%</strong>
                </div>
                <div className="scanner-progress-track">
                  <div className="scanner-progress-fill" style={{ width: `${scanProgress}%` }} />
                </div>
              </div>
            )}
          </div>

          <div className="scanner-panel">
            <div className="scanner-panel-title scanner-files-title">
              Selected Files
              {files.length > 0 && (
                <button
                  onClick={handleClearAll}
                  style={{
                    marginLeft: 'auto', background: 'transparent', border: 'none',
                    color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer',
                    fontFamily: 'var(--font-mono)', textDecoration: 'underline',
                  }}
                >Clear all & reset</button>
              )}
            </div>
            {files.length === 0 ? (
              <div className="scanner-empty">No files selected yet.</div>
            ) : (
              <div className="scanner-file-list">
                {previews.map(({ file, url }, index) => {
                  const progress = fileProgress[fileId(file, index)];
                  return (
                    <div key={fileId(file, index)} className="scanner-file-row">
                      {url ? <img src={url} alt={file.name} /> : <span className="scanner-file-icon"><FileIcon /></span>}
                      <div className="scanner-file-details">
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                          <strong style={{ flex: 1 }}>{file.name}</strong>
                          {!isScanning && (
                            <button
                              onClick={() => handleRemoveFile(index)}
                              title="Remove file"
                              style={{
                                background: 'transparent', border: 'none', color: 'var(--text-muted)',
                                cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: '0 2px', flexShrink: 0,
                              }}
                            >✕</button>
                          )}
                        </div>
                        <span>{file.type || 'Unknown type'} — {formatBytes(file.size)}</span>
                        {isScanning && (
                          <div className="scanner-file-progress" aria-label={`${file.name} scan progress`}>
                            <div className="scanner-file-progress-head">
                              <span>
                                {progress?.status === 'complete' ? 'Scanned'
                                  : progress?.status === 'ready' ? 'Ready for AI analysis'
                                  : progress?.status === 'preparing' ? 'Preparing file'
                                  : progress?.status === 'scanning' ? 'AI scanning'
                                  : 'Waiting in queue'}
                              </span>
                              <strong>{progress?.percent || 0}%</strong>
                            </div>
                            <div className="scanner-file-progress-track">
                              <div className="scanner-file-progress-fill" style={{ width: `${progress?.percent || 0}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ── Results ─────────────────────────────────────────────────────── */}
        {(scanAnalysis || error) && (
          <section className="scanner-results">
            <div className="scanner-panel-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {error ? 'Scan Error' : 'AI Scan Results'}
              {scanCount > 0 && !error && (
                <span className="badge badge-green">{scanCount} scan{scanCount > 1 ? 's' : ''}</span>
              )}
            </div>
            {error
              ? <pre className="scanner-error">{error}</pre>
              : <ScanResults
                  analysis={scanAnalysis}
                  syncedAt={syncedAt}
                  lastScannedFull={lastScannedFull}
                  scanCount={scanCount}
                />
            }
          </section>
        )}
      </main>
    </div>
  );
}
