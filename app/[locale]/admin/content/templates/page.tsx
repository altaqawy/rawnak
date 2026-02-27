import OwnerTemplatesPage from '@/app/[locale]/admin/templates/page';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function ContentTemplatesProxy(props: PageProps) {
  return <OwnerTemplatesPage {...props} />;
}

