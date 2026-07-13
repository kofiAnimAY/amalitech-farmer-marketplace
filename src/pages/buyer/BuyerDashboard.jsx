import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle2, Store } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getOrders, updateOrderStatus } from '../../services/orderService';
import { StatCard } from '../../components/dashboard/DashboardCard';
import OrderCard from '../../components/orders/OrderCard';
import { OrderCardSkeleton, DashboardStatSkeleton } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import PageTransition from '../../components/common/PageTransition';
import { getWelcomeMessage, ORDER_STATUS } from '../../utils/constants';

const TABS = ['All', 'Active', 'Fulfilled'];

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('All');

  useEffect(() => {
    let active = true;
    getOrders({ buyerId: user.id }).then((data) => {
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
  };

  const filtered = useMemo(() => {
    if (tab === 'All') return orders;
    if (tab === 'Fulfilled') return orders.filter((o) => o.status === ORDER_STATUS.FULFILLED);
    return orders.filter((o) => o.status !== ORDER_STATUS.FULFILLED);
  }, [orders, tab]);

  const stats = useMemo(
    () => ({
      total: orders.length,
      active: orders.filter((o) => o.status !== ORDER_STATUS.FULFILLED).length,
      fulfilled: orders.filter((o) => o.status === ORDER_STATUS.FULFILLED).length,
    }),
    [orders]
  );

  return (
    <PageTransition className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">
          {user.buyerType || 'Buyer'} account
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink-900">
          {getWelcomeMessage(user, { returning: true })}
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          {user.businessName ? `${user.businessName} · ` : ''}
          {user.town}, {user.region}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {loading ? (
          <>
            <DashboardStatSkeleton />
            <DashboardStatSkeleton />
            <DashboardStatSkeleton />
          </>
        ) : (
          <>
            <StatCard icon={<Package className="h-[18px] w-[18px]" />} label="Total orders" value={stats.total} index={0} />
            <StatCard icon={<Clock className="h-[18px] w-[18px]" />} tone="accent" label="Active orders" value={stats.active} index={1} />
            <StatCard icon={<CheckCircle2 className="h-[18px] w-[18px]" />} tone="primary" label="Fulfilled" value={stats.fulfilled} index={2} />
          </>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-ink-900">Your orders</h2>
        <Link to="/marketplace" className="text-sm font-semibold text-primary-700 hover:underline">
          Browse more
        </Link>
      </div>

      <div className="mt-4 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold ${
              tab === t ? 'border-primary-700 bg-primary-700 text-white' : 'border-surface-line bg-white text-ink-600'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          <>
            <OrderCardSkeleton />
            <OrderCardSkeleton />
          </>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Store className="h-6 w-6" />}
            title="No orders here yet"
            description="Orders you place with farmers will show up here so you can track them."
            action={
              <Link to="/marketplace" className="btn-primary btn-sm">
                Browse marketplace
              </Link>
            }
          />
        ) : (
          filtered.map((order) => <OrderCard key={order.id} order={order} variant="buyer" onUpdateStatus={handleUpdateStatus} />)
        )}
      </div>
    </PageTransition>
  );
}
