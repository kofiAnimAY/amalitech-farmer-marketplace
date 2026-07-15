import { AVAILABILITY, ORDER_STATUS } from '../../utils/constants';

const AVAILABILITY_STYLES = {
  [AVAILABILITY.IN_STOCK]: 'bg-primary-50 text-primary-700 border-primary-200',
  [AVAILABILITY.LOW_STOCK]: 'bg-accent-50 text-accent-700 border-accent-200',
  [AVAILABILITY.OUT_OF_STOCK]: 'bg-danger-50 text-danger-500 border-danger-500/20',
};

const ORDER_STATUS_STYLES = {
  [ORDER_STATUS.PLACED]: 'bg-accent-50 text-accent-700 border-accent-200',
  [ORDER_STATUS.CONFIRMED]: 'bg-primary-50 text-primary-700 border-primary-200',
  [ORDER_STATUS.FULFILLED]: 'bg-primary-700 text-white border-primary-700',
};

export function AvailabilityBadge({ status, className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${AVAILABILITY_STYLES[status]} ${className}`}
    >
      {status}
    </span>
  );
}

export function OrderStatusBadge({ status, className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${ORDER_STATUS_STYLES[status]} ${className}`}
    >
      {status}
    </span>
  );
}
