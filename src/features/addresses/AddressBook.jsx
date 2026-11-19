import { useState } from 'react';
import { ArrowRight, MapPin, MoreHorizontal, Plus, ShieldCheck, X } from 'lucide-react';
import API from '../../lib/api.js';
import { Field, PageTitle } from '../../components/shared.jsx';
function AddressBook({ addresses, setAddresses, notify }) {
  const [show, setShow] = useState(false),
    [form, setForm] = useState({
      label: '',
      contactName: '',
      phone: '',
      address: '',
      pin: '',
      city: '',
      state: '',
    });
  const save = async () => {
    if (!form.label || !form.contactName || !/^\d{6}$/.test(form.pin) || !form.address) {
      notify('Add a name, full address, and valid 6-digit PIN.');
      return;
    }
    const entry = {
      ...form,
      id: crypto.randomUUID(),
      type: 'Pickup',
      default: addresses.length === 0,
    };
    setAddresses([entry, ...addresses]);
    fetch(`${API}/addresses`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    }).catch(() => {});
    setForm({ label: '', contactName: '', phone: '', address: '', pin: '', city: '', state: '' });
    setShow(false);
    notify('Address saved to your address book.');
  };
  return (
    <>
      <PageTitle
        eyebrow="YOUR SAVED LOCATIONS"
        title="Address book"
        subtitle="Save your frequent pickup and delivery addresses."
        action={
          <button className="button-primary" onClick={() => setShow(true)}>
            <Plus size={17} /> Add address
          </button>
        }
      />
      <div className="address-info">
        <div>
          <div className="address-info-icon">
            <MapPin size={18} />
          </div>
          <span>
            <b>Ship faster with saved addresses</b>
            <small>Your addresses are private and only visible to your account.</small>
          </span>
        </div>
        <ShieldCheck size={18} />
      </div>
      <div className="address-grid">
        {addresses.map(a => (
          <div className="panel address-card" key={a.id}>
            <div className="address-card-top">
              <span className="address-type">
                <MapPin size={14} />
                {a.type || 'Pickup'}
              </span>
              <button
                onClick={() => {
                  setAddresses(addresses.filter(x => x.id !== a.id));
                  notify('Address removed.');
                }}
              >
                <MoreHorizontal size={18} />
              </button>
            </div>
            <h3>
              {a.label}
              {a.default && <span>DEFAULT</span>}
            </h3>
            <b>{a.contactName}</b>
            <p>
              {a.address}
              <br />
              {a.city} {a.pin}
              {a.state && `, ${a.state}`}
            </p>
            <span className="address-phone">{a.phone}</span>
          </div>
        ))}
        {!addresses.length && (
          <div className="panel address-empty">
            <div>
              <MapPin size={22} />
            </div>
            <h3>No saved addresses yet</h3>
            <p>Add a pickup location to speed up your next booking.</p>
            <button className="button-secondary" onClick={() => setShow(true)}>
              <Plus size={15} /> Add your first address
            </button>
          </div>
        )}
      </div>
      {show && (
        <div className="modal-backdrop">
          <div className="address-modal">
            <div className="modal-head">
              <div>
                <div className="eyebrow">ADDRESS BOOK</div>
                <h2>Add a new address</h2>
                <p>Save a location for quicker bookings.</p>
              </div>
              <button className="modal-close" onClick={() => setShow(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="form-grid">
              <Field
                label="Address label"
                name="label"
                value={form.label}
                onChange={e => setForm({ ...form, label: e.target.value })}
                placeholder="e.g. Main warehouse"
                required
              />
              <Field
                label="Contact name"
                name="contactName"
                value={form.contactName}
                onChange={e => setForm({ ...form, contactName: e.target.value })}
                required
              />
              <Field
                label="Phone number"
                name="phone"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
              />
              <Field
                label="PIN code"
                name="pin"
                value={form.pin}
                onChange={e => setForm({ ...form, pin: e.target.value })}
                required
              />
              <Field
                label="Full address"
                name="address"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                wide
                required
              />
              <Field
                label="City"
                name="city"
                value={form.city}
                onChange={e => setForm({ ...form, city: e.target.value })}
              />
              <Field
                label="State"
                name="state"
                value={form.state}
                onChange={e => setForm({ ...form, state: e.target.value })}
              />
            </div>
            <div className="modal-footer">
              <button className="button-secondary" onClick={() => setShow(false)}>
                Cancel
              </button>
              <button className="button-primary" onClick={save}>
                Save address <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export default AddressBook;
