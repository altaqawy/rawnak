import { redirect } from 'next/navigation';
import { requireOwner } from '@/lib/auth/guards';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function OwnerSiteSettingsAliasPage({ params }: PageProps) {
  const { locale } = await params;
  await requireOwner(locale);
  redirect(`/${locale}/admin/settings`);
}
