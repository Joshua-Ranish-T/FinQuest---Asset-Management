import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponse, Transaction } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month') || undefined; // YYYY-MM or undefined for current month

  const transactions = db.getTransactions();
  const insights = db.getCashflowInsights(month);
  const monthly_trend = db.getMonthlyTrend(6);

  const response: ApiResponse = {
    success: true,
    data: {
      transactions,
      insights,
      monthly_trend,
    },
  };
  return NextResponse.json(response);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.type || !body.category || body.amount === undefined) {
      const badRequest: ApiResponse = {
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Type, category, and amount are required.' },
      };
      return NextResponse.json(badRequest, { status: 400 });
    }

    const created = db.addTransaction({
      type: body.type,
      category: body.category,
      amount: Number(body.amount),
      currency: body.currency || 'INR',
      date: body.date || new Date().toISOString().split('T')[0],
      notes: body.notes || '',
    });

    const response: ApiResponse<Transaction> = {
      success: true,
      data: created,
    };
    return NextResponse.json(response, { status: 201 });
  } catch {
    const serverError: ApiResponse = {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create transaction.' },
    };
    return NextResponse.json(serverError, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      const badRequest: ApiResponse = {
        success: false,
        error: { code: 'MISSING_ID', message: 'Transaction ID is required.' },
      };
      return NextResponse.json(badRequest, { status: 400 });
    }

    const deleted = db.deleteTransaction(id);
    if (!deleted) {
      const notFound: ApiResponse = {
        success: false,
        error: { code: 'NOT_FOUND', message: 'Transaction not found.' },
      };
      return NextResponse.json(notFound, { status: 404 });
    }

    const response: ApiResponse = {
      success: true,
      data: { id, deleted: true },
    };
    return NextResponse.json(response);
  } catch {
    const serverError: ApiResponse = {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete transaction.' },
    };
    return NextResponse.json(serverError, { status: 500 });
  }
}
