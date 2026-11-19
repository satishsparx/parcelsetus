import { ArrowUpRight } from 'lucide-react';
import { providerLetter, providerTone } from '../lib/carriers.js';
export function PageTitle({ eyebrow, title, subtitle, action }) {
  return (
    <div className="page-title-row">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

export function Metric({ label, value, delta, positive, sub, icon: Icon, color, spark }) {
  return (
    <div className="metric-card">
      <div className="metric-top">
        <span>{label}</span>
        <div className={`metric-icon ${color}`}>
          <Icon size={16} />
        </div>
      </div>
      <div className="metric-bottom">
        <div>
          <strong>{value}</strong>
          <div className="metric-delta">
            <b className={positive ? 'positive' : ''}>{delta}</b>
            <span>{sub}</span>
          </div>
        </div>
        <div className={`sparkline ${color}`}>
          {spark.map((h, i) => (
            <i key={i} style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ShipmentTable({ shipments, setTracking, compact = false }) {
  return (
    <div className="table-scroll">
      <table className="ship-table">
        <thead>
          <tr>
            <th>SHIPMENT</th>
            <th>RECIPIENT</th>
            <th>COURIER</th>
            <th>STATUS</th>
            <th>{compact ? '' : 'AMOUNT'}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {shipments.map(s => (
            <tr key={s.id} onClick={() => setTracking(s)}>
              <td>
                <div className="shipment-id">
                  <span className={`provider-mark ${providerTone(s.provider)}`}>
                    {providerLetter(s.provider)}
                  </span>
                  <span>
                    <b>{s.id}</b>
                    <small>{s.awb}</small>
                  </span>
                </div>
              </td>
              <td>
                <div className="recipient">
                  <span className={`person-avatar ${s.color}`}>{s.initials}</span>
                  <span>
                    <b>{s.recipient}</b>
                    <small>{s.destination}</small>
                  </span>
                </div>
              </td>
              <td>
                <span className="provider-name">{s.provider}</span>
              </td>
              <td>
                <Status status={s.status} />
              </td>
              <td>{compact ? '' : <b className="amount">₹{s.amount.toFixed(2)}</b>}</td>
              <td>
                <button
                  className="row-more"
                  onClick={e => {
                    e.stopPropagation();
                    setTracking(s);
                  }}
                  aria-label="View shipment"
                >
                  <ArrowUpRight size={15} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {shipments.length === 0 && <div className="empty-state">No shipments match your search.</div>}
    </div>
  );
}

function Status({ status }) {
  let cls =
    status === 'Delivered'
      ? 'delivered'
      : status === 'In transit'
        ? 'transit'
        : status === 'Out for delivery'
          ? 'out'
          : status === 'Exception'
            ? 'exception'
            : 'pending';
  return (
    <span className={`status ${cls}`}>
      <i />
      {status}
    </span>
  );
}

export function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  wide,
  required,
  type = 'text',
}) {
  return (
    <label className={`form-field ${wide ? 'wide' : ''}`}>
      <span>
        {label}
        {required && <i>*</i>}
      </span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
    </label>
  );
}

export function ReviewBlock({ icon: Icon, title, lines }) {
  return (
    <div className="review-block">
      <div className="review-block-head">
        <Icon size={15} />
        {title}
      </div>
      {lines.filter(Boolean).map((l, i) => (
        <p key={i}>{l}</p>
      ))}
    </div>
  );
}
