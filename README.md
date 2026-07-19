# FarmConnect

FarmConnect is a mobile-first marketplace for smallholder farmers and buyers in Ghana. The project now includes a Flask REST API for listings and orders, plus a React/Vite frontend for browsing and managing marketplace activity.

## Project overview

- Frontend: React, React Router, Tailwind CSS, Vite
- Backend: Flask + Flask-RESTX
- Data layer: MongoDB through the app database helpers
- Auth: JWT-based login and registration

## Prerequisites

Before running the app locally, make sure you have:

- Python 3.10+ and pip
- Node.js 18+ and npm
- MongoDB running locally, or a reachable MongoDB URI

Create a `.env` file in the project root with at least:

```env
JWT_KEY=change-me
MONGO_URI=mongodb://localhost:27017/testdb
DB_NAME=testdb
MOCK_DB=true
DEBUG=true
```

## Backend API

The backend runs by default on `http://localhost:8000`.

Swagger documentation is available at `http://localhost:8000/` when the backend is running.

### Authentication

All write operations require a bearer token returned by the auth endpoints.

#### POST /register
Create a new buyer or farmer account.

Request body:

```json
{
  "username": "kofi",
  "email": "kofi@example.com",
  "password": "secret123",
  "role": "farmer",
  "town": "Koforidua",
  "farmName": "Kofi Farms",
  "region": "Eastern Region",
  "businessName": ""
}
```

Response:

```json
{
  "message": "User registered successfully",
  "user": { "id": "...", "name": "...", "email": "...", "role": "farmer" },
  "token": "..."
}
```

#### POST /login
Authenticate an existing user.

Request body:

```json
{
  "email": "kofi@example.com",
  "password": "secret123"
}
```

Response:

```json
{
  "user": { "id": "...", "email": "...", "role": "farmer" },
  "token": "..."
}
```

### Listings

#### GET /marketplace/listings
Return all marketplace listings.

Response:

```json
{
  "listings": []
}
```

#### POST /marketplace/listings
Create a new listing. Requires a farmer token.

Request body:

```json
{
  "item_name": "Tomatoes",
  "description": "Freshly harvested tomatoes",
  "price": 12.5,
  "quantity": 40,
  "region": "Greater Accra",
  "category": "Vegetables",
  "unit": "crates",
  "harvest_date": "2026-07-19"
}
```

#### PATCH /marketplace/listings
Update an existing listing. Requires the authenticated farmer to own that listing.

Request body:

```json
{
  "listing_id": "64b0...",
  "new_name": "Tomatoes",
  "new_price": 13.5,
  "new_quantity": 30,
  "description": "Updated description"
}
```

#### DELETE /marketplace/listings
Delete a listing. Requires the authenticated farmer to own that listing.

Request body:

```json
{
  "listing_id": "64b0..."
}
```

### Orders

#### POST /marketplace/order
Place an order for a listing. Requires a buyer token.

Request body:

```json
{
  "listing_id": "64b0...",
  "quantity": 5
}
```

#### PATCH /marketplace/order
Update the status of an existing order. Requires a farmer token.

Request body:

```json
{
  "order_id": "64b0...",
  "new_status": "fulfilled"
}
```

## Running the application

### Option 1: Run backend and frontend separately

#### Backend

```bash
pip install -r requirements.txt
python app.py
```

The backend will start on `http://0.0.0.0:8000`.

#### Frontend

```bash
npm install
$env:VITE_API_BASE_URL = 'http://localhost:8000'
npm run dev
```

On Windows PowerShell, the frontend will run on the Vite URL printed in the terminal (usually `http://localhost:5173`).

### Option 2: Use the provided helpers

#### Make targets

```bash
make install
make run-backend
make run-frontend
```

You can also start both together in a compatible shell with:

```bash
make dev
```

> The `make dev` target uses backgrounding, so it works best in Git Bash, WSL, or a Unix-like shell. On Windows PowerShell, use two terminals or the helper scripts.

#### Helper scripts

- POSIX:

```bash
./scripts/run-dev.sh http://localhost:8000
```

- PowerShell:

```powershell
./scripts/run-dev.ps1 -ApiBase 'http://localhost:8000'
```

## Demo accounts

The frontend also includes demo accounts for quick testing. The default password is `password123`.

| Role | Email | Notes |
| --- | --- | --- |
| Farmer | kofi.mensah@farmconnect.test | Vegetables, Eastern Region |
| Farmer | ama.boateng@farmconnect.test | Grains and tubers, Ashanti Region |
| Buyer | abena.osei@farmconnect.test | Household, Greater Accra |
| Buyer | kojo.appiah@farmconnect.test | Restaurant, Greater Accra |

## Project structure

```text
app/            Flask backend and API namespaces
src/            React frontend and pages
scripts/        Helper scripts for local development
tests/          Python unit tests
```

## Running tests

```bash
pytest -q
```


