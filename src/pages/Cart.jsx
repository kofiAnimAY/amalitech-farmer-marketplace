import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Store } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/common/EmptyState';
import PageTransition from '../components/common/PageTransition';
import { formatCurrency } from '../utils/constants';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, subtotal, farmerGroups } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const estimatedDelivery = farmerGroups.length * 15;
  const total = subtotal + estimatedDelivery;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    if (user.role !== 'buyer') {
      navigate('/checkout'); // RoleProtectedRoute will bounce non-buyers back appropriately
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <PageTransition className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="mb-6 font-display text-2xl font-semibold text-ink-900">Your cart</h1>
        <EmptyState
          icon={<ShoppingBag className="h-6 w-6" />}
          title="Your cart is empty"
          description="Browse the marketplace and add fresh produce to get started."
          action={
            <Link to="/marketplace" className="btn-primary btn-sm">
              Browse marketplace
            </Link>
          }
        />
      </PageTransition>
    );
  }

  return (
    <PageTransition className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <h1 className="font-display text-2xl font-semibold text-ink-900">Your cart</h1>
      <p className="mt-1 text-sm text-ink-500">
        {items.length} listing{items.length === 1 ? '' : 's'} from {farmerGroups.length} farmer
        {farmerGroups.length === 1 ? '' : 's'}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <AnimatePresence initial={false}>
            {farmerGroups.map((group) => (
              <motion.div
                key={group.farmName}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}
                className="card overflow-hidden"
              >
                <div className="flex items-center gap-2 border-b border-surface-line bg-surface-sunk px-4 py-2.5">
                  <Store className="h-3.5 w-3.5 text-primary-600" />
                  <p className="text-xs font-semibold text-ink-700">{group.farmName}</p>
                </div>
                <div className="divide-y divide-surface-line">
                  {group.items.map((item) => (
                    <motion.div layout key={item.id} className="flex items-center gap-3 p-3.5">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 shrink-0 rounded-xl object-cover"
                        onError={(e) => (e.currentTarget.style.opacity = 0)}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-semibold text-ink-900">{item.name}</p>
                        <p className="tabular text-xs text-ink-500">
                          {formatCurrency(item.price)} / {item.unit}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex items-center rounded-lg border border-surface-line">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="flex h-7 w-7 items-center justify-center text-ink-600 disabled:opacity-30"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="tabular w-7 text-center text-xs font-bold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.maxQuantity}
                              className="flex h-7 w-7 items-center justify-center text-ink-600 disabled:opacity-30"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="rounded-lg p-1.5 text-ink-400 hover:bg-danger-50 hover:text-danger-500"
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="tabular shrink-0 text-sm font-bold text-ink-900">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-1">
          <div className="card sticky top-20 space-y-3 p-4">
            <h2 className="font-display text-base font-semibold text-ink-900">Order summary</h2>
            <div className="flex items-center justify-between text-sm text-ink-600">
              <span>Subtotal</span>
              <span className="tabular">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-ink-600">
              <span>Estimated delivery</span>
              <span className="tabular">{formatCurrency(estimatedDelivery)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-surface-line pt-3 text-base font-bold text-ink-900">
              <span>Total</span>
              <span className="tabular">{formatCurrency(total)}</span>
            </div>
            <button onClick={handleCheckout} className="btn-primary btn-block btn-lg mt-2">
              Checkout <ArrowRight className="h-4 w-4" />
            </button>
            <p className="text-center text-[11px] text-ink-400">Delivery fee is calculated per farmer at checkout.</p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
