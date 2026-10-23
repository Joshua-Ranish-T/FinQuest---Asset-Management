import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponse } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { assets } = body;

    if (!Array.isArray(assets) || assets.length === 0) {
      const badRequest: ApiResponse = {
        success: false,
        error: { code: 'INVALID_PAYLOAD', message: 'An array of assets is required for import.' },
      };
      return NextResponse.json(badRequest, { status: 400 });
    }

    const result = db.bulkAddAssets(assets);

    if (!result.success) {
      const quotaError: ApiResponse = {
        success: false,
        error: result.error,
      };
      return NextResponse.json(quotaError, { status: 403 });
    }

    const response: ApiResponse = {
      success: true,
      data: {
        imported_count: result.importedCount,
        message: `Successfully imported ${result.importedCount} assets!`,
      },
    };
    return NextResponse.json(response, { status: 201 });
  } catch {
    const serverError: ApiResponse = {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to process bulk asset import.' },
    };
    return NextResponse.json(serverError, { status: 500 });
  }
}
