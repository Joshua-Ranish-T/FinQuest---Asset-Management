'use client';

import { useState } from 'react';

export function ThemeScript() {
  const code = `
    (function() {
      try {
        var cookies = document.cookie.split(';');
        var theme = 'dark';
        var fontScale = 'base';
        var isAuthed = false;

        for (var i = 0; i < cookies.length; i++) {
          var c = cookies[i].trim();
          if (c.indexOf('finquest-theme=') === 0) {
            theme = c.substring(15);
          } else if (c.indexOf('finquest-font-scale=') === 0) {
            fontScale = c.substring(20);
          } else if (c.indexOf('fb-auth=1') === 0) {
            isAuthed = true;
          }
        }

        var html = document.documentElement;
        if (theme === 'dark') {
          html.classList.add('dark');
        } else {
          html.classList.remove('dark');
        }

        var scaleMap = { sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem' };
        if (scaleMap[fontScale]) {
          html.style.setProperty('--font-scale', scaleMap[fontScale]);
        }

        if (isAuthed) {
          html.classList.add('is-authed');
        } else {
          html.classList.remove('is-authed');
        }
      } catch (e) {}
    })();
  `;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}

export function useTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'dark';
  });

  const [fontScale, setFontScale] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [isAuthed, setIsAuthed] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('is-authed');
    }
    return false;
  });

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (typeof document !== 'undefined') {
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      document.cookie = `finquest-theme=${next}; path=/; max-age=31536000; SameSite=Lax`;
    }
  };

  const updateFontScale = (scale: 'sm' | 'base' | 'lg' | 'xl') => {
    setFontScale(scale);
    if (typeof document !== 'undefined') {
      const scaleMap = { sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem' };
      document.documentElement.style.setProperty('--font-scale', scaleMap[scale]);
      document.cookie = `finquest-font-scale=${scale}; path=/; max-age=31536000; SameSite=Lax`;
    }
  };

  const setAuthSession = (authed: boolean) => {
    setIsAuthed(authed);
    if (typeof document !== 'undefined') {
      if (authed) {
        document.documentElement.classList.add('is-authed');
        document.cookie = `fb-auth=1; path=/; max-age=86400; SameSite=Lax`;
      } else {
        document.documentElement.classList.remove('is-authed');
        document.cookie = `fb-auth=; path=/; max-age=0; SameSite=Lax`;
      }
    }
  };

  return { theme, fontScale, isAuthed, toggleTheme, updateFontScale, setAuthSession };
}
