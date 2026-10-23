import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateSessionToken } from '@/lib/auth';
import { ApiResponse, UserProfile } from '@/types';
import { getSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, full_name } = body;

    if (!email || !password) {
      const badReq: ApiResponse = {
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Email and password are required.' },
      };
      return NextResponse.json(badReq, { status: 400 });
    }

    if (password.length < 8) {
      const badReq: ApiResponse = {
        success: false,
        error: { code: 'WEAK_PASSWORD', message: 'Password must be at least 8 characters long.' },
      };
      return NextResponse.json(badReq, { status: 400 });
    }

    // 1. Supabase Cloud Integration when configured
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseServerClient();
      if (supabase) {
        const { data: supaData, error: supaErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: full_name || email.split('@')[0] },
          },
        });
        if (supaErr) {
          const errResponse: ApiResponse = {
            success: false,
            error: { code: 'AUTH_FAILED', message: supaErr.message },
          };
          return NextResponse.json(errResponse, { status: 400 });
        }
      }
    }

    // 2. Persistent Local Storage
    const result = db.registerUser(email, password, full_name);
    if (!result.success || !result.user) {
      const conflict: ApiResponse = {
        success: false,
        error: result.error,
      };
      return NextResponse.json(conflict, { status: 409 });
    }

    const sessionToken = generateSessionToken(result.user.id, result.user.email);
    const response = NextResponse.json({
      success: true,
      data: {
        user: result.user,
        message: 'Account registered successfully!',
      },
    });

    response.cookies.set('fb-auth', '1', {
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
      httpOnly: false, // client-readable for hydration attributes
      sameSite: 'lax',
    });

    response.cookies.set('fb-session', sessionToken, {
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
      httpOnly: true, // secure HTTP-only session cookie
      sameSite: 'lax',
    });

    return response;
  } catch {
    const serverError: ApiResponse = {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to process registration.' },
    };
    return NextResponse.json(serverError, { status: 500 });
  }
}
