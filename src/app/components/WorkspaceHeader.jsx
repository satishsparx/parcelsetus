import { Bell, ChevronDown, ChevronRight, Menu, Search } from 'lucide-react';

export default function WorkspaceHeader({ page, onSearch, onNotify, onOpenMobileNav, onNavigate }) {
  return (
    <header className="topbar">
      <button className="mobile-menu" onClick={onOpenMobileNav} aria-label="Open menu">
        <Menu size={19} />
      </button>
      <div className="breadcrumb">
        Workspace <ChevronRight size={14} /> <b>{page}</b>
      </div>
      <div className="top-actions">
        <div className="search-global">
          <Search size={16} />
          <input
            placeholder="Search anything..."
            onChange={event => onSearch(event.target.value)}
          />
          <kbd>⌘ K</kbd>
        </div>
        <button className="icon-button" aria-label="Notifications" onClick={onNotify}>
          <Bell size={18} />
          <i />
        </button>
        <div className="top-divider" />
        <button className="top-profile" onClick={() => onNavigate('Settings')}>
          <div className="profile-avatar small">PS</div>
          <ChevronDown size={14} />
        </button>
      </div>
    </header>
  );
}
