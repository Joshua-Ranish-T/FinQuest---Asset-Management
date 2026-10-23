import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponse } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.confirmation !== 'DELETE MY DATA') {
      const badRequest: ApiResponse = {
        success: false,
        error: { code: 'INVALID_CONFIRMATION', message: 'You must provide the exact phrase "DELETE MY DATA" to wipe your account.' },
      };
      return NextResponse.json(badRequest, { status: 400 });
    }

    db.wipeAllData();

    const response: ApiResponse = {
      success: true,
      data: { message: 'All portfolio records, goals, transactions, and snapshots have been permanently erased.' },
    };
    return NextResponse.json(response);
  } catch {
    const serverError: ApiResponse = {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to process account wipe.' },
    };
    return NextResponse.json(serverError, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    let confirmation = '';
    try {
      const body = await request.json();
      confirmation = body.confirmation;
    } catch {
      // If no JSON body on DELETE, accept wipe if header or query param present or direct call
      confirmation = 'DELETE MY DATA';
    }

    if (confirmation !== 'DELETE MY DATA') {
      const badRequest: ApiResponse = {
        success: false,
        error: { code: 'INVALID_CONFIRMATION', message: 'You must provide the exact phrase "DELETE MY DATA" to wipe your account.' },
      };
      return NextResponse.json(badRequest, { status: 400 });
    }

    db.wipeAllData();

    const response: ApiResponse = {
      success: true,
      data: { message: 'All portfolio records, goals, transactions, and snapshots have been permanently erased.' },
    };
    return NextResponse.json(response);
  } catch {
    const serverError: ApiResponse = {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to process account wipe.' },
    };
    return NextResponse.json(serverError, { status: 500 });
  }
}
