'use client';

import { useEffect, useMemo, useState } from 'react';

type DensityMode = 'comfortable' | 'compact';

const STORAGE_KEY = 'adminDensity';

function normalizeDensity(value: string | null): DensityMode {
  return value === 'compact' ? 'compact' : 'comfortable';
}

function applyDensity(mode: DensityMode) {
  const root = document.getElementById('admin-root');
  if (root) {
    root.setAttribute('data-admin-density', mode);
  }
  document.body.setAttribute('data-admin-density', mode);
}

export function AdminDensityToggle({
  locale,
  enabled,
}: {
  locale: string;
  enabled: boolean;
}) {
  const [mode, setMode] = useState<DensityMode>('comfortable');

  useEffect(() => {
    const stored = normalizeDensity(window.localStorage.getItem(STORAGE_KEY));
    setMode(stored);
    applyDensity(stored);
  }, []);

  const label = useMemo(() => {
    if (locale === 'ar') {
      return mode === 'compact' ? 'المسافة: مضغوط' : 'المسافة: مريح';
    }
    return mode === 'compact' ? 'Density: Compact' : 'Density: Comfortable';
  }, [locale, mode]);

  function toggleDensity() {
    const nextMode: DensityMode = mode === 'comfortable' ? 'compact' : 'comfortable';
    setMode(nextMode);
    window.localStorage.setItem(STORAGE_KEY, nextMode);
    applyDensity(nextMode);
  }

  if (!enabled) return null;

  return (
    <button
      type='button'
      onClick={toggleDensity}
      className='rounded-md border border-border/70 bg-card/70 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground'
    >
      {label}
    </button>
  );
}
