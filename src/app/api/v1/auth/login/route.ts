import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateSessionToken } from '@/lib/auth';
import { ApiResponse } from '@/types';
import { getSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      const badReq: ApiResponse = {
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Email and password are required.' },
      };
      return NextResponse.json(badReq, { status: 400 });
    }

    // 1. Supabase Cloud Integration when configured
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseServerClient();
      if (supabase) {
        const { error: supaErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (supaErr) {
          const unauthorized: ApiResponse = {
            success: false,
            error: { code: 'INVALID_CREDENTIALS', message: supaErr.message },
          };
          return NextResponse.json(unauthorized, { status: 401 });
        }
      }
    }

    // 2. Persistent Storage Authentication
    const result = db.authenticateUser(email, password);
    if (!result.success || !result.user) {
      const unauthorized: ApiResponse = {
        success: false,
        error: result.error,
      };
      return NextResponse.json(unauthorized, { status: 401 });
    }

    const sessionToken = generateSessionToken(result.user.id, result.user.email);
    const response = NextResponse.json({
      success: true,
      data: {
        user: result.user,
        message: 'Signed in successfully!',
      },
    });

    response.cookies.set('fb-auth', '1', {
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
      httpOnly: false,
      sameSite: 'lax',
    });

    response.cookies.set('fb-session', sessionToken, {
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
      httpOnly: true,
      sameSite: 'lax',
    });

    return response;
  } catch {
    const serverError: ApiResponse = {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to process login.' },
    };
    return NextResponse.json(serverError, { status: 500 });
  }
}
