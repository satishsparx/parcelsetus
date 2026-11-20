import { Check, X } from 'lucide-react';
import BookingModal from '../../features/booking/BookingModal.jsx';
import TrackingModal from '../../features/shipments/TrackingModal.jsx';
import WorkspaceHeader from './WorkspaceHeader.jsx';
import WorkspaceSidebar from './WorkspaceSidebar.jsx';

export default function WorkspaceLayout({
  user,
  page,
  shipmentCount,
  mobileNav,
  onMobileNav,
  onNavigate,
  onLogout,
  onNotify,
  onSearch,
  children,
  bookingOpen,
  addresses,
  onBooked,
  tracking,
  onCloseTracking,
  toast,
  onClearToast,
}) {
  return (
    <div className="app-shell">
      <WorkspaceSidebar
        user={user}
        page={page}
        shipmentCount={shipmentCount}
        mobileNav={mobileNav}
        onCloseMobileNav={() => onMobileNav(false)}
        onNavigate={onNavigate}
        onLogout={onLogout}
        onNotify={onNotify}
      />
      <main className="main-area">
        <WorkspaceHeader
          page={page}
          onSearch={onSearch}
          onNotify={() => onNotify('You’re all caught up.')}
          onOpenMobileNav={() => onMobileNav(true)}
          onNavigate={onNavigate}
        />
        <div className="content-wrap">{children}</div>
      </main>
      {bookingOpen && (
        <BookingModal
          onClose={() => onNavigate('Overview')}
          addresses={addresses}
          onBooked={onBooked}
        />
      )}
      {tracking && <TrackingModal shipment={tracking} onClose={onCloseTracking} />}
      {toast && (
        <div className="toast">
          <Check size={16} />
          {toast}
          <button onClick={onClearToast} aria-label="Dismiss notification">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
