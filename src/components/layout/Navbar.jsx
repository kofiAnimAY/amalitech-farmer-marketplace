import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Leaf, ShoppingCart, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const dashboardPath = user?.role === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard';

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`text-sm font-semibold transition-colors hover:text-primary-700 ${
        location.pathname === to ? 'text-primary-700' : 'text-ink-600'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-surface-line bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-700 text-white">
            <Leaf className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-bold text-ink-900">FarmConnect</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLink('/', 'Home')}
          {navLink('/marketplace', 'Marketplace')}
          {isAuthenticated && navLink(dashboardPath, 'Dashboard')}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {(!isAuthenticated || user?.role === 'buyer') && (
            <Link
              to="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-ink-700 hover:bg-surface-sunk"
              aria-label="View cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-bold text-ink-900">
                  {itemCount}
                </span>
              )}
            </Link>
          )}

          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 hover:bg-surface-sunk"
              >
                <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full bg-primary-100" />
                <ChevronDown className="hidden h-3.5 w-3.5 text-ink-400 sm:block" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 animate-pop-in rounded-2xl border border-surface-line bg-white p-1.5 shadow-raised">
                  <div className="px-3 py-2.5">
                    <p className="truncate text-sm font-semibold text-ink-900">{user.name}</p>
                    <p className="truncate text-xs capitalize text-ink-500">{user.role} account</p>
                  </div>
                  <div className="my-1 border-t border-surface-line" />
                  <Link
                    to={dashboardPath}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-ink-700 hover:bg-surface-sunk"
                  >
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-danger-500 hover:bg-danger-50"
                  >
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-ghost btn-sm hidden sm:inline-flex">
                Log in
              </Link>
              <Link to="/register" className="btn-primary btn-sm">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
