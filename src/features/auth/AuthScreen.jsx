import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, Clock3, Package, ShieldCheck, Sparkles, X } from 'lucide-react';
import API from '../../lib/api.js';
function AuthScreen({ view, setView, token, message, setMessage, onAuth }) {
  const [form, setForm] = useState({
      fullName: '',
      email: '',
      mobile: '',
      password: '',
      businessName: '',
      accountType: 'Individual',
      confirmPassword: '',
    }),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [devLink, setDevLink] = useState('');
  const formRef = useRef(form);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const updateForm = nextForm => {
    formRef.current = nextForm;
    setForm(nextForm);
  };
  const update = e => updateForm({ ...formRef.current, [e.target.name]: e.target.value });
  useEffect(() => {
    if (!googleClientId || !['login', 'register'].includes(view)) return;
    let mounted = true;
    const init = () => {
      if (!mounted || !window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async response => {
          setBusy(true);
          setError('');
          const current = formRef.current;
          try {
            const r = await fetch(`${API}/auth/google`, {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                credential: response.credential,
                accountType: current.accountType,
                businessName: current.businessName,
                mobile: current.mobile,
              }),
            });
            const d = await r.json();
            if (!r.ok) throw new Error(d.error || 'Google sign-in failed.');
            onAuth(d.user);
          } catch (e) {
            setError(e.message);
          } finally {
            setBusy(false);
          }
        },
      });
      const el = document.getElementById('google-signin-button');
      if (el) {
        el.innerHTML = '';
        window.google.accounts.id.renderButton(el, {
          theme: 'outline',
          size: 'large',
          shape: 'rectangular',
          text: 'continue_with',
          width: 340,
          logo_alignment: 'left',
        });
      }
    };
    if (window.google?.accounts?.id) init();
    else {
      let script = document.querySelector('script[data-google-identity]');
      if (!script) {
        script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.dataset.googleIdentity = 'true';
        script.onload = init;
        document.head.appendChild(script);
      } else script.addEventListener('load', init);
    }
    return () => {
      mounted = false;
    };
  }, [view, googleClientId, onAuth]);
  const submit = async e => {
    e.preventDefault();
    setError('');
    setMessage('');
    setDevLink('');
    if (view === 'register' && form.password !== form.confirmPassword) {
      setError('Your passwords do not match.');
      return;
    }
    setBusy(true);
    let endpoint, body;
    if (view === 'register') {
      endpoint = 'register';
      body = {
        fullName: form.fullName,
        email: form.email,
        mobile: form.mobile,
        password: form.password,
        businessName: form.businessName,
        accountType: form.accountType,
      };
    } else if (view === 'login') {
      endpoint = 'login';
      body = { email: form.email, password: form.password };
    } else if (view === 'forgot') {
      endpoint = 'forgot-password';
      body = { email: form.email };
    } else {
      endpoint = 'reset-password';
      body = { token, password: form.password };
    }
    try {
      const response = await fetch(`${API}/auth/${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.code === 'EMAIL_NOT_VERIFIED') {
          setView('check-email');
          setMessage(data.error);
          return;
        }
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }
      if (view === 'login') {
        onAuth(data.user);
        return;
      }
      if (view === 'register') {
        setView('check-email');
        setMessage(data.message);
        setDevLink(data.developmentLink || '');
        return;
      }
      if (view === 'forgot') {
        setView('reset-sent');
        setMessage(data.message);
        setDevLink(data.developmentLink || '');
        return;
      }
      setView('login');
      setMessage('Password updated. Sign in with your new password.');
      history.replaceState({}, '', window.location.pathname);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const resend = async () => {
    setError('');
    try {
      const r = await fetch(`${API}/auth/resend-verification`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setMessage(d.message);
      setDevLink(d.developmentLink || '');
    } catch (e) {
      setError(e.message);
    }
  };
  const heading = {
    login: ['Welcome back', 'Sign in to manage your shipments.'],
    register: ['Create your account', 'Start shipping smarter with ParcelSetus.'],
    forgot: ['Forgot your password?', 'We’ll email you a link to reset it.'],
    reset: ['Create a new password', 'Choose a strong password you haven’t used before.'],
    'check-email': ['Check your inbox', 'One quick step to activate your account.'],
    'reset-sent': ['Check your inbox', 'If the email exists, reset instructions are on the way.'],
    verifying: ['Verifying your email', 'Please wait while we activate your account.'],
    'verify-error': [
      'Verification link expired',
      'Request a fresh verification email to continue.',
    ],
  }[view] || ['Welcome', ''];
  const isForm = ['login', 'register', 'forgot', 'reset'].includes(view);
  return (
    <main className="auth-page">
      <section className="auth-visual">
        <div className="auth-brand">
          <div className="brand-icon">
            <Package size={20} />
          </div>
          <span>
            parcel<span>setus</span>
          </span>
        </div>
        <div className="auth-visual-copy">
          <div className="auth-chip">
            <Sparkles size={14} /> SHIPPING, SIMPLIFIED
          </div>
          <h1>
            Every shipment,
            <br />
            <em>closer to delivered.</em>
          </h1>
          <p>
            One place for every parcel. Compare couriers, book in seconds, and keep every delivery
            in view.
          </p>
          <div className="auth-visual-art">
            <div className="auth-orbit orbit-one" />
            <div className="auth-orbit orbit-two" />
            <div className="auth-box">
              <Package size={45} />
            </div>
            <div className="auth-route route-one">
              <span />
              <i />
              <b>DELHIVERY</b>
              <strong>2–3 days</strong>
            </div>
            <div className="auth-route route-two">
              <span />
              <i />
              <b>INDIA POST</b>
              <strong>3–5 days</strong>
            </div>
            <div className="auth-route route-three">
              <span />
              <i />
              <b>SHADOWFAX</b>
              <strong>1–2 days</strong>
            </div>
          </div>
        </div>
        <div className="auth-visual-foot">
          <span>
            <ShieldCheck size={15} /> Your shipping, all together
          </span>
          <span>© 2026 ParcelSetus</span>
        </div>
      </section>
      <section className="auth-panel">
        <div className="auth-mobile-brand">
          <div className="brand-icon">
            <Package size={18} />
          </div>
          <b>
            parcel<span>setus</span>
          </b>
        </div>
        <div className="auth-card">
          <div className="eyebrow">
            {view === 'register'
              ? 'GET STARTED'
              : view === 'login'
                ? 'SELLER PORTAL'
                : 'ACCOUNT ACCESS'}
          </div>
          <h2>{heading[0]}</h2>
          <p className="auth-subtitle">{heading[1]}</p>
          {isForm && (
            <form className="auth-form" onSubmit={submit}>
              {view === 'register' && (
                <>
                  <label className="auth-label">
                    Full name
                    <input
                      autoComplete="name"
                      name="fullName"
                      value={form.fullName}
                      onChange={update}
                      placeholder="Your name"
                      required
                      minLength={2}
                    />
                  </label>
                  <label className="auth-label">
                    I’m signing up as
                    <div className="account-type-picker">
                      {['Individual', 'Business'].map(x => (
                        <button
                          type="button"
                          key={x}
                          className={form.accountType === x ? 'selected' : ''}
                          onClick={() => updateForm({ ...formRef.current, accountType: x })}
                        >
                          {x}
                        </button>
                      ))}
                    </div>
                  </label>
                  {form.accountType === 'Business' && (
                    <label className="auth-label">
                      Business name <span className="optional-label">Optional</span>
                      <input
                        autoComplete="organization"
                        name="businessName"
                        value={form.businessName}
                        onChange={update}
                        placeholder="Your business name"
                      />
                    </label>
                  )}
                  <div className="auth-two-fields">
                    <label className="auth-label">
                      Email address
                      <input
                        autoComplete="email"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={update}
                        placeholder="you@company.com"
                        required
                      />
                    </label>
                    <label className="auth-label">
                      Mobile <span className="optional-label">Optional</span>
                      <input
                        autoComplete="tel"
                        name="mobile"
                        value={form.mobile}
                        onChange={update}
                        placeholder="+91 98765 43210"
                      />
                    </label>
                  </div>
                </>
              )}
              {(view === 'login' || view === 'forgot') && (
                <label className="auth-label">
                  Email address
                  <input
                    autoComplete="email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={update}
                    placeholder="you@company.com"
                    required
                  />
                </label>
              )}
              {(view === 'login' || view === 'register' || view === 'reset') && (
                <label className="auth-label">
                  {view === 'reset' ? 'New password' : 'Password'}
                  <input
                    autoComplete={view === 'login' ? 'current-password' : 'new-password'}
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={update}
                    placeholder={
                      view === 'login' ? 'Enter your password' : 'At least 10 characters'
                    }
                    required
                    minLength={view === 'login' ? 1 : 10}
                    maxLength={128}
                  />
                  {view === 'register' && <small>Use at least 10 characters.</small>}
                </label>
              )}
              {view === 'register' && (
                <label className="auth-label">
                  Confirm password
                  <input
                    autoComplete="new-password"
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={update}
                    placeholder="Enter your password again"
                    required
                    minLength={10}
                  />
                </label>
              )}
              {error && (
                <div className="auth-alert error">
                  <X size={15} />
                  {error}
                </div>
              )}
              {message && view === 'login' && (
                <div className="auth-alert success">
                  <Check size={15} />
                  {message}
                </div>
              )}
              {view === 'login' && (
                <button
                  type="button"
                  className="forgot-link"
                  onClick={() => {
                    setError('');
                    setView('forgot');
                  }}
                >
                  Forgot password?
                </button>
              )}
              <button className="auth-submit" type="submit" disabled={busy}>
                {busy
                  ? 'Please wait…'
                  : view === 'login'
                    ? 'Sign in'
                    : view === 'register'
                      ? 'Create account'
                      : view === 'forgot'
                        ? 'Send reset link'
                        : 'Update password'}
                <ArrowRight size={17} />
              </button>
            </form>
          )}
          {['check-email', 'reset-sent', 'verifying', 'verify-error'].includes(view) && (
            <div className="auth-message-box">
              <div className={`auth-message-icon ${view === 'verify-error' ? 'warn' : ''}`}>
                {view === 'verifying' ? (
                  <Clock3 size={22} />
                ) : view === 'verify-error' ? (
                  <X size={22} />
                ) : (
                  <Check size={22} />
                )}
              </div>
              <b>
                {view === 'check-email'
                  ? 'Verification required'
                  : view === 'verify-error'
                    ? 'Your link needs a refresh'
                    : view === 'verifying'
                      ? 'Checking verification…'
                      : 'Email sent'}
              </b>
              <p>
                {message ||
                  (view === 'check-email'
                    ? 'We sent a verification link. Open it to activate your account.'
                    : view === 'verify-error'
                      ? 'Request a new verification link and we’ll send it to your email.'
                      : 'Check your email for the next step.')}
              </p>
              {devLink && (
                <a className="dev-link" href={devLink}>
                  Open development email link <ArrowRight size={14} />
                </a>
              )}
              {view === 'check-email' && (
                <button className="auth-text-button" onClick={resend}>
                  Resend verification email
                </button>
              )}
              {view === 'verify-error' && (
                <button className="auth-submit" onClick={() => setView('check-email')}>
                  Request a new link <ArrowRight size={17} />
                </button>
              )}
            </div>
          )}
          {['login', 'register'].includes(view) && (
            <>
              <div className="auth-divider">
                <span />
                or continue with
                <span />
              </div>
              {googleClientId ? (
                <div className="google-button-wrap">
                  <div id="google-signin-button" />
                </div>
              ) : (
                <button
                  className="google-fallback"
                  disabled
                  title="Configure VITE_GOOGLE_CLIENT_ID and GOOGLE_CLIENT_ID to enable"
                >
                  <span className="google-g">G</span>Continue with Google
                </button>
              )}
            </>
          )}
          {view === 'login' && (
            <p className="auth-switch">
              New to ParcelSetus?{' '}
              <button
                onClick={() => {
                  setError('');
                  setMessage('');
                  setView('register');
                }}
              >
                Create an account
              </button>
            </p>
          )}
          {view === 'register' && (
            <p className="auth-switch">
              Already have an account?{' '}
              <button
                onClick={() => {
                  setError('');
                  setMessage('');
                  setView('login');
                }}
              >
                Sign in
              </button>
            </p>
          )}
          {view === 'forgot' && (
            <p className="auth-switch">
              <button onClick={() => setView('login')}>Back to sign in</button>
            </p>
          )}
          {['check-email', 'reset-sent', 'verify-error'].includes(view) && (
            <p className="auth-switch">
              <button
                onClick={() => {
                  setError('');
                  setView('login');
                }}
              >
                Back to sign in
              </button>
            </p>
          )}
        </div>
        <div className="auth-panel-foot">
          <ShieldCheck size={14} />
          Your account is protected with secure sign-in.
        </div>
      </section>
    </main>
  );
}
export default AuthScreen;
