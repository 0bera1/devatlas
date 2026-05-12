import { HomeShell } from '@/components/home/home-shell';

export default function Home() {
  return (
    <HomeShell>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
        <h1 className="font-sans text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Hoş geldiniz
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          DevAtlas API ile kimlik doğrulama akışını test etmek için üst menüden{' '}
          <span className="font-medium text-zinc-900 dark:text-zinc-200">
            Kayıt ol
          </span>{' '}
          veya{' '}
          <span className="font-medium text-zinc-900 dark:text-zinc-200">
            Giriş
          </span>{' '}
          sayfalarını kullanın.
        </p>
      </main>
    </HomeShell>
  );
}
