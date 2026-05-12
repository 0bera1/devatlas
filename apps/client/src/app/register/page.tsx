'use client';

import { AuthShell } from '@/components/auth/auth-shell';
import { RegisterForm } from '@/components/auth/register-form';
import { useTranslations } from '@/hooks/use-translations';

export default function RegisterPage() {
  const { t } = useTranslations();

  return (
    <AuthShell
      title={t('auth.register.title')}
      description={t('auth.register.description')}
      footer={{
        text: t('auth.register.footerText'),
        linkText: t('auth.register.footerLink'),
        href: '/login',
      }}
    >
      <RegisterForm />
    </AuthShell>
  );
}
