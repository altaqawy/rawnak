import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/session';
import {
  getDashboardData,
  listCustomers,
  listExpenses,
  listInvoices,
  listLeads,
  listPayments,
  listStockMoves,
  toCsv,
} from '@/lib/admin-console/repository';
import { listAuditLog } from '@/lib/builder/repository';

const DATASETS = new Set(['website', 'customers', 'team', 'inventory', 'finance']);

export async function GET(request: Request) {
  const auth = await getAuthContext();
  if (!auth.user || auth.role !== 'owner') {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const dataset = searchParams.get('dataset');
  if (!dataset || !DATASETS.has(dataset)) {
    return NextResponse.json({ ok: false, error: 'invalid_dataset' }, { status: 400 });
  }

  let rows: Array<Record<string, unknown>> = [];

  if (dataset === 'website') {
    const data = await getDashboardData({
      from: searchParams.get('from'),
      to: searchParams.get('to'),
      locale: searchParams.get('locale'),
      device: searchParams.get('device'),
      country: searchParams.get('country'),
      eventType: searchParams.get('eventType'),
      pageSlug: searchParams.get('pageSlug'),
    });
    rows = data.recentEvents.map((item) => ({
      id: item.id,
      occurred_at: item.occurred_at,
      event_name: item.event_name,
      page_slug: item.page_slug,
      country_code: item.country_code,
    }));
  }

  if (dataset === 'customers') {
    const [customers, leads] = await Promise.all([listCustomers(), listLeads()]);
    rows = [
      ...customers.map((item: any) => ({
        row_type: 'customer',
        id: item.id,
        name: item.name,
        user_id: item.user_id,
        created_at: item.created_at,
      })),
      ...leads.map((item: any) => ({
        row_type: 'lead',
        id: item.id,
        name: item.name,
        status: item.status,
        channel: item.channel,
        customer_id: item.customer_id,
        created_at: item.created_at,
      })),
    ];
  }

  if (dataset === 'team') {
    const logs = (await listAuditLog()).slice(0, 500);
    rows = logs.map((item) => ({
      id: item.id,
      created_at: item.created_at,
      actor_id: item.actor_id,
      action: item.action,
      entity_type: item.entity_type,
      entity_id: item.entity_id,
    }));
  }

  if (dataset === 'inventory') {
    const moves = await listStockMoves();
    rows = moves.map((item: any) => ({
      id: item.id,
      item_id: item.item_id,
      direction: item.direction,
      quantity: item.quantity,
      reference_type: item.reference_type,
      reference_id: item.reference_id,
      occurred_at: item.occurred_at,
      created_at: item.created_at,
    }));
  }

  if (dataset === 'finance') {
    const [invoices, payments, expenses] = await Promise.all([
      listInvoices(),
      listPayments(),
      listExpenses(),
    ]);
    rows = [
      ...invoices.map((item: any) => ({
        row_type: 'invoice',
        id: item.id,
        customer_id: item.customer_id,
        status: item.status,
        currency: item.currency,
        subtotal: item.subtotal,
        tax: item.tax,
        total: item.total,
        issued_at: item.issued_at,
        due_at: item.due_at,
        created_at: item.created_at,
      })),
      ...payments.map((item: any) => ({
        row_type: 'payment',
        id: item.id,
        invoice_id: item.invoice_id,
        customer_id: item.customer_id,
        amount: item.amount,
        method: item.method,
        occurred_at: item.occurred_at,
        created_at: item.created_at,
      })),
      ...expenses.map((item: any) => ({
        row_type: 'expense',
        id: item.id,
        amount: item.amount,
        category: item.category,
        note: item.note,
        occurred_at: item.occurred_at,
        created_at: item.created_at,
      })),
    ];
  }

  const csv = toCsv(rows);
  const filename = `${dataset}-${new Date().toISOString().slice(0, 10)}.csv`;
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
