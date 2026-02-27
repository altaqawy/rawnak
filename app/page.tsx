import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { defaultLocale, isLocale, localeCookieName } from '@/i18n/config';

export default async function RootPage() {
  const cookieStore = await cookies();
  const storedLocale = cookieStore.get(localeCookieName)?.value;
  const locale = storedLocale && isLocale(storedLocale) ? storedLocale : defaultLocale;

  redirect(`/${locale}`);
}
