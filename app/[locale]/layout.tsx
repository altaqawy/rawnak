import type { Metadata } from 'next';
import type { CSSProperties, ReactNode } from 'react';
import { Cairo, Manrope } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { defaultLocale, isLocale, locales, type Locale } from '@/i18n/config';
import { BackgroundEffect } from '@/components/BackgroundEffect';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { ThemeProvider } from '@/components/ThemeProvider';
import { getPublicSiteSettings } from '@/lib/builder/repository';

const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' });
const cairo = Cairo({ subsets: ['arabic'], variable: '--font-cairo' });

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : defaultLocale;
  const messages = (await import(`../../messages/${safeLocale}.json`)).default;

  return {
    title: messages.meta.title,
    description: messages.meta.description,
    icons: {
      icon: '/brand/rawnak-logo.png',
      shortcut: '/brand/rawnak-logo.png',
      apple: '/brand/rawnak-logo.png',
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = (await import(`../../messages/${locale}.json`)).default;
  const isArabic = locale === 'ar';
  const siteSettings = await getPublicSiteSettings();

  const themeVars: CSSProperties = {
    fontFamily: isArabic ? 'var(--font-cairo)' : 'var(--font-manrope)',
    ['--theme-light-base' as string]: siteSettings.tokens.light.base,
    ['--theme-light-secondary' as string]: siteSettings.tokens.light.secondary,
    ['--theme-light-primary' as string]: siteSettings.tokens.light.primary,
    ['--theme-light-text' as string]: siteSettings.tokens.light.text,
    ['--theme-dark-base' as string]: siteSettings.tokens.dark.base,
    ['--theme-dark-secondary' as string]: siteSettings.tokens.dark.secondary,
    ['--theme-dark-primary' as string]: siteSettings.tokens.dark.accent,
    ['--theme-dark-text' as string]: siteSettings.tokens.dark.text,
    ['--theme-radius' as string]: siteSettings.tokens.radius,
    ['--theme-shadow-soft' as string]: siteSettings.tokens.shadowSoft,
    ['--theme-typography-scale' as string]: siteSettings.tokens.typographyScale,
    ['--bg-intensity-light' as string]: String(siteSettings.bgIntensityLight),
    ['--bg-intensity-dark' as string]: String(siteSettings.bgIntensityDark),
    ['--bg-motion-enabled' as string]: siteSettings.bgMotionEnabled ? '1' : '0',
  };

  return (
    <div
      lang={locale}
      dir={isArabic ? 'rtl' : 'ltr'}
      className={`${manrope.variable} ${cairo.variable} theme-scope min-h-screen`}
      style={themeVars}
    >
      <ThemeProvider>
        <BackgroundEffect
          motionEnabled={siteSettings.bgMotionEnabled}
          intensityLight={siteSettings.bgIntensityLight}
          intensityDark={siteSettings.bgIntensityDark}
        />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="relative flex min-h-screen flex-col bg-transparent text-foreground">
            <Header locale={locale} />
            <main className="flex-1">{children}</main>
            <Footer locale={locale} />
          </div>
        </NextIntlClientProvider>
      </ThemeProvider>
    </div>
  );
}

