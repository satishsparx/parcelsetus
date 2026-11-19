import { ArrowDownUp, Download, FileText, Truck, Wallet } from 'lucide-react';
import { Metric, PageTitle } from '../../components/shared.jsx';

const money = amount =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount || 0);

const paymentStatus = status =>
  status === 'used' ? 'Paid' : status === 'paid' ? 'Paid · processing' : status;

function Payments({ payments = [], notify }) {
  const paid = payments.filter(payment => ['paid', 'used'].includes(payment.status));
  const spent = paid.reduce((total, payment) => total + payment.amount, 0);
  const average = paid.length ? spent / paid.length : 0;
  const pending = payments.filter(payment => payment.status === 'created').length;

  const exportTransactions = () => {
    const rows = [
      ['Payment ID', 'Shipment ID', 'Courier', 'Method', 'Amount', 'Status', 'Created at'],
      ...payments.map(payment => [
        payment.id,
        payment.shipmentId,
        payment.carrier,
        payment.method?.toUpperCase(),
        payment.amount,
        paymentStatus(payment.status),
        payment.createdAt,
      ]),
    ];
    const csv = rows
      .map(row => row.map(value => `"${String(value ?? '').replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    link.download = 'parcelsetus-payments.csv';
    link.click();
    URL.revokeObjectURL(link.href);
    notify('Payment history exported.');
  };

  return (
    <>
      <PageTitle
        eyebrow="BILLING & PAYMENTS"
        title="Payments"
        subtitle="Review your shipment charges and UPI payment history."
      />
      <div className="metric-grid payment-metrics">
        <Metric
          label="Total shipping spend"
          value={money(spent)}
          delta={`${paid.length} paid`}
          sub="Verified UPI charges"
          icon={Wallet}
          color="violet"
          spark={[23, 28, 20, 36, 32, 40, 35, 49, 44, 53, 45, 58]}
        />
        <Metric
          label="Average per shipment"
          value={money(average)}
          delta="UPI"
          sub="Based on paid shipments"
          icon={ArrowDownUp}
          color="green"
          spark={[38, 33, 42, 30, 35, 28, 37, 25, 30, 22, 28, 20]}
        />
        <Metric
          label="UPI providers"
          value="Multiple"
          delta="Checkout"
          sub="Google Pay, PhonePe, Paytm and more"
          icon={Truck}
          color="blue"
          spark={[24, 26, 24, 28, 30, 27, 32, 34, 31, 38, 40, 42]}
        />
        <Metric
          label="Pending payments"
          value={String(pending).padStart(2, '0')}
          delta={pending ? 'In progress' : 'All clear'}
          sub="Checkout not yet completed"
          icon={FileText}
          color="orange"
          spark={[25, 28, 25, 32, 28, 35, 31, 39, 34, 43, 40, 46]}
        />
      </div>
      <section className="panel payments-panel">
        <div className="panel-heading">
          <div>
            <h2>Recent transactions</h2>
            <p>Your latest UPI shipping payments</p>
          </div>
          <button
            className="button-secondary"
            onClick={exportTransactions}
            disabled={!payments.length}
          >
            <Download size={15} /> Export
          </button>
        </div>
        {payments.map(payment => (
          <div className="transaction-row" key={payment.id}>
            <div className={`transaction-symbol ${payment.status === 'failed' ? 'refund' : ''}`}>
              <Truck size={17} />
            </div>
            <span>
              <b>Shipment · {payment.shipmentId || 'Booking payment'}</b>
              <small>
                {payment.createdAt
                  ? new Date(payment.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Date unavailable'}{' '}
                · {payment.carrier} · {payment.method?.toUpperCase() || 'UPI'}
              </small>
            </span>
            <b className="transaction-amount">{money(payment.amount)}</b>
            <span className={`paid-pill ${payment.status === 'created' ? 'pending-pill' : ''}`}>
              {paymentStatus(payment.status)}
            </span>
          </div>
        ))}
        {!payments.length && (
          <div className="payments-empty">
            <div className="transaction-symbol">
              <Wallet size={17} />
            </div>
            <span>
              <b>No payments yet</b>
              <small>Verified shipment payments will appear here.</small>
            </span>
          </div>
        )}
      </section>
    </>
  );
}

export default Payments;
