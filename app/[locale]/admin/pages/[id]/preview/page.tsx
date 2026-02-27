import { redirect } from 'next/navigation';
import { requireOwner } from '@/lib/auth/guards';
import { getOwnerPageById } from '@/lib/builder/repository';

type PageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function LegacyOwnerPagePreviewRedirect({ params }: PageProps) {
  const { locale, id } = await params;
  await requireOwner(locale);

  const page = await getOwnerPageById(id);
  if (!page) {
    redirect(`/${locale}/admin/pages`);
  }

  redirect(`/${locale}/preview/${page.slug}`);
}
