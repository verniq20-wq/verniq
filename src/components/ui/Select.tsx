import { ChevronDown } from 'lucide-react';
import { useId, type SelectHTMLAttributes } from 'react';
import { cn } from '../../utils';

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label: string;
  options: Option[];
  onChange: (value: string) => void;
  hint?: string;
}

/** Native select for reliability on low-cost Android tablets, styled to match. */
export function Select({ label, options, onChange, hint, className, id, ...rest }: SelectProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <div className={className}>
      <label htmlFor={selectId} className="field-label">
        {label}
      </label>
      <div className="relative">
        <select
          id={selectId}
          className={cn('field cursor-pointer appearance-none pr-11')}
          onChange={(e) => onChange(e.target.value)}
          {...rest}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" aria-hidden />
      </div>
      {hint && <p className="mt-1.5 text-xs text-ink-500">{hint}</p>}
    </div>
  );
}

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  onChange: (value: string) => void;
  hint?: string;
}

export function TextField({ label, onChange, hint, className, id, ...rest }: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className={className}>
      <label htmlFor={inputId} className="field-label">
        {label}
      </label>
      <input id={inputId} className="field" onChange={(e) => onChange(e.target.value)} {...rest} />
      {hint && <p className="mt-1.5 text-xs text-ink-500">{hint}</p>}
    </div>
  );
}
