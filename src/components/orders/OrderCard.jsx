import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MapPin, User, Store } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { OrderStatusBadge } from '../common/Badge';
import OrderTrackingTimeline from './OrderTrackingTimeline';
import Button from '../common/Button';
import { formatCurrency, formatDateTime, ORDER_STATUS } from '../../utils/constants';

const NEXT_STATUS = {
  [ORDER_STATUS.PLACED]: { next: ORDER_STATUS.CONFIRMED, cta: 'Confirm order' },
  [ORDER_STATUS.CONFIRMED]: { next: ORDER_STATUS.FULFILLED, cta: 'Mark as fulfilled' },
  [ORDER_STATUS.FULFILLED]: null,
};

/**
 * @param {'buyer'|'farmer'} variant
 * @param {(orderId:string, status:string) => Promise<void>} onUpdateStatus - farmer only
 */
export default function OrderCard({ order, variant = 'buyer', onUpdateStatus }) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const { notify } = useToast();

  const total = order.items.reduce((s, i) => s + i.price * i.quantity, 0) + order.deliveryFee;
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
  const advance = NEXT_STATUS[order.status];
  const canManage = variant === 'farmer' && Boolean(onUpdateStatus);

  const handleAdvance = async (event) => {
    event?.stopPropagation();
    if (!advance || !onUpdateStatus) return;
    setUpdating(true);
    try {
      const updated = await onUpdateStatus(order.id, advance.next);
      if (updated?.status) {
        const message = advance.next === ORDER_STATUS.FULFILLED ? 'Order marked as fulfilled.' : 'Order confirmed successfully.';
        notify(message, 'success');
      }
    } catch (error) {
      notify(error?.message || 'Unable to update this order right now.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <motion.div layout className="card overflow-hidden">
      <button onClick={() => setExpanded((v) => !v)} className="w-full p-4 text-left">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-ink-400">{order.id}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-ink-900">
              {variant === 'buyer' ? (
                <>
                  <Store className="h-3.5 w-3.5 text-primary-600" /> {order.farmName}
                </>
              ) : (
                <>
                  <User className="h-3.5 w-3.5 text-primary-600" /> {order.buyerBusiness || order.buyerName}
                </>
              )}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="mt-3 flex items-center gap-3">
          <div className="flex -space-x-3">
            {order.items.slice(0, 3).map((item, i) => (
              <img
                key={i}
                src={item.image}
                alt=""
                className="h-11 w-11 rounded-xl border-2 border-white object-cover"
                onError={(e) => (e.currentTarget.style.visibility = 'hidden')}
              />
            ))}
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-1 text-xs text-ink-600">
              {itemCount} item{itemCount === 1 ? '' : 's'} · {order.items.map((i) => i.name).join(', ')}
            </p>
            <p className="tabular text-sm font-bold text-primary-800">{formatCurrency(total)}</p>
          </div>
          <ChevronDown className={`h-4 w-4 shrink-0 text-ink-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-surface-line px-4 py-4">
              <OrderTrackingTimeline order={order} viewer={variant} />

              <div className="mt-4 space-y-2">
                {order.items.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between text-sm">
                    <span className="text-ink-600">
                      {item.quantity} × {item.name}
                    </span>
                    <span className="tabular font-medium text-ink-900">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between text-sm text-ink-500">
                  <span>Delivery fee</span>
                  <span className="tabular">{formatCurrency(order.deliveryFee)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-surface-line pt-2 text-sm font-bold text-ink-900">
                  <span>Total</span>
                  <span className="tabular">{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-2 rounded-xl bg-surface-sunk px-3 py-2.5 text-xs text-ink-600">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" />
                <span>
                  {order.deliveryAddress}, {order.deliveryTown}, {order.deliveryRegion}
                  {order.deliveryNotes ? ` — ${order.deliveryNotes}` : ''}
                </span>
              </div>

              <p className="mt-2 text-[11px] text-ink-400">
                Placed {formatDateTime(order.placedAt)} · Paying by {order.paymentMethod}
              </p>

              {canManage && advance && (
                <Button variant="primary" block loading={updating} onClick={handleAdvance} className="mt-4">
                  {advance.cta}
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
