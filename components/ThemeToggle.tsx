'use client';

import { Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const t = useTranslations('theme');
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = useMemo(() => resolvedTheme === 'dark', [resolvedTheme]);
  const label = isDark ? t('switchToLight') : t('switchToDark');

  if (!mounted) {
    return (
      <Button type="button" variant="outline" size="sm" className="h-8 rounded-full border-border/70 bg-card/70 px-3">
        <Sun className="size-4" />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      aria-label={label}
      title={label}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="h-8 rounded-full border-border/70 bg-card/70 px-3"
    >
      {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
      <span className="hidden text-xs md:inline">{isDark ? t('dark') : t('light')}</span>
    </Button>
  );
}
