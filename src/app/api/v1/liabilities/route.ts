import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponse, Liability } from '@/types';

export async function GET() {
  const liabilities = db.getLiabilities();
  const summary = db.getPortfolioSummary();
  const profile = db.getUserProfile();

  const response: ApiResponse = {
    success: true,
    data: {
      liabilities,
      summary: {
        total_outstanding: summary.totalLiabilities,
        base_currency: summary.baseCurrency,
        count: summary.liabilitiesCount,
        max_allowed: profile.limits?.liabilities_max || 5,
      },
    },
  };
  return NextResponse.json(response);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || body.principal_outstanding === undefined) {
      const badRequest: ApiResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Liability name and principal_outstanding are required.',
        },
      };
      return NextResponse.json(badRequest, { status: 400 });
    }

    const result = db.addLiability({
      name: body.name,
      liability_type: body.liability_type || 'OTHER',
      lender: body.lender || '',
      principal_outstanding: Number(body.principal_outstanding),
      interest_rate: body.interest_rate !== undefined ? Number(body.interest_rate) : undefined,
      monthly_emi: body.monthly_emi !== undefined ? Number(body.monthly_emi) : undefined,
      currency: body.currency || 'INR',
    });

    if (!result.success) {
      const quotaError: ApiResponse = {
        success: false,
        error: result.error,
      };
      return NextResponse.json(quotaError, { status: 403 });
    }

    const response: ApiResponse<Liability> = {
      success: true,
      data: result.data,
    };
    return NextResponse.json(response, { status: 201 });
  } catch {
    const serverError: ApiResponse = {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to process liability creation.' },
    };
    return NextResponse.json(serverError, { status: 500 });
  }
}
