import { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Mail, Lock, Eye, EyeOff, Sprout, ShoppingBasket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import PageTransition from '../components/common/PageTransition';
import { getWelcomeMessage } from '../utils/constants';

export default function Login() {
  const { login, authLoading, authError, setAuthError, isAuthenticated, user } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [demoLoadingRole, setDemoLoadingRole] = useState(null);

  if (isAuthenticated) {
    return <Navigate to={user.role === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard'} replace />;
  }

  const redirectAfterLogin = (loggedInUser) => {
    notify(getWelcomeMessage(loggedInUser, { returning: true }), 'success');
    const from = location.state?.from?.pathname;
    const home = loggedInUser.role === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard';
    navigate(from || home, { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const loggedInUser = await login(form.email, form.password);
      redirectAfterLogin(loggedInUser);
    } catch {
      // authError already set in context
    }
  };

  const handleDemoLogin = async (role) => {
    setAuthError(null);
    setDemoLoadingRole(role);
    const creds =
      role === 'farmer'
        ? { email: 'kofi.mensah@farmconnect.test', password: 'password123' }
        : { email: 'abena.osei@farmconnect.test', password: 'password123' };
    try {
      const loggedInUser = await login(creds.email, creds.password);
      redirectAfterLogin(loggedInUser);
    } catch {
      // ignore
    } finally {
      setDemoLoadingRole(null);
    }
  };

  return (
    <PageTransition className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl">
      {/* Branding panel — desktop only */}
      <div className="relative hidden w-[42%] shrink-0 overflow-hidden bg-primary-800 md:block">
        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, white 1.5px, transparent 1.5px), radial-gradient(circle at 60% 70%, white 1.5px, transparent 1.5px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative flex h-full flex-col justify-between p-10">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white">
              <Leaf className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-bold text-white">FarmConnect</span>
          </Link>
          <div>
            <h1 className="font-display text-4xl font-semibold leading-tight text-white">
              Fresh from the farm, straight to you.
            </h1>
            <p className="mt-4 max-w-sm text-sm text-primary-100">
              Log in to buy directly from verified Ghanaian farmers, or manage your farm's listings and
              incoming orders.
            </p>
          </div>
          <p className="text-xs text-primary-200">
            Demo product — mock data only, no real payments or listings.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col justify-center px-5 py-10 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 md:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-700 text-white">
              <Leaf className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-bold text-ink-900">FarmConnect</span>
          </div>

          <h2 className="font-display text-2xl font-semibold text-ink-900">Welcome back</h2>
          <p className="mt-1.5 text-sm text-ink-500">Log in to continue to your marketplace.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="field-label" htmlFor="email">
                Email address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="field-input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="field-input pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-danger-50 px-3 py-2 text-xs font-medium text-danger-600"
              >
                {authError}
              </motion.p>
            )}

            <Button type="submit" variant="primary" block size="lg" loading={authLoading && !demoLoadingRole}>
              Log in
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-surface-line" />
            <span className="text-xs font-medium text-ink-400">or try a demo account</span>
            <div className="h-px flex-1 bg-surface-line" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              loading={demoLoadingRole === 'farmer'}
              disabled={demoLoadingRole === 'buyer'}
              onClick={() => handleDemoLogin('farmer')}
              icon={<Sprout className="h-4 w-4" />}
            >
              Farmer
            </Button>
            <Button
              variant="secondary"
              loading={demoLoadingRole === 'buyer'}
              disabled={demoLoadingRole === 'farmer'}
              onClick={() => handleDemoLogin('buyer')}
              icon={<ShoppingBasket className="h-4 w-4" />}
            >
              Buyer
            </Button>
          </div>

          <p className="mt-8 text-center text-sm text-ink-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary-700 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
