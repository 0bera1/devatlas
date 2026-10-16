import { ResetPasswordForm } from '@/components/auth/account-recovery';
import type { ReactNode } from 'react';
import { Suspense } from 'react';

export default function ResetPasswordPage(): ReactNode {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
