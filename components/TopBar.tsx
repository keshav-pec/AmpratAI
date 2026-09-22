'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function TopBar() {
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('amprat.theme') as 'light' | 'dark' | null;
    setTheme(saved);
  }, []);

  function toggle() {
    const isDark =
      document.documentElement.getAttribute('data-theme') === 'dark' ||
      (!document.documentElement.getAttribute('data-theme') &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    const next = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('amprat.theme', next);
    setTheme(next);
  }

  return (
    <header className="topbar noprint">
      <div className="topbar-in">
        <Link href="/" className="brand">
          Amprat<span>AI</span>
        </Link>
        <div className="crumb" />
        <button className="icon-btn" onClick={toggle} aria-label="Switch light and dark theme">
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
      </div>
    </header>
  );
}
