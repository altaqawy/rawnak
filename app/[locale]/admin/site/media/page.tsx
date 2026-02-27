import ContentMediaPage from '@/app/[locale]/admin/content/media/page';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function SiteMediaProxy(props: PageProps) {
  return <ContentMediaPage {...props} />;
}
