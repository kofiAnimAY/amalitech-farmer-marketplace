import { NavLink } from 'react-router-dom';
import { Home, Store, ShoppingCart, ClipboardList, LayoutDashboard, ListChecks, Plus } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const buyerTabs = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/marketplace', label: 'Browse', icon: Store },
  { to: '/cart', label: 'Cart', icon: ShoppingCart, showCartBadge: true },
  { to: '/buyer/dashboard', label: 'Orders', icon: ClipboardList },
];

const farmerTabs = [
  { to: '/farmer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/farmer/listings', label: 'Listings', icon: ListChecks },
  { to: '/farmer/listings/new', label: 'Add', icon: Plus, isFab: true },
  { to: '/farmer/orders', label: 'Orders', icon: ClipboardList },
];

export default function BottomNav({ role }) {
  const { itemCount } = useCart();
  const tabs = role === 'farmer' ? farmerTabs : buyerTabs;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-surface-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-6xl items-stretch justify-around px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          if (tab.isFab) {
            return (
              <NavLink key={tab.to} to={tab.to} className="relative flex flex-1 flex-col items-center justify-center py-2">
                <span className="-mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary-700 text-white shadow-raised">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="mt-1 text-[10px] font-semibold text-ink-600">{tab.label}</span>
              </NavLink>
            );
          }
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold ${
                  isActive ? 'text-primary-700' : 'text-ink-400'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative">
                    <Icon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 2} />
                    {tab.showCartBadge && itemCount > 0 && (
                      <span className="absolute -right-2 -top-1.5 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-accent-500 px-1 text-[9px] font-bold text-ink-900">
                        {itemCount}
                      </span>
                    )}
                  </span>
                  {tab.label}
                  {isActive && (
                    <span className="absolute -top-px h-0.5 w-8 rounded-full bg-primary-700" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
