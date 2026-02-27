import ContentBuilderPage from '@/app/[locale]/admin/content/builder/page';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default function SiteBuilderProxy(props: PageProps) {
  return <ContentBuilderPage {...props} />;
}
