import { redirect } from 'next/navigation';
import { requireOwner } from '@/lib/auth/guards';
import {
  appendAuditLog,
  createOwnerPage,
  getOwnerPageBySlug,
  listOwnerPages,
} from '@/lib/builder/repository';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function OwnerBuilderEntryPage({ params }: PageProps) {
  const { locale } = await params;
  const context = await requireOwner(locale);

  const existingServicesPage = await getOwnerPageBySlug('services');
  if (existingServicesPage) {
    redirect(`/${locale}/admin/builder/${existingServicesPage.id}`);
  }

  const created = await createOwnerPage({
    slug: 'services',
    titleAr: 'الخدمات',
    titleEn: 'Services',
    navLabelAr: 'الخدمات',
    navLabelEn: 'Services',
    showInNav: true,
    navOrder: 20,
  });

  if (created.success) {
    await appendAuditLog({
      actorId: context.user!.id,
      action: 'page.create',
      entityType: 'page',
      entityId: created.id,
      detailsJson: { slug: 'services', source: 'admin_builder_entry' },
    });

    redirect(`/${locale}/admin/builder/${created.id}`);
  }

  const pages = await listOwnerPages();
  if (pages[0]?.id) {
    redirect(`/${locale}/admin/builder/${pages[0].id}`);
  }

  redirect(`/${locale}/admin/pages`);
}
