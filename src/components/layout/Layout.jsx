import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import { useAuth } from '../../context/AuthContext';

export default function Layout() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-surface-sunk">
      <Navbar />
      <main className={`flex-1 ${isAuthenticated ? 'pb-20 md:pb-8' : 'pb-8'}`}>
        <AnimatePresence mode="wait">
          <div key={location.pathname}>
            <Outlet />
          </div>
        </AnimatePresence>
      </main>
      {isAuthenticated && <BottomNav role={user.role} />}
    </div>
  );
}
