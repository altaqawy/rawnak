import { getTranslations } from 'next-intl/server';
import { updateProfileAction } from '@/app/[locale]/portal/actions';
import { Button } from '@/components/ui/button';
import { requireCustomer } from '@/lib/auth/guards';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const ERROR_KEYS = new Set(['supabase_not_configured', 'save_failed']);
const STATUS_KEYS = new Set(['saved']);

function pickParam(value: string | string[] | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

export default async function PortalProfilePage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const query = await searchParams;
  const context = await requireCustomer(locale);
  const t = await getTranslations('portal');

  const errorParam = pickParam(query.error);
  const statusParam = pickParam(query.status);
  const errorKey = errorParam && ERROR_KEYS.has(errorParam) ? errorParam : undefined;
  const statusKey = statusParam && STATUS_KEYS.has(statusParam) ? statusParam : undefined;

  let displayName = '';
  if (isSupabaseConfigured() && context.user) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', context.user.id)
      .maybeSingle();
    displayName = data?.display_name ?? '';
  }

  return (
    <div className="space-y-6">
      <header className="glass-card rounded-2xl border border-border/70 p-6">
        <h1 className="text-start text-2xl font-semibold text-foreground">{t('nav.profile')}</h1>
        <p className="mt-2 text-start text-sm text-muted-foreground">{t('profile.subtitle')}</p>

        {errorKey && (
          <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {t(`messages.${errorKey}`)}
          </p>
        )}
        {statusKey && (
          <p className="mt-4 rounded-lg border border-border/70 bg-card/70 px-3 py-2 text-sm text-muted-foreground">
            {t(`messages.${statusKey}`)}
          </p>
        )}
      </header>

      <section className="glass-card rounded-2xl border border-border/70 p-6">
        <form action={updateProfileAction.bind(null, locale)} className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="display_name" className="block text-start text-xs text-muted-foreground">
              {t('profile.fields.displayName')}
            </label>
            <input
              id="display_name"
              name="display_name"
              defaultValue={displayName}
              className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm md:max-w-md"
            />
          </div>
          <Button type="submit">{t('actions.save')}</Button>
        </form>
      </section>
    </div>
  );
}
