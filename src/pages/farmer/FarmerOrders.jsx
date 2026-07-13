import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getOrders, updateOrderStatus } from '../../services/orderService';
import OrderCard from '../../components/orders/OrderCard';
import { OrderCardSkeleton } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import PageTransition from '../../components/common/PageTransition';
import { ORDER_STATUS } from '../../utils/constants';

const TABS = ['All', ORDER_STATUS.PLACED, ORDER_STATUS.CONFIRMED, ORDER_STATUS.FULFILLED];

export default function FarmerOrders() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(searchParams.get('tab') || 'All');
  const tabParam = searchParams.get('tab');

  useEffect(() => {
    let active = true;
    getOrders({ farmerId: user.id }).then((data) => {
      if (active) {
        setOrders(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [user.id]);

  const handleUpdateStatus = async (orderId, status) => {
    const updated = await updateOrderStatus(orderId, status);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    return updated;
  };

  useEffect(() => {
    const nextTab = searchParams.get('tab') || 'All';
    if (nextTab !== tab) setTab(nextTab);
  }, [searchParams, tab]);

  const filtered = useMemo(() => {
    if (tab === 'All') return orders;
    if (tabParam === 'All' || !tabParam) return orders;
    return orders.filter((o) => o.status === tab);
  }, [orders, tab, tabParam]);

  const countFor = (status) => (status === 'All' ? orders.length : orders.filter((o) => o.status === status).length);

  return (
    <PageTransition className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <h1 className="font-display text-2xl font-semibold text-ink-900">Incoming orders</h1>
      <p className="mt-1 text-sm text-ink-500">Confirm and fulfil orders placed by buyers.</p>

      <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              if (t === 'All') params.delete('tab');
              else params.set('tab', t);
              setSearchParams(params);
              setTab(t);
            }}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold ${
              tab === t ? 'border-primary-700 bg-primary-700 text-white' : 'border-surface-line bg-white text-ink-600'
            }`}
          >
            {t} {!loading && `(${countFor(t)})`}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          <>
            <OrderCardSkeleton />
            <OrderCardSkeleton />
            <OrderCardSkeleton />
          </>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="h-6 w-6" />}
            title="No orders here"
            description="Orders matching this filter will appear here as buyers order your produce."
          />
        ) : (
          filtered.map((order) => (
            <OrderCard key={order.id} order={order} variant="farmer" onUpdateStatus={handleUpdateStatus} />
          ))
        )}
      </div>
    </PageTransition>
  );
}
