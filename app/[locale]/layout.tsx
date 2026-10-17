import type { Metadata } from 'next';
import type { CSSProperties, ReactNode } from 'react';
import { Cairo, Manrope } from 'next/font/google';
import { headers } from 'next/headers';
import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { defaultLocale, isLocale, locales, type Locale } from '@/i18n/config';
import { BackgroundEffect } from '@/components/BackgroundEffect';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { ToolsFooter, ToolsHeader } from '@/components/tools/ToolsHeader';
import '@/components/tools/tools-theme.css';
import '@/components/tools/component-library.css';
import '@/components/tools/motion-library.css';
import '@/components/tools/interaction-lab.css';
import '@/components/tools/kinetic-lab.css';
import '@/components/tools/visual-studio.css';
import { isToolsHost } from '@/lib/tools/domain';
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

  // Tools subdomain is a product surface inside this Next.js deployment.
  // Avoid loading the main site's CMS nav/settings on the tools hostname.
  const requestHeaders = await headers();
  const isToolsSubdomain = isToolsHost(requestHeaders.get('host') ?? requestHeaders.get('x-forwarded-host'));
  if (isToolsSubdomain) {
    return (
      <div lang={locale} dir={isArabic ? 'rtl' : 'ltr'} className={`${manrope.variable} ${cairo.variable} theme-scope rawnak-tools-shell min-h-screen`}>
        <ThemeProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <div className="flex min-h-screen flex-col bg-background text-foreground">
              <ToolsHeader locale={locale} />
              <main className="flex-1">{children}</main>
              <ToolsFooter locale={locale} />
            </div>
          </NextIntlClientProvider>
        </ThemeProvider>
      </div>
    );
  }

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

