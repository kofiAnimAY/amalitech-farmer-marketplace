import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ListChecks, Clock, Wallet, AlertTriangle, PlusCircle, ClipboardList, Sprout } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getProducts } from '../../services/productService';
import { getOrders, updateOrderStatus } from '../../services/orderService';
import { StatCard, DashboardCard } from '../../components/dashboard/DashboardCard';
import OrderCard from '../../components/orders/OrderCard';
import { OrderCardSkeleton, DashboardStatSkeleton } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import PageTransition from '../../components/common/PageTransition';
import { getWelcomeMessage, formatCurrency, ORDER_STATUS, AVAILABILITY } from '../../utils/constants';

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([getProducts({ farmerId: user.id }), getOrders({ farmerId: user.id })]).then(([p, o]) => {
      if (!active) return;
      setListings(p);
      setOrders(o);
      setLoading(false);
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

  const stats = useMemo(() => {
    const pendingOrders = orders.filter((o) => o.status !== ORDER_STATUS.FULFILLED).length;
    const revenue = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.price * i.quantity, 0), 0);
    const lowStock = listings.filter((p) => p.availability === AVAILABILITY.LOW_STOCK || p.availability === AVAILABILITY.OUT_OF_STOCK).length;
    return { activeListings: listings.length, pendingOrders, revenue, lowStock };
  }, [orders, listings]);

  const recentOrders = orders.slice(0, 3);

  return (
    <PageTransition className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <div>
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary-600">
          <Sprout className="h-3.5 w-3.5" /> {user.farmName}
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink-900">
          {getWelcomeMessage(user, { returning: true })}
        </h1>
        <p className="mt-1 text-sm text-ink-500">{user.town}, {user.region}</p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <DashboardStatSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              icon={<ListChecks className="h-[18px] w-[18px]" />}
              label="Active listings"
              value={stats.activeListings}
              index={0}
              to="/farmer/listings"
            />
            <StatCard
              icon={<Clock className="h-[18px] w-[18px]" />}
              tone="accent"
              label="Pending orders"
              value={stats.pendingOrders}
              index={1}
              to="/farmer/orders"
            />
            <StatCard
              icon={<Wallet className="h-[18px] w-[18px]" />}
              label="Revenue (fulfilled)"
              value={formatCurrency(stats.revenue)}
              index={2}
              to="/farmer/orders"
            />
            <StatCard
              icon={<AlertTriangle className="h-[18px] w-[18px]" />}
              tone="danger"
              label="Needs attention"
              value={stats.lowStock}
              index={3}
              to="/farmer/listings?filter=needs-attention"
            />
          </>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <DashboardCard
          to="/farmer/listings/new"
          icon={<PlusCircle className="h-5 w-5" />}
          title="Add new listing"
          description="List fresh produce for sale"
          index={0}
        />
        <DashboardCard
          to="/farmer/listings"
          icon={<ListChecks className="h-5 w-5" />}
          title="Manage listings"
          description={`${stats.activeListings} active listing${stats.activeListings === 1 ? '' : 's'}`}
          tone="accent"
          index={1}
        />
        <DashboardCard
          to="/farmer/orders"
          icon={<ClipboardList className="h-5 w-5" />}
          title="Incoming orders"
          description={`${stats.pendingOrders} awaiting action`}
          tone="soil"
          index={2}
        />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-ink-900">Recent orders</h2>
        <Link to="/farmer/orders" className="text-sm font-semibold text-primary-700 hover:underline">
          View all
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          <>
            <OrderCardSkeleton />
            <OrderCardSkeleton />
          </>
        ) : recentOrders.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="h-6 w-6" />}
            title="No orders yet"
            description="Once buyers order your produce, they'll show up here."
          />
        ) : (
          recentOrders.map((order) => (
            <OrderCard key={order.id} order={order} variant="farmer" onUpdateStatus={handleUpdateStatus} />
          ))
        )}
      </div>
    </PageTransition>
  );
}
