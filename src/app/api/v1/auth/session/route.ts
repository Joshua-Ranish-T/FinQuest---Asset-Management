import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifySessionToken } from '@/lib/auth';
import { ApiResponse, UserProfile } from '@/types';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('fb-session');
    const authFlag = cookieStore.get('fb-auth');

    if (!sessionCookie && !authFlag) {
      return NextResponse.json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      }, { status: 401 });
    }

    if (sessionCookie) {
      const verified = verifySessionToken(sessionCookie.value);
      if (!verified) {
        return NextResponse.json({
          success: false,
          error: { code: 'INVALID_SESSION', message: 'Session expired or invalid' },
        }, { status: 401 });
      }
    }

    const profile = db.getUserProfile();
    return NextResponse.json({
      success: true,
      data: { profile },
    });
  } catch {
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to verify session.' },
    }, { status: 500 });
  }
}
