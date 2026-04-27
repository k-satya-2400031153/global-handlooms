# Global Handlooms — Architecture & Frontend-Backend Connection

> **Project by:** K. Satya (Registration No: 2400031153)
> **Stack:** React (Vite) + Node.js (Express) + MongoDB (Mongoose)

---

## 1. Project Overview

Global Handlooms is a full-stack e-commerce platform for handloom artisans and buyers. It has:

- A **React frontend** (deployed on Vercel) that the user sees and interacts with.
- A **Node.js / Express backend** (deployed on Render) that handles business logic, authentication, and database operations.
- A **MongoDB Atlas database** that permanently stores all users, products, orders, and discounts.

---

## 2. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                            │
│                                                                  │
│   React App (Vite)  ─── localhost:5173 (dev)                     │
│                     ─── Vercel URL (production)                  │
│                                                                  │
│   Pages: HomePage, LoginPage, BuyerView, ArtisanView,           │
│           AdminView, MarketingView, CheckoutPage, ProfilePage    │
└──────────────────┬───────────────────────────────────────────────┘
                   │
                   │  HTTP Requests (fetch API)
                   │  with Authorization: Bearer <JWT Token>
                   │
                   ▼
┌──────────────────────────────────────────────────────────────────┐
│                    NODE.JS / EXPRESS BACKEND                     │
│                                                                  │
│   server.js  ─── localhost:5000 (dev)                            │
│              ─── Render URL (production)                         │
│                                                                  │
│   Routes:   /api/auth       /api/products                        │
│             /api/orders     /api/marketing                       │
│             /api/user                                            │
└──────────────────┬───────────────────────────────────────────────┘
                   │
                   │  Mongoose ODM (Object Document Mapper)
                   │
                   ▼
┌──────────────────────────────────────────────────────────────────┐
│                     MONGODB ATLAS (Cloud DB)                     │
│                                                                  │
│   Collections:  users    products    orders    discounts         │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. How Frontend Connects to Backend

### 3.1 The Environment Variable Bridge

The frontend does **not** hardcode the backend URL. Instead it uses an environment variable:

**File: `frontend/.env`**
```
VITE_API_URL=http://localhost:5000/api       ← for local development
VITE_API_URL=https://your-app.onrender.com/api  ← for production
```

**Used in every page like this:**
```js
const API = import.meta.env.VITE_API_URL;

// Example usage inside BuyerView.jsx:
const response = await fetch(`${API}/products`);
```

This way, the **same frontend code** works both locally and in production — you just change the `.env` file.

---

### 3.2 CORS — Allowing Frontend to Talk to Backend

By default, browsers block requests from one domain (Vercel) to another (Render). CORS (Cross-Origin Resource Sharing) is configured in the backend to allow this.

**File: `backend/server.js`**
```js
app.use(cors({
    origin: [
        'http://localhost:5173',                          // local React dev server
        'https://global-handlooms-2k4t.vercel.app'       // deployed frontend
    ],
    credentials: true,
}));
```

**Simple explanation:** The backend tells the browser: *"It is safe to accept requests from these two addresses."*

---

### 3.3 A Typical API Request (Step by Step)

**Example: Buyer views the product list**

```
Step 1 — React sends a fetch request:
         GET http://localhost:5000/api/products
         (no token needed — products are public)

Step 2 — Express receives it in server.js:
         app.use('/api/products', productRoutes)

Step 3 — productRoutes.js matches the route:
         router.get('/', getProducts)

Step 4 — getProducts() in productController.js:
         const products = await Product.find({});
         res.json({ success: true, data: products });

Step 5 — MongoDB returns all product documents.

Step 6 — React receives the JSON response:
         setProducts(data.data);
```

---

## 4. Authentication Flow (Login / Register)

Authentication is done using **OTP (One-Time Password) + JWT (JSON Web Token)**.

### Step-by-Step Login Flow:

```
User enters Email + Password on LoginPage.jsx
          │
          ▼
POST /api/auth/send-otp
  → Backend checks password against bcrypt hash in MongoDB
  → If correct, generates a 6-digit OTP (stored in server memory for 5 min)
  → Sends OTP to user's email via Nodemailer + Gmail SMTP
          │
          ▼
User enters the OTP they received
          │
          ▼
POST /api/auth/verify-otp
  → Backend checks if OTP matches and hasn't expired
  → Creates a JWT Token: { id, email, role } signed with JWT_SECRET
  → Returns: { token, user } to the frontend
          │
          ▼
Frontend stores in browser:
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
          │
          ▼
All future API calls include:
  Header: Authorization: Bearer <token>
```

