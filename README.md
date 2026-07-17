# FarmConnect

A mobile-first frontend for a smallholder farmer marketplace, connecting Ghanaian farmers
directly with restaurants, households and retailers. **Frontend only** — all data is mocked
and no real backend, auth, or payments are involved. Built with React, React Router, Tailwind
CSS and Framer Motion.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (defaults to `http://localhost:5173`).

```bash
npm run build     # production build to /dist
npm run preview   # preview the production build locally
```

## Demo accounts

Any mock account uses the password `password123`. The login screen also has one-tap
"Farmer" / "Buyer" demo login buttons for convenience.

| Role   | Email                          | Notes                          |
|--------|---------------------------------|---------------------------------|
| Farmer | kofi.mensah@farmconnect.test    | Vegetables, Eastern Region      |
| Farmer | ama.boateng@farmconnect.test    | Grains/tubers, Ashanti Region   |
| Buyer  | abena.osei@farmconnect.test     | Household, Greater Accra        |
| Buyer  | kojo.appiah@farmconnect.test    | Restaurant, Greater Accra       |

You can also register a brand-new account with either role from `/register`.

## Project structure

```
src/
  components/
    auth/        RoleProtectedRoute — guards farmer-only / buyer-only routes
    common/      Button, LoadingSpinner, SkeletonLoader, Badge, Modal, EmptyState, PageTransition
    dashboard/   StatCard, DashboardCard (quick-action tiles)
    layout/      Navbar, BottomNav (mobile tab bar), Layout, Footer
    orders/      OrderCard, OrderTrackingTimeline
    product/     ProductCard, SearchFilter
  context/       AuthContext, CartContext, ToastContext
  data/          mockUsers.js, mockProducts.js, mockOrders.js
  pages/         Landing, Login, Register, Marketplace, ProductDetails, Cart, Checkout, ...
    buyer/       BuyerDashboard
    farmer/      FarmerDashboard, FarmerListings, ListingForm (create + edit), FarmerOrders
  services/      authService, productService, orderService — the mock "API" layer
  utils/         constants.js (enums/formatters), enrich.js (join product ↔ farmer)
```

## Where the real backend plugs in

Every network-shaped call goes through `src/services/*Service.js`. Each function has a
`TODO(backend)` comment naming the REST endpoint it should become
(e.g. `GET /products`, `POST /orders`, `PATCH /orders/:id/status`). None of the UI code talks
to mock data directly — pages and components only ever call these service functions, so
swapping `simulateRequest(...)` for a real `fetch`/`axios` call is a localized change:

- `authService.js` → `loginUser`, `registerUser`, `getUserProfile`, `updateUserProfile`
- `productService.js` → `getProducts`, `getProductById`, `createListing`, `updateListing`, `deleteListing`
- `orderService.js` → `getOrders`, `getOrderById`, `placeOrder`, `updateOrderStatus`

`AuthContext` currently persists a mock session (`{ userId, token }`) to `localStorage`;
replace that with real JWT/cookie session handling when auth is live. `CartContext` is
frontend-only state (also persisted to `localStorage`) since carts don't need a backend
until checkout.

## Notes on mock data

- Product photos are stock imagery (Unsplash), standing in for farmer-uploaded photos.
  `ProductCard` and `ProductDetails` fall back to a clean category icon if an image ever
  fails to load, so this is safe to swap for real uploads later.
- Prices are in Ghanaian Cedis (GH₵), quantities/units reflect how produce is actually sold
  in local markets (crates, bags, bunches, tubers, birds, etc).
- Orders are split one order per farmer at checkout, mirroring how most multi-vendor
  marketplaces work — each farmer only ever sees and manages their own orders.

## Running with the backend

This repository now includes a small Flask backend under `app/` and a React frontend under `src/`.
A `Makefile` is provided to simplify common workflows. The examples below assume the backend runs on `http://localhost:8000`.

POSIX / Git Bash (Linux, macOS, Windows Git Bash):

```bash
# Install everything
make install

# Start backend only
make run-backend

# Start frontend only (Vite will use the backend at VITE_API_BASE_URL)
make run-frontend

# Start backend (background) and frontend together
make dev

# Run Python tests
make test
```

Windows PowerShell (examples):

```powershell
# Install Python deps
pip install -r requirements.txt

# Install frontend deps
npm install

# Start backend (in a separate terminal)
python app.py

# Start frontend (in a separate terminal)
$env:VITE_API_BASE_URL = 'http://localhost:8000'
npm run dev
```

Notes:
- The Makefile `dev` target uses POSIX backgrounding (`&`) and may not work in cmd.exe / PowerShell — use two terminals on Windows or run inside Git Bash / WSL.
- If your backend uses a different host/port, set `VITE_API_BASE_URL` appropriately before starting the frontend.

Helper scripts

Two convenience scripts are provided in `scripts/` to run both servers locally:

- POSIX: `scripts/run-dev.sh [API_BASE]` — starts `python app.py` in the background and runs Vite with `VITE_API_BASE_URL` set to `API_BASE` (default: `http://localhost:8000`).

- PowerShell: `scripts/run-dev.ps1` — run with `.
  scripts\run-dev.ps1 -ApiBase 'http://localhost:8000'` to start the backend and then the frontend (foreground).

Examples:

POSIX:
```bash
./scripts/run-dev.sh http://localhost:8000
```

PowerShell:
```powershell
.\scripts\run-dev.ps1 -ApiBase 'http://localhost:8000'
```


