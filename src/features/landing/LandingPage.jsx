import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleHelp,
  Clock3,
  MapPin,
  Package,
  PackageCheck,
  Sparkles,
  WalletCards,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './landing.css';

const features = [
  {
    icon: PackageCheck,
    number: '01',
    title: 'Every shipment, in view',
    copy: 'See what is booked, what is moving, and what needs your attention from one workspace.',
  },
  {
    icon: MapPin,
    number: '02',
    title: 'Pickup details, ready to go',
    copy: 'Keep your business and pickup addresses together, then reuse them when you book.',
  },
  {
    icon: WalletCards,
    number: '03',
    title: 'Clear checkout, clear records',
    copy: 'Review the shipping charge before you pay and find past transactions when you need them.',
  },
];

function Brand({ light = false }) {
  return (
    <Link className={`landing-brand ${light ? 'light' : ''}`} to="/" aria-label="ParcelSetus home">
      <span className="landing-brand-icon">
        <Package size={19} strokeWidth={2.2} />
      </span>
      <span className="landing-brand-word">
        parcel<span>setus</span>
      </span>
    </Link>
  );
}

function ShipmentPreview() {
  return (
    <div className="landing-visual" aria-label="ParcelSetus shipment dashboard preview">
      <div className="visual-glow glow-one" />
      <div className="visual-glow glow-two" />
      <div className="preview-topline">
        <span className="preview-brand-mark">
          <Package size={14} />
        </span>
        <span>WORKSPACE PREVIEW</span>
        <span className="preview-live-dot" />
      </div>
      <div className="preview-card preview-main-card">
        <div className="preview-card-heading">
          <div>
            <span className="preview-label">OVERVIEW</span>
            <h3>Good morning, seller</h3>
          </div>
          <button aria-label="Help with your dashboard">
            <CircleHelp size={17} />
          </button>
        </div>
        <div className="preview-stats">
          <div className="preview-stat">
            <span>Shipments</span>
            <strong>12</strong>
            <small>
              <span className="stat-trend">↗</span> this month
            </small>
          </div>
          <div className="preview-stat accent">
            <span>In transit</span>
            <strong>08</strong>
            <small>
              <i /> on the move
            </small>
          </div>
          <div className="preview-stat">
            <span>Delivered</span>
            <strong>24</strong>
            <small>
              <Check size={12} /> completed
            </small>
          </div>
        </div>
        <div className="preview-list-head">
          <strong>Recent shipments</strong>
          <span>
            View all <ArrowUpRight size={12} />
          </span>
        </div>
        <div className="preview-shipment-row">
          <span className="preview-parcel-icon">
            <Package size={15} />
          </span>
          <span className="preview-shipment-copy">
            <b>PS-24810</b>
            <small>Bengaluru → Mumbai</small>
          </span>
          <span className="preview-status moving">
            <i /> In transit
          </span>
        </div>
        <div className="preview-shipment-row">
          <span className="preview-parcel-icon peach">
            <Package size={15} />
          </span>
          <span className="preview-shipment-copy">
            <b>PS-24809</b>
            <small>Bengaluru → Pune</small>
          </span>
          <span className="preview-status delivered">
            <Check size={12} /> Delivered
          </span>
        </div>
        <div className="preview-shipment-row">
          <span className="preview-parcel-icon mint">
            <Package size={15} />
          </span>
          <span className="preview-shipment-copy">
            <b>PS-24808</b>
            <small>Bengaluru → Delhi</small>
          </span>
          <span className="preview-status pickup">
            <Clock3 size={12} /> Pickup ready
          </span>
        </div>
      </div>
      <div className="preview-float-card float-pickup">
        <span className="float-icon">
          <MapPin size={15} />
        </span>
        <span>
          <b>Pickup scheduled</b>
          <small>Today · 2:00–5:00 PM</small>
        </span>
        <span className="float-check">
          <Check size={12} />
        </span>
      </div>
      <div className="preview-float-card float-payment">
        <span className="float-icon payment-icon">
          <WalletCards size={15} />
        </span>
        <span>
          <b>Payment complete</b>
          <small>Shipment charge · ₹90</small>
        </span>
      </div>
      <div className="visual-orbit orbit-a" />
      <div className="visual-orbit orbit-b" />
    </div>
  );
}

