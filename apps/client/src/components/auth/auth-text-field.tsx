import type { ChangeEvent } from 'react';

export interface AuthTextFieldProps {
  id: string;
  label: string;
  type: 'email' | 'password' | 'text' | 'date';
  autoComplete?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  minLength?: number;
}

export function AuthTextField({
  id,
  label,
  type,
  autoComplete,
  value,
  onChange,
  disabled,
  required,
  minLength,
}: AuthTextFieldProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        minLength={minLength}
        className="block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-950 shadow-sm transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/20"
      />
    </div>
  );
}
