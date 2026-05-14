'use client';

import { useTranslations } from '@/hooks/i18n/use-translations';
import type { ChangeEvent } from 'react';
import { useState } from 'react';

export type AuthTextFieldVariant = 'default' | 'authImmersive';

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
  variant?: AuthTextFieldVariant;
  /** Şifre alanında göz ikonu ile metin / nokta görünümü arasında geçiş */
  passwordToggleable?: boolean;
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
  variant = 'default',
  passwordToggleable = false,
}: AuthTextFieldProps) {
  const { t } = useTranslations();
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  const isImmersive: boolean = variant === 'authImmersive';
  const showToggle: boolean =
    type === 'password' && passwordToggleable === true;
  const inputType: 'email' | 'password' | 'text' | 'date' =
    type === 'password' && passwordVisible ? 'text' : type;

  const immersiveInputClass: string = showToggle
    ? 'block w-full rounded-xl border border-zinc-600 bg-zinc-900/90 py-3.5 pl-4 pr-12 text-sm text-white shadow-inner transition-colors placeholder:text-zinc-500 focus:border-amber-500/80 focus:outline-none focus:ring-2 focus:ring-amber-500/25 disabled:cursor-not-allowed disabled:opacity-50'
    : 'block w-full rounded-xl border border-zinc-600 bg-zinc-900/90 px-4 py-3.5 text-sm text-white shadow-inner transition-colors placeholder:text-zinc-500 focus:border-amber-500/80 focus:outline-none focus:ring-2 focus:ring-amber-500/25 disabled:cursor-not-allowed disabled:opacity-50';

  const defaultInputClass: string = showToggle
    ? 'block w-full rounded-lg border border-zinc-300 bg-white py-2 pl-3 pr-11 text-zinc-950 shadow-sm transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/20'
    : 'block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-950 shadow-sm transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-100 dark:focus:ring-zinc-100/20';

  const inputClassName: string = isImmersive
    ? immersiveInputClass
    : defaultInputClass;

  const toggleButtonClass: string = isImmersive
    ? 'absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 disabled:pointer-events-none disabled:opacity-40'
    : 'absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 dark:focus-visible:ring-zinc-500 disabled:pointer-events-none disabled:opacity-40';

  const inputEl = (
    <input
      id={id}
      name={id}
      type={inputType}
      autoComplete={autoComplete}
      placeholder={isImmersive ? label : undefined}
      value={value}
      onChange={handleChange}
      disabled={disabled}
      required={required}
      minLength={minLength}
      className={inputClassName}
    />
  );

  return (
    <div className={isImmersive ? 'space-y-0' : 'space-y-1.5'}>
      <label
        htmlFor={id}
        className={
          isImmersive
            ? 'sr-only'
            : 'block text-sm font-medium text-zinc-700 dark:text-zinc-300'
        }
      >
        {label}
      </label>
      {showToggle ? (
        <div className="relative">
          {inputEl}
          <button
            type="button"
            className={toggleButtonClass}
            onClick={() => {
              setPasswordVisible((previous: boolean) => !previous);
            }}
            disabled={disabled}
            aria-label={
              passwordVisible ? t('auth.password.hide') : t('auth.password.show')
            }
            aria-pressed={passwordVisible}
          >
            {passwordVisible ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      ) : (
        inputEl
      )}
    </div>
  );
}

function EyeIcon(props: { readonly className?: string }) {
  return (
    <svg
      className={props.className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function EyeSlashIcon(props: { readonly className?: string }) {
  return (
    <svg
      className={props.className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
      />
    </svg>
  );
}
