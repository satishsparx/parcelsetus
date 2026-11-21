import { useEffect, useRef, useState } from 'react';
import API from '../../lib/api.js';

export default function useAuthentication(navigate, pathname) {
  const sessionLookupStarted = useRef(false);
  const [auth, setAuth] = useState(() =>
      new URLSearchParams(window.location.search).has('reset') ||
      !window.location.pathname.startsWith('/app')
        ? null
        : undefined,
    ),
    [authView, setAuthView] = useState(() => {
      const params = new URLSearchParams(window.location.search);
      return params.has('verify') ? 'verifying' : params.has('reset') ? 'reset' : 'login';
    }),
    [authToken] = useState(() => {
      const params = new URLSearchParams(window.location.search);
      return params.get('verify') || params.get('reset') || '';
    }),
    [authMessage, setAuthMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verify = params.get('verify');
    const reset = params.get('reset');
    const changeEmail = params.get('changeEmail');

    if (verify) {
      fetch(`${API}/auth/verify-email`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verify }),
      })
        .then(response => response.json().then(data => ({ ok: response.ok, data })))
        .then(({ ok, data }) => {
          history.replaceState({}, '', window.location.pathname);
          if (ok) {
            setAuth(data.user);
            setAuthView('login');
          } else {
            setAuth(null);
            setAuthView('verify-error');
            setAuthMessage(data.error);
          }
        })
        .catch(() => {
          setAuth(null);
          setAuthView('verify-error');
          setAuthMessage('Could not reach the server. Please try the verification link again.');
        });
      return;
    }

    if (changeEmail) {
      fetch(`${API}/auth/verify-email-change`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: changeEmail }),
      })
        .then(response => response.json().then(data => ({ ok: response.ok, data })))
        .then(async ({ ok, data }) => {
          history.replaceState({}, '', window.location.pathname);
          setAuthView('login');
          if (!ok) {
            setAuth(null);
            setAuthMessage(data.error || 'Could not update your email address.');
            return;
          }

          const current = await fetch(`${API}/auth/me`, { credentials: 'include' }).catch(
            () => null,
          );
          const currentData = current?.ok ? await current.json() : null;
          if (currentData?.user) {
            setAuth(currentData.user);
            navigate('/app/settings');
          } else {
            setAuth(null);
            setAuthMessage('Email updated. Sign in with your new email address.');
          }
        })
        .catch(() => {
          history.replaceState({}, '', window.location.pathname);
          setAuth(null);
          setAuthView('login');
          setAuthMessage('Could not reach the server to update your email address.');
        });
      return;
    }

    if (reset) return;
    if (!pathname.startsWith('/app')) {
      sessionLookupStarted.current = false;
      return;
    }
    if (auth || sessionLookupStarted.current) return;

    sessionLookupStarted.current = true;
    fetch(`${API}/auth/me`, { credentials: 'include' })
      .then(response => (response.ok ? response.json() : null))
      .then(data => setAuth(data?.user || null))
      .catch(() => setAuth(null));
  }, [navigate, pathname, auth]);

  return {
    auth,
    setAuth,
    authView,
    setAuthView,
    authToken,
    authMessage,
    setAuthMessage,
  };
}
