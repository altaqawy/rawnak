import AuditPage from '@/app/[locale]/admin/audit/page';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function TeamAuditProxy(props: PageProps) {
  return <AuditPage {...props} />;
}

