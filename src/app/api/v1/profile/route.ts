import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponse } from '@/types';

export async function GET() {
  // Always return the live profile with current counts and limits
  const profile = db.getUserProfile();
  const response: ApiResponse = {
    success: true,
    data: profile,
  };
  return NextResponse.json(response);
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const updated = db.updateUserProfile({
      ...(body.full_name !== undefined && { full_name: body.full_name }),
      ...(body.base_currency !== undefined && { base_currency: body.base_currency }),
      ...(body.theme !== undefined && { theme: body.theme }),
      ...(body.font_scale !== undefined && { font_scale: body.font_scale }),
    });
    const response: ApiResponse = { success: true, data: updated };
    return NextResponse.json(response);
  } catch {
    const serverError: ApiResponse = {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update profile.' },
    };
    return NextResponse.json(serverError, { status: 500 });
  }
}
