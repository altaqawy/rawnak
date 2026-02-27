import ContentSeoPage from '@/app/[locale]/admin/content/seo/page';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default function SiteSeoProxy(props: PageProps) {
  return <ContentSeoPage {...props} />;
}
