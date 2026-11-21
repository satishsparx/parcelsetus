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

let razorpayLoader;
const createShipmentId = () =>
  `SHP-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
const loadRazorpay = () => {
  if (window.Razorpay) return Promise.resolve();
  if (!razorpayLoader) {
    razorpayLoader = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = resolve;
      script.onerror = () =>
        reject(new Error('Could not load UPI checkout. Check your connection.'));
      document.body.appendChild(script);
    });
  }
  return razorpayLoader;
};

function BookingModal({ onClose, onBooked, addresses }) {
  const [step, setStep] = useState(1),
    [selected, setSelected] = useState(null),
    [busy, setBusy] = useState(false),
    [paymentError, setPaymentError] = useState(''),
    [shipmentId, setShipmentId] = useState(createShipmentId),
    [paymentAttemptStarted, setPaymentAttemptStarted] = useState(false),
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
      whatsappOptIn: false,
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
  const update = e =>
    setForm({
      ...form,
      [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    });
  const next = () => {
    if (
      step === 1 &&
      (!form.pickupName ||
        form.pickupPhone.trim().length < 8 ||
        form.pickupAddress.trim().length < 5 ||
        !/^\d{6}$/.test(form.pickupPin) ||
        !form.recipient ||
        form.phone.trim().length < 8 ||
        form.address.trim().length < 5 ||
        !/^\d{6}$/.test(form.pin))
    ) {
      alert(
        'Enter phone numbers with at least 8 digits, addresses with at least 5 characters, and valid 6-digit PIN codes.',
      );
      return;
    }
    if (
      step === 2 &&
      (!Number(form.weight) || !Number(form.length) || !Number(form.width) || !Number(form.height))
    ) {
      alert('Enter valid weight and dimensions.');
      return;
    }
    if (step === 2 && form.payment === 'COD' && (!Number(form.cod) || Number(form.cod) <= 0)) {
      alert('Enter the amount the recipient will pay to the courier.');
      return;
    }
    setStep(step + 1);
  };
  const finish = async () => {
    if (selected === null) return;
    setBusy(true);
    setPaymentError('');
    const provider = rates[selected];
    try {
      if (!provider.quoteId)
        throw new Error('Choose a live courier quote before continuing to payment.');
      const orderResponse = await fetch(`${API}/payments/razorpay/order`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteId: provider.quoteId,
          provider: provider.provider,
          idempotencyKey: shipmentId,
          shipment: {
            recipient: form.recipient,
            phone: form.phone,
            address: form.address,
            destination: form.pin,
            city: form.city,
            state: form.state,
            pickupName: form.pickupName,
            pickupPhone: form.pickupPhone,
            pickupAddress: form.pickupAddress,
            pickupPin: form.pickupPin,
            pickupCity: form.pickupCity,
            pickupState: form.pickupState,
            weight: form.weight,
            length: form.length,
            width: form.width,
            height: form.height,
            description: form.description,
            value: form.value,
            paymentType: form.payment,
            codAmount: form.cod ? Number(form.cod) : 0,
            whatsappOptIn: form.whatsappOptIn,
          },
        }),
      });
      const orderData = await orderResponse.json();
      if (!orderResponse.ok) {
        const details = orderData.details
          ?.map(({ field, message }) => `${field.replace(/^shipment\./, '')}: ${message}`)
          .join('; ');
        throw new Error(
          details
            ? `${orderData.error} ${details}`
            : orderData.error || 'Could not start UPI checkout.',
        );
      }
      if (orderData.shipment) {
        onBooked(orderData.shipment);
        return;
      }
      setPaymentAttemptStarted(true);
      await loadRazorpay();
      if (!window.Razorpay) throw new Error('UPI checkout did not load. Please try again.');
      const checkout = new window.Razorpay({
        key: orderData.keyId,
        order_id: orderData.orderId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: orderData.name,
        description: orderData.description,
        theme: { color: '#705bd1' },
        modal: {
          ondismiss: () => setBusy(false),
        },
        handler: async response => {
          setBusy(true);
          try {
            const verifyResponse = await fetch(`${API}/payments/razorpay/verify`, {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response),
            });
            const verifyData = await verifyResponse.json();
            if (!verifyResponse.ok)
              throw new Error(verifyData.error || 'Payment could not be verified yet.');
            onBooked(verifyData.shipment);
          } catch (error) {
            setPaymentError(error.message || 'Payment verification failed. You can retry shortly.');
            setBusy(false);
          }
        },
      });
      checkout.on('payment.failed', response => {
        setPaymentError(response.error?.description || 'UPI payment failed. Please try again.');
        setBusy(false);
      });
      checkout.open();
      setBusy(false);
    } catch (error) {
      setPaymentError(error.message || 'Could not start payment. Please try again.');
      setBusy(false);
    }
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
          {['Addresses', 'Package', 'Courier', 'Review', 'Payment'].map((x, i) => (
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
                  <label className="whatsapp-opt-in">
                    <input
                      type="checkbox"
                      name="whatsappOptIn"
                      checked={form.whatsappOptIn}
                      onChange={update}
                    />
                    <span>
                      <b>Send WhatsApp booking updates</b>
                      <small>
                        I confirm the recipient agrees to receive shipment updates on WhatsApp.
                      </small>
                    </span>
                  </label>
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
                    onClick={() => {
                      if (selected !== i && paymentAttemptStarted) {
                        setShipmentId(createShipmentId());
                        setPaymentAttemptStarted(false);
                      }
                      setSelected(i);
                    }}
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
              <div className="section-kicker">04 — REVIEW BOOKING</div>
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
            </>
          )}
          {step === 5 && (
            <>
              <div className="section-kicker">05 — SECURE UPI PAYMENT</div>
              <div className="upi-payment-card">
                <div className="upi-payment-heading">
                  <span className="upi-mark">UPI</span>
                  <div>
                    <b>Pay the shipping charge</b>
                    <small>Choose a UPI app in the secure checkout.</small>
                  </div>
                  <strong>₹{rates[selected]?.price}.00</strong>
                </div>
                <div className="upi-app-list" aria-label="Supported UPI apps">
                  {['Google Pay', 'PhonePe', 'Paytm', 'BHIM', 'More UPI apps'].map(app => (
                    <span key={app}>{app}</span>
                  ))}
                </div>
                <p>
                  Your payment is verified securely before the shipment is booked. COD collection,
                  if selected, is paid by the recipient to the courier separately.
                </p>
                <small className="upi-powered">UPI checkout powered by Razorpay</small>
              </div>
              {paymentError && <div className="auth-alert error payment-error">{paymentError}</div>}
            </>
          )}
        </div>
        <div className="modal-footer">
          <button
            className="button-secondary"
            disabled={busy}
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
            disabled={
              (step === 3 && selected === null) || (step === 5 && selected === null) || busy
            }
            onClick={step === 5 ? finish : next}
          >
            {busy
              ? 'Booking…'
              : step === 5
                ? `Pay ₹${rates[selected]?.price}.00`
                : step === 3
                  ? 'Review booking'
                  : step === 4
                    ? 'Continue to payment'
                    : 'Continue'}
            {step !== 5 && <ArrowRight size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
}
export default BookingModal;
