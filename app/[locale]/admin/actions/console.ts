'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireOwner } from '@/lib/auth/guards';
import {
  createCustomer,
  createExpense,
  createInventoryItem,
  createInvoice,
  createLead,
  createPayment,
  createStockMove,
} from '@/lib/admin-console/repository';
import { appendAuditLog } from '@/lib/builder/repository';

function withStatus(pathname: string, status: string) {
  const params = new URLSearchParams({ status });
  return `${pathname}?${params.toString()}`;
}

function withError(pathname: string, error: string) {
  const params = new URLSearchParams({ error });
  return `${pathname}?${params.toString()}`;
}

export async function createCustomerAction(locale: string, formData: FormData) {
  const context = await requireOwner(locale);
  const path = `/${locale}/admin/customers`;
  const result = await createCustomer({
    userId: String(formData.get('user_id') ?? ''),
    name: String(formData.get('name') ?? ''),
  });
  if (!result.success) redirect(withError(path, 'save_failed'));
  await appendAuditLog({
    actorId: context.user!.id,
    action: 'customer.create',
    entityType: 'customer',
  });
  revalidatePath(path);
  revalidatePath(`/${locale}/admin/dashboard`);
  redirect(withStatus(path, 'saved'));
}

export async function createLeadAction(locale: string, formData: FormData) {
  const context = await requireOwner(locale);
  const path = `/${locale}/admin/leads`;
  const result = await createLead({
    customerId: String(formData.get('customer_id') ?? ''),
    name: String(formData.get('name') ?? ''),
    channel: String(formData.get('channel') ?? ''),
    status: (String(formData.get('status') ?? 'new') as 'new' | 'in_progress' | 'closed'),
  });
  if (!result.success) redirect(withError(path, 'save_failed'));
  await appendAuditLog({
    actorId: context.user!.id,
    action: 'lead.create',
    entityType: 'lead',
  });
  revalidatePath(path);
  revalidatePath(`/${locale}/admin/dashboard`);
  redirect(withStatus(path, 'saved'));
}

export async function createInventoryItemAction(locale: string, formData: FormData) {
  const context = await requireOwner(locale);
  const path = `/${locale}/admin/inventory/items`;
  const result = await createInventoryItem({
    sku: String(formData.get('sku') ?? ''),
    nameAr: String(formData.get('name_ar') ?? ''),
    nameEn: String(formData.get('name_en') ?? ''),
  });
  if (!result.success) redirect(withError(path, 'save_failed'));
  await appendAuditLog({
    actorId: context.user!.id,
    action: 'inventory.item.create',
    entityType: 'inventory_item',
  });
  revalidatePath(path);
  redirect(withStatus(path, 'saved'));
}

export async function createStockMoveAction(locale: string, formData: FormData) {
  const context = await requireOwner(locale);
  const path = `/${locale}/admin/inventory/moves`;
  const itemId = String(formData.get('item_id') ?? '').trim();
  const direction = String(formData.get('direction') ?? 'in').trim();
  const quantity = String(formData.get('quantity') ?? '').trim();
  if (!itemId || !quantity || (direction !== 'in' && direction !== 'out')) {
    redirect(withError(path, 'invalid_request'));
  }
  const result = await createStockMove({
    itemId,
    direction,
    quantity,
    referenceType: String(formData.get('reference_type') ?? ''),
    referenceId: String(formData.get('reference_id') ?? ''),
    note: String(formData.get('note') ?? ''),
    createdBy: context.user!.id,
  });
  if (!result.success) redirect(withError(path, 'save_failed'));
  await appendAuditLog({
    actorId: context.user!.id,
    action: 'inventory.move.create',
    entityType: 'stock_move',
  });
  revalidatePath(path);
  revalidatePath(`/${locale}/admin/inventory/ledger`);
  revalidatePath(`/${locale}/admin/dashboard`);
  redirect(withStatus(path, 'saved'));
}

export async function createInvoiceAction(locale: string, formData: FormData) {
  const context = await requireOwner(locale);
  const path = `/${locale}/admin/finance/invoices`;
  const result = await createInvoice({
    customerId: String(formData.get('customer_id') ?? ''),
    status: String(formData.get('status') ?? 'draft') as 'draft' | 'issued' | 'paid' | 'void',
    currency: String(formData.get('currency') ?? 'EGP'),
    subtotal: String(formData.get('subtotal') ?? ''),
    tax: String(formData.get('tax') ?? ''),
    total: String(formData.get('total') ?? ''),
    issuedAt: String(formData.get('issued_at') ?? ''),
    dueAt: String(formData.get('due_at') ?? ''),
    createdBy: context.user!.id,
  });
  if (!result.success) redirect(withError(path, 'save_failed'));
  await appendAuditLog({
    actorId: context.user!.id,
    action: 'finance.invoice.create',
    entityType: 'invoice',
  });
  revalidatePath(path);
  revalidatePath(`/${locale}/admin/dashboard`);
  redirect(withStatus(path, 'saved'));
}

export async function createPaymentAction(locale: string, formData: FormData) {
  const context = await requireOwner(locale);
  const path = `/${locale}/admin/finance/payments`;
  const amount = String(formData.get('amount') ?? '').trim();
  if (!amount) redirect(withError(path, 'missing_fields'));
  const result = await createPayment({
    invoiceId: String(formData.get('invoice_id') ?? ''),
    customerId: String(formData.get('customer_id') ?? ''),
    amount,
    method: String(formData.get('method') ?? ''),
    occurredAt: String(formData.get('occurred_at') ?? ''),
    createdBy: context.user!.id,
  });
  if (!result.success) redirect(withError(path, 'save_failed'));
  await appendAuditLog({
    actorId: context.user!.id,
    action: 'finance.payment.create',
    entityType: 'payment',
  });
  revalidatePath(path);
  revalidatePath(`/${locale}/admin/dashboard`);
  redirect(withStatus(path, 'saved'));
}

export async function createExpenseAction(locale: string, formData: FormData) {
  const context = await requireOwner(locale);
  const path = `/${locale}/admin/finance/expenses`;
  const amount = String(formData.get('amount') ?? '').trim();
  if (!amount) redirect(withError(path, 'missing_fields'));
  const result = await createExpense({
    amount,
    category: String(formData.get('category') ?? ''),
    occurredAt: String(formData.get('occurred_at') ?? ''),
    note: String(formData.get('note') ?? ''),
    createdBy: context.user!.id,
  });
  if (!result.success) redirect(withError(path, 'save_failed'));
  await appendAuditLog({
    actorId: context.user!.id,
    action: 'finance.expense.create',
    entityType: 'expense',
  });
  revalidatePath(path);
  revalidatePath(`/${locale}/admin/dashboard`);
  redirect(withStatus(path, 'saved'));
}
