import { getTranslations } from 'next-intl/server';
import { assignRoleAction, inviteStaffAction } from '@/app/[locale]/admin/actions/users';
import { Button } from '@/components/ui/button';
import { canGrantRole, type AppRole } from '@/lib/auth/roles';
import { requireOwnerOrAdmin } from '@/lib/auth/guards';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { isSupabaseAdminConfigured, isSupabaseConfigured } from '@/lib/supabase/config';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const ERROR_KEYS = new Set([
  'supabase_not_configured',
  'missing_fields',
  'invite_failed',
  'invalid_request',
  'cannot_grant_owner',
  'save_failed',
]);
const STATUS_KEYS = new Set(['invited', 'saved']);

function pickParam(value: string | string[] | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function isRoleAllowed(role: AppRole, currentRole: AppRole | null): boolean {
  return canGrantRole(currentRole, role);
}

export default async function AdminUsersPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const query = await searchParams;
  const context = await requireOwnerOrAdmin(locale);
  const t = await getTranslations('admin');
  const configured = isSupabaseConfigured();

  const errorParam = pickParam(query.error);
  const statusParam = pickParam(query.status);
  const errorKey = errorParam && ERROR_KEYS.has(errorParam) ? errorParam : undefined;
  const statusKey = statusParam && STATUS_KEYS.has(statusParam) ? statusParam : undefined;

  const supabase = configured ? await createSupabaseServerClient() : null;
  const rolesResult = supabase
    ? await supabase
        .from('user_roles')
        .select('user_id, role, scopes, created_at, profiles(display_name)')
        .order('created_at', { ascending: false })
    : { data: [], error: null };

  const roles = rolesResult.data ?? [];
  const emailByUserId = new Map<string, string>();

  if (isSupabaseAdminConfigured()) {
    const adminClient = createSupabaseAdminClient();
    const { data } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    data?.users.forEach((user) => {
      if (user.email) {
        emailByUserId.set(user.id, user.email);
      }
    });
  }

  return (
    <div className="space-y-6">
      <header className="glass-card rounded-2xl border border-border/70 p-6">
        <h1 className="text-start text-2xl font-semibold text-foreground">{t('nav.users')}</h1>
        <p className="mt-2 text-start text-sm text-muted-foreground">{t('users.subtitle')}</p>

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
        <h2 className="text-start text-lg font-medium text-foreground">{t('users.inviteTitle')}</h2>
        <p className="mt-1 text-start text-sm text-muted-foreground">{t('users.inviteHint')}</p>

        {!isSupabaseAdminConfigured() ? (
          <p className="mt-4 rounded-lg border border-border/70 bg-card/70 px-3 py-2 text-sm text-muted-foreground">
            {t('messages.supabase_not_configured')}
          </p>
        ) : (
          <form action={inviteStaffAction.bind(null, locale)} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              name="email"
              required
              className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm sm:max-w-sm"
            />
            <Button type="submit">{t('users.inviteAction')}</Button>
          </form>
        )}
      </section>

      <section className="glass-card rounded-2xl border border-border/70 p-6">
        <h2 className="text-start text-lg font-medium text-foreground">{t('users.rolesTitle')}</h2>
        <p className="mt-1 text-start text-sm text-muted-foreground">{t('users.rolesHint')}</p>

        {roles.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-border/70 p-6 text-start">
            <p className="text-sm text-muted-foreground">{t('empty.noItems')}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t('empty.authorizedOnly')}</p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {roles.map((entry) => {
              const scopes = Array.isArray(entry.scopes) ? (entry.scopes as string[]) : [];
              const profile = Array.isArray(entry.profiles) ? entry.profiles[0] : entry.profiles;
              const displayName = profile?.display_name ?? null;
              const email = emailByUserId.get(entry.user_id) ?? '';

              return (
                <div key={entry.user_id} className="rounded-xl border border-border/70 bg-card/60 p-4">
                  <div className="grid gap-1 text-start">
                    <p className="text-sm font-medium text-foreground">
                      {displayName || t('users.noDisplayName')}
                    </p>
                    {email ? <p className="text-xs text-muted-foreground">{email}</p> : null}
                    <p className="text-xs text-muted-foreground">{entry.user_id}</p>
                  </div>

                  <form action={assignRoleAction.bind(null, locale)} className="mt-4 space-y-3">
                    <input type="hidden" name="user_id" value={entry.user_id} />

                    <div className="space-y-1">
                      <label htmlFor={`role-${entry.user_id}`} className="block text-start text-xs text-muted-foreground">
                        {t('users.roleField')}
                      </label>
                      <select
                        id={`role-${entry.user_id}`}
                        name="role"
                        defaultValue={entry.role}
                        className="h-10 w-full rounded-md border border-border/70 bg-background/70 px-3 text-sm"
                      >
                        {(['customer', 'employee', 'supervisor', 'admin', 'owner'] as AppRole[]).map((role) =>
                          isRoleAllowed(role, context.role) || role === entry.role ? (
                            <option key={role} value={role}>
                              {t(`roles.${role}`)}
                            </option>
                          ) : null,
                        )}
                      </select>
                    </div>

                    <fieldset className="space-y-2">
                      <legend className="text-start text-xs text-muted-foreground">{t('users.scopesField')}</legend>
                      <div className="flex flex-wrap gap-3">
                        {(['all', 'services', 'products', 'kits', 'portfolio'] as const).map((scope) => (
                          <label key={scope} className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                            <input
                              type="checkbox"
                              name="scopes"
                              value={scope}
                              defaultChecked={scopes.includes(scope)}
                            />
                            <span>{t(`scopes.${scope}`)}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    <Button type="submit">{t('actions.save')}</Button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
