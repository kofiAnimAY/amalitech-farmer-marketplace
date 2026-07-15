import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { CATEGORIES, REGIONS, PRICE_RANGES } from '../../utils/constants';

export default function SearchFilter({ filters, onChange, resultCount }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState(filters);

  const activeExtraFilters =
    (filters.region !== 'All' ? 1 : 0) + (filters.priceRangeLabel !== PRICE_RANGES[0].label ? 1 : 0);

  const openSheet = () => {
    setDraft(filters);
    setSheetOpen(true);
  };

  const apply = () => {
    onChange(draft);
    setSheetOpen(false);
  };

  const resetAll = () => {
    const cleared = { search: '', category: 'All', region: 'All', priceRangeLabel: PRICE_RANGES[0].label };
    onChange(cleared);
    setDraft(cleared);
    setSheetOpen(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Search tomatoes, maize, yam…"
            className="field-input pl-10"
            aria-label="Search produce"
          />
          {filters.search && (
            <button
              onClick={() => onChange({ ...filters, search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          onClick={openSheet}
          className="relative flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl border border-surface-line bg-white text-ink-700 hover:bg-surface-sunk"
          aria-label="More filters"
        >
          <SlidersHorizontal className="h-[18px] w-[18px]" />
          {activeExtraFilters > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent-500 text-[10px] font-bold text-ink-900">
              {activeExtraFilters}
            </span>
          )}
        </button>
      </div>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {['All', ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => onChange({ ...filters, category: cat })}
            className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
              filters.category === cat
                ? 'border-primary-700 bg-primary-700 text-white'
                : 'border-surface-line bg-white text-ink-600 hover:border-primary-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {typeof resultCount === 'number' && (
        <p className="text-xs text-ink-500">
          {resultCount} listing{resultCount === 1 ? '' : 's'} found
        </p>
      )}

      <Modal open={sheetOpen} onClose={() => setSheetOpen(false)} title="Filter listings">
        <div className="space-y-5">
          <div>
            <p className="field-label">Region</p>
            <div className="flex flex-wrap gap-2">
              {['All', ...REGIONS].map((r) => (
                <button
                  key={r}
                  onClick={() => setDraft({ ...draft, region: r })}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    draft.region === r
                      ? 'border-primary-700 bg-primary-700 text-white'
                      : 'border-surface-line bg-white text-ink-600'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="field-label">Price range</p>
            <div className="flex flex-wrap gap-2">
              {PRICE_RANGES.map((range) => (
                <button
                  key={range.label}
                  onClick={() => setDraft({ ...draft, priceRangeLabel: range.label })}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    draft.priceRangeLabel === range.label
                      ? 'border-primary-700 bg-primary-700 text-white'
                      : 'border-surface-line bg-white text-ink-600'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="secondary" block onClick={resetAll}>
              Clear all
            </Button>
            <Button variant="primary" block onClick={apply}>
              Show results
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
