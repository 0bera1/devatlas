'use client';

import { isHttpNetworkError } from '@/api/http/execute-request';
import { useToast } from '@/components/providers/toast-provider';
import { useChangePasswordMutation } from '@/features/profile/mutations/useProfileMutation';
import { useTranslations } from '@/hooks/use-translations';
import { useState } from 'react';

const MIN_PASSWORD_LENGTH = 8;

export interface ProfilePasswordFormState {
  readonly currentPassword: string;
  readonly newPassword: string;
  readonly confirmPassword: string;
  readonly errorMessage: string | null;
}

export interface ProfilePasswordFormHandle {
  readonly state: ProfilePasswordFormState;
  readonly setCurrentPassword: (next: string) => void;
  readonly setNewPassword: (next: string) => void;
  readonly setConfirmPassword: (next: string) => void;
  readonly submit: () => Promise<void>;
  readonly isSubmitting: boolean;
}

export function useProfilePasswordForm(): ProfilePasswordFormHandle {
  const { t } = useTranslations();
  const { showSuccess, showError } = useToast();
  const mutation = useChangePasswordMutation();

  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submit = async (): Promise<void> => {
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setErrorMessage(t('profile.password.tooShort'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage(t('profile.password.mismatch'));
      return;
    }
    setErrorMessage(null);

    try {
      await mutation.mutateAsync({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showSuccess(t('toast.passwordUpdated'));
    } catch (error: unknown) {
      const msg: string = isHttpNetworkError(error)
        ? t('errors.network')
        : error instanceof Error && error.message.length > 0
          ? error.message
          : t('toast.passwordUpdateFailed');
      showError(msg);
    }
  };

  return {
    state: { currentPassword, newPassword, confirmPassword, errorMessage },
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    submit,
    isSubmitting: mutation.isPending,
  };
}
