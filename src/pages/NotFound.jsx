import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import PageTransition from '../components/common/PageTransition';

export default function NotFound() {
  return (
    <PageTransition className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
        <Compass className="h-7 w-7" />
      </span>
      <h1 className="mt-5 font-display text-2xl font-semibold text-ink-900">Page not found</h1>
      <p className="mt-2 text-sm text-ink-500">The page you're looking for doesn't exist or may have moved.</p>
      <Link to="/" className="btn-primary mt-6">
        Back to home
      </Link>
    </PageTransition>
  );
}
