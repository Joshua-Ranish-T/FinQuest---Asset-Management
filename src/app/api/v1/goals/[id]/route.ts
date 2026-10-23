import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponse, Goal } from '@/types';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = db.updateGoal(id, {
      ...(body.name && { name: body.name }),
      ...(body.target_amount !== undefined && { target_amount: Number(body.target_amount) }),
      ...(body.target_date && { target_date: body.target_date }),
      ...(body.category && { category: body.category }),
      ...(Array.isArray(body.linked_asset_ids) && { linked_asset_ids: body.linked_asset_ids }),
      ...(body.current_amount !== undefined && { current_amount: Number(body.current_amount) }),
    });

    if (!updated) {
      const notFound: ApiResponse = {
        success: false,
        error: { code: 'NOT_FOUND', message: `Goal ${id} was not found.` },
      };
      return NextResponse.json(notFound, { status: 404 });
    }

    const response: ApiResponse<Goal> = {
      success: true,
      data: updated,
    };
    return NextResponse.json(response);
  } catch {
    const serverError: ApiResponse = {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update goal.' },
    };
    return NextResponse.json(serverError, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = db.deleteGoal(id);

  if (!deleted) {
    const notFound: ApiResponse = {
      success: false,
      error: { code: 'NOT_FOUND', message: `Goal ${id} was not found.` },
    };
    return NextResponse.json(notFound, { status: 404 });
  }

  const response: ApiResponse = {
    success: true,
    data: { id, deleted: true },
  };
  return NextResponse.json(response);
}
