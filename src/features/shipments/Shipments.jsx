import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Plus,
  SlidersHorizontal,
  Search,
} from 'lucide-react';
import { PageTitle, ShipmentTable } from '../../components/shared.jsx';
function Shipments({
  shipments,
  query,
  setQuery,
  statusFilter,
  setStatusFilter,
  exportCsv,
  setTracking,
  go,
}) {
  return (
    <>
      <PageTitle
        eyebrow="YOUR SHIPPING ACTIVITY"
        title="Shipments"
        subtitle="Manage and track every parcel, all in one place."
        action={
          <button className="button-primary" onClick={() => go('Book shipment')}>
            <Plus size={17} /> Book a shipment
          </button>
        }
      />
      <div className="shipment-summary">
        <div>
          <span className="summary-dot purple-dot" />
          <b>{shipments.length}</b>
          <span>shipments found</span>
        </div>
        <span className="summary-separator" />
        <span>Updated just now</span>
      </div>
      <section className="panel all-shipments">
        <div className="list-toolbar">
          <div className="list-filters">
            <label className="search-field">
              <Search size={16} />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search shipments..."
              />
            </label>
            <label className="filter-select">
              <Filter size={15} />
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option>All shipments</option>
                {[
                  'In transit',
                  'Pickup scheduled',
                  'Delivered',
                  'Out for delivery',
                  'Exception',
                ].map(x => (
                  <option key={x}>{x}</option>
                ))}
              </select>
              <ChevronDown size={13} />
            </label>
            <button className="filter-select date-filter" onClick={() => {}}>
              <SlidersHorizontal size={15} />
              Date range
              <ChevronDown size={13} />
            </button>
          </div>
          <button className="button-secondary" onClick={exportCsv}>
            <Download size={15} /> Export CSV
          </button>
        </div>
        <div className="full-table">
          <ShipmentTable shipments={shipments} setTracking={setTracking} />
        </div>
        <div className="table-footer">
          <span>
            Showing{' '}
            <b>
              {shipments.length ? 1 : 0}–{shipments.length}
            </b>{' '}
            of <b>{shipments.length}</b> shipments
          </span>
          <div className="pagination">
            <button disabled>
              <ChevronLeft size={15} />
            </button>
            <button className="current">1</button>
            <button disabled>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
export default Shipments;
