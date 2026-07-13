import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MapPin, Minus, Plus, ShoppingCart, Check, BadgeCheck,
  Carrot, Apple, Wheat, Sprout, Egg, Leaf, Package,
} from 'lucide-react';
import { getProductById, getProducts } from '../services/productService';
import { withFarmerInfo, withFarmerInfoList } from '../utils/enrich';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AvailabilityBadge } from '../components/common/Badge';
import ProductCard from '../components/product/ProductCard';
import { Skeleton } from '../components/common/SkeletonLoader';
import PageTransition from '../components/common/PageTransition';
import Button from '../components/common/Button';
import { formatCurrency, timeAgo, AVAILABILITY } from '../utils/constants';

const CATEGORY_ICON = { Vegetables: Carrot, Fruits: Apple, 'Grains & Cereals': Wheat, 'Tubers & Roots': Sprout, 'Legumes & Nuts': Leaf, 'Herbs & Spices': Leaf, 'Poultry & Eggs': Egg };

function HeroImage({ src, alt, category }) {
  const [errored, setErrored] = useState(false);
  const Icon = CATEGORY_ICON[category] || Leaf;
  if (errored) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 sm:h-80">
        <Icon className="h-16 w-16 text-primary-400" strokeWidth={1.3} />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setErrored(true)}
      className="h-64 w-full rounded-2xl object-cover sm:h-80"
    />
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { notify } = useToast();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);
    setQty(1);
    setJustAdded(false);

    getProductById(id)
      .then((p) => {
        if (!active) return;
        const enriched = withFarmerInfo(p);
        setProduct(enriched);
        return getProducts({ category: p.category }).then((list) => {
          if (!active) return;
          setRelated(withFarmerInfoList(list.filter((x) => x.id !== p.id)).slice(0, 4));
        });
      })
      .catch(() => setNotFound(true))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [id]);

  const handleAdd = async () => {
    if (!isAuthenticated) {
      notify('Please log in or create an account to add items to your cart', 'error');
      navigate('/login');
      return;
    }

    setAdding(true);
    await new Promise((r) => setTimeout(r, 500));
    const result = addToCart(product, qty);
    setAdding(false);

    if (!result.success) {
      notify('Please log in or create an account to add items to your cart', 'error');
      navigate('/login');
      return;
    }

    setJustAdded(true);
    notify(`${qty} × ${product.name} added to cart`, 'success');
    setTimeout(() => setJustAdded(false), 1600);
  };

  if (notFound) {
    return (
      <PageTransition className="mx-auto max-w-2xl px-4 py-16 text-center">
        <Package className="mx-auto h-10 w-10 text-ink-300" />
        <h1 className="mt-4 font-display text-xl font-semibold text-ink-900">Listing not found</h1>
        <p className="mt-2 text-sm text-ink-500">This produce listing may have been removed by the farmer.</p>
        <Link to="/marketplace" className="btn-primary mt-6 inline-flex">
          Back to marketplace
        </Link>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-800">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {loading ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Skeleton className="h-64 w-full rounded-2xl sm:h-80" />
          <div className="space-y-3">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="relative">
              <HeroImage src={product.image} alt={product.name} category={product.category} />
              <div className="absolute left-3 top-3">
                <AvailabilityBadge status={product.availability} className="bg-white/95 backdrop-blur-sm" />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
              <p className="stamp">{product.category}</p>
              <h1 className="mt-3 font-display text-2xl font-semibold text-ink-900 sm:text-3xl">{product.name}</h1>

              <div className="mt-2 flex items-center gap-3 text-sm text-ink-500">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {product.region}
                </span>
                <span>·</span>
                <span>{timeAgo(product.harvestedAt)}</span>
              </div>

              <p className="tabular mt-4 font-display text-3xl font-bold text-primary-800">
                {formatCurrency(product.price)}
                <span className="ml-1.5 font-sans text-sm font-medium text-ink-400">/ {product.unit}</span>
              </p>
              <p className="mt-1 text-xs text-ink-500">{product.quantityAvailable} {product.unit}(s) available</p>

              <p className="mt-4 text-sm leading-relaxed text-ink-600">{product.description}</p>

              {/* Farmer info */}
              <div className="mt-5 flex items-center gap-3 rounded-2xl border border-surface-line bg-white p-3.5">
                <img src={product.farmerAvatar} alt={product.farmerName} className="h-11 w-11 rounded-full bg-primary-100" />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1 text-sm font-semibold text-ink-900">
                    {product.farmerName}
                    {product.farmerVerified && <BadgeCheck className="h-3.5 w-3.5 text-primary-600" />}
                  </p>
                  <p className="truncate text-xs text-ink-500">{product.farmName}</p>
                </div>
              </div>

              {/* Quantity + add to cart */}
              {product.availability !== AVAILABILITY.OUT_OF_STOCK ? (
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex items-center rounded-xl border border-surface-line">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="flex h-11 w-11 items-center justify-center text-ink-600 hover:text-primary-700 disabled:opacity-30"
                      disabled={qty <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="tabular w-10 text-center text-sm font-bold">{qty}</span>
                    <button
                      onClick={() => setQty((q) => Math.min(product.quantityAvailable, q + 1))}
                      className="flex h-11 w-11 items-center justify-center text-ink-600 hover:text-primary-700 disabled:opacity-30"
                      disabled={qty >= product.quantityAvailable}
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <Button block loading={adding} onClick={handleAdd} size="lg" icon={justAdded ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}>
                    {justAdded ? 'Added to cart' : `Add to cart · ${formatCurrency(product.price * qty)}`}
                  </Button>
                </div>
              ) : (
                <div className="mt-6 rounded-xl bg-danger-50 px-4 py-3 text-sm font-medium text-danger-600">
                  This listing is currently out of stock. Check back soon or explore similar produce below.
                </div>
              )}
            </motion.div>
          </div>

          {related.length > 0 && (
            <div className="mt-14">
              <h2 className="font-display text-lg font-semibold text-ink-900">More {product.category.toLowerCase()}</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {related.map((p, i) => (
                  <ProductCard key={p.id} product={p} farmerName={p.farmerName} index={i} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </PageTransition>
  );
}
