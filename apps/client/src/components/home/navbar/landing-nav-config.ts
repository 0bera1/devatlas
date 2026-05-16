import type { MessageKey } from '@/i18n';

export interface LandingNavLinkConfig {
  readonly href: string;
  readonly labelKey: MessageKey;
  readonly isActive: (pathname: string) => boolean;
}

/** Orta menü: Ara → Rehber → Keşif → Diyagramlar → Dokümanlar */
export const landingNavLinks: readonly LandingNavLinkConfig[] = [
  {
    href: '/search',
    labelKey: 'nav.search',
    isActive: (pathname: string): boolean => pathname.startsWith('/search'),
  },
  {
    href: '/knowledge',
    labelKey: 'nav.menu.guide',
    isActive: (pathname: string): boolean => pathname.startsWith('/knowledge'),
  },
  {
    href: '/explore',
    labelKey: 'nav.explore',
    isActive: (pathname: string): boolean => pathname.startsWith('/explore'),
  },
  {
    href: '/diagrams',
    labelKey: 'nav.diagrams',
    isActive: (pathname: string): boolean => pathname.startsWith('/diagrams'),
  },
  {
    href: '/documents',
    labelKey: 'nav.documents',
    isActive: (pathname: string): boolean => pathname.startsWith('/documents'),
  },
];
