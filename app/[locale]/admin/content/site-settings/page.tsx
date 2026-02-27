import OwnerSettingsPage from '@/app/[locale]/admin/settings/page';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function ContentSiteSettingsProxy(props: PageProps) {
  return <OwnerSettingsPage {...props} />;
}

