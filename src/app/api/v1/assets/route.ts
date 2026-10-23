import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponse, Asset } from '@/types';

export async function GET() {
  const assets = db.getAssets();
  const summary = db.getPortfolioSummary();
  const profile = db.getUserProfile();

  const response: ApiResponse = {
    success: true,
    data: {
      assets,
      summary: {
        total_value: summary.totalAssets,
        base_currency: summary.baseCurrency,
        count: summary.assetsCount,
        max_allowed: profile.limits?.assets_max || 25,
      },
    },
  };
  return NextResponse.json(response);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || body.current_value === undefined) {
      const badRequest: ApiResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Asset name and current_value are required.',
        },
      };
      return NextResponse.json(badRequest, { status: 400 });
    }

    const result = db.addAsset({
      name: body.name,
      asset_class: body.asset_class || 'OTHER',
      institution: body.institution || '',
      quantity: Number(body.quantity) || 1,
      buy_price: Number(body.buy_price) !== undefined ? Number(body.buy_price) : Number(body.current_value),
      current_value: Number(body.current_value),
      currency: body.currency || 'INR',
      notes: body.notes || '',
    });

    if (!result.success) {
      const quotaError: ApiResponse = {
        success: false,
        error: result.error,
      };
      return NextResponse.json(quotaError, { status: 403 });
    }

    const response: ApiResponse<Asset> = {
      success: true,
      data: result.data,
    };
    return NextResponse.json(response, { status: 201 });
  } catch {
    const serverError: ApiResponse = {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to process asset creation.' },
    };
    return NextResponse.json(serverError, { status: 500 });
  }
}
