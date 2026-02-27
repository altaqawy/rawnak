import { redirect } from 'next/navigation';
import { requireOwner } from '@/lib/auth/guards';

type PageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function LegacyOwnerPageEditorRedirect({ params }: PageProps) {
  const { locale, id } = await params;
  await requireOwner(locale);
  redirect(`/${locale}/admin/builder/${id}`);
}
