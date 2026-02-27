import 'server-only';

import { redirect } from 'next/navigation';
import { isStaffRole } from '@/lib/auth/roles';
import { getAuthContext, type AuthContext } from '@/lib/auth/session';

function loginPath(locale: string) {
  return `/${locale}/auth/login`;
}

export async function requireAuthenticatedUser(locale: string): Promise<AuthContext> {
  const context = await getAuthContext();

  if (!context.user) {
    redirect(loginPath(locale));
  }

  return context;
}

export async function requireStaff(locale: string): Promise<AuthContext> {
  const context = await requireAuthenticatedUser(locale);

  if (!isStaffRole(context.role)) {
    redirect(`/${locale}/portal`);
  }

  return context;
}

export async function requireCustomer(locale: string): Promise<AuthContext> {
  const context = await requireAuthenticatedUser(locale);

  if (context.role !== 'customer') {
    if (isStaffRole(context.role)) {
      redirect(`/${locale}/admin`);
    }

    redirect(`/${locale}`);
  }

  return context;
}

export async function requireOwnerOrAdmin(locale: string): Promise<AuthContext> {
  const context = await requireStaff(locale);

  if (context.role !== 'owner' && context.role !== 'admin') {
    redirect(`/${locale}/admin`);
  }

  return context;
}

export async function requireOwner(locale: string): Promise<AuthContext> {
  const context = await requireStaff(locale);

  if (context.role !== 'owner') {
    redirect(`/${locale}`);
  }

  return context;
}
