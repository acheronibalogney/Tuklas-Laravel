import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';
import { useTheme } from '../ThemeContext';

/* ── Icons ─────────────────────────────────────────────────────────────── */
const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const KeyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);

const blankUser = { firstName: '', lastName: '', email: '', role: 'user' };

/* ── Password cell — shows masked value, reveal toggle ─────────────────── */
function PasswordCell({ password }) {
  const [revealed, setRevealed] = useState(false);
  const display = password
    ? (revealed ? password : '•'.repeat(Math.min(password.length, 12)))
    : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>—</span>;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{
        fontFamily: revealed ? 'var(--font-body)' : 'var(--font-mono)',
        fontSize: revealed ? 13 : 14,
        color: 'var(--text-secondary)',
        letterSpacing: revealed ? 'normal' : '0.08em',
        userSelect: revealed ? 'text' : 'none',
      }}>
        {display}
      </span>
      {password && (
        <button
          title={revealed ? 'Hide password' : 'Reveal password'}
          onClick={() => setRevealed(v => !v)}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: 2, display: 'flex',
            borderRadius: 4,
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          {revealed ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      )}
    </div>
  );
}

/* ── Change-password modal ──────────────────────────────────────────────── */
function PasswordModal({ account, onClose, onSave }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    const result = onSave(account.email, newPassword);
    if (result.success) {
      setSuccess(true);
      setTimeout(onClose, 1200);
    } else {
      setError(result.error || 'Failed to update password.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)', zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: 420,
          boxShadow: '0 24px 64px rgba(0,0,0,0.3)', overflow: 'hidden',
          animation: 'scaleIn 0.2s ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '18px 24px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--accent-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent)',
          }}>
            <KeyIcon />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--text-primary)' }}>
              Change Password
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>
              {account.name || account.email}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              marginLeft: 'auto', background: 'transparent', border: 'none',
              color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer',
              lineHeight: 1, padding: '2px 6px', borderRadius: 'var(--radius-sm)',
            }}
          >×</button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {success ? (
            <div style={{
              textAlign: 'center', padding: '24px 0',
              color: 'var(--accent)', fontWeight: 700, fontSize: 15,
            }}>
              ✓ Password updated successfully
            </div>
          ) : (
            <>
              {/* Current password (read-only display) */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Current Password
                </label>
                <div style={{
                  padding: '9px 12px', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)', background: 'var(--bg-card)',
                  fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.08em',
                }}>
                  {account.password
                    ? '•'.repeat(Math.min(account.password.length, 12))
                    : <span style={{ fontStyle: 'italic', letterSpacing: 'normal' }}>No password set</span>}
                </div>
              </div>

              {/* New password */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => { setNewPassword(e.target.value); setError(''); }}
                    placeholder="Min. 6 characters"
                    required
                    style={{
                      width: '100%', padding: '9px 40px 9px 12px',
                      borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                      background: 'var(--bg-card)', fontSize: 14, color: 'var(--text-primary)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(v => !v)}
                    style={{
                      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                    }}
                  >
                    {showNew ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Confirm New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                    placeholder="Re-enter new password"
                    required
                    style={{
                      width: '100%', padding: '9px 40px 9px 12px',
                      borderRadius: 'var(--radius-md)', border: '1px solid var(--border)',
                      background: 'var(--bg-card)', fontSize: 14, color: 'var(--text-primary)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    style={{
                      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                    }}
                  >
                    {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {error && (
                <div style={{
                  padding: '8px 12px', borderRadius: 'var(--radius-md)',
                  background: 'rgba(179,58,58,0.08)', border: '1px solid rgba(179,58,58,0.3)',
                  color: '#B33A3A', fontSize: 13,
                }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, height: 40 }}
                >
                  Save Password
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={onClose}
                  style={{ flex: 1, height: 40 }}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

/* ── Main Admin page ────────────────────────────────────────────────────── */
export default function Admin() {
  const navigate = useNavigate();
  const {
    user, isAdmin, allUsers,
    createUser, updateUser, deleteUser, toggleUserStatus,
    getUserActivity, resetPassword, logout,
  } = useUser();
  const { theme, toggle } = useTheme();

  const [search, setSearch] = useState('');
  const [form, setForm] = useState(blankUser);
  const [editingEmail, setEditingEmail] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [passwordTarget, setPasswordTarget] = useState(null); // account object for modal
  const [confirmDelete, setConfirmDelete] = useState('');
  const [notice, setNotice] = useState('');

  if (!user || !isAdmin) return (
    <div className="admin-denied">
      <h2>Access denied</h2>
      <button className="btn-primary" onClick={() => navigate('/auth')}>Go to login</button>
    </div>
  );

  const filteredUsers = allUsers.filter(account =>
    `${account.name || ''} ${account.email || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    ['Total users', allUsers.length],
    ['Active', allUsers.filter(a => a.status !== 'suspended').length],
    ['Suspended', allUsers.filter(a => a.status === 'suspended').length],
    ['Admins', allUsers.filter(a => a.role === 'admin').length],
  ];

  const resetForm = () => { setForm(blankUser); setEditingEmail(''); };

  const submitUser = e => {
    e.preventDefault();
    if (editingEmail) {
      updateUser(editingEmail, form);
      setNotice('User profile updated.');
      resetForm();
      return;
    }
    const result = createUser(form);
    setNotice(result.success ? 'User created.' : result.error);
    if (result.success) resetForm();
  };

  const editUser = account => {
    const parts = (account.name || '').trim().split(/\s+/);
    setEditingEmail(account.email);
    setForm({
      firstName: account.firstName || parts[0] || '',
      lastName: account.lastName || parts.slice(1).join(' '),
      email: account.email,
      role: account.role || 'user',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="admin-page">
      {/* ── Topbar ─────────────────────────────────────────────────────── */}
      <header className="admin-topbar">
        <div>
          <strong className="grad-text">Tuklas</strong>
          <span className="admin-label">ADMIN</span>
        </div>
        <div className="admin-header-actions">
          <button className="btn-secondary" onClick={() => navigate('/app')}>Dashboard</button>
          <button className="theme-toggle" onClick={toggle}>{theme === 'dark' ? '☀️' : '🌙'}</button>
          <button className="btn-secondary" onClick={() => { logout(); navigate('/'); }}>Sign out</button>
        </div>
      </header>

      <main className="admin-layout">
        {/* ── Create / Edit user form ───────────────────────────────────── */}
        <section className="admin-panel">
          <div className="section-header"><span className="section-title">Admin</span></div>
          <p className="admin-copy">Create accounts and assign their access role.</p>
          <form onSubmit={submitUser} className="admin-user-form">
            <input required placeholder="First name" value={form.firstName}
              onChange={e => setForm(c => ({ ...c, firstName: e.target.value }))} />
            <input required placeholder="Last name" value={form.lastName}
              onChange={e => setForm(c => ({ ...c, lastName: e.target.value }))} />
            <input required type="email" placeholder="Email address"
              disabled={Boolean(editingEmail)} value={form.email}
              onChange={e => setForm(c => ({ ...c, email: e.target.value }))} />
            <select value={form.role} onChange={e => setForm(c => ({ ...c, role: e.target.value }))}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <div className="admin-form-actions">
              <button className="btn-primary" type="submit">{editingEmail ? 'Save user' : 'Create user'}</button>
              {editingEmail && <button className="btn-secondary" type="button" onClick={resetForm}>Cancel</button>}
            </div>
          </form>
          {notice && <p className="admin-notice">{notice}</p>}
        </section>

        {/* ── Stats ────────────────────────────────────────────────────── */}
        <section className="admin-stats">
          {stats.map(([label, value]) => (
            <div key={label} className="admin-stat">
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </section>

        {/* ── User table ───────────────────────────────────────────────── */}
        <section className="admin-panel">
          <div className="admin-list-header">
            <div>
              <div className="section-title">Manage users</div>
              <p className="admin-copy">View activity, edit access, see passwords, change passwords, suspend, or delete accounts.</p>
            </div>
            <input
              placeholder="Search users"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table style={{ minWidth: 820 }}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Password</th>
                  <th>Activity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(account => {
                  const activity = getUserActivity(account.email);
                  const isProtected = account.email === user.email;

                  return (
                    <tr key={account.email}>
                      {/* User */}
                      <td>
                        <strong>{account.name || `${account.firstName || ''} ${account.lastName || ''}`}</strong>
                        <br />
                        <small style={{ color: 'var(--text-muted)' }}>{account.email}</small>
                      </td>

                      {/* Role */}
                      <td>
                        <span className={`badge ${account.role === 'admin' ? 'badge-blue' : 'badge-muted'}`}>
                          {account.role || 'user'}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`badge ${account.status === 'suspended' ? 'badge-muted' : 'badge-green'}`}>
                          {account.status || 'active'}
                        </span>
                      </td>

                      {/* Password — masked with reveal toggle */}
                      <td style={{ minWidth: 160 }}>
                        <PasswordCell password={account.password} />
                      </td>

                      {/* Activity */}
                      <td>
                        <button
                          className="admin-link"
                          onClick={() => setSelectedUser({ account, activity })}
                        >
                          {activity.lastScan === 'No scan yet' ? 'No scan yet' : 'View activity'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="admin-actions">
                          <button onClick={() => editUser(account)}>Edit</button>
                          <button
                            onClick={() => setPasswordTarget(account)}
                            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                          >
                            <KeyIcon /> Password
                          </button>
                          {!isProtected && (
                            <button onClick={() => toggleUserStatus(account.email)}>
                              {account.status === 'suspended' ? 'Activate' : 'Suspend'}
                            </button>
                          )}
                          {!isProtected && (
                            confirmDelete === account.email
                              ? <button className="admin-delete" onClick={() => { deleteUser(account.email); setConfirmDelete(''); }}>Confirm delete</button>
                              : <button className="admin-delete" onClick={() => setConfirmDelete(account.email)}>Delete</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* ── Activity modal ───────────────────────────────────────────────── */}
      {selectedUser && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedUser(null)}>
          <section className="admin-modal" onClick={e => e.stopPropagation()}>
            <button className="admin-modal-close" onClick={() => setSelectedUser(null)}>×</button>
            <h2>{selectedUser.account.name}</h2>
            <p>{selectedUser.account.email}</p>
            <div className="admin-activity-grid">
              <div><span>Joined</span><strong>{selectedUser.account.createdAt || 'Not recorded'}</strong></div>
              <div><span>Profile</span><strong>{selectedUser.activity.hasProfile ? 'Completed' : 'Not completed'}</strong></div>
              <div><span>Last AI scan</span><strong>{selectedUser.activity.lastScan}</strong></div>
              <div><span>Skills found</span><strong>{selectedUser.activity.skillsFound}</strong></div>
            </div>
          </section>
        </div>
      )}

      {/* ── Change password modal ─────────────────────────────────────────── */}
      {passwordTarget && (
        <PasswordModal
          account={passwordTarget}
          onClose={() => setPasswordTarget(null)}
          onSave={(email, pwd) => {
            const result = resetPassword(email, pwd);
            if (result.success) setNotice(`Password updated for ${email}.`);
            return result;
          }}
        />
      )}
    </div>
  );
}
