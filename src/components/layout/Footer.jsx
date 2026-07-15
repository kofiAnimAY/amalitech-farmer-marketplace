import { Leaf } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-surface-line bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-700 text-white">
              <Leaf className="h-4 w-4" />
            </span>
            <span className="font-display text-base font-bold text-ink-900">FarmConnect</span>
          </div>
          <p className="max-w-sm text-sm text-ink-500">
            Connecting Ghanaian smallholder farmers directly with restaurants, households and retailers —
            fewer middlemen, fairer prices, fresher produce.
          </p>
        </div>
        <div className="mt-8 flex flex-col gap-2 border-t border-surface-line pt-6 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} FarmConnect. Built as a frontend demo — no real transactions occur.</p>
          <p>Made for smallholder farmers across Ghana 🇬🇭</p>
        </div>
      </div>
    </footer>
  );
}
