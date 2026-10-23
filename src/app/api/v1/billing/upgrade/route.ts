import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponse } from '@/types';

export async function POST() {
  const updatedProfile = db.updateUserProfile({
    subscription_status: 'pro',
    pro_purchased_at: new Date().toISOString(),
  });

  const response: ApiResponse = {
    success: true,
    data: {
      profile: updatedProfile,
      message: 'Successfully upgraded to FinQuest Pro! All quotas are now unlimited.',
    },
  };
  return NextResponse.json(response);
}
