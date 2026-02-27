import ContentPagesPage from '@/app/[locale]/admin/content/pages/page';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function SitePagesProxy(props: PageProps) {
  return <ContentPagesPage {...props} />;
}
