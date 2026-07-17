import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, ImagePlus, Wand2, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getProductById, createListing, updateListing, deleteListing } from '../../services/productService';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import PageTransition from '../../components/common/PageTransition';
import { Skeleton } from '../../components/common/SkeletonLoader';
import { CATEGORIES, REGIONS, UNITS } from '../../utils/constants';

const SAMPLE_IMAGES = {
  Vegetables: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=640&h=480&fit=crop&auto=format&q=80',
  Fruits: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=640&h=480&fit=crop&auto=format&q=80',
  'Grains & Cereals': 'https://images.unsplash.com/photo-1601593768799-76e3c1c04f5c?w=640&h=480&fit=crop&auto=format&q=80',
  'Tubers & Roots': 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=640&h=480&fit=crop&auto=format&q=80',
  'Legumes & Nuts': 'https://images.unsplash.com/photo-1567892737950-30c4db37cd89?w=640&h=480&fit=crop&auto=format&q=80',
  'Herbs & Spices': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=640&h=480&fit=crop&auto=format&q=80',
  'Poultry & Eggs': 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=640&h=480&fit=crop&auto=format&q=80',
};

const EMPTY_FORM = {
  item_name: '',
  category: CATEGORIES[0],
  description: '',
  price: '',
  unit: 'crate',
  quantity: '',
  region: REGIONS[0],
  image: '',
  harvest_date: new Date().toISOString().slice(0, 10),
};

export default function ListingForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notify } = useToast();

  const [form, setForm] = useState({ ...EMPTY_FORM, region: user.region || REGIONS[0] });
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    let active = true;
    getProductById(id).then((p) => {
      if (!active) return;
      setForm({
        item_name: p.name,
        category: p.category,
        description: p.description,
        price: p.price,
        unit: p.unit,
        quantity: p.quantity,
        region: p.region,
        image: p.image,
        harvest_date: p.harvestedAt.slice(0, 10),
      });
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [id, isEdit]);

  const useSampleImage = () => {
    setForm((f) => ({ ...f, image: SAMPLE_IMAGES[f.category] }));
    setImgError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, image: form.image || SAMPLE_IMAGES[form.category] };
      if (isEdit) {
        await updateListing(id, payload);
        notify('Listing updated', 'success');
      } else {
        await createListing(payload, user);
        notify('Listing created', 'success');
      }
      navigate('/farmer/listings');
    } catch (err) {
      notify(err.message || 'Something went wrong', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteListing(id);
      notify('Listing removed', 'success');
      navigate('/farmer/listings');
    } catch (err) {
      notify(err.message, 'error');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <PageTransition className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <Skeleton className="h-6 w-40" />
        <div className="mt-6 space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <Link to="/farmer/listings" className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-800">
        <ArrowLeft className="h-4 w-4" /> Back to listings
      </Link>

      <h1 className="font-display text-2xl font-semibold text-ink-900">
        {isEdit ? 'Edit listing' : 'Add new listing'}
      </h1>
      <p className="mt-1 text-sm text-ink-500">
        {isEdit ? 'Update your produce details below.' : 'Fill in the details buyers will see for this produce.'}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {/*
        <div>
          <label className="field-label">Photo</label>
          <div className="flex items-center gap-3">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-surface-line bg-surface-sunk">
              {form.image && !imgError ? (
                <img src={form.image} alt="" className="h-full w-full object-cover" onError={() => setImgError(true)} />
              ) : (
                <ImagePlus className="h-6 w-6 text-ink-300" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <input
                value={form.image}
                onChange={(e) => {
                  setForm({ ...form, image: e.target.value });
                  setImgError(false);
                }}
                placeholder="Paste an image URL"
                className="field-input"
              />
              <button type="button" onClick={useSampleImage} className="flex items-center gap-1.5 text-xs font-semibold text-primary-700 hover:underline">
                <Wand2 className="h-3.5 w-3.5" /> Use a sample photo for this category
              </button>
            </div>
          </div>
          <p className="mt-1.5 text-[11px] text-ink-400">
            Photo uploads will connect to real storage once the backend is ready — for now, paste a URL.
          </p>
        </div>
        */}

        <div>
          <label className="field-label">Produce name</label>
          <input
            required
            value={form.item_name}
            onChange={(e) => setForm({ ...form, item_name: e.target.value })}
            placeholder="e.g. Fresh Tomatoes"
            className="field-input"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="field-input">
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Region</label>
            <select value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} className="field-input">
              {REGIONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="field-label">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe freshness, growing method, best uses…"
            rows={3}
            className="field-input resize-none"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="field-label">Price (GH₵)</label>
            <input
              required
              type="number"
              min="0"
              step="0.5"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="0.00"
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label">Unit</label>
            <select
              required
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              className="field-input"
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Quantity</label>
            <input
              required
              type="number"
              min="0"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              placeholder="0"
              className="field-input"
            />
          </div>
        </div>

        <div>
          <label className="field-label">Harvest date</label>
          <input
            type="date"
            value={form.harvest_date}
            onChange={(e) => setForm({ ...form, harvest_date: e.target.value })}
            className="field-input"
            max={new Date().toISOString().slice(0, 10)}
          />
        </div>

        <div className="flex gap-2 pt-2">
          {isEdit && (
            <Button type="button" variant="danger" onClick={() => setDeleteOpen(true)} icon={<Trash2 className="h-4 w-4" />}>
              Delete
            </Button>
          )}
          <Button type="submit" variant="primary" block size="lg" loading={submitting}>
            {isEdit ? 'Save changes' : 'Publish listing'}
          </Button>
        </div>
      </form>

      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete this listing?">
        <p className="text-sm text-ink-600">This will remove <span className="font-semibold text-ink-900">{form.item_name}</span> from the marketplace immediately.</p>
        <div className="mt-5 flex gap-2">
          <Button variant="secondary" block onClick={() => setDeleteOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" block loading={deleting} onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </PageTransition>
  );
}
