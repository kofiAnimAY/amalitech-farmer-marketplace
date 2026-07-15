import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Sprout, ShoppingBasket, ArrowLeft, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import PageTransition from '../components/common/PageTransition';
import { REGIONS, getWelcomeMessage } from '../utils/constants';

const BUYER_TYPES = ['Household', 'Restaurant', 'Retailer'];

export default function Register() {
  const { register, authLoading, authError, setAuthError, isAuthenticated, user } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    region: REGIONS[0],
    town: '',
    farmName: '',
    buyerType: BUYER_TYPES[0],
    businessName: '',
  });
  const [validationError, setValidationError] = useState(null);

  if (isAuthenticated) {
    return <Navigate to={user.role === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard'} replace />;
  }

  const chooseRole = (r) => {
    setRole(r);
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError(null);
    setAuthError(null);

    if (form.password !== form.confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setValidationError('Password must be at least 6 characters.');
      return;
    }

    try {
      const newUser = await register({ ...form, role });
      notify(getWelcomeMessage(newUser, { returning: false }), 'success');
      navigate(role === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard', { replace: true });
    } catch {
      // authError already set in context
    }
  };

  return (
    <PageTransition className="mx-auto min-h-[calc(100vh-4rem)] max-w-md px-5 py-10 sm:px-6">
      <Link to="/" className="mb-8 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-700 text-white">
          <Leaf className="h-5 w-5" />
        </span>
        <span className="font-display text-lg font-bold text-ink-900">FarmConnect</span>
      </Link>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="font-display text-2xl font-semibold text-ink-900">Create your account</h2>
            <p className="mt-1.5 text-sm text-ink-500">First, tell us how you'll use FarmConnect.</p>

            <div className="mt-6 space-y-3">
              <button
                onClick={() => chooseRole('farmer')}
                className="card flex w-full items-center gap-4 p-5 text-left transition-all hover:border-primary-400 hover:shadow-raised"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
                  <Sprout className="h-6 w-6" />
                </span>
                <span>
                  <span className="block font-display text-base font-semibold text-ink-900">I'm a Farmer</span>
                  <span className="block text-xs text-ink-500">List and sell my produce directly to buyers</span>
                </span>
              </button>

              <button
                onClick={() => chooseRole('buyer')}
                className="card flex w-full items-center gap-4 p-5 text-left transition-all hover:border-primary-400 hover:shadow-raised"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-50 text-accent-700">
                  <ShoppingBasket className="h-6 w-6" />
                </span>
                <span>
                  <span className="block font-display text-base font-semibold text-ink-900">I'm a Buyer</span>
                  <span className="block text-xs text-ink-500">Restaurant, household or retailer buying produce</span>
                </span>
              </button>
            </div>

            <p className="mt-8 text-center text-sm text-ink-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary-700 hover:underline">
                Log in
              </Link>
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25 }}
          >
            <button
              onClick={() => setStep(1)}
              className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-800"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>

            <div className="mb-5 flex items-center gap-2">
              <span
                className={`stamp ${role === 'farmer' ? 'bg-primary-50 text-primary-700' : 'bg-accent-50 text-accent-700 border-accent-200'}`}
              >
                {role === 'farmer' ? <Sprout className="h-3 w-3" /> : <ShoppingBasket className="h-3 w-3" />}
                Signing up as {role === 'farmer' ? 'Farmer' : 'Buyer'}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="field-label">Full name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Ama Boateng"
                  className="field-input"
                />
              </div>

              <div>
                <label className="field-label">Email address</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="field-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Password</label>
                  <input
                    required
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="At least 6 characters"
                    className="field-input"
                  />
                </div>
                <div>
                  <label className="field-label">Confirm</label>
                  <input
                    required
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="Repeat password"
                    className="field-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Region</label>
                  <select
                    value={form.region}
                    onChange={(e) => setForm({ ...form, region: e.target.value })}
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
                    value={form.town}
                    onChange={(e) => setForm({ ...form, town: e.target.value })}
                    placeholder="e.g. Koforidua"
                    className="field-input"
                  />
                </div>
              </div>

              {role === 'farmer' ? (
                <div>
                  <label className="field-label">Farm name</label>
                  <input
                    required
                    value={form.farmName}
                    onChange={(e) => setForm({ ...form, farmName: e.target.value })}
                    placeholder="e.g. Boateng Family Farms"
                    className="field-input"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="field-label">I'm buying as a…</label>
                    <div className="grid grid-cols-3 gap-2">
                      {BUYER_TYPES.map((t) => (
                        <button
                          type="button"
                          key={t}
                          onClick={() => setForm({ ...form, buyerType: t })}
                          className={`rounded-xl border px-2 py-2 text-xs font-semibold ${
                            form.buyerType === t
                              ? 'border-primary-700 bg-primary-700 text-white'
                              : 'border-surface-line bg-white text-ink-600'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  {form.buyerType !== 'Household' && (
                    <div>
                      <label className="field-label">Business name</label>
                      <input
                        required
                        value={form.businessName}
                        onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                        placeholder="e.g. The Green Table Restaurant"
                        className="field-input"
                      />
                    </div>
                  )}
                </>
              )}

              {(validationError || authError) && (
                <p className="rounded-lg bg-danger-50 px-3 py-2 text-xs font-medium text-danger-600">
                  {validationError || authError}
                </p>
              )}

              <Button type="submit" variant="primary" block size="lg" loading={authLoading} icon={<Check className="h-4 w-4" />}>
                Create account
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
