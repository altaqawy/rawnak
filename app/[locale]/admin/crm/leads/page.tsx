import LeadsPage from '@/app/[locale]/admin/leads/page';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function CrmLeadsProxy(props: PageProps) {
  return <LeadsPage {...props} />;
}

