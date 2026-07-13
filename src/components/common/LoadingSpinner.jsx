import { Leaf } from 'lucide-react';

const SIZES = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-[3px]',
};

/**
 * Simple rotating-ring spinner. Use `inline` for buttons/small spaces,
 * or the default block form for section/page-level loading.
 */
export default function LoadingSpinner({ size = 'md', className = '', label }) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`} role="status" aria-live="polite">
      <span
        className={`${SIZES[size]} animate-spin rounded-full border-primary-200 border-t-primary-700`}
      />
      {label && <span className="text-sm font-medium text-ink-600">{label}</span>}
      <span className="sr-only">Loading</span>
    </div>
  );
}

/** Full-page loading state — first paint, route-level fetches, etc. */
export function PageLoader({ label = 'Loading FarmConnect…' }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <div className="relative flex h-14 w-14 items-center justify-center">
        <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-primary-100 border-t-primary-700" />
        <Leaf className="h-6 w-6 text-primary-700" />
      </div>
      <p className="text-sm font-medium text-ink-600">{label}</p>
    </div>
  );
}