### Why JWT?

JWT (JSON Web Token) is a small encoded string that proves who the user is. The backend signs it with a secret key (`JWT_SECRET`). Every protected route verifies this token — if it's valid, the request is allowed; if it's missing or wrong, the backend returns a 401 error.

---

## 5. Role-Based Access Control (RBAC)

The system has **4 user roles**. Each role can only access specific routes and pages.

| Role | Dashboard Page | What They Can Do |
|---|---|---|
| **Buyer** | `/buyer` | Browse market, add to cart, place & track orders |
| **Artisan** | `/artisan` | Create, edit, and delete their own products |
| **Admin** | `/admin` | View all orders, update order status, manage all products |
| **Marketing Specialist** | `/marketing` | Create discount campaigns, broadcast emails, view analytics |

### How it works — Two-Layer Protection:

**Layer 1 — Frontend ProtectedRoute (React)**
```jsx
// In App.jsx — prevents unauthorized page access
<Route path="/buyer"
  element={
    <ProtectedRoute requiredRole="Buyer">
      <BuyerView />
    </ProtectedRoute>
  }
/>
```
If someone without the "Buyer" role tries to visit `/buyer`, React redirects them away immediately.

**Layer 2 — Backend Middleware (Express)**
```js
// In orderRoutes.js — backend double check
router.get('/all',
  protect,                       // checks JWT token is valid
  authorizeRoles('Admin'),       // checks role is 'Admin'
  getAllOrders
);
```
Even if someone bypasses the frontend, the backend rejects unauthorized API requests.

---

## 6. Backend API Reference

All routes are prefixed with `/api`.

### Authentication Routes — `/api/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/send-otp` | Public | Sends OTP to email. For login, also verifies password first. |
| POST | `/verify-otp` | Public | Verifies OTP and returns JWT token + user object |
| POST | `/forgot-password` | Public | Sends password-reset OTP to registered email |
| POST | `/set-password` | Protected (JWT) | Updates bcrypt-hashed password |
| POST | `/override-token` | Code-protected | Admin/Marketing backdoor access via secret code |

### Product Routes — `/api/products`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Public | Get all products (supports ?search, ?material, ?region) |
| GET | `/artisan` | Artisan (JWT) | Get only this artisan's own products |
| POST | `/` | Artisan / Admin | Create a new product listing |
| PUT | `/:id` | Artisan / Admin | Update a product |
| DELETE | `/:id` | Artisan / Admin | Delete a product |

### Order Routes — `/api/orders`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | Buyer (JWT) | Place a new order (deducts inventory) |
| GET | `/` | Buyer (JWT) | Get this buyer's own orders |
| DELETE | `/:id` | Buyer (JWT) | Cancel an order (only if Pending/Processing) |
| GET | `/:id/invoice` | Buyer (JWT) | Get invoice data for a specific order |
| GET | `/all` | Admin only | Get all orders in the system |
| PATCH | `/:id/status` | Admin only | Update order status + write tracking history |
| PATCH | `/:id/auto-fulfill` | Admin only | Toggle auto-fulfillment engine |

### Marketing Routes — `/api/marketing`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/discounts/active` | **Public** | Get the currently active discount (shown as promo banner) |
| POST | `/broadcast` | Marketing / Admin | Send bulk email to all users |
| POST | `/discounts` | Marketing / Admin | Create a new discount/promo |
| GET | `/discounts` | Marketing / Admin | Get all discounts |
| PATCH | `/discounts/:id/status` | Marketing / Admin | Activate or deactivate a discount |
| DELETE | `/discounts/:id` | Marketing / Admin | Delete a discount |
| GET | `/analytics` | Marketing / Admin | Revenue, order stats, top products |

### User Routes — `/api/user`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/profile` | Protected (JWT) | Get logged-in user's profile |
| PUT | `/profile` | Protected (JWT) | Update name, phone, storeName, location |
| POST | `/addresses` | Protected (JWT) | Add a shipping address to address book |
| DELETE | `/addresses/:id` | Protected (JWT) | Remove a saved address |

---

## 7. Database Models (MongoDB Collections)

### User Collection
```js
{
  email: String (unique, required),
  role: String  (Admin | Artisan | Buyer | Marketing Specialist),
  name: String,
  phone: String,
  storeName: String,       // Artisan only
  location: String,        // Artisan only
  savedAddresses: [        // Buyer only
    { label, fullName, phone, addressLine1, city, state, pincode }
  ],
  password: String,        // bcrypt hashed
  isVerified: Boolean,
  createdAt, updatedAt     // auto timestamps
}
```

