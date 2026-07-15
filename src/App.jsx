import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';

import Layout from './components/layout/Layout';
import RoleProtectedRoute from './components/auth/RoleProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Marketplace from './pages/Marketplace';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import NotFound from './pages/NotFound';

import BuyerDashboard from './pages/buyer/BuyerDashboard';

import FarmerDashboard from './pages/farmer/FarmerDashboard';
import FarmerListings from './pages/farmer/FarmerListings';
import ListingForm from './pages/farmer/ListingForm';
import FarmerOrders from './pages/farmer/FarmerOrders';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <Routes>
              <Route element={<Layout />}>
                {/* Public */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/product/:id" element={<ProductDetails />} />

                {/* Authenticated users only */}
                <Route element={<RoleProtectedRoute />}>
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                </Route>

                {/* Buyer only */}
                <Route element={<RoleProtectedRoute allowedRoles={['buyer']} />}>
                  <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
                </Route>

                {/* Farmer only */}
                <Route element={<RoleProtectedRoute allowedRoles={['farmer']} />}>
                  <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
                  <Route path="/farmer/listings" element={<FarmerListings />} />
                  <Route path="/farmer/listings/new" element={<ListingForm />} />
                  <Route path="/farmer/listings/:id/edit" element={<ListingForm />} />
                  <Route path="/farmer/orders" element={<FarmerOrders />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
