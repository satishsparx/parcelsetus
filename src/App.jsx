import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Settings,
  Wallet,
  X,
} from 'lucide-react';
import API from './lib/api.js';
import AuthScreen from './features/auth/AuthScreen.jsx';
import Dashboard from './features/dashboard/Dashboard.jsx';
import Shipments from './features/shipments/Shipments.jsx';
import BookingModal from './features/booking/BookingModal.jsx';
import TrackingModal from './features/shipments/TrackingModal.jsx';
import AddressBook from './features/addresses/AddressBook.jsx';
import Payments from './features/payments/Payments.jsx';
import SettingsPage from './features/settings/SettingsPage.jsx';
function App() {
  const [auth, setAuth] = useState(() =>
      new URLSearchParams(window.location.search).has('reset') ? null : undefined,
    ),
    [authView, setAuthView] = useState(() => {
      const params = new URLSearchParams(window.location.search);
      return params.has('verify') ? 'verifying' : params.has('reset') ? 'reset' : 'login';
    }),
    [authToken] = useState(() => {
      const params = new URLSearchParams(window.location.search);
      return params.get('verify') || params.get('reset') || '';
    }),
    [page, setPage] = useState('Overview'),
    [shipments, setShipments] = useState([]),
    [addresses, setAddresses] = useState([]),
    [query, setQuery] = useState(''),
    [statusFilter, setStatusFilter] = useState('All shipments'),
    [bookOpen, setBookOpen] = useState(false),
    [tracking, setTracking] = useState(null),
    [toast, setToast] = useState(''),
    [mobileNav, setMobileNav] = useState(false),
    [range, setRange] = useState('Last 30 days'),
    [authMessage, setAuthMessage] = useState('');
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verify = params.get('verify'),
      reset = params.get('reset');
    if (verify) {
      fetch(`${API}/auth/verify-email`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verify }),
      })
        .then(r => r.json().then(d => ({ ok: r.ok, data: d })))
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
    if (reset) return;
    fetch(`${API}/auth/me`, { credentials: 'include' })
      .then(r => (r.ok ? r.json() : null))
      .then(d => setAuth(d?.user || null))
      .catch(() => setAuth(null));
  }, []);
  useEffect(() => {
    if (!auth) return;
    fetch(`${API}/shipments`, { credentials: 'include' })
      .then(r => (r.ok ? r.json() : null))
      .then(x => Array.isArray(x) && setShipments(x))
      .catch(() => {});
    fetch(`${API}/addresses`, { credentials: 'include' })
      .then(r => (r.ok ? r.json() : null))
      .then(x => x && setAddresses(x))
      .catch(() => {});
  }, [auth]);
  if (auth === undefined)
    return (
      <div className="auth-loading">
        <div className="brand-icon">
          <Package size={20} />
        </div>
        <span>Loading your workspace…</span>
      </div>
    );
  if (!auth)
    return (
      <AuthScreen
        view={authView}
        setView={setAuthView}
        token={authToken}
        message={authMessage}
        setMessage={setAuthMessage}
        onAuth={setAuth}
      />
    );
  const notify = s => {
    setToast(s);
    setTimeout(() => setToast(''), 3200);
  };
  const logout = async (all = false) => {
    try {
      const response = await fetch(`${API}/auth/${all ? 'logout-all' : 'logout'}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Sign out could not be completed. Please try again.');
    } catch (error) {
      notify(error.message || 'Sign out could not be completed. Please try again.');
      return;
    }
    setAuth(null);
    setPage('Overview');
    setAuthView('login');
    notify('You have been signed out.');
  };
  const visible = shipments.filter(
    s =>
      (statusFilter === 'All shipments' || s.status === statusFilter) &&
      `${s.id} ${s.awb} ${s.recipient} ${s.provider}`.toLowerCase().includes(query.toLowerCase()),
  );
  const nav = [
    {
      label: 'WORKSPACE',
      items: [
        ['Overview', LayoutDashboard],
        ['Shipments', Package],
        ['Book shipment', Plus],
        ['Address book', MapPin],
      ],
    },
    {
      label: 'ACCOUNT',
      items: [
        ['Payments', Wallet],
        ['Settings', Settings],
      ],
    },
  ];
  const go = v => {
    if (v === 'Book shipment') {
      setBookOpen(true);
      return;
    }
    setPage(v);
    setMobileNav(false);
  };
  const createBooking = shipment => {
    setShipments(s => [shipment, ...s]);
    setBookOpen(false);
    setPage('Shipments');
    notify('Shipment booked successfully. Your label is ready.');
    fetch(`${API}/shipments`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': shipment.id },
      body: JSON.stringify(shipment),
    }).catch(() => {});
  };
  const exportCsv = () => {
    const csv = [
      'Shipment ID,AWB,Provider,Recipient,Destination,Date,Amount,Status',
      ...visible.map(s =>
        [s.id, s.awb, s.provider, s.recipient, s.destination, s.date, s.amount, s.status].join(','),
      ),
    ].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'parcelsetus-shipments.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'mobile-open' : ''}`}>
        <div className="brand">
          <div className="brand-icon">
            <Package size={20} strokeWidth={2.4} />
          </div>
          <span>
            parcel<span className="brand-light">setus</span>
          </span>
          <button className="sidebar-close" onClick={() => setMobileNav(false)}>
            <X size={18} />
          </button>
        </div>
        <div className="workspace-switch">
          <div className="workspace-avatar">P</div>
          <div className="workspace-copy">
            <b>ParcelSetus Store</b>
            <span>Business account</span>
          </div>
          <ChevronDown size={15} />
        </div>
        {nav.map(group => (
          <div className="nav-group" key={group.label}>
            <div className="nav-label">{group.label}</div>
            {group.items.map(([name, Icon]) => (
              <button
                key={name}
                className={`nav-item ${page === name ? 'active' : ''}`}
                onClick={() => go(name)}
              >
                <Icon size={17} strokeWidth={1.8} />
                <span>{name}</span>
                {name === 'Shipments' && <span className="nav-count">{shipments.length}</span>}
              </button>
            ))}
          </div>
        ))}
        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">
              <CircleHelp size={17} />
            </div>
            <b>Need a hand?</b>
            <p>Our shipping experts are here for you.</p>
            <button onClick={() => notify('Support: hello@parcelsetus.com')}>
              Visit help centre <ArrowUpRight size={13} />
            </button>
          </div>
          <button className="profile-row" onClick={() => setPage('Settings')}>
            <div className="profile-avatar">
              {auth.fullName
                ?.split(' ')
                .map(x => x[0])
                .slice(0, 2)
                .join('') || 'PS'}
            </div>
            <div className="profile-copy">
              <b>{auth.fullName}</b>
              <span>{auth.email}</span>
            </div>
            <MoreHorizontal size={18} />
          </button>
          <button className="sidebar-logout" onClick={() => logout(false)}>
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>
      {mobileNav && <div className="nav-scrim" onClick={() => setMobileNav(false)} />}
      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileNav(true)}>
            <Menu size={19} />
          </button>
          <div className="breadcrumb">
            Workspace <ChevronRight size={14} /> <b>{page}</b>
          </div>
          <div className="top-actions">
            <div className="search-global">
              <Search size={16} />
              <input placeholder="Search anything..." onChange={e => setQuery(e.target.value)} />
              <kbd>⌘ K</kbd>
            </div>
            <button
              className="icon-button"
              aria-label="Notifications"
              onClick={() => notify('You’re all caught up.')}
            >
              <Bell size={18} />
              <i />
            </button>
            <div className="top-divider" />
            <button className="top-profile" onClick={() => setPage('Settings')}>
              <div className="profile-avatar small">PS</div>
              <ChevronDown size={14} />
            </button>
          </div>
        </header>
        <div className="content-wrap">
          {page === 'Overview' ? (
            <Dashboard
              shipments={shipments}
              go={go}
              setTracking={setTracking}
              range={range}
              setRange={setRange}
            />
          ) : page === 'Shipments' ? (
            <Shipments
              shipments={visible}
              query={query}
              setQuery={setQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              exportCsv={exportCsv}
              setTracking={setTracking}
              go={go}
            />
          ) : page === 'Address book' ? (
            <AddressBook addresses={addresses} setAddresses={setAddresses} notify={notify} />
          ) : page === 'Payments' ? (
            <Payments notify={notify} />
          ) : page === 'Settings' ? (
            <SettingsPage
              user={auth}
              onUser={setAuth}
              notify={notify}
              onLogoutAll={() => logout(true)}
            />
          ) : (
            <Dashboard
              shipments={shipments}
              go={go}
              setTracking={setTracking}
              range={range}
              setRange={setRange}
            />
          )}
        </div>
      </main>
      {bookOpen && (
        <BookingModal
          onClose={() => setBookOpen(false)}
          addresses={addresses}
          onBooked={createBooking}
        />
      )}
      {tracking && <TrackingModal shipment={tracking} onClose={() => setTracking(null)} />}
      {toast && (
        <div className="toast">
          <Check size={16} />
          {toast}
          <button onClick={() => setToast('')}>
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
export default App;
