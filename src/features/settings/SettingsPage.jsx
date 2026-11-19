import { useState } from 'react';
import { Bell, Building2, Check, LogOut, ShieldCheck, Users } from 'lucide-react';
import API from '../../lib/api.js';
import { Field, PageTitle } from '../../components/shared.jsx';
function SettingsPage({ user, onUser, notify, onLogoutAll }) {
  const [password, setPassword] = useState(''),
    [linkError, setLinkError] = useState(''),
    [linkBusy, setLinkBusy] = useState(false);
  const linkPassword = async e => {
    e.preventDefault();
    setLinkError('');
    setLinkBusy(true);
    try {
      const r = await fetch(`${API}/auth/link-password`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      onUser(d.user);
      setPassword('');
      notify('Password sign-in connected.');
    } catch (e) {
      setLinkError(e.message);
    } finally {
      setLinkBusy(false);
    }
  };
  return (
    <>
      <PageTitle
        eyebrow="YOUR ACCOUNT"
        title="Settings"
        subtitle="Manage your profile and business preferences."
      />
      <div className="settings-layout">
        <aside className="panel settings-nav">
          <button className="selected">
            <Users size={16} />
            Profile
          </button>
          <button>
            <Building2 size={16} />
            Business details
          </button>
          <button>
            <Bell size={16} />
            Notifications
          </button>
          <button>
            <ShieldCheck size={16} />
            Security
          </button>
        </aside>
        <section className="panel settings-content">
          <div className="panel-heading">
            <div>
              <h2>Personal information</h2>
              <p>Update your personal details here.</p>
            </div>
          </div>
          <div className="settings-avatar">
            <div className="profile-avatar">
              {user.fullName
                ?.split(' ')
                .map(x => x[0])
                .slice(0, 2)
                .join('') || 'PS'}
            </div>
            <div>
              <b>{user.fullName}</b>
              <span>{user.accountType} account</span>
            </div>
            <span className="verified-label">
              <Check size={12} />
              Verified
            </span>
          </div>
          <div className="form-grid settings-form">
            <Field label="Full name" name="name" value={user.fullName || ''} onChange={() => {}} />
            <Field
              label="Email address"
              name="email"
              value={user.email || ''}
              onChange={() => {}}
            />
            <Field
              label="Mobile number"
              name="mobile"
              value={user.mobile || 'Not added'}
              onChange={() => {}}
            />
            <Field
              label="Business name"
              name="business"
              value={user.businessName || 'Not added'}
              onChange={() => {}}
            />
          </div>
          {!(user.authProviders || []).includes('password') && (
            <form className="link-password-form" onSubmit={linkPassword}>
              <div>
                <b>Connect email and password sign-in</b>
                <small>
                  Add a password to this Google account. Your Google sign-in will keep working.
                </small>
              </div>
              <label className="auth-label">
                New password
                <input
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  minLength={10}
                  maxLength={128}
                  placeholder="At least 10 characters"
                  required
                />
              </label>
              {linkError && <div className="auth-alert error">{linkError}</div>}
              <button className="button-secondary" type="submit" disabled={linkBusy}>
                {linkBusy ? 'Saving…' : 'Set password'}
              </button>
            </form>
          )}
          <div className="security-session-row">
            <span>
              <b>Sign out everywhere</b>
              <small>End all active sessions on other devices.</small>
            </span>
            <button className="button-secondary" onClick={onLogoutAll}>
              <LogOut size={14} /> Sign out all devices
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
export default SettingsPage;
