import { useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import AuthScreen from './features/auth/AuthScreen.jsx';
import LandingPage from './features/landing/LandingPage.jsx';
import Dashboard from './features/dashboard/Dashboard.jsx';
import Shipments from './features/shipments/Shipments.jsx';
import AddressBook from './features/addresses/AddressBook.jsx';
import Payments from './features/payments/Payments.jsx';
import SettingsPage from './features/settings/SettingsPage.jsx';
import WorkspaceLayout from './app/components/WorkspaceLayout.jsx';
import useAuthentication from './app/hooks/useAuthentication.js';
import useToast from './app/hooks/useToast.js';
import useWorkspaceData from './app/hooks/useWorkspaceData.js';
import API from './lib/api.js';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const authState = useAuthentication(navigate);
  const { auth, setAuth, authView, setAuthView, authToken, authMessage, setAuthMessage } =
    authState;
  const { toast, setToast, notify } = useToast();
  const workspaceData = useWorkspaceData(auth);
  const [mobileNav, setMobileNav] = useState(false);
  const bookingOpen = location.pathname === '/app/book';

  if (auth === undefined) {
    return (
      <div className="auth-loading">
        <div className="brand-icon">
          <Package size={20} />
        </div>
        <span>Loading your workspace…</span>
      </div>
    );
  }

  const go = label => {
    const paths = {
      Overview: '/app',
      Shipments: '/app/shipments',
      'Book shipment': '/app/book',
      'Address book': '/app/addresses',
      Payments: '/app/payments',
      Settings: '/app/settings',
    };
    navigate(paths[label] || '/app');
    setMobileNav(false);
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
    setAuthView('login');
    navigate('/');
    notify('You have been signed out.');
  };

  const onBooked = shipment => {
    workspaceData.addBookedShipment(shipment);
    if (shipment) {
      navigate('/app/shipments');
      notify('Payment verified and shipment booked successfully.');
    }
  };

  const changeAuthView = view => {
    setAuthView(view);
    if (view === 'register') navigate('/sign-up');
    if (view === 'login') navigate('/sign-in');
  };
  const handleAuth = user => {
    setAuth(user);
    navigate('/app', { replace: true });
  };
  const authScreen = view => (
    <AuthScreen
      view={view}
      setView={changeAuthView}
      token={authToken}
      message={authMessage}
      setMessage={setAuthMessage}
      onAuth={handleAuth}
      onHome={() => navigate('/')}
    />
  );

  const exportCsv = () => {
    const csv = [
      'Shipment ID,AWB,Provider,Recipient,Destination,Date,Amount,Status',
      ...workspaceData.visibleShipments.map(shipment =>
        [
          shipment.id,
          shipment.awb,
          shipment.provider,
          shipment.recipient,
          shipment.destination,
          shipment.date,
          shipment.amount,
          shipment.status,
        ].join(','),
      ),
    ].join('\n');
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    anchor.download = 'parcelsetus-shipments.csv';
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  };

  const workspacePage = (title, content) => {
    if (!auth) return <Navigate to="/sign-in" replace />;
    return (
      <WorkspaceLayout
        user={auth}
        page={title}
        shipmentCount={workspaceData.shipments.length}
        mobileNav={mobileNav}
        onMobileNav={setMobileNav}
        onNavigate={go}
        onLogout={() => logout(false)}
        onNotify={notify}
        onSearch={workspaceData.setQuery}
        bookingOpen={bookingOpen}
        addresses={workspaceData.addresses}
        onBooked={onBooked}
        tracking={workspaceData.tracking}
        onCloseTracking={() => workspaceData.setTracking(null)}
        toast={toast}
        onClearToast={() => setToast('')}
      >
        {content}
      </WorkspaceLayout>
    );
  };

  const overview = (
    <Dashboard
      user={auth}
      shipments={workspaceData.shipments}
      go={go}
      setTracking={workspaceData.setTracking}
      range={workspaceData.range}
      setRange={workspaceData.setRange}
    />
  );

  const rootAuthView = ['reset', 'verifying', 'verify-error'].includes(authView);

  return (
    <Routes>
      <Route
        path="/"
        element={
          auth ? (
            <Navigate to="/app" replace />
          ) : rootAuthView ? (
            authScreen(authView)
          ) : (
            <LandingPage />
          )
        }
      />
      <Route
        path="/sign-in"
        element={
          auth ? (
            <Navigate to="/app" replace />
          ) : (
            authScreen(authView === 'forgot' ? 'forgot' : 'login')
          )
        }
      />
      <Route
        path="/sign-up"
        element={auth ? <Navigate to="/app" replace /> : authScreen('register')}
      />
      <Route path="/app" element={workspacePage('Overview', overview)} />
      <Route
        path="/app/shipments"
        element={workspacePage(
          'Shipments',
          <Shipments
            shipments={workspaceData.visibleShipments}
            query={workspaceData.query}
            setQuery={workspaceData.setQuery}
            statusFilter={workspaceData.statusFilter}
            setStatusFilter={workspaceData.setStatusFilter}
            exportCsv={exportCsv}
            setTracking={workspaceData.setTracking}
            go={go}
          />,
        )}
      />
      <Route
        path="/app/addresses"
        element={workspacePage(
          'Address book',
          <AddressBook
            addresses={workspaceData.addresses}
            setAddresses={workspaceData.setAddresses}
            notify={notify}
          />,
        )}
      />
      <Route
        path="/app/payments"
        element={workspacePage(
          'Payments',
          <Payments payments={workspaceData.payments} notify={notify} />,
        )}
      />
      <Route
        path="/app/settings"
        element={workspacePage(
          'Settings',
          <SettingsPage
            user={auth}
            onUser={setAuth}
            notify={notify}
            onLogoutAll={() => logout(true)}
          />,
        )}
      />
      <Route path="/app/book" element={workspacePage('Overview', overview)} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
