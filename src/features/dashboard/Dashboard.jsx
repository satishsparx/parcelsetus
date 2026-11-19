import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  MapPin,
  Package,
  Plus,
  Search,
  Sparkles,
  Truck,
} from 'lucide-react';
import { Metric, PageTitle, ShipmentTable } from '../../components/shared.jsx';
function Dashboard({ user, shipments, go, setTracking, range, setRange }) {
  const count = s => shipments.filter(x => x.status === s).length;
  const firstName = user?.fullName?.trim().split(/\s+/)[0] || 'there';
  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
    .format(new Date())
    .toUpperCase();
  const delivered = count('Delivered'),
    transit = shipments.filter(x => ['In transit', 'Out for delivery'].includes(x.status)).length;
  return (
    <>
      <PageTitle
        eyebrow={today}
        title={`Good morning, ${firstName} 👋`}
        subtitle="Here’s what’s happening with your shipments today."
        action={
          <button className="button-primary" onClick={() => go('Book shipment')}>
            <Plus size={17} /> Book a shipment
          </button>
        }
      />
      <div className="overview-toolbar">
        <div className="live-pill">
          <span /> All systems operational
        </div>
        <button
          className="select-button"
          onClick={() => setRange(range === 'Last 30 days' ? 'This month' : 'Last 30 days')}
        >
          {range}
          <ChevronDown size={14} />
        </button>
      </div>
      <div className="metric-grid">
        <Metric
          label="Total shipments"
          value={shipments.length.toString().padStart(2, '0')}
          delta="12.8%"
          positive
          sub="vs. previous period"
          icon={Package}
          color="violet"
          spark={[14, 22, 18, 28, 20, 34, 28, 39, 30, 44, 35, 50]}
        />
        <Metric
          label="Delivered"
          value={delivered.toString().padStart(2, '0')}
          delta="8.2%"
          positive
          sub="vs. previous period"
          icon={Check}
          color="green"
          spark={[22, 18, 24, 19, 31, 24, 35, 28, 40, 34, 47, 42]}
        />
        <Metric
          label="In transit"
          value={transit.toString().padStart(2, '0')}
          delta="3.1%"
          positive
          sub="vs. previous period"
          icon={Truck}
          color="blue"
          spark={[17, 25, 20, 32, 25, 29, 38, 33, 45, 38, 49, 44]}
        />
        <Metric
          label="Needs attention"
          value={count('Exception').toString().padStart(2, '0')}
          delta="2 shipments"
          sub="Require your attention"
          icon={Activity}
          color="orange"
          spark={[35, 24, 32, 19, 30, 22, 28, 18, 26, 17, 22, 14]}
        />
      </div>
      <div className="dashboard-grid">
        <section className="panel shipment-panel">
          <div className="panel-heading">
            <div>
              <h2>Recent shipments</h2>
              <p>A quick look at your latest activity</p>
            </div>
            <button className="text-link" onClick={() => go('Shipments')}>
              View all shipments <ArrowRight size={14} />
            </button>
          </div>
          <ShipmentTable shipments={shipments.slice(0, 5)} setTracking={setTracking} compact />
        </section>
        <aside className="right-column">
          <section className="panel actions-panel">
            <div className="panel-heading">
              <div>
                <h2>Quick actions</h2>
                <p>Get things moving</p>
              </div>
              <Sparkles size={17} className="sparkle" />
            </div>
            <button className="quick-action primary-quick" onClick={() => go('Book shipment')}>
              <div className="quick-icon">
                <Plus size={18} />
              </div>
              <span>
                <b>Book a shipment</b>
                <small>Create a new shipment</small>
              </span>
              <ArrowRight size={16} />
            </button>
            <button className="quick-action" onClick={() => go('Shipments')}>
              <div className="quick-icon muted">
                <Search size={17} />
              </div>
              <span>
                <b>Track a shipment</b>
                <small>Find a parcel by AWB</small>
              </span>
              <ArrowRight size={16} />
            </button>
            <button className="quick-action" onClick={() => go('Address book')}>
              <div className="quick-icon muted">
                <MapPin size={17} />
              </div>
              <span>
                <b>Manage addresses</b>
                <small>Your saved locations</small>
              </span>
              <ArrowRight size={16} />
            </button>
          </section>
          <section className="shipping-tip">
            <div className="tip-top">
              <div className="tip-icon">
                <Sparkles size={16} />
              </div>
              <span>SHIPPING TIP</span>
              <ArrowUpRight size={15} />
            </div>
            <h3>Save more on every shipment</h3>
            <p>Compare delivery speeds and prices from all your couriers before you book.</p>
            <button onClick={() => go('Book shipment')}>
              Compare courier rates <ArrowRight size={14} />
            </button>
            <div className="tip-decoration">✳</div>
          </section>
        </aside>
      </div>
    </>
  );
}
export default Dashboard;
