import { redirect } from 'next/navigation';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function SiteModuleEntryPage({ params }: PageProps) {
  const { locale } = await params;
  redirect(`/${locale}/admin/site/pages`);
}
