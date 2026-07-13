const VARIANTS = {
  primary: 'btn-primary',
  accent: 'btn-accent',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
};

// Spinner border colors are tied to the button variant so it reads
// clearly on both light and dark button backgrounds.
const SPINNER_TONE = {
  primary: 'border-white/35 border-t-white',
  danger: 'border-white/35 border-t-white',
  accent: 'border-ink-900/25 border-t-ink-900',
  secondary: 'border-primary-200 border-t-primary-700',
  ghost: 'border-primary-200 border-t-primary-700',
};

/**
 * Standard button used across forms and actions. Pass `loading` to show
 * an inline spinner and disable interaction — used for login, register,
 * add-to-cart, place order, create/update listing, update order status.
 */
export default function Button({
  children,
  variant = 'primary',
  size,
  loading = false,
  disabled = false,
  block = false,
  type = 'button',
  className = '',
  icon,
  ...rest
}) {
  const sizeClass = size === 'lg' ? 'btn-lg' : size === 'sm' ? 'btn-sm' : '';
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${VARIANTS[variant]} ${sizeClass} ${block ? 'btn-block' : ''} ${className}`}
      {...rest}
    >
      {loading ? (
        <>
          <span className={`h-4 w-4 animate-spin rounded-full border-2 ${SPINNER_TONE[variant]}`} />
          <span>Please wait…</span>
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
}
