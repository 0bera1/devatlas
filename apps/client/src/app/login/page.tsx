import { AuthShell } from '@/components/auth/auth-shell';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <AuthShell
      title="Giriş yap"
      description="DevAtlas hesabınızla devam edin."
      footer={{
        text: 'Hesabınız yok mu?',
        linkText: 'Kayıt olun',
        href: '/register',
      }}
    >
      <LoginForm />
    </AuthShell>
  );
}
