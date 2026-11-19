import { ArrowDown, ArrowDownUp, Building2, Download, FileText, Truck, Wallet } from 'lucide-react';
import { Metric, PageTitle } from '../../components/shared.jsx';
function Payments({ notify }) {
  return (
    <>
      <PageTitle
        eyebrow="BILLING & PAYMENTS"
        title="Payments"
        subtitle="Keep track of your shipping spend and transactions."
      />
      <div className="metric-grid payment-metrics">
        <Metric
          label="Total shipping spend"
          value="₹12,480"
          delta="This month"
          sub="Across 38 shipments"
          icon={Wallet}
          color="violet"
          spark={[23, 28, 20, 36, 32, 40, 35, 49, 44, 53, 45, 58]}
        />
        <Metric
          label="Average per shipment"
          value="₹78"
          delta="₹6 less"
          positive
          sub="vs. last month"
          icon={ArrowDownUp}
          color="green"
          spark={[38, 33, 42, 30, 35, 28, 37, 25, 30, 22, 28, 20]}
        />
        <Metric
          label="Wallet balance"
          value="₹0"
          delta="Top up"
          sub="Add balance to ship"
          icon={Building2}
          color="blue"
          spark={[24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24]}
        />
        <Metric
          label="Pending invoices"
          value="02"
          delta="View invoices"
          sub="Ready to download"
          icon={FileText}
          color="orange"
          spark={[25, 28, 25, 32, 28, 35, 31, 39, 34, 43, 40, 46]}
        />
      </div>
      <section className="panel payments-panel">
        <div className="panel-heading">
          <div>
            <h2>Recent transactions</h2>
            <p>Your latest shipping charges and refunds</p>
          </div>
          <button
            className="button-secondary"
            onClick={() => notify('Transaction export downloaded.')}
          >
            <Download size={15} /> Export
          </button>
        </div>
        <div className="transaction-row">
          <div className="transaction-symbol">
            <Truck size={17} />
          </div>
          <span>
            <b>Shipment · SHP-2026-1048</b>
            <small>19 Nov, 2026 · Delhivery</small>
          </span>
          <b className="transaction-amount">− ₹86.00</b>
          <span className="paid-pill">Paid</span>
        </div>
        <div className="transaction-row">
          <div className="transaction-symbol">
            <Truck size={17} />
          </div>
          <span>
            <b>Shipment · SHP-2026-1047</b>
            <small>19 Nov, 2026 · India Post</small>
          </span>
          <b className="transaction-amount">− ₹52.00</b>
          <span className="paid-pill">Paid</span>
        </div>
        <div className="transaction-row">
          <div className="transaction-symbol refund">
            <ArrowDown size={17} />
          </div>
          <span>
            <b>Shipping adjustment</b>
            <small>16 Nov, 2026 · Refund</small>
          </span>
          <b className="transaction-amount refund-text">+ ₹18.00</b>
          <span className="paid-pill">Credited</span>
        </div>
      </section>
      <p className="sample-note">Payment records shown are sample data for this preview.</p>
    </>
  );
}
export default Payments;