function LandingPage() {
  return (
    <main className="landing-page">
      <header className="landing-header">
        <div className="landing-header-inner">
          <Brand />
          <nav className="landing-nav" aria-label="Main navigation">
            <a href="#platform">Platform</a>
            <a href="#how-it-works">How it works</a>
            <a href="#why-parcelsetus">Why ParcelSetus</a>
          </nav>
          <div className="landing-header-actions">
            <Link className="landing-signin" to="/sign-in">
              Sign in
            </Link>
            <Link className="landing-header-cta" to="/sign-up">
              Create account <ArrowUpRight size={15} />
            </Link>
          </div>
          <Link className="landing-mobile-signin" to="/sign-up">
            Get started <ArrowUpRight size={14} />
          </Link>
        </div>
      </header>

      <section className="landing-hero" id="platform">
        <div className="landing-hero-inner">
          <div className="landing-hero-copy">
            <div className="landing-kicker">
              <Sparkles size={14} /> A BETTER WAY TO SEND
            </div>
            <h1>
              Great things
              <br />
              are <em>going places.</em>
            </h1>
            <p className="landing-lede">
              Shipping should move your business forward. Bring bookings, pickups, payments, and
              parcel updates into one calm, clear workspace.
            </p>
            <div className="landing-hero-actions" id="get-started">
              <Link className="landing-primary-cta" to="/sign-up">
                Start shipping <ArrowRight size={17} />
              </Link>
              <Link className="landing-secondary-cta" to="/sign-in">
                Sign in to your account
              </Link>
            </div>
            <div className="landing-trust-note">
              <span className="trust-avatars">
                <i>P</i>
                <i>S</i>
                <i>+</i>
              </span>
              <span>
                <b>Made for growing sellers</b>
                <small>Less juggling. More momentum.</small>
              </span>
            </div>
          </div>
          <ShipmentPreview />
        </div>
        <div className="landing-hero-bottom">
          <span>SHIPPING, MADE SIMPLE</span>
          <span className="hero-bottom-line" />
          <span>BUILT AROUND YOUR BUSINESS</span>
        </div>
      </section>

      <section className="landing-intro" id="why-parcelsetus">
        <div className="intro-overline">THE PARCELSETUS DIFFERENCE</div>
        <div className="intro-content">
          <h2>
            One thoughtful workspace.
            <br />
            <span>Every parcel accounted for.</span>
          </h2>
          <p>
            From the first booking to the final delivery update, keep the details close and the next
            step clear. ParcelSetus gives your shipping operation room to grow.
          </p>
        </div>
        <div className="feature-grid">
          {features.map(({ icon: Icon, number, title, copy }) => (
            <article className="landing-feature" key={number}>
              <div className="feature-topline">
                <span className="feature-icon">
                  <Icon size={19} />
                </span>
                <span>{number}</span>
              </div>
              <h3>{title}</h3>
              <p>{copy}</p>
              <span className="feature-rule" />
            </article>
          ))}
        </div>
      </section>

      <section className="landing-steps" id="how-it-works">
        <div className="steps-copy">
          <div className="intro-overline">A CLEARER SHIPPING ROUTINE</div>
          <h2>
            From packed
            <br />
            to <em>on its way.</em>
          </h2>
          <p>
            Keep each step together, so shipping feels like part of your business—not another job.
          </p>
          <Link className="steps-link" to="/sign-up">
            Explore your workspace <ArrowRight size={16} />
          </Link>
        </div>
        <div className="steps-list">
          <article>
            <span>01</span>
            <div>
              <h3>Add the parcel details</h3>
              <p>Enter the delivery and package information once.</p>
            </div>
            <i>
              <Package size={17} />
            </i>
          </article>
          <article>
            <span>02</span>
            <div>
              <h3>Review and book</h3>
              <p>Choose a service and review the charge before checkout.</p>
            </div>
            <i>
              <Check size={17} />
            </i>
          </article>
          <article>
            <span>03</span>
            <div>
              <h3>Keep the delivery in view</h3>
              <p>Find shipment updates and payment records in one place.</p>
            </div>
            <i>
              <MapPin size={17} />
            </i>
          </article>
        </div>
      </section>

      <section className="landing-final-cta">
        <div className="final-cta-mark">
          <Package size={22} />
        </div>
        <div>
          <span>YOUR NEXT CHAPTER STARTS HERE</span>
          <h2>Let’s get it moving.</h2>
        </div>
        <Link to="/sign-up">
          Create your account <ArrowRight size={17} />
        </Link>
      </section>

      <footer className="landing-footer">
        <Brand light />
        <span>Shipping, with a little more clarity.</span>
        <div>
          <Link to="/sign-in">Sign in</Link>
          <Link to="/sign-up">Create account</Link>
          <a href="mailto:hello@parcelsetus.com">Contact</a>
        </div>
        <small>© 2026 ParcelSetus</small>
      </footer>
    </main>
  );
}

export default LandingPage;
