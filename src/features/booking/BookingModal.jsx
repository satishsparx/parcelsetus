import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Box,
  Check,
  Clock3,
  FileText,
  MapPin,
  ShieldCheck,
  X,
} from 'lucide-react';
import API from '../../lib/api.js';
import { seedQuotes } from '../../data/carrierQuotes.js';
import { Field, ReviewBlock } from '../../components/shared.jsx';
import { providerLetter, providerTone } from '../../lib/carriers.js';
function BookingModal({ onClose, onBooked, addresses }) {
  const [step, setStep] = useState(1),
    [selected, setSelected] = useState(null),
    [busy, setBusy] = useState(false),
    [rates, setRates] = useState(seedQuotes),
    [rateNotice, setRateNotice] = useState(
      'Prices shown are sample estimates. Live provider rates become available after carrier API credentials are configured.',
    ),
    [form, setForm] = useState({
      pickupName: 'Priya Sharma',
      pickupPhone: '9876543210',
      pickupAddress: '4th Floor, WeWork Galaxy',
      pickupPin: '560001',
      pickupCity: 'Bengaluru',
      pickupState: 'Karnataka',
      recipient: '',
      phone: '',
      address: '',
      pin: '',
      city: '',
      state: '',
      weight: '500',
      length: '20',
      width: '15',
      height: '10',
      description: 'Merchandise',
      value: '1200',
      payment: 'Prepaid',
      cod: '',
    });
  useEffect(() => {
    if (step !== 3) return;
    let live = true;
    fetch(`${API}/rates`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pickupPin: form.pickupPin,
        destinationPin: form.pin,
        weightGrams: form.weight,
        lengthCm: form.length,
        widthCm: form.width,
        heightCm: form.height,
        paymentType: form.payment,
      }),
    })
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (!live || !Array.isArray(data)) return;
        const available = data
          .filter(x => x.available)
          .map(x => ({
            ...x,
            days: x.estimatedDays,
            price: x.amount,
            tag:
              x.provider === 'India Post'
                ? 'Lowest price'
                : x.provider === 'Shadowfax'
                  ? 'Fastest'
                  : 'Best balance',
            tone:
              x.provider === 'India Post'
                ? 'green'
                : x.provider === 'Shadowfax'
                  ? 'orange'
                  : 'purple',
          }));
        if (available.length) {
          setRates(available);
          setSelected(null);
          setRateNotice('Rates are demo estimates until live carrier credentials are configured.');
        } else
          setRateNotice(
            'No configured courier can serve this route. Check both PIN codes and parcel details.',
          );
      })
      .catch(() => {
        if (live)
          setRateNotice(
            'Showing sample estimates. Start the API to check configured carrier services.',
          );
      });
    return () => {
      live = false;
    };
  }, [
    step,
    form.pickupPin,
    form.pin,
    form.weight,
    form.length,
    form.width,
    form.height,
    form.payment,
  ]);
  const update = e => setForm({ ...form, [e.target.name]: e.target.value });
  const next = () => {
    if (
      step === 1 &&
      (!form.pickupName ||
        !form.pickupPhone ||
        !form.pickupAddress ||
        !/^\d{6}$/.test(form.pickupPin) ||
        !form.recipient ||
        !form.phone ||
        !form.address ||
        !/^\d{6}$/.test(form.pin))
    ) {
      alert('Please complete the required address fields and enter valid 6-digit PIN codes.');
      return;
    }
    if (
      step === 2 &&
      (!Number(form.weight) || !Number(form.length) || !Number(form.width) || !Number(form.height))
    ) {
      alert('Enter valid weight and dimensions.');
      return;
    }
    setStep(step + 1);
  };
  const finish = () => {
    if (!selected) return;
    setBusy(true);
    const provider = rates[selected];
    setTimeout(() => {
      const n = Date.now().toString().slice(-6),
        s = {
          id: `SHP-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
          awb: `${provider.provider.slice(0, 2).toUpperCase()}${n}2845193`,
          provider: provider.provider,
          recipient: form.recipient,
          destination: form.pin,
          date: '19 Nov, 2026',
          amount: provider.price,
          status: 'Pickup scheduled',
          initials: form.recipient
            .split(' ')
            .map(w => w[0])
            .join('')
            .slice(0, 2)
            .toUpperCase(),
          color: 'lavender',
        };
      onBooked(s);
    }, 750);
  };
  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="booking-modal">
        <div className="modal-head">
          <div>
            <div className="eyebrow">NEW SHIPMENT</div>
            <h2>Let’s get it moving</h2>
            <p>Book a delivery in just a few simple steps.</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="stepper">
          {['Addresses', 'Package', 'Choose courier', 'Confirm'].map((x, i) => (
            <div
              className={`step-item ${step === i + 1 ? 'selected' : step > i + 1 ? 'complete' : ''}`}
              key={x}
            >
              <span>{step > i + 1 ? <Check size={13} /> : i + 1}</span>
              <b>{x}</b>
            </div>
          ))}
        </div>
        <div className="modal-body">
          {step === 1 && (
            <>
              <div className="section-kicker">01 — ROUTE DETAILS</div>
              <div className="route-columns">
                <fieldset className="form-card">
                  <legend>
                    <span className="pin-dot pickup-dot" />
                    Pickup from
                  </legend>
                  {addresses.length > 0 && (
                    <select
                      className="saved-address-select"
                      onChange={e => {
                        const a = addresses.find(x => x.id === e.target.value);
                        if (a)
                          setForm({
                            ...form,
                            pickupName: a.contactName || form.pickupName,
                            pickupPhone: a.phone || form.pickupPhone,
                            pickupAddress: a.address || '',
                            pickupPin: a.pin || '',
                            pickupCity: a.city || '',
                            pickupState: a.state || '',
                          });
                      }}
                    >
                      <option value="">Choose saved pickup address</option>
                      {addresses.map(a => (
                        <option value={a.id} key={a.id}>
                          {a.label}
                        </option>
                      ))}
                    </select>
                  )}
                  <div className="form-grid">
                    <Field
                      label="Contact name"
                      name="pickupName"
                      value={form.pickupName}
                      onChange={update}
                      required
                    />
                    <Field
                      label="Phone number"
                      name="pickupPhone"
                      value={form.pickupPhone}
                      onChange={update}
                      required
                    />
                    <Field
                      label="Pickup PIN code"
                      name="pickupPin"
                      value={form.pickupPin}
                      onChange={update}
                      required
                    />
                    <Field
                      label="City"
                      name="pickupCity"
                      value={form.pickupCity}
                      onChange={update}
                    />
                    <Field
                      label="Full address"
                      name="pickupAddress"
                      value={form.pickupAddress}
                      onChange={update}
                      wide
                      required
                    />
                    <Field
                      label="State"
                      name="pickupState"
                      value={form.pickupState}
                      onChange={update}
                    />
                  </div>
                </fieldset>
                <fieldset className="form-card">
                  <legend>
                    <span className="pin-dot delivery-dot" />
                    Deliver to
                  </legend>
                  <div className="form-grid">
                    <Field
                      label="Recipient name"
                      name="recipient"
                      value={form.recipient}
                      onChange={update}
                      placeholder="e.g. Aisha Patel"
                      required
                    />
                    <Field
                      label="Phone number"
                      name="phone"
                      value={form.phone}
                      onChange={update}
                      placeholder="10-digit number"
                      required
                    />
                    <Field
                      label="Destination PIN code"
                      name="pin"
                      value={form.pin}
                      onChange={update}
                      placeholder="6-digit PIN"
                      required
                    />
                    <Field
                      label="City"
                      name="city"
                      value={form.city}
                      onChange={update}
                      placeholder="City"
                    />
                    <Field
                      label="Full address"
                      name="address"
                      value={form.address}
                      onChange={update}
                      placeholder="House no., street, landmark"
                      wide
                      required
                    />
                    <Field
                      label="State"
                      name="state"
                      value={form.state}
                      onChange={update}
                      placeholder="State"
                    />
                  </div>
                </fieldset>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div className="section-kicker">02 — PARCEL DETAILS</div>
              <div className="package-type">
                <label className="radio-card selected">
                  <input type="radio" name="type" defaultChecked />
                  <Box size={18} />
                  <span>
                    <b>Parcel</b>
                    <small>Goods & merchandise</small>
                  </span>
                </label>
                <label className="radio-card">
                  <input type="radio" name="type" />
                  <FileText size={18} />
                  <span>
                    <b>Document</b>
                    <small>Paper & documents</small>
                  </span>
                </label>
              </div>
              <div className="form-grid package-grid">
                <Field
                  label="Weight (grams)"
                  name="weight"
                  value={form.weight}
                  onChange={update}
                  required
                />
                <Field
                  label="Shipment value (₹)"
                  name="value"
                  value={form.value}
                  onChange={update}
                />
                <Field label="Length (cm)" name="length" value={form.length} onChange={update} />
                <Field label="Width (cm)" name="width" value={form.width} onChange={update} />
                <Field label="Height (cm)" name="height" value={form.height} onChange={update} />
                <Field
                  label="Contents description"
                  name="description"
                  value={form.description}
                  onChange={update}
                />
                <label className="form-field">
                  <span>Payment type</span>
                  <select name="payment" value={form.payment} onChange={update}>
                    <option>Prepaid</option>
                    <option>COD</option>
                  </select>
                </label>
                {form.payment === 'COD' && (
                  <Field
                    label="COD amount (₹)"
                    name="cod"
                    value={form.cod}
                    onChange={update}
                    required
                  />
                )}
              </div>
              <div className="info-note">
                <ShieldCheck size={16} />
                Your parcel details help couriers provide accurate rates. Volumetric weight is
                calculated automatically.
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <div className="section-kicker">03 — AVAILABLE SERVICES</div>
              <div className="route-summary">
                <span>
                  <MapPin size={15} />
                  {form.pickupPin} · {form.pickupCity}
                </span>
                <ArrowRight size={14} />
                <span>
                  <MapPin size={15} />
                  {form.pin} · {form.city || 'Destination'}
                </span>
                <span className="route-weight">
                  <Box size={14} />
                  {form.weight} g
                </span>
              </div>
              <div className="rate-list">
                {rates.map((q, i) => (
                  <button
                    key={q.provider}
                    className={`rate-card ${selected === i ? 'chosen' : ''}`}
                    onClick={() => setSelected(i)}
                  >
                    <span className={`provider-mark large ${providerTone(q.provider)}`}>
                      {providerLetter(q.provider)}
                    </span>
                    <span className="rate-main">
                      <b>
                        {q.provider}
                        <small>{q.service || q.provider}</small>
                      </b>
                      <span className="rate-delivery">
                        <Clock3 size={14} />
                        {q.days}
                      </span>
                    </span>
                    <span className={`rate-tag ${q.tone}`}>{q.tag}</span>
                    <span className="rate-price">
                      <b>₹{q.price}</b>
                      <small>incl. taxes</small>
                    </span>
                    <span className={`radio-circle ${selected === i ? 'checked' : ''}`}>
                      {selected === i && <Check size={12} />}
                    </span>
                  </button>
                ))}
              </div>
              <p className="quote-disclaimer">
                <ShieldCheck size={14} />
                {rateNotice}
              </p>
            </>
          )}
          {step === 4 && (
            <>
              <div className="section-kicker">04 — REVIEW & CONFIRM</div>
              <div className="confirm-banner">
                <div>
                  <Check size={18} />
                </div>
                <span>
                  <b>Everything looks good</b>
                  <small>Review your shipment before confirming.</small>
                </span>
              </div>
              <div className="review-grid">
                <ReviewBlock
                  icon={MapPin}
                  title="ROUTE"
                  lines={[
                    `${form.pickupName} · ${form.pickupPin}`,
                    `${form.recipient} · ${form.pin}`,
                    form.address,
                  ]}
                />
                <ReviewBlock
                  icon={Box}
                  title="PACKAGE"
                  lines={[
                    `${form.weight} g · ${form.length} × ${form.width} × ${form.height} cm`,
                    form.description,
                    `${form.payment}${form.payment === 'COD' ? ` · ₹${form.cod}` : ''}`,
                  ]}
                />
              </div>
              {selected !== null && (
                <div className="review-price">
                  <span>
                    Courier & service{' '}
                    <b>
                      {rates[selected].provider} ·{' '}
                      {rates[selected].service || rates[selected].provider}
                    </b>
                  </span>
                  <span>
                    Estimated delivery <b>{rates[selected].days}</b>
                  </span>
                  <span>
                    Shipping charge <b>₹{rates[selected].price}.00</b>
                  </span>
                  <strong>
                    Total payable <b>₹{rates[selected].price}.00</b>
                  </strong>
                </div>
              )}
              <label className="terms-check">
                <input type="checkbox" defaultChecked />I agree to the{' '}
                <a href="#terms">shipping terms and conditions</a>
              </label>
            </>
          )}
        </div>
        <div className="modal-footer">
          <button
            className="button-secondary"
            onClick={() => (step === 1 ? onClose() : setStep(step - 1))}
          >
            {step === 1 ? (
              'Cancel'
            ) : (
              <>
                <ArrowLeft size={15} /> Back
              </>
            )}
          </button>
          <span className="secure-note">
            <ShieldCheck size={14} />
            Secure booking
          </span>
          <button
            className="button-primary"
            disabled={(step === 3 && selected === null) || busy}
            onClick={step === 4 ? finish : next}
          >
            {busy
              ? 'Booking…'
              : step === 4
                ? 'Confirm booking'
                : step === 3
                  ? 'Review booking'
                  : 'Continue'}
            {step !== 4 && <ArrowRight size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
}
export default BookingModal;
