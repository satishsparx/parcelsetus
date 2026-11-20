import { useEffect, useMemo, useState } from 'react';
import API from '../../lib/api.js';

export default function useWorkspaceData(auth) {
  const [shipments, setShipments] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All shipments');
  const [tracking, setTracking] = useState(null);
  const [range, setRange] = useState('Last 30 days');

  useEffect(() => {
    if (!auth) return;

    fetch(`${API}/shipments`, { credentials: 'include' })
      .then(response => (response.ok ? response.json() : null))
      .then(data => Array.isArray(data) && setShipments(data))
      .catch(() => {});
    fetch(`${API}/addresses`, { credentials: 'include' })
      .then(response => (response.ok ? response.json() : null))
      .then(data => data && setAddresses(data))
      .catch(() => {});
    fetch(`${API}/payments`, { credentials: 'include' })
      .then(response => (response.ok ? response.json() : null))
      .then(data => Array.isArray(data) && setPayments(data))
      .catch(() => {});
  }, [auth]);

  const visibleShipments = useMemo(
    () =>
      shipments.filter(
        shipment =>
          (statusFilter === 'All shipments' || shipment.status === statusFilter) &&
          `${shipment.id} ${shipment.awb} ${shipment.recipient} ${shipment.provider}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [shipments, statusFilter, query],
  );

  const addBookedShipment = shipment => {
    if (!shipment) return;
    setShipments(current => [shipment, ...current.filter(item => item.id !== shipment.id)]);
    setPayments(current => [
      {
        id: shipment.paymentId,
        shipmentId: shipment.id,
        carrier: shipment.provider,
        amount: shipment.amount,
        currency: 'INR',
        method: 'upi',
        status: 'used',
        createdAt: shipment.createdAt,
      },
      ...current.filter(payment => payment.shipmentId !== shipment.id),
    ]);
  };

  return {
    shipments,
    setShipments,
    addresses,
    setAddresses,
    payments,
    setPayments,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    tracking,
    setTracking,
    range,
    setRange,
    visibleShipments,
    addBookedShipment,
  };
}
