'use client';

import { isHttpNetworkError } from '@/api/http/execute-request';
import { useToast } from '@/components/providers/toast-provider';
import type { UpdateProfileBody, UserProfile } from '@/domains/profile/profileDomains';
import { useUpdateProfileMutation } from '@/features/profile/mutations/useProfileMutation';
import { useTranslations } from '@/hooks/i18n/use-translations';
import { useEffect, useState } from 'react';

export interface ProfileInfoFormState {
  readonly firstName: string;
  readonly lastName: string;
  readonly birthDate: string;
}

export interface ProfileInfoFormHandle {
  readonly state: ProfileInfoFormState;
  readonly setFirstName: (next: string) => void;
  readonly setLastName: (next: string) => void;
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

  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [birthDate, setBirthDate] = useState<string>('');
  const [initialFirstName, setInitialFirstName] = useState<string>('');
  const [initialLastName, setInitialLastName] = useState<string>('');
  const [initialBirthDate, setInitialBirthDate] = useState<string>('');

  useEffect(() => {
    if (profile === undefined) {
      return;
    }
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setInitialFirstName(profile.firstName);
    setInitialLastName(profile.lastName);
    const initialDate: string = toBirthDateInputValue(profile.birthDate);
    setBirthDate(initialDate);
    setInitialBirthDate(initialDate);
  }, [profile]);

  const isDirty: boolean =
    firstName.trim() !== initialFirstName.trim() ||
    lastName.trim() !== initialLastName.trim() ||
    birthDate !== initialBirthDate;

  const submit = async (): Promise<void> => {
    if (profile === undefined) {
      return;
    }

    const body: UpdateProfileBody = {};
    const nameDirty: boolean =
      firstName.trim() !== initialFirstName.trim() ||
      lastName.trim() !== initialLastName.trim();

    if (nameDirty) {
      if (firstName.trim().length === 0) {
        showError(t('auth.validation.firstNameRequired'));
        return;
      }
      if (lastName.trim().length === 0) {
        showError(t('auth.validation.lastNameRequired'));
        return;
      }
      body.firstName = firstName.trim();
      body.lastName = lastName.trim();
    }

    if (birthDate !== '' && birthDate !== initialBirthDate) {
      body.birthDate = new Date(birthDate).toISOString();
    }

    if (Object.keys(body).length === 0) {
      return;
    }

    try {
      const updated: UserProfile = await mutation.mutateAsync(body);
      setFirstName(updated.firstName);
      setLastName(updated.lastName);
      setInitialFirstName(updated.firstName);
      setInitialLastName(updated.lastName);
      const nextBirth: string = toBirthDateInputValue(updated.birthDate);
      setBirthDate(nextBirth);
      setInitialBirthDate(nextBirth);
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
    state: { firstName, lastName, birthDate },
    setFirstName,
    setLastName,
    setBirthDate,
    submit,
    isSubmitting: mutation.isPending,
    isDirty,
  };
}
