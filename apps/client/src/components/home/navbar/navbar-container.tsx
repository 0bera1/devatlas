import type { ReactNode } from 'react';

/**
 * Arka plan ve kenarlık renkleri geçişe sokulmaz: şeffaf → cam arasında tarayıcı
 * ara karelerde ani beyazlık üretebiliyor. Uç durumdaki sınıflar aynı kalır.
 */
const surfaceEase =
  'transition-[padding,box-shadow,border-radius] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none';

export interface NavbarContainerProps {
  readonly isScrolled: boolean;
  readonly children: ReactNode;
}

/**
 * Dış kabuk: tam genişlikte hafif cam; orta menü border’ı NavbarMenu içinde.
 */
export function NavbarContainer({
  isScrolled,
  children,
}: NavbarContainerProps): ReactNode {
  return (
    <div className="mx-auto w-full max-w-6xl px-0 sm:px-1">
      <div
        className={`${surfaceEase} ${
          isScrolled
            ? 'rounded-2xl border border-white/15 bg-[rgba(255,255,255,0.55)] px-4 py-2.5 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.22)] backdrop-blur-md dark:border-zinc-700/30 dark:bg-[rgba(9,9,11,0.55)] dark:shadow-[0_14px_44px_-14px_rgba(0,0,0,0.55)] sm:px-4 sm:py-2.5'
            : 'rounded-[1.75rem] px-4 py-3.5 sm:px-6 sm:py-4'
        }`}
      >
        {children}
      </div>
    </div>
  );
}
