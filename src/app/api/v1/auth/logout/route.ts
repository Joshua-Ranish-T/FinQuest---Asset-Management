import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types';
import { getSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase';

export async function POST() {
  try {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseServerClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    }

    const response = NextResponse.json({
      success: true,
      data: { message: 'Logged out successfully.' },
    });

    response.cookies.delete('fb-auth');
    response.cookies.delete('fb-session');

    return response;
  } catch {
    const serverError: ApiResponse = {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to process logout.' },
    };
    return NextResponse.json(serverError, { status: 500 });
  }
}
