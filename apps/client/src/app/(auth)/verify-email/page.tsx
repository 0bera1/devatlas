import { VerifyEmailView } from '@/components/auth/account-recovery';
import type { ReactNode } from 'react';
import { Suspense } from 'react';

export default function VerifyEmailPage(): ReactNode {
  return (
    <Suspense fallback={null}>
      <VerifyEmailView />
    </Suspense>
  );
}
