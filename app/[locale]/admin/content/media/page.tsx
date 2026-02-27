import OwnerMediaPage from '@/app/[locale]/admin/media/page';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function ContentMediaProxy(props: PageProps) {
  return <OwnerMediaPage {...props} />;
}

