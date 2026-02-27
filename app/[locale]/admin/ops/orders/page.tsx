import OrdersPage from '@/app/[locale]/admin/operations/orders/page';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default function OpsOrdersProxy(props: PageProps) {
  return <OrdersPage {...props} />;
}

