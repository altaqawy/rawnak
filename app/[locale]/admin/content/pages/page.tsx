import OwnerPagesPage from '@/app/[locale]/admin/pages/page';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function ContentPagesProxy(props: PageProps) {
  return <OwnerPagesPage {...props} />;
}

