# Frontend ↔ Backend Connection Code

---

## 1. Frontend — API Base URL (`src/pages/BuyerView.jsx`)

The frontend reads the backend URL from the `.env` file:

```js
// .env (frontend root)
VITE_API_URL=http://localhost:5000/api

// How it's used in any React page:
const API = import.meta.env.VITE_API_URL;

// Public call (no login needed):
const response = await fetch(`${API}/products`);

// Protected call (sends JWT token in header):
const token = localStorage.getItem('token');
const response = await fetch(`${API}/orders`, {
    headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## 2. Backend — CORS + Routes (`backend/server.js`)

The backend allows the frontend's domain and mounts all routes:

```js
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes     from './routes/authRoutes.js';
import productRoutes  from './routes/productRoutes.js';
import orderRoutes    from './routes/orderRoutes.js';
import marketingRoutes from './routes/marketingRoutes.js';
import userRoutes     from './routes/userRoutes.js';

connectDB(); // connects to MongoDB

const app = express();

// CORS — allows the React frontend to call this backend
app.use(cors({
    origin: [
        'http://localhost:5173',                        // local dev
        'https://global-handlooms-2k4t.vercel.app'     // deployed frontend
    ],
    credentials: true,
}));

app.use(express.json({ limit: '50mb' }));

// Routes — each path maps to a separate route file
app.use('/api/auth',      authRoutes);
app.use('/api/products',  productRoutes);
app.use('/api/orders',    orderRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/user',      userRoutes);

app.listen(process.env.PORT || 5000);
```

---

## 3. Backend — JWT Auth Middleware (`backend/middleware/authMiddleware.js`)

Protects routes — checks the token the frontend sends:

```js
import jwt from 'jsonwebtoken';

// Runs before protected route handlers
export const protect = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // reads "Bearer <token>"

    if (!token) return res.status(401).json({ error: "No token provided." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
};

// Role guard — used on admin-only routes
export const authorizeRoles = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role))
        return res.status(403).json({ error: "Access denied." });
    next();
};
```

---

## 4. Backend — Database Connection (`backend/config/db.js`)

```js
import mongoose from 'mongoose';

const connectDB = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
};

export default connectDB;
```

---

## 5. Example — Full Request Cycle

**Buyer clicks "Place Order":**

```
React (CheckoutPage.jsx)
  → POST http://localhost:5000/api/orders
  → Header: Authorization: Bearer eyJhbGci...

Express (orderRoutes.js)
  → protect middleware checks JWT ✓
  → createOrder() runs

orderController.js
  → saves order to MongoDB
  → returns { success: true, order }

React
  → shows success toast
  → navigates to /buyer?tab=orders
```
