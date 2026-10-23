import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponse, Goal } from '@/types';

export async function GET() {
  const goals = db.getGoals();
  const profile = db.getUserProfile();

  const response: ApiResponse = {
    success: true,
    data: {
      goals,
      count: goals.length,
      max_allowed: profile.limits?.goals_max || 3,
    },
  };
  return NextResponse.json(response);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || body.target_amount === undefined || !body.target_date) {
      const badRequest: ApiResponse = {
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Goal name, target_amount, and target_date are required.' },
      };
      return NextResponse.json(badRequest, { status: 400 });
    }

    const result = db.addGoal({
      name: body.name,
      target_amount: Number(body.target_amount),
      target_date: body.target_date,
      category: body.category || 'CUSTOM',
      linked_asset_ids: Array.isArray(body.linked_asset_ids) ? body.linked_asset_ids : [],
      current_amount: Number(body.current_amount) || 0,
    });

    if (!result.success) {
      const quotaError: ApiResponse = {
        success: false,
        error: result.error,
      };
      return NextResponse.json(quotaError, { status: 403 });
    }

    const response: ApiResponse<Goal> = {
      success: true,
      data: result.data,
    };
    return NextResponse.json(response, { status: 201 });
  } catch {
    const serverError: ApiResponse = {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create financial goal.' },
    };
    return NextResponse.json(serverError, { status: 500 });
  }
}
