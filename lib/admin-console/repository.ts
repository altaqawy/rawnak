import 'server-only';

import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type DateFilters = {
  from?: string | null;
  to?: string | null;
};

function toStartUtc(date?: string | null) {
  if (!date) return null;
  return `${date}T00:00:00.000Z`;
}

function toEndUtc(date?: string | null) {
  if (!date) return null;
  return `${date}T23:59:59.999Z`;
}

function toNullableText(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function parseNumeric(value: string | null | undefined) {
  if (!value) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

async function withDateRange<T extends { gte: any; lte: any }>(
  query: T,
  column: string,
  filters?: DateFilters,
) {
  const from = toStartUtc(filters?.from);
  const to = toEndUtc(filters?.to);
  let next = query;
  if (from) next = next.gte(column, from);
  if (to) next = next.lte(column, to);
  return next;
}

export type DashboardFilters = DateFilters & {
  locale?: string | null;
  device?: string | null;
  country?: string | null;
  eventType?: string | null;
  pageSlug?: string | null;
};

export async function listCustomers() {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('customers')
    .select('id, user_id, name, created_at, updated_at')
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function createCustomer(input: { userId?: string | null; name?: string | null }) {
  if (!isSupabaseConfigured()) return { success: false, message: 'Supabase not configured.' };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('customers').insert({
    user_id: toNullableText(input.userId),
    name: toNullableText(input.name),
  });
  return error ? { success: false, message: error.message } : { success: true };
}

export async function listLeads() {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('leads_requests')
    .select('id, customer_id, name, channel, status, created_at, updated_at')
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function createLead(input: {
  customerId?: string | null;
  name?: string | null;
  channel?: string | null;
  status?: 'new' | 'in_progress' | 'closed';
}) {
  if (!isSupabaseConfigured()) return { success: false, message: 'Supabase not configured.' };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('leads_requests').insert({
    customer_id: toNullableText(input.customerId),
    name: toNullableText(input.name),
    channel: toNullableText(input.channel),
    status: input.status ?? 'new',
  });
  return error ? { success: false, message: error.message } : { success: true };
}

export async function listInventoryItems() {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('inventory_items')
    .select('id, sku, name_ar, name_en, created_at, updated_at')
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function createInventoryItem(input: {
  sku?: string | null;
  nameAr?: string | null;
  nameEn?: string | null;
}) {
  if (!isSupabaseConfigured()) return { success: false, message: 'Supabase not configured.' };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('inventory_items').insert({
    sku: toNullableText(input.sku),
    name_ar: toNullableText(input.nameAr),
    name_en: toNullableText(input.nameEn),
  });
  return error ? { success: false, message: error.message } : { success: true };
}

export async function listStockMoves() {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('stock_moves')
    .select('id, item_id, direction, quantity, reference_type, reference_id, note, occurred_at, created_by, created_at')
    .order('occurred_at', { ascending: false });
  return data ?? [];
}

export async function createStockMove(input: {
  itemId: string;
  direction: 'in' | 'out';
  quantity: string;
  referenceType?: string | null;
  referenceId?: string | null;
  note?: string | null;
  createdBy: string;
}) {
  if (!isSupabaseConfigured()) return { success: false, message: 'Supabase not configured.' };
  const quantity = parseNumeric(input.quantity);
  if (!quantity || quantity <= 0) return { success: false, message: 'Invalid quantity.' };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('stock_moves').insert({
    item_id: input.itemId,
    direction: input.direction,
    quantity,
    reference_type: toNullableText(input.referenceType),
    reference_id: toNullableText(input.referenceId),
    note: toNullableText(input.note),
    created_by: input.createdBy,
  });

  return error ? { success: false, message: error.message } : { success: true };
}

export async function listInvoices() {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('invoices')
    .select('id, customer_id, status, currency, subtotal, tax, total, issued_at, due_at, created_by, created_at, updated_at')
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function createInvoice(input: {
  customerId?: string | null;
  status?: 'draft' | 'issued' | 'paid' | 'void';
  currency?: string | null;
  subtotal?: string | null;
  tax?: string | null;
  total?: string | null;
  issuedAt?: string | null;
  dueAt?: string | null;
  createdBy: string;
}) {
  if (!isSupabaseConfigured()) return { success: false, message: 'Supabase not configured.' };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('invoices').insert({
    customer_id: toNullableText(input.customerId),
    status: input.status ?? 'draft',
    currency: toNullableText(input.currency) ?? 'EGP',
    subtotal: parseNumeric(input.subtotal),
    tax: parseNumeric(input.tax),
    total: parseNumeric(input.total),
    issued_at: toNullableText(input.issuedAt),
    due_at: toNullableText(input.dueAt),
    created_by: input.createdBy,
  });
  return error ? { success: false, message: error.message } : { success: true };
}

export async function listPayments() {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('payments')
    .select('id, invoice_id, customer_id, amount, method, occurred_at, created_by, created_at')
    .order('occurred_at', { ascending: false });
  return data ?? [];
}

export async function createPayment(input: {
  invoiceId?: string | null;
  customerId?: string | null;
  amount: string;
  method?: string | null;
  occurredAt?: string | null;
  createdBy: string;
}) {
  if (!isSupabaseConfigured()) return { success: false, message: 'Supabase not configured.' };
  const amount = parseNumeric(input.amount);
  if (!amount || amount <= 0) return { success: false, message: 'Invalid amount.' };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('payments').insert({
    invoice_id: toNullableText(input.invoiceId),
    customer_id: toNullableText(input.customerId),
    amount,
    method: toNullableText(input.method),
    occurred_at: toNullableText(input.occurredAt),
    created_by: input.createdBy,
  });
  return error ? { success: false, message: error.message } : { success: true };
}

export async function listExpenses() {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('expenses')
    .select('id, amount, category, occurred_at, note, created_by, created_at')
    .order('occurred_at', { ascending: false });
  return data ?? [];
}

export async function createExpense(input: {
  amount: string;
  category?: string | null;
  occurredAt?: string | null;
  note?: string | null;
  createdBy: string;
}) {
  if (!isSupabaseConfigured()) return { success: false, message: 'Supabase not configured.' };
  const amount = parseNumeric(input.amount);
  if (!amount || amount <= 0) return { success: false, message: 'Invalid amount.' };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('expenses').insert({
    amount,
    category: toNullableText(input.category),
    occurred_at: toNullableText(input.occurredAt),
    note: toNullableText(input.note),
    created_by: input.createdBy,
  });
  return error ? { success: false, message: error.message } : { success: true };
}

export async function getDashboardData(filters: DashboardFilters) {
  if (!isSupabaseConfigured()) {
    return {
      kpis: {
        sessions: 0,
        uniqueVisitors: 0,
        pageviews: 0,
        totalEvents: 0,
        conversions: 0,
        newCustomers: 0,
        outstandingInvoicesCount: 0,
        outstandingInvoicesTotal: 0,
      },
      pageviewsByDay: [] as Array<{ date: string; value: number }>,
      countryStats: [] as Array<{ countryCode: string; value: number }>,
      topPages: [] as Array<{ pageSlug: string; views: number }>,
      recentEvents: [] as Array<{
        id: string;
        occurred_at: string;
        event_name: string;
        page_slug: string | null;
        country_code: string | null;
      }>,
      financeSummary: { cashIn: 0, cashOut: 0 },
      inventorySummary: { stockIn: 0, stockOut: 0 },
      latestCustomers: [] as Array<{ id: string; name: string | null; created_at: string }>,
      latestLeads: [] as Array<{ id: string; name: string | null; status: string; created_at: string }>,
      recentFinance: [] as Array<{ kind: 'payment' | 'expense'; id: string; amount: number; occurred_at: string }>,
    };
  }

  const supabase = await createSupabaseServerClient();
  const from = toStartUtc(filters.from);
  const to = toEndUtc(filters.to);
  const locale = toNullableText(filters.locale);
  const device = toNullableText(filters.device);
  const country = toNullableText(filters.country)?.toUpperCase();
  const eventType = toNullableText(filters.eventType);
  const pageSlug = toNullableText(filters.pageSlug);

  let eventsQuery = supabase
    .from('analytics_events')
    .select('id, occurred_at, event_name, page_slug, locale, device, country_code, session_id, visitor_id')
    .order('occurred_at', { ascending: false })
    .limit(3000);
  if (from) eventsQuery = eventsQuery.gte('occurred_at', from);
  if (to) eventsQuery = eventsQuery.lte('occurred_at', to);
  if (locale) eventsQuery = eventsQuery.eq('locale', locale);
  if (device) eventsQuery = eventsQuery.eq('device', device);
  if (country) eventsQuery = eventsQuery.eq('country_code', country);
  if (eventType) eventsQuery = eventsQuery.eq('event_name', eventType);
  if (pageSlug) eventsQuery = eventsQuery.eq('page_slug', pageSlug);

  let customersQuery = supabase.from('customers').select('id, name, created_at').order('created_at', { ascending: false });
  if (from) customersQuery = customersQuery.gte('created_at', from);
  if (to) customersQuery = customersQuery.lte('created_at', to);

  let leadsQuery = supabase
    .from('leads_requests')
    .select('id, name, status, created_at')
    .order('created_at', { ascending: false })
    .limit(20);
  if (from) leadsQuery = leadsQuery.gte('created_at', from);
  if (to) leadsQuery = leadsQuery.lte('created_at', to);

  let invoicesQuery = supabase
    .from('invoices')
    .select('id, status, total, created_at')
    .order('created_at', { ascending: false });
  if (from) invoicesQuery = invoicesQuery.gte('created_at', from);
  if (to) invoicesQuery = invoicesQuery.lte('created_at', to);

  let paymentsQuery = supabase
    .from('payments')
    .select('id, amount, occurred_at')
    .order('occurred_at', { ascending: false })
    .limit(20);
  if (from) paymentsQuery = paymentsQuery.gte('occurred_at', from);
  if (to) paymentsQuery = paymentsQuery.lte('occurred_at', to);

  let expensesQuery = supabase
    .from('expenses')
    .select('id, amount, occurred_at')
    .order('occurred_at', { ascending: false })
    .limit(20);
  if (from) expensesQuery = expensesQuery.gte('occurred_at', from);
  if (to) expensesQuery = expensesQuery.lte('occurred_at', to);

  let stockMovesQuery = supabase
    .from('stock_moves')
    .select('id, direction, quantity, occurred_at')
    .order('occurred_at', { ascending: false })
    .limit(2000);
  if (from) stockMovesQuery = stockMovesQuery.gte('occurred_at', from);
  if (to) stockMovesQuery = stockMovesQuery.lte('occurred_at', to);

  const [eventsRes, customersRes, leadsRes, invoicesRes, paymentsRes, expensesRes, stockMovesRes] =
    await Promise.all([eventsQuery, customersQuery, leadsQuery, invoicesQuery, paymentsQuery, expensesQuery, stockMovesQuery]);

  const events = eventsRes.data ?? [];
  const customers = customersRes.data ?? [];
  const leads = leadsRes.data ?? [];
  const invoices = invoicesRes.data ?? [];
  const payments = paymentsRes.data ?? [];
  const expenses = expensesRes.data ?? [];
  const stockMoves = stockMovesRes.data ?? [];

  const sessionSet = new Set(events.map((item) => item.session_id).filter(Boolean));
  const visitorSet = new Set(events.map((item) => item.visitor_id).filter(Boolean));
  const pageviews = events.filter((item) => item.event_name === 'page_view');
  const conversions = events.filter((item) => item.event_name === 'operation_completed');

  const byDay = new Map<string, number>();
  for (const event of pageviews) {
    const key = new Date(event.occurred_at).toISOString().slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + 1);
  }

  const countryMap = new Map<string, number>();
  for (const event of events) {
    if (!event.country_code) continue;
    const key = event.country_code.toUpperCase();
    countryMap.set(key, (countryMap.get(key) ?? 0) + 1);
  }

  const pagesMap = new Map<string, number>();
  for (const event of pageviews) {
    const key = event.page_slug || 'unknown';
    pagesMap.set(key, (pagesMap.get(key) ?? 0) + 1);
  }

  const outstanding = invoices.filter((invoice) => invoice.status !== 'paid' && invoice.status !== 'void');
  const outstandingSum = outstanding.reduce((sum, invoice) => sum + Number(invoice.total ?? 0), 0);
  const cashIn = payments.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
  const cashOut = expenses.reduce((sum, expense) => sum + Number(expense.amount ?? 0), 0);
  const stockIn = stockMoves
    .filter((move) => move.direction === 'in')
    .reduce((sum, move) => sum + Number(move.quantity ?? 0), 0);
  const stockOut = stockMoves
    .filter((move) => move.direction === 'out')
    .reduce((sum, move) => sum + Number(move.quantity ?? 0), 0);

  return {
    kpis: {
      sessions: sessionSet.size,
      uniqueVisitors: visitorSet.size,
      pageviews: pageviews.length,
      totalEvents: events.length,
      conversions: conversions.length,
      newCustomers: customers.length,
      outstandingInvoicesCount: outstanding.length,
      outstandingInvoicesTotal: outstandingSum,
    },
    pageviewsByDay: Array.from(byDay.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, value]) => ({ date, value })),
    countryStats: Array.from(countryMap.entries())
      .map(([countryCode, value]) => ({ countryCode, value }))
      .sort((a, b) => b.value - a.value),
    topPages: Array.from(pagesMap.entries())
      .map(([pageSlug, views]) => ({ pageSlug, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10),
    recentEvents: events.slice(0, 20).map((event) => ({
      id: event.id,
      occurred_at: event.occurred_at,
      event_name: event.event_name,
      page_slug: event.page_slug,
      country_code: event.country_code,
    })),
    financeSummary: { cashIn, cashOut },
    inventorySummary: { stockIn, stockOut },
    latestCustomers: customers.slice(0, 10).map((item) => ({
      id: item.id,
      name: item.name,
      created_at: item.created_at,
    })),
    latestLeads: leads.slice(0, 10).map((item) => ({
      id: item.id,
      name: item.name,
      status: item.status,
      created_at: item.created_at,
    })),
    recentFinance: [
      ...payments.map((item) => ({
        kind: 'payment' as const,
        id: item.id,
        amount: Number(item.amount ?? 0),
        occurred_at: item.occurred_at,
      })),
      ...expenses.map((item) => ({
        kind: 'expense' as const,
        id: item.id,
        amount: Number(item.amount ?? 0),
        occurred_at: item.occurred_at,
      })),
    ]
      .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime())
      .slice(0, 20),
  };
}

export function toCsv(rows: Array<Record<string, unknown>>): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escape = (value: unknown) => {
    const text = value == null ? '' : String(value);
    if (text.includes(',') || text.includes('"') || text.includes('\n')) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };
  const lines = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => escape(row[header])).join(',')),
  ];
  return lines.join('\n');
}
