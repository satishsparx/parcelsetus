import {
  ArrowUpRight,
  ChevronDown,
  CircleHelp,
  LayoutDashboard,
  LogOut,
  MapPin,
  MoreHorizontal,
  Package,
  Plus,
  Settings,
  Wallet,
  X,
} from 'lucide-react';

const navigation = [
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

export default function WorkspaceSidebar({
  user,
  page,
  shipmentCount,
  mobileNav,
  onCloseMobileNav,
  onNavigate,
  onLogout,
  onNotify,
}) {
  const initials =
    user.fullName
      ?.split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('') || 'PS';

  return (
    <>
      <aside className={`sidebar ${mobileNav ? 'mobile-open' : ''}`}>
        <div className="brand">
          <div className="brand-icon">
            <Package size={20} strokeWidth={2.4} />
          </div>
          <span>
            parcel<span className="brand-light">setus</span>
          </span>
          <button className="sidebar-close" onClick={onCloseMobileNav} aria-label="Close menu">
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
        {navigation.map(group => (
          <div className="nav-group" key={group.label}>
            <div className="nav-label">{group.label}</div>
            {group.items.map(([name, Icon]) => (
              <button
                key={name}
                className={`nav-item ${page === name ? 'active' : ''}`}
                onClick={() => onNavigate(name)}
              >
                <Icon size={17} strokeWidth={1.8} />
                <span>{name}</span>
                {name === 'Shipments' && <span className="nav-count">{shipmentCount}</span>}
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
            <button onClick={() => onNotify('Support: hello@parcelsetus.com')}>
              Visit help centre <ArrowUpRight size={13} />
            </button>
          </div>
          <button className="profile-row" onClick={() => onNavigate('Settings')}>
            <div className="profile-avatar">{initials}</div>
            <div className="profile-copy">
              <b>{user.fullName}</b>
              <span>{user.email}</span>
            </div>
            <MoreHorizontal size={18} />
          </button>
          <button className="sidebar-logout" onClick={onLogout}>
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>
      {mobileNav && <div className="nav-scrim" onClick={onCloseMobileNav} />}
    </>
  );
}
