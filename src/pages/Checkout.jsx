import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Smartphone, Banknote, CheckCircle2, PartyPopper, Store } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { placeOrder } from '../services/orderService';
import Button from '../components/common/Button';
import PageTransition from '../components/common/PageTransition';
import { REGIONS, formatCurrency } from '../utils/constants';

const PAYMENT_METHODS = [
  { id: 'Mobile Money', label: 'Mobile Money', icon: Smartphone, hint: 'MTN, Vodafone or AirtelTigo' },
  { id: 'Cash on Delivery', label: 'Cash on Delivery', icon: Banknote, hint: 'Pay when your order arrives' },
];

export default function Checkout() {
  const { items, subtotal, farmerGroups, clearCart } = useCart();
  const { user } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const [delivery, setDelivery] = useState({ region: user?.region || REGIONS[0], town: user?.town || '', address: '', notes: '' });
  const [paymentMethod, setPaymentMethod] = useState('Mobile Money');
  const [placing, setPlacing] = useState(false);
  const [placedOrders, setPlacedOrders] = useState(null);

  const deliveryFeeTotal = farmerGroups.length * 15;
  const total = subtotal + deliveryFeeTotal;

  if (items.length === 0 && !placedOrders) {
    return <Navigate to="/cart" replace />;
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setPlacing(true);
    try {
      const orders = await placeOrder({
        buyer: user,
        cartItems: items,
        delivery: { ...delivery, fee: 15 },
        paymentMethod,
      });
      setPlacedOrders(orders);
      clearCart();
      notify('Order placed successfully', 'success');
    } catch (err) {
      notify(err.message || 'Could not place order', 'error');
    } finally {
      setPlacing(false);
    }
  };

  if (placedOrders) {
    return (
      <PageTransition className="mx-auto max-w-lg px-4 py-14 text-center sm:px-6">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary-700"
        >
          <PartyPopper className="h-8 w-8" />
        </motion.div>
        <h1 className="mt-5 font-display text-2xl font-semibold text-ink-900">Order placed!</h1>
        <p className="mt-2 text-sm text-ink-500">
          {placedOrders.length > 1
            ? `Your order has been split into ${placedOrders.length} orders, one per farmer, and sent for confirmation.`
            : 'Your order has been sent to the farmer for confirmation.'}
        </p>

        <div className="mt-6 space-y-3 text-left">
          {placedOrders.map((order) => (
            <div key={order.id} className="card flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                  <Store className="h-[18px] w-[18px]" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink-900">{order.farmName}</p>
                  <p className="text-xs text-ink-500">{order.id}</p>
                </div>
              </div>
              <CheckCircle2 className="h-5 w-5 text-primary-600" />
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Link to="/buyer/dashboard" className="btn-primary">
            Track my orders
          </Link>
          <Link to="/marketplace" className="btn-secondary">
            Continue shopping
          </Link>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <h1 className="font-display text-2xl font-semibold text-ink-900">Checkout</h1>
      <p className="mt-1 text-sm text-ink-500">Confirm delivery details and payment method.</p>

      <form onSubmit={handlePlaceOrder} className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="card p-4">
            <h2 className="mb-3 font-display text-base font-semibold text-ink-900">Delivery details</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Region</label>
                  <select
                    value={delivery.region}
                    onChange={(e) => setDelivery({ ...delivery, region: e.target.value })}
                    className="field-input"
                  >
                    {REGIONS.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label">Town</label>
                  <input
                    required
                    value={delivery.town}
                    onChange={(e) => setDelivery({ ...delivery, town: e.target.value })}
                    placeholder="e.g. East Legon"
                    className="field-input"
                  />
                </div>
              </div>
              <div>
                <label className="field-label">Delivery address</label>
                <input
                  required
                  value={delivery.address}
                  onChange={(e) => setDelivery({ ...delivery, address: e.target.value })}
                  placeholder="House number, street, landmark"
                  className="field-input"
                />
              </div>
              <div>
                <label className="field-label">Delivery notes (optional)</label>
                <textarea
                  value={delivery.notes}
                  onChange={(e) => setDelivery({ ...delivery, notes: e.target.value })}
                  placeholder="Gate code, best time to deliver, etc."
                  rows={2}
                  className="field-input resize-none"
                />
              </div>
            </div>
          </div>

          <div className="card p-4">
            <h2 className="mb-3 font-display text-base font-semibold text-ink-900">Payment method</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {PAYMENT_METHODS.map((pm) => (
                <button
                  type="button"
                  key={pm.id}
                  onClick={() => setPaymentMethod(pm.id)}
                  className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition-colors ${
                    paymentMethod === pm.id ? 'border-primary-600 bg-primary-50' : 'border-surface-line bg-white'
                  }`}
                >
                  <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${paymentMethod === pm.id ? 'bg-primary-700 text-white' : 'bg-surface-sunk text-ink-500'}`}>
                    <pm.icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-ink-900">{pm.label}</span>
                    <span className="block text-[11px] text-ink-500">{pm.hint}</span>
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-ink-400">
              This is a frontend demo — no real payment is processed.
            </p>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card sticky top-20 space-y-4 p-4">
            <h2 className="font-display text-base font-semibold text-ink-900">Order summary</h2>
            <div className="max-h-52 space-y-3 overflow-y-auto pr-1">
              {farmerGroups.map((group) => (
                <div key={group.farmName}>
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-ink-700">
                    <Store className="h-3 w-3 text-primary-600" /> {group.farmName}
                  </p>
                  {group.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-0.5 text-xs text-ink-500">
                      <span>
                        {item.quantity} × {item.name}
                      </span>
                      <span className="tabular">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="space-y-1.5 border-t border-surface-line pt-3 text-sm">
              <div className="flex items-center justify-between text-ink-600">
                <span>Subtotal</span>
                <span className="tabular">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-ink-600">
                <span>Delivery ({farmerGroups.length} farmer{farmerGroups.length === 1 ? '' : 's'})</span>
                <span className="tabular">{formatCurrency(deliveryFeeTotal)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-surface-line pt-2 text-base font-bold text-ink-900">
                <span>Total</span>
                <span className="tabular">{formatCurrency(total)}</span>
              </div>
            </div>
            <Button type="submit" variant="primary" block size="lg" loading={placing}>
              Place order
            </Button>
          </div>
        </div>
      </form>
    </PageTransition>
  );
}
