import { useState } from 'react';
import { Bell, Building2, Check, LogOut, ShieldCheck, Users } from 'lucide-react';
import API from '../../lib/api.js';
import { Field, PageTitle } from '../../components/shared.jsx';

const profileFromUser = user => ({
  fullName: user.fullName || '',
  email: user.email || '',
  mobile: user.mobile || '',
  businessName: user.businessName || '',
  businessAddress: user.businessAddress || '',
  gstin: user.gstin || '',
});

function SettingsPage({ user, onUser, notify, onLogoutAll }) {
  const [profile, setProfile] = useState(() => profileFromUser(user));
  const [password, setPassword] = useState('');
  const [linkError, setLinkError] = useState('');
  const [linkBusy, setLinkBusy] = useState(false);
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [emailNotice, setEmailNotice] = useState('');
  const [verificationLink, setVerificationLink] = useState('');

  const updateProfile = e =>
    setProfile(current => ({ ...current, [e.target.name]: e.target.value }));

  const saveProfile = async e => {
    e.preventDefault();
    setProfileBusy(true);
    setProfileError('');
    setEmailNotice('');
    setVerificationLink('');
    try {
      const response = await fetch(`${API}/profile`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: profile.fullName,
          businessName: profile.businessName,
          mobile: profile.mobile,
          businessAddress: profile.businessAddress,
          gstin: profile.gstin,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not save your business details.');
      onUser(data.user);

      if (profile.email.trim().toLowerCase() !== user.email.toLowerCase()) {
        const emailResponse = await fetch(`${API}/auth/change-email`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: profile.email }),
        });
        const emailData = await emailResponse.json();
        if (!emailResponse.ok)
          throw new Error(emailData.error || 'Could not request an email change.');
        setEmailNotice(emailData.message);
        setVerificationLink(emailData.developmentLink || '');
      }
      notify('Business information saved.');
    } catch (error) {
      setProfileError(error.message || 'Could not save your business details.');
    } finally {
      setProfileBusy(false);
    }
  };

  const linkPassword = async e => {
    e.preventDefault();
    setLinkError('');
    setLinkBusy(true);
    try {
      const response = await fetch(`${API}/auth/link-password`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      onUser(data.user);
      setPassword('');
      notify('Password sign-in connected.');
    } catch (error) {
      setLinkError(error.message);
    } finally {
      setLinkBusy(false);
    }
  };

  return (
    <>
      <PageTitle
        eyebrow="YOUR ACCOUNT"
        title="Settings"
        subtitle="Manage your profile and business information."
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
              <h2>Business information</h2>
              <p>Keep your contact and business details up to date.</p>
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
            {user.emailVerified && (
              <span className="verified-label">
                <Check size={12} />
                Verified
              </span>
            )}
          </div>
          <form onSubmit={saveProfile}>
            <div className="form-grid settings-form">
              <Field
                label="Full name"
                name="fullName"
                value={profile.fullName}
                onChange={updateProfile}
                required
              />
              <Field
                label="Email address"
                name="email"
                type="email"
                value={profile.email}
                onChange={updateProfile}
                required
              />
              <Field
                label="Mobile number"
                name="mobile"
                value={profile.mobile}
                onChange={updateProfile}
              />
              <Field
                label="Business name"
                name="businessName"
                value={profile.businessName}
                onChange={updateProfile}
              />
              <Field
                label="Business address"
                name="businessAddress"
                value={profile.businessAddress}
                onChange={updateProfile}
                wide
                placeholder="Street, city, state, PIN code"
              />
              <Field
                label="GSTIN (optional)"
                name="gstin"
                value={profile.gstin}
                onChange={updateProfile}
                placeholder="15-character GSTIN"
              />
            </div>
            {profileError && (
              <div className="auth-alert error settings-feedback">{profileError}</div>
            )}
            {emailNotice && <div className="settings-feedback">{emailNotice}</div>}
            {verificationLink && (
              <div className="settings-feedback">
                <a href={verificationLink}>Confirm email change</a>
              </div>
            )}
            <div className="settings-save">
              <button className="button-primary" type="submit" disabled={profileBusy}>
                {profileBusy ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
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
