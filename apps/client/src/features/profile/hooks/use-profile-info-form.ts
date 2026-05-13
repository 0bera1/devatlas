'use client';

import { isHttpNetworkError } from '@/api/http/execute-request';
import { useToast } from '@/components/providers/toast-provider';
import type { UpdateProfileBody, UserProfile } from '@/domains/profileDomains';
import { useUpdateProfileMutation } from '@/features/profile/mutations/useProfileMutation';
import { useTranslations } from '@/hooks/use-translations';
import { useEffect, useState } from 'react';

export interface ProfileInfoFormState {
  readonly name: string;
  readonly clearName: boolean;
  readonly birthDate: string;
}

export interface ProfileInfoFormHandle {
  readonly state: ProfileInfoFormState;
  readonly setName: (next: string) => void;
  readonly setClearName: (next: boolean) => void;
  readonly setBirthDate: (next: string) => void;
  readonly submit: () => Promise<void>;
  readonly isSubmitting: boolean;
  readonly isDirty: boolean;
}

function toBirthDateInputValue(iso: string | null | undefined): string {
  if (iso === null || iso === undefined) {
    return '';
  }
  const date: Date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toISOString().slice(0, 10);
}

export function useProfileInfoForm(
  profile: UserProfile | undefined,
): ProfileInfoFormHandle {
  const { t } = useTranslations();
  const { showSuccess, showError } = useToast();
  const mutation = useUpdateProfileMutation();

  const [name, setName] = useState<string>('');
  const [clearName, setClearName] = useState<boolean>(false);
  const [birthDate, setBirthDate] = useState<string>('');
  const [initialName, setInitialName] = useState<string>('');
  const [initialBirthDate, setInitialBirthDate] = useState<string>('');

  useEffect(() => {
    if (profile === undefined) {
      return;
    }
    setName(profile.name ?? '');
    setInitialName(profile.name ?? '');
    const initialDate: string = toBirthDateInputValue(profile.birthDate);
    setBirthDate(initialDate);
    setInitialBirthDate(initialDate);
    setClearName(false);
  }, [profile]);

  const isDirty: boolean =
    clearName ||
    name.trim() !== initialName.trim() ||
    birthDate !== initialBirthDate;

  const submit = async (): Promise<void> => {
    if (profile === undefined) {
      return;
    }

    const body: UpdateProfileBody = {};
    if (clearName) {
      body.name = null;
    } else if (name.trim() !== initialName.trim()) {
      body.name = name.trim();
    }
    if (birthDate !== '' && birthDate !== initialBirthDate) {
      body.birthDate = new Date(birthDate).toISOString();
    }

    if (Object.keys(body).length === 0) {
      return;
    }

    try {
      const updated: UserProfile = await mutation.mutateAsync(body);
      setName(updated.name ?? '');
      setInitialName(updated.name ?? '');
      const nextBirth: string = toBirthDateInputValue(updated.birthDate);
      setBirthDate(nextBirth);
      setInitialBirthDate(nextBirth);
      setClearName(false);
      showSuccess(t('toast.profileUpdated'));
    } catch (error: unknown) {
      const msg: string = isHttpNetworkError(error)
        ? t('errors.network')
        : error instanceof Error && error.message.length > 0
          ? error.message
          : t('toast.profileUpdateFailed');
      showError(msg);
    }
  };

  return {
    state: { name, clearName, birthDate },
    setName,
    setClearName,
    setBirthDate,
    submit,
    isSubmitting: mutation.isPending,
    isDirty,
  };
}
