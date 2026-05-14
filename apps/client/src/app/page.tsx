'use client';

import { HomeShell } from '@/components/home/home-shell';
import { useTranslations } from '@/hooks/i18n/use-translations';
import Link from 'next/link';

export default function Home() {
  const { t } = useTranslations();

  return (
    <HomeShell>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
        <h1 className="font-sans text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          {t('home.title')}
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          {t('home.introBefore')}{' '}
          <Link
            href="/documents"
            className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-200"
          >
            {t('nav.documents')}
          </Link>{' '}
          {t('home.introAfterDocs')}{' '}
          <Link
            href="/register"
            className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-200"
          >
            {t('nav.register')}
          </Link>{' '}
          {t('home.introBetweenAuth')}{' '}
          <Link
            href="/login"
            className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-200"
          >
            {t('nav.login')}
          </Link>{' '}
          {t('home.introAfterAuth')}
        </p>
        <p className="max-w-xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
          {t('home.publicFeedBefore')}{' '}
          <Link
            href="/explore"
            className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-200"
          >
            {t('home.publicFeedLink')}
          </Link>{' '}
          {t('home.publicFeedMid')}{' '}
          <Link
            href="/knowledge"
            className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-200"
          >
            {t('home.knowledgeLink')}
          </Link>
          {t('home.publicFeedAfter')}
        </p>
      </main>
    </HomeShell>
  );
}
