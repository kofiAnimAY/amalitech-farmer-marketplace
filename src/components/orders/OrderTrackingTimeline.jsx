import { motion } from 'framer-motion';
import { Package, CheckCircle2, Truck } from 'lucide-react';
import { ORDER_STATUS_STEPS, formatDateTime } from '../../utils/constants';

const STEP_ICONS = [Package, CheckCircle2, Truck];

/**
 * @param {object} order - order with `status` and `statusHistory`
 * @param {'buyer'|'farmer'} viewer - controls which copy line is shown
 */
export default function OrderTrackingTimeline({ order, viewer = 'buyer' }) {
  const currentIndex = ORDER_STATUS_STEPS.findIndex((s) => s.key === order.status);
  const progressPct = currentIndex <= 0 ? 0 : (currentIndex / (ORDER_STATUS_STEPS.length - 1)) * 100;

  const currentStep = ORDER_STATUS_STEPS[currentIndex];
  const currentCopy = viewer === 'buyer' ? currentStep?.buyerCopy : currentStep?.farmerCopy;

  return (
    <div>
      <div className="relative flex items-start justify-between px-1">
        <div className="absolute left-0 right-0 top-4 h-0.5 bg-surface-line" />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-0 top-4 h-0.5 bg-primary-600"
        />
        {ORDER_STATUS_STEPS.map((step, i) => {
          const Icon = STEP_ICONS[i];
          const done = i < currentIndex;
          const active = i === currentIndex;
          const historyEntry = order.statusHistory.find((h) => h.status === step.key);

          return (
            <div key={step.key} className="relative z-10 flex w-1/3 flex-col items-center text-center">
              <motion.div
                initial={false}
                animate={{ scale: active ? 1.08 : 1 }}
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                  done || active
                    ? 'border-primary-700 bg-primary-700 text-white'
                    : 'border-surface-line bg-white text-ink-400'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
              </motion.div>
              <p
                className={`mt-2 text-[11px] font-semibold ${
                  done || active ? 'text-ink-900' : 'text-ink-400'
                }`}
              >
                {step.label}
              </p>
              {historyEntry && (
                <p className="mt-0.5 text-[10px] text-ink-400">{formatDateTime(historyEntry.at)}</p>
              )}
            </div>
          );
        })}
      </div>

      {currentCopy && (
        <div className="mt-4 rounded-xl bg-surface-sunk px-3.5 py-2.5">
          <p className="text-xs font-medium text-ink-700">{currentCopy}</p>
        </div>
      )}
    </div>
  );
}
