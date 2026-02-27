import OwnerSeoPage from '@/app/[locale]/admin/seo/page';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default function ContentSeoProxy(props: PageProps) {
  return <OwnerSeoPage {...props} />;
}

