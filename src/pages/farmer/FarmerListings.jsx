import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PlusCircle, ListChecks } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getProducts, deleteListing } from '../../services/productService';
import { withFarmerInfoList } from '../../utils/enrich';
import ProductCard from '../../components/product/ProductCard';
import { ProductGridSkeleton } from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import PageTransition from '../../components/common/PageTransition';
import { AVAILABILITY } from '../../utils/constants';

export default function FarmerListings() {
  const { user } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadListings = () => {
    setLoading(true);
    getProducts({ farmerId: user.id }).then((data) => {
      setListings(withFarmerInfoList(data));
      setLoading(false);
    });
  };

  useEffect(loadListings, [user.id]);

  const activeFilter = searchParams.get('filter') === 'needs-attention' ? 'needs-attention' : 'all';

  const visibleListings = useMemo(() => {
    if (activeFilter !== 'needs-attention') return listings;
    return listings.filter((product) =>
      [AVAILABILITY.LOW_STOCK, AVAILABILITY.OUT_OF_STOCK].includes(product.availability)
    );
  }, [activeFilter, listings]);

  const setFilter = (nextFilter) => {
    const params = new URLSearchParams(searchParams);
    if (nextFilter === 'all') {
      params.delete('filter');
    } else {
      params.set('filter', 'needs-attention');
    }
    setSearchParams(params);
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteListing(toDelete.id);
      setListings((prev) => prev.filter((p) => p.id !== toDelete.id));
      notify(`${toDelete.name} removed from your listings`, 'success');
      setToDelete(null);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <PageTransition className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Your listings</h1>
          <p className="mt-1 text-sm text-ink-500">Manage the produce you currently have for sale.</p>
        </div>
        <Link to="/farmer/listings/new" className="btn-primary hidden sm:inline-flex">
          <PlusCircle className="h-4 w-4" /> Add new
        </Link>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold ${activeFilter === 'all' ? 'border-primary-700 bg-primary-700 text-white' : 'border-surface-line bg-white text-ink-600'}`}
        >
          All listings
        </button>
        <button
          type="button"
          onClick={() => setFilter('needs-attention')}
          className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold ${activeFilter === 'needs-attention' ? 'border-primary-700 bg-primary-700 text-white' : 'border-surface-line bg-white text-ink-600'}`}
        >
          Needs attention
        </button>
      </div>

      <div className="mt-6">
        {loading ? (
          <ProductGridSkeleton count={6} />
        ) : visibleListings.length === 0 ? (
          <EmptyState
            icon={<ListChecks className="h-6 w-6" />}
            title={activeFilter === 'needs-attention' ? 'Nothing needs attention right now' : 'No listings yet'}
            description={
              activeFilter === 'needs-attention'
                ? 'All your current listings are in stock and ready to sell.'
                : 'Create your first listing so buyers can start ordering your produce.'
            }
            action={
              <Link to="/farmer/listings/new" className="btn-primary btn-sm">
                <PlusCircle className="h-4 w-4" /> Add your first listing
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {visibleListings.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                farmerName={product.farmerName}
                variant="manage"
                index={i}
                onEdit={(p) => navigate(`/farmer/listings/${p.id}/edit`)}
                onDelete={(p) => setToDelete(p)}
              />
            ))}
          </div>
        )}
      </div>

      <Link
        to="/farmer/listings/new"
        className="btn-primary fixed bottom-24 right-5 z-30 !rounded-full !p-4 shadow-raised sm:hidden"
        aria-label="Add new listing"
      >
        <PlusCircle className="h-5 w-5" />
      </Link>

      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Remove this listing?">
        <p className="text-sm text-ink-600">
          Are you sure you want to remove <span className="font-semibold text-ink-900">{toDelete?.name}</span> from your
          listings? Buyers will no longer be able to see or order it.
        </p>
        <div className="mt-5 flex gap-2">
          <Button variant="secondary" block onClick={() => setToDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" block loading={deleting} onClick={handleDelete}>
            Remove
          </Button>
        </div>
      </Modal>
    </PageTransition>
  );
}