### Product Collection
```js
{
  title: String,
  price: Number,
  inventory: Number,
  originRegion: String,
  materialsUsed: [String],
  image: String,           // base64 or URL
  artisanId: ObjectId,     // references User (the artisan who owns it)
  createdAt, updatedAt
}
```

### Order Collection
```js
{
  buyerId: ObjectId,        // references User
  products: [
    { productId: ObjectId, quantity: Number }
  ],
  totalAmount: Number,
  shippingAddress: { fullName, phone, addressLine1, city, state, pincode },
  paymentMode: String,      // UPI | CARD | COD
  paymentId: String,
  status: String,           // Pending → Processing → Shipped → Out for Delivery → Delivered
  trackingNumber: String,
  trackingHistory: [
    { status: String, location: String, timestamp: Date }
  ],
  autoFulfillment: Boolean,
  createdAt, updatedAt
}
```

### Discount Collection
```js
{
  title: String,
  percentage: Number,
  isActive: Boolean,
  createdAt, updatedAt
}
```

---

## 8. Security Measures

| Security Feature | Where | How |
|---|---|---|
| **Password Hashing** | Backend | bcryptjs with 12 salt rounds — passwords are never stored as plain text |
| **JWT Authentication** | Backend | Tokens signed with `JWT_SECRET`, expire in 24 hours |
| **OTP Expiry** | Backend | OTPs expire after 5 minutes (stored in server memory) |
| **RBAC Guards** | Backend | `authorizeRoles()` middleware blocks wrong-role requests |
| **Protected Routes** | Frontend | `ProtectedRoute` component checks JWT + role before rendering pages |
| **No secrets in frontend** | Frontend | All secrets (JWT_SECRET, DB passwords) stay on server only |
| **CORS Whitelist** | Backend | Only Vercel frontend and localhost are allowed to call the API |
| **Payload Limit** | Backend | 50MB limit set for image uploads |

---

## 9. Real-Time Features

### Logistics Engine (Auto Order Progression)
- Runs on the backend as a scheduled timer (`setInterval`)
- Every few minutes, automatically advances eligible orders through statuses:
  `Pending → Processing → Shipped → Out for Delivery → Delivered`
- Writes timestamped tracking history for each status change

### Live Order Polling (Frontend)
- `BuyerView.jsx` polls `/api/orders` every **15 seconds** automatically
- Shows a live "Syncing..." indicator while polling
- Buyers see order status updates without refreshing the page

### Live Promo Banner
- `App.jsx` polls `/api/marketing/discounts/active` every **60 seconds**
- If a Marketing Specialist activates a discount, the promo banner appears on the home/buyer pages within 1 minute for all users

---

## 10. Deployment Setup

| Layer | Service | URL |
|---|---|---|
| **Frontend** | Vercel | `https://global-handlooms-2k4t.vercel.app` |
| **Backend** | Render | `https://<your-backend>.onrender.com` |
| **Database** | MongoDB Atlas | Cloud cluster (always-on) |

### Frontend Environment Variables (Vercel Dashboard)
```
VITE_API_URL = https://<your-backend-name>.onrender.com/api
```

### Backend Environment Variables (Render Dashboard)
```
MONGO_URI    = mongodb+srv://...               # MongoDB Atlas connection string
JWT_SECRET   = <strong random string>          # For signing JWT tokens
EMAIL        = your_email@gmail.com            # Nodemailer sender
APP_PASSWORD = your_gmail_app_password         # Gmail App Password
PORT         = 5000                            # Render sets this automatically
```

---

## 11. Frontend Pages & What API They Call

| Page | Route | APIs Called |
|---|---|---|
| **HomePage** | `/` | `/marketing/discounts/active` |
| **LoginPage** | `/login` | `/auth/send-otp`, `/auth/verify-otp`, `/auth/forgot-password` |
| **BuyerView** | `/buyer` | `/products`, `/orders` (+ polls every 15s) |
| **CheckoutPage** | `/checkout` | `/orders` (POST to create order) |
| **ArtisanView** | `/artisan` | `/products/artisan`, `/products` (POST/PUT/DELETE) |
| **AdminView** | `/admin` | `/orders/all`, `/orders/:id/status`, `/products` |
| **MarketingView** | `/marketing` | `/marketing/broadcast`, `/marketing/discounts`, `/marketing/analytics` |
| **ProfilePage** | `/profile` | `/user/profile`, `/user/addresses`, `/auth/set-password` |
| **InvoicePage** | `/invoice/:id` | `/orders/:id/invoice` |

---

*This document describes the complete connection between the React frontend and Node.js backend of the Global Handlooms platform.*
