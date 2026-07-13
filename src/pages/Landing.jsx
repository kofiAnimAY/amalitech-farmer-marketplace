import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Handshake, BadgeCheck, Wallet, Carrot, Apple, Wheat, Sprout, Egg, Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getProducts } from '../services/productService';
import { withFarmerInfoList } from '../utils/enrich';
import ProductCard from '../components/product/ProductCard';
import { ProductGridSkeleton } from '../components/common/SkeletonLoader';
import PageTransition from '../components/common/PageTransition';
import Footer from '../components/layout/Footer';
import { getWelcomeMessage, AVAILABILITY } from '../utils/constants';

const CATEGORY_CHIPS = [
  { label: 'Vegetables', icon: Carrot },
  { label: 'Fruits', icon: Apple },
  { label: 'Grains & Cereals', icon: Wheat },
  { label: 'Tubers & Roots', icon: Sprout },
  { label: 'Poultry & Eggs', icon: Egg },
  { label: 'Herbs & Spices', icon: Leaf },
];

export default function Landing() {
  const { user, isAuthenticated } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getProducts({}).then((products) => {
      if (!active) return;
      const inStock = products.filter((p) => p.availability !== AVAILABILITY.OUT_OF_STOCK);
      setFeatured(withFarmerInfoList(inStock.slice(0, 8)));
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <PageTransition>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary-800">
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 25%, white 1.5px, transparent 1.5px), radial-gradient(circle at 75% 60%, white 1.5px, transparent 1.5px), radial-gradient(circle at 45% 85%, white 1.5px, transparent 1.5px)',
            backgroundSize: '56px 56px',
          }}
        />
        <div className="relative mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-20">
          {isAuthenticated ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <p className="stamp border-white/25 bg-white/10 text-primary-50">
                <BadgeCheck className="h-3 w-3" /> {user.role === 'farmer' ? user.farmName : user.businessName || 'Buyer account'}
              </p>
              <h1 className="mt-4 font-display text-3xl font-semibold text-white sm:text-4xl">
                {getWelcomeMessage(user, { returning: true })}
              </h1>
              <p className="mt-3 max-w-lg text-primary-100">
                {user.role === 'farmer'
                  ? "Here's what's happening with your listings and orders today."
                  : 'Fresh produce from verified farmers is ready to browse.'}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to={user.role === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard'} className="btn-accent btn-lg">
                  Go to dashboard <ArrowRight className="h-4 w-4" />
                </Link>
                {user.role === 'buyer' && (
                  <Link to="/marketplace" className="btn bg-white/10 text-white border border-white/25 hover:bg-white/20 btn-lg">
                    Browse marketplace
                  </Link>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <p className="stamp border-white/25 bg-white/10 text-primary-50">
                <Leaf className="h-3 w-3" /> Direct from Ghanaian farms
              </p>
              <h1 className="mt-4 max-w-xl font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
                Fresh produce, straight from the farmer to you.
              </h1>
              <p className="mt-4 max-w-lg text-primary-100">
                FarmConnect cuts out the middlemen — browse verified listings by region, price and
                category, and order directly from the farmers who grew it.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/register" className="btn-accent btn-lg">
                  Get started <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/marketplace" className="btn bg-white/10 text-white border border-white/25 hover:bg-white/20 btn-lg">
                  Browse marketplace
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Value props */}
      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { icon: Handshake, title: 'Direct from farmers', copy: 'No middlemen — talk price and quality straight with the grower.' },
            { icon: BadgeCheck, title: 'Verified & traceable', copy: 'Every listing shows the farmer, region and harvest date.' },
            { icon: Wallet, title: 'Fairer prices', copy: 'Farmers earn more, buyers pay less than at the open market.' },
          ].map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              className="card p-5"
            >
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                <v.icon className="h-5 w-5" />
              </span>
              <h3 className="font-display text-base font-semibold text-ink-900">{v.title}</h3>
              <p className="mt-1 text-sm text-ink-500">{v.copy}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Category chips */}
      <section className="mx-auto max-w-6xl px-5 sm:px-6">
        <h2 className="font-display text-lg font-semibold text-ink-900">Shop by category</h2>
        <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto pb-2">
          {CATEGORY_CHIPS.map((c) => (
            <Link
              key={c.label}
              to={`/marketplace?category=${encodeURIComponent(c.label)}`}
              className="flex shrink-0 flex-col items-center gap-2 rounded-2xl border border-surface-line bg-white px-5 py-4 transition-colors hover:border-primary-300"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                <c.icon className="h-5 w-5" />
              </span>
              <span className="whitespace-nowrap text-xs font-semibold text-ink-700">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured produce */}
      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink-900">Featured produce</h2>
          <Link to="/marketplace" className="text-sm font-semibold text-primary-700 hover:underline">
            View all
          </Link>
        </div>
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((product, i) => (
              <ProductCard key={product.id} product={product} farmerName={product.farmerName} index={i} />
            ))}
          </div>
        )}
      </section>

      {!isAuthenticated && (
        <section className="mx-auto max-w-6xl px-5 pb-14 sm:px-6">
          <div className="card flex flex-col items-start gap-4 bg-soil-100/60 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold text-ink-900">Growing produce to sell?</h3>
              <p className="mt-1 text-sm text-ink-600">List your harvest in minutes and reach buyers across Ghana.</p>
            </div>
            <Link to="/register" className="btn-primary shrink-0">
              Start selling <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      <Footer />
    </PageTransition>
  );
}
