import DeliveriesPage from '@/app/[locale]/admin/operations/deliveries/page';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default function OpsDeliveriesProxy(props: PageProps) {
  return <DeliveriesPage {...props} />;
}

