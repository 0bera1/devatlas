'use client';

import { AuthShell } from '@/components/auth/auth-shell';
import { LoginForm } from '@/components/auth/login-form';
import { useTranslations } from '@/hooks/use-translations';

export default function LoginPage() {
  const { t } = useTranslations();

  return (
    <AuthShell
      title={t('auth.login.title')}
      description={t('auth.login.description')}
      footer={{
        text: t('auth.login.footerText'),
        linkText: t('auth.login.footerLink'),
        href: '/register',
      }}
    >
      <LoginForm />
    </AuthShell>
  );
}
