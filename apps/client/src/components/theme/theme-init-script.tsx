import Script from 'next/script';
import type { ReactNode } from 'react';

const THEME_INIT = `(function(){try{var k='devatlas_theme';var s=localStorage.getItem(k);var d=document.documentElement;if(s==='dark'){d.classList.add('dark');}else if(s==='light'){d.classList.remove('dark');}else if(window.matchMedia('(prefers-color-scheme: dark)').matches){d.classList.add('dark');}else{d.classList.remove('dark');}}catch(e){}})();`;

export function ThemeInitScript(): ReactNode {
  return (
    <Script id="devatlas-theme-init" strategy="beforeInteractive">
      {THEME_INIT}
    </Script>
  );
}
