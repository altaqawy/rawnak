import CustomersPage from '@/app/[locale]/admin/customers/page';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function CrmCustomersProxy(props: PageProps) {
  return <CustomersPage {...props} />;
}

