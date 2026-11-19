import { Check, Download, MapPin, Truck, X } from 'lucide-react';
function TrackingModal({ shipment: s, onClose }) {
  const events = [
    [
      'Booking confirmed',
      'Shipment booked and label generated',
      'Bengaluru · 19 Nov, 9:42 AM',
      'done',
    ],
    ['Picked up', 'Parcel collected by courier partner', 'Bengaluru · 19 Nov, 2:15 PM', 'done'],
    [
      'In transit',
      'Shipment is moving to the destination hub',
      'Bengaluru Hub · 19 Nov, 6:30 PM',
      'current',
    ],
    ['Out for delivery', 'Expected delivery soon', 'Pending', 'future'],
    ['Delivered', 'Shipment delivered to recipient', 'Pending', 'future'],
  ];
  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="tracking-modal">
        <div className="modal-head">
          <div>
            <div className="eyebrow">SHIPMENT TRACKING</div>
            <h2>{s.id}</h2>
            <p>
              {s.provider} · AWB {s.awb}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="tracking-status-card">
          <div className="tracking-pulse">
            <Truck size={19} />
          </div>
          <div>
            <span>CURRENT STATUS</span>
            <b>{s.status}</b>
            <small>Estimated delivery · 21 Nov, 2026</small>
          </div>
          <button onClick={() => window.print()}>
            <Download size={15} />
            Label
          </button>
        </div>
        <div className="timeline-title">
          Tracking history <span>Latest updates</span>
        </div>
        <div className="timeline">
          {events.map(([title, desc, meta, state]) => (
            <div className={`timeline-item ${state}`} key={title}>
              <div className="timeline-dot">{state === 'done' ? <Check size={12} /> : null}</div>
              <div>
                <b>{title}</b>
                <p>{desc}</p>
                <small>{meta}</small>
              </div>
            </div>
          ))}
        </div>
        <div className="tracking-footer">
          <span>
            <MapPin size={15} />
            Delivering to <b>{s.destination}</b>
          </span>
          <button onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}
export default TrackingModal;
