import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ShoppingCart, Check, Pencil, Trash2, Carrot, Apple, Wheat, Sprout, Egg, Leaf } from 'lucide-react';
import { AvailabilityBadge } from '../common/Badge';
import { formatCurrency, timeAgo, AVAILABILITY } from '../../utils/constants';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const CATEGORY_ICON = {
  Vegetables: Carrot,
  Fruits: Apple,
  'Grains & Cereals': Wheat,
  'Tubers & Roots': Sprout,
  'Legumes & Nuts': Leaf,
  'Herbs & Spices': Leaf,
  'Poultry & Eggs': Egg,
};

function ImageWithFallback({ src, alt, category }) {
  const [errored, setErrored] = useState(false);
  const Icon = CATEGORY_ICON[category] || Leaf;

  if (errored) {
    return (
      <div className="flex h-36 w-full items-center justify-center bg-gradient-to-br from-primary-100 to-primary-50 sm:h-40">
        <Icon className="h-10 w-10 text-primary-400" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setErrored(true)}
      className="h-36 w-full object-cover sm:h-40"
    />
  );
}

/**
 * @param {'buyer'|'manage'} variant - 'buyer' shows an add-to-cart action,
 * 'manage' (farmer's own listings) shows edit/delete actions instead.
 */
export default function ProductCard({ product, farmerName, variant = 'buyer', onEdit, onDelete, index = 0 }) {
  const navigate = useNavigate();
  const { addToCart, justAddedId } = useCart();
  const { isAuthenticated } = useAuth();
  const { notify } = useToast();
  const isOut = product.availability === AVAILABILITY.OUT_OF_STOCK;
  const justAdded = justAddedId === product.id;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      notify('Please log in or create an account to add items to your cart', 'error', 2400);
      navigate('/login');
      return;
    }

    const result = addToCart({ ...product, farmerName }, 1);
    if (!result.success) {
      notify('Please log in or create an account to add items to your cart', 'error', 2400);
      navigate('/login');
      return;
    }

    notify(`${product.name} added to cart`, 'success', 1800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
      whileHover={{ y: -3 }}
      className="card group relative overflow-hidden"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative overflow-hidden">
          <ImageWithFallback src={product.image} alt={product.name} category={product.category} />
          <div className="absolute left-2 top-2">
            <AvailabilityBadge status={product.availability} className="bg-white/95 backdrop-blur-sm" />
          </div>
          <div className="absolute right-2 top-2 stamp bg-white/95 backdrop-blur-sm">
            <MapPin className="h-3 w-3" />
            {product.region}
          </div>
        </div>

        <div className="space-y-1.5 p-3.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 font-display text-[15px] font-semibold text-ink-900">{product.name}</h3>
          </div>
          <p className="line-clamp-1 text-xs text-ink-500">{farmerName}</p>
          <div className="flex items-baseline justify-between pt-0.5">
            <p className="tabular font-display text-base font-bold text-primary-800">
              {formatCurrency(product.price)}
              <span className="ml-1 font-sans text-xs font-medium text-ink-400">/ {product.unit}</span>
            </p>
          </div>
          <p className="text-[11px] text-ink-400">{timeAgo(product.harvestedAt)}</p>
        </div>
      </Link>

      <div className="px-3.5 pb-3.5">
        {variant === 'buyer' ? (
          <button
            onClick={handleAdd}
            disabled={isOut}
            className={`btn btn-block btn-sm ${
              justAdded ? 'bg-primary-700 text-white' : isOut ? 'bg-surface-sunk text-ink-400' : 'btn-primary'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="h-3.5 w-3.5" /> Added
              </>
            ) : isOut ? (
              'Unavailable'
            ) : (
              <>
                <ShoppingCart className="h-3.5 w-3.5" /> Add to cart
              </>
            )}
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => onEdit?.(product)} className="btn btn-secondary btn-sm flex-1">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
            <button onClick={() => onDelete?.(product)} className="btn btn-sm border border-danger-500/30 text-danger-500 hover:bg-danger-50">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
