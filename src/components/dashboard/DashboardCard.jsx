import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/** A single metric tile — e.g. "Active listings: 12". */
export function StatCard({ icon, label, value, tone = 'primary', index = 0, to, onClick }) {
  const tones = {
    primary: 'bg-primary-50 text-primary-700',
    accent: 'bg-accent-50 text-accent-700',
    soil: 'bg-soil-100 text-soil-600',
    danger: 'bg-danger-50 text-danger-500',
  };

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={to || onClick ? { y: -3, scale: 1.01 } : undefined}
      className={`card p-4 transition-all duration-200 ${to || onClick ? 'cursor-pointer shadow-sm hover:shadow-raised' : ''}`}
    >
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${tones[tone]}`}>{icon}</div>
      <p className="tabular font-display text-2xl font-bold text-ink-900">{value}</p>
      <p className="text-xs font-medium text-ink-500">{label}</p>
    </motion.div>
  );

  if (to) {
    return (
      <Link to={to} onClick={onClick} className="block">
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="block w-full text-left">
        {content}
      </button>
    );
  }

  return content;
}

/** A tappable navigation tile — "Add new listing", "View orders", etc. */
export function DashboardCard({ icon, title, description, to, onClick, tone = 'primary', index = 0 }) {
  const tones = {
    primary: 'bg-primary-50 text-primary-700',
    accent: 'bg-accent-50 text-accent-700',
    soil: 'bg-soil-100 text-soil-600',
  };

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="card flex items-center gap-3.5 p-4 transition-all duration-200 hover:shadow-raised"
    >
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-ink-900">{title}</p>
        {description && <p className="line-clamp-1 text-xs text-ink-500">{description}</p>}
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-ink-400" />
    </motion.div>
  );

  if (to) {
    return (
      <Link to={to} onClick={onClick} className="block">
        {content}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className="block w-full text-left">
      {content}
    </button>
  );
}
