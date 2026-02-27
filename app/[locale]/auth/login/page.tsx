import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { loginAction } from '@/app/[locale]/auth/actions';
import { Button } from '@/components/ui/button';
import { isSupabaseConfigured } from '@/lib/supabase/config';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const LOGIN_ERROR_KEYS = new Set([
  'supabase_not_configured',
  'missing_fields',
  'invalid_credentials',
]);
const LOGIN_STATUS_KEYS = new Set(['check_email']);

function pickParam(value: string | string[] | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

export default async function LoginPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const query = await searchParams;
  const t = await getTranslations('auth');
  const configured = isSupabaseConfigured();

  const errorParam = pickParam(query.error);
  const statusParam = pickParam(query.status);
  const errorKey = errorParam && LOGIN_ERROR_KEYS.has(errorParam) ? errorParam : undefined;
  const statusKey = statusParam && LOGIN_STATUS_KEYS.has(statusParam) ? statusParam : undefined;

  return (
    <section className="mx-auto flex w-full max-w-6xl justify-center px-4 py-20 md:px-6 md:py-24">
      <div className="glass-card w-full max-w-md rounded-2xl border border-border/70 p-6 md:p-8">
        <h1 className="text-start text-2xl font-semibold text-foreground">{t('login.title')}</h1>
        <p className="mt-2 text-start text-sm text-muted-foreground">{t('login.subtitle')}</p>

        {errorKey && (
          <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {t(`errors.${errorKey}`)}
          </p>
        )}

        {statusKey && (
          <p className="mt-4 rounded-lg border border-border/70 bg-card/70 px-3 py-2 text-sm text-muted-foreground">
            {t(`status.${statusKey}`)}
          </p>
        )}

        {!configured ? (
          <p className="mt-4 rounded-lg border border-border/70 bg-card/70 px-3 py-2 text-sm text-muted-foreground">
            {t('errors.supabase_not_configured')}
          </p>
        ) : (
          <form action={loginAction.bind(null, locale)} className="mt-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-start text-sm text-foreground">
                {t('fields.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm outline-none ring-offset-background transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-start text-sm text-foreground">
                {t('fields.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm outline-none ring-offset-background transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
              />
            </div>

            <Button type="submit" className="w-full">
              {t('login.submit')}
            </Button>
          </form>
        )}

        <p className="mt-6 text-start text-sm text-muted-foreground">
          {t('login.noAccount')}{' '}
          <Link href={`/${locale}/auth/signup`} className="text-primary underline-offset-4 hover:underline">
            {t('login.signupLink')}
          </Link>
        </p>
      </div>
    </section>
  );
}
