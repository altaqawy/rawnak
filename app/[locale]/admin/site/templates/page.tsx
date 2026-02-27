import ContentTemplatesPage from '@/app/[locale]/admin/content/templates/page';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function SiteTemplatesProxy(props: PageProps) {
  return <ContentTemplatesPage {...props} />;
}
