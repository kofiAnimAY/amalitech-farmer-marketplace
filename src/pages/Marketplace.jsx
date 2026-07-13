import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import { getProducts } from '../services/productService';
import { withFarmerInfoList } from '../utils/enrich';
import ProductCard from '../components/product/ProductCard';
import SearchFilter from '../components/product/SearchFilter';
import { ProductGridSkeleton } from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';
import PageTransition from '../components/common/PageTransition';
import { PRICE_RANGES } from '../utils/constants';

export default function Marketplace() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: '',
    category: searchParams.get('category') || 'All',
    region: 'All',
    priceRangeLabel: PRICE_RANGES[0].label,
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const range = PRICE_RANGES.find((r) => r.label === filters.priceRangeLabel) || PRICE_RANGES[0];

    const handle = setTimeout(
      () => {
        getProducts({
          search: filters.search,
          category: filters.category,
          region: filters.region,
          minPrice: range.min,
          maxPrice: range.max,
        }).then((results) => {
          if (!active) return;
          setProducts(withFarmerInfoList(results));
          setLoading(false);
          setInitialLoad(false);
        });
      },
      initialLoad ? 0 : 300
    );

    return () => {
      active = false;
      clearTimeout(handle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  return (
    <PageTransition className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <h1 className="font-display text-2xl font-semibold text-ink-900">Marketplace</h1>
      <p className="mt-1 text-sm text-ink-500">Browse fresh listings from farmers across Ghana.</p>

      <div className="mt-5">
        <SearchFilter filters={filters} onChange={setFilters} resultCount={loading ? undefined : products.length} />
      </div>

      <div className="mt-5">
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : products.length === 0 ? (
          <EmptyState
            icon={<SearchX className="h-6 w-6" />}
            title="No listings match your filters"
            description="Try a different search term, or widen your category, region or price filters."
            action={
              <button
                onClick={() => setFilters({ search: '', category: 'All', region: 'All', priceRangeLabel: PRICE_RANGES[0].label })}
                className="btn-secondary btn-sm"
              >
                Clear filters
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} farmerName={product.farmerName} index={i} />
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
