import { useState } from 'react';
import { ArrowRight, MapPin, Pencil, Plus, ShieldCheck, Trash2, X } from 'lucide-react';
import API from '../../lib/api.js';
import { Field, PageTitle } from '../../components/shared.jsx';

const emptyForm = () => ({
  label: '',
  contactName: '',
  phone: '',
  address: '',
  pin: '',
  city: '',
  state: '',
  default: false,
});

function AddressBook({ addresses, setAddresses, notify }) {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const save = async e => {
    e.preventDefault();
    if (!form.label || !form.contactName || !/^\d{6}$/.test(form.pin) || !form.address) {
      notify('Add a name, full address, and valid 6-digit PIN.');
      return;
    }
    const input = {
      label: form.label,
      contactName: form.contactName,
      phone: form.phone,
      address: form.address,
      pin: form.pin,
      city: form.city,
      state: form.state,
      type: 'Pickup',
      default: form.default || addresses.length === 0,
    };
    setBusy(true);
    setError('');
    try {
      const response = await fetch(
        `${API}/addresses${form.id ? `/${encodeURIComponent(form.id)}` : ''}`,
        {
          method: form.id ? 'PUT' : 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        },
      );
      const data = response.status === 204 ? null : await response.json();
      if (!response.ok) throw new Error(data?.error || 'Could not save this address.');
      setAddresses(current =>
        form.id
          ? current.map(address => (address.id === data.id ? data : address))
          : [data, ...current],
      );
      setForm(emptyForm());
      setShow(false);
      notify(form.id ? 'Pickup address updated.' : 'Address saved to your address book.');
    } catch (saveError) {
      setError(saveError.message || 'Could not save this address.');
    } finally {
      setBusy(false);
    }
  };
  const edit = address => {
    setForm({
      id: address.id,
      label: address.label,
      contactName: address.contactName,
      phone: address.phone || '',
      address: address.address,
      pin: address.pin,
      city: address.city || '',
      state: address.state || '',
      default: Boolean(address.default),
    });
    setError('');
    setShow(true);
  };
  const remove = async address => {
    try {
      const response = await fetch(`${API}/addresses/${encodeURIComponent(address.id)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Could not remove this address.');
      }
      setAddresses(current => current.filter(item => item.id !== address.id));
      notify('Address removed.');
    } catch (removeError) {
      notify(removeError.message || 'Could not remove this address.');
    }
  };
  const addNew = () => {
    setForm(emptyForm());
    setError('');
    setShow(true);
  };
  return (
    <>
      <PageTitle
        eyebrow="YOUR SAVED LOCATIONS"
        title="Address book"
        subtitle="Save your frequent pickup and delivery addresses."
        action={
          <button className="button-primary" onClick={addNew}>
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
              <span className="address-actions">
                <button aria-label={`Edit ${a.label}`} onClick={() => edit(a)}>
                  <Pencil size={15} />
                </button>
                <button aria-label={`Remove ${a.label}`} onClick={() => remove(a)}>
                  <Trash2 size={15} />
                </button>
              </span>
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
            <button className="button-secondary" onClick={addNew}>
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
                <h2>{form.id ? 'Edit pickup address' : 'Add a new address'}</h2>
                <p>Save a location for quicker bookings.</p>
              </div>
              <button
                className="modal-close"
                onClick={() => {
                  setShow(false);
                  setForm(emptyForm());
                }}
              >
                <X size={18} />
              </button>
            </div>
            <form className="form-grid" onSubmit={save}>
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
              <label className="default-address-check">
                <input
                  type="checkbox"
                  checked={form.default}
                  onChange={e => setForm({ ...form, default: e.target.checked })}
                />
                Set as default pickup address
              </label>
              {error && <div className="auth-alert error address-form-error">{error}</div>}
              <div className="modal-footer address-form-footer">
                <button
                  className="button-secondary"
                  type="button"
                  onClick={() => {
                    setShow(false);
                    setForm(emptyForm());
                    setError('');
                  }}
                >
                  Cancel
                </button>
                <button className="button-primary" type="submit" disabled={busy}>
                  {busy ? 'Saving…' : 'Save address'} <ArrowRight size={15} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
export default AddressBook;
