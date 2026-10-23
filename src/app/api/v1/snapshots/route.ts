import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponse, NetWorthSnapshot } from '@/types';

export async function GET() {
  const snapshots = db.getSnapshots();
  const summary = db.getPortfolioSummary();
  const profile = db.getUserProfile();

  const response: ApiResponse = {
    success: true,
    data: {
      snapshots,
      summary,
      limits: profile.limits,
    },
  };
  return NextResponse.json(response);
}

export async function POST() {
  try {
    const result = db.addSnapshot();

    if (!result.success) {
      const quotaError: ApiResponse = {
        success: false,
        error: result.error,
      };
      return NextResponse.json(quotaError, { status: 403 });
    }

    const response: ApiResponse<NetWorthSnapshot> = {
      success: true,
      data: result.data,
    };
    return NextResponse.json(response, { status: 201 });
  } catch {
    const serverError: ApiResponse = {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to record net worth snapshot.' },
    };
    return NextResponse.json(serverError, { status: 500 });
  }
}
