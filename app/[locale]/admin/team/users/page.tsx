import UsersPage from '@/app/[locale]/admin/users/page';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function TeamUsersProxy(props: PageProps) {
  return <UsersPage {...props} />;
}

