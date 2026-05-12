import { AuthShell } from '@/components/auth/auth-shell';
import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
  return (
    <AuthShell
      title="Hesap oluştur"
      description="Birkaç alanla kayıt olun; ardından otomatik giriş yapılır."
      footer={{
        text: 'Zaten hesabınız var mı?',
        linkText: 'Giriş yapın',
        href: '/login',
      }}
    >
      <RegisterForm />
    </AuthShell>
  );
}
