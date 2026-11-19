# ParcelSetus seller portal

React + Vite seller workspace for the ParcelSetus multi-carrier parcel booking product. The app opens on seller registration/sign-in and gates the workspace behind an authenticated, email-verified account.

## Run locally

```sh
npm install
npm run dev
```

Copy `.env.example` to `.env` and set `VITE_API_URL`. Google sign-in also needs `VITE_GOOGLE_CLIENT_ID`. Run the backend and MongoDB for account registration, verification, sign-in and reset flows. For local development without SMTP, the backend returns a development verification/reset link in its response.

## Included product flows

- Seller dashboard with shipment status summaries and recent activity
- Email/password registration and sign-in, verified email gating, Google sign-in, password reset, sign-out, and sign out all devices

## Frontend structure

- `src/App.jsx` owns shared app state and selects the active page or modal.
- `src/features/` contains auth, dashboard, shipments, booking, addresses, payments, and settings UI.
- `src/components/shared.jsx` contains reusable page, metric, table, and form components.
- `src/lib/api.js` and `src/data/carrierQuotes.js` hold shared API and courier demo data.
- `src/main.jsx` mounts the app; `src/styles.css` contains the shared design system.

## Code quality

- `npm run lint` checks JavaScript, JSX, React hooks, and Fast Refresh rules with ESLint.
- `npm run format` applies the shared Prettier style.
- `npm run format:check` checks formatting without changing files.
- Guided shipment booking: pickup and delivery addresses, package details, courier estimates, review, and confirmation
- Shipment list with search, status filter, CSV export, and tracking timeline
- Address book with saved pickup locations
- Payments overview and profile settings preview

The carrier rates and booking references in preview mode are estimates. Live carrier serviceability, prices, AWB and labels require active carrier agreements and credentials on the backend.
