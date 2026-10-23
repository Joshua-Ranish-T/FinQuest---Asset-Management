import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponse, Asset } from '@/types';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const asset = db.getAssetById(id);

  if (!asset) {
    const notFound: ApiResponse = {
      success: false,
      error: { code: 'NOT_FOUND', message: `Asset ${id} was not found.` },
    };
    return NextResponse.json(notFound, { status: 404 });
  }

  const response: ApiResponse<Asset> = {
    success: true,
    data: asset,
  };
  return NextResponse.json(response);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = db.updateAsset(id, {
      ...(body.name && { name: body.name }),
      ...(body.asset_class && { asset_class: body.asset_class }),
      ...(body.institution !== undefined && { institution: body.institution }),
      ...(body.quantity !== undefined && { quantity: Number(body.quantity) }),
      ...(body.buy_price !== undefined && { buy_price: Number(body.buy_price) }),
      ...(body.current_value !== undefined && { current_value: Number(body.current_value) }),
      ...(body.currency && { currency: body.currency }),
      ...(body.notes !== undefined && { notes: body.notes }),
    });

    if (!updated) {
      const notFound: ApiResponse = {
        success: false,
        error: { code: 'NOT_FOUND', message: `Asset ${id} was not found.` },
      };
      return NextResponse.json(notFound, { status: 404 });
    }

    const response: ApiResponse<Asset> = {
      success: true,
      data: updated,
    };
    return NextResponse.json(response);
  } catch {
    const serverError: ApiResponse = {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update asset.' },
    };
    return NextResponse.json(serverError, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = db.deleteAsset(id);

  if (!deleted) {
    const notFound: ApiResponse = {
      success: false,
      error: { code: 'NOT_FOUND', message: `Asset ${id} was not found.` },
    };
    return NextResponse.json(notFound, { status: 404 });
  }

  const response: ApiResponse = {
    success: true,
    data: { id, deleted: true },
  };
  return NextResponse.json(response);
}
