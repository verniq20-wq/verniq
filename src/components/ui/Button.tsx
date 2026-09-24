import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'soft' | 'danger' | 'inverse' | 'glass';
type Size = 'sm' | 'md' | 'lg' | 'xl';

const base =
  'group/btn relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-[transform,background-color,box-shadow,color,border-color] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:translate-y-0 active:scale-[0.98]';

const variants: Record<Variant, string> = {
  primary: 'bg-ocean-600 text-white shadow-soft hover:-translate-y-0.5 hover:bg-ocean-500 hover:shadow-lift',
  secondary: 'bg-aqua-600 text-white shadow-soft hover:-translate-y-0.5 hover:bg-aqua-500 hover:shadow-lift',
  outline: 'border border-ink-200 bg-surface text-ink-800 shadow-soft hover:-translate-y-0.5 hover:border-ocean-300 hover:text-ocean-700',
  ghost: 'text-ink-600 hover:bg-ink-100 hover:text-ink-900',
  soft: 'bg-ocean-50 text-ocean-700 hover:bg-ocean-100',
  danger: 'bg-rose-600 text-white hover:bg-rose-500',
  // for use on the ocean gradient
  inverse: 'bg-surface text-ocean-700 shadow-soft hover:-translate-y-0.5 hover:bg-ocean-50 hover:shadow-lift',
  glass: 'text-white hover:bg-white/10',
};

const sizes: Record<Size, string> = {
  sm: 'min-h-[36px] px-3 text-sm',
  md: 'min-h-[44px] px-4 text-[15px]',
  lg: 'min-h-[52px] px-6 text-base',
  xl: 'min-h-[60px] px-8 text-lg',
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

export type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', icon, iconRight, loading, fullWidth, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      {...rest}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : icon}
      {children}
      {iconRight && <span className="transition-transform duration-200 group-hover/btn:translate-x-0.5">{iconRight}</span>}
    </button>
  );
});

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  fullWidth,
  className,
  children,
  ...rest
}: CommonProps & LinkProps) {
  return (
    <Link className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)} {...rest}>
      {icon}
      {children}
      {iconRight && <span className="transition-transform duration-200 group-hover/btn:translate-x-0.5">{iconRight}</span>}
    </Link>
  );
}

export function IconButton({
  label,
  className,
  children,
  ...rest
}: { label: string } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'relative inline-flex h-11 w-11 items-center justify-center rounded-xl text-ink-600 transition-colors duration-200 hover:bg-ink-100 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500 disabled:opacity-40',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
