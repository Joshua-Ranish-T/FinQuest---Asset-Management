import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponse, Liability } from '@/types';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const liability = db.getLiabilityById(id);

  if (!liability) {
    const notFound: ApiResponse = {
      success: false,
      error: { code: 'NOT_FOUND', message: `Liability ${id} was not found.` },
    };
    return NextResponse.json(notFound, { status: 404 });
  }

  const response: ApiResponse<Liability> = {
    success: true,
    data: liability,
  };
  return NextResponse.json(response);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = db.updateLiability(id, {
      ...(body.name && { name: body.name }),
      ...(body.liability_type && { liability_type: body.liability_type }),
      ...(body.lender !== undefined && { lender: body.lender }),
      ...(body.principal_outstanding !== undefined && { principal_outstanding: Number(body.principal_outstanding) }),
      ...(body.interest_rate !== undefined && { interest_rate: Number(body.interest_rate) }),
      ...(body.monthly_emi !== undefined && { monthly_emi: Number(body.monthly_emi) }),
      ...(body.currency && { currency: body.currency }),
    });

    if (!updated) {
      const notFound: ApiResponse = {
        success: false,
        error: { code: 'NOT_FOUND', message: `Liability ${id} was not found.` },
      };
      return NextResponse.json(notFound, { status: 404 });
    }

    const response: ApiResponse<Liability> = {
      success: true,
      data: updated,
    };
    return NextResponse.json(response);
  } catch {
    const serverError: ApiResponse = {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update liability.' },
    };
    return NextResponse.json(serverError, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = db.deleteLiability(id);

  if (!deleted) {
    const notFound: ApiResponse = {
      success: false,
      error: { code: 'NOT_FOUND', message: `Liability ${id} was not found.` },
    };
    return NextResponse.json(notFound, { status: 404 });
  }

  const response: ApiResponse = {
    success: true,
    data: { id, deleted: true },
  };
  return NextResponse.json(response);
}
