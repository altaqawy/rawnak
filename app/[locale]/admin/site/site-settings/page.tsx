import ContentSiteSettingsPage from '@/app/[locale]/admin/content/site-settings/page';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function SiteSettingsProxy(props: PageProps) {
  return <ContentSiteSettingsPage {...props} />;
}
