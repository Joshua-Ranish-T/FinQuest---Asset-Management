import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'json';

  const data = db.exportAllData();

  if (format === 'csv') {
    // Generate combined CSV
    const assets = data.assets;
    let csv = 'ID,Name,AssetClass,Platform,Quantity,Cost,Valuation,Currency\n';
    assets.forEach((a) => {
      csv += `"${a.id}","${a.name}","${a.asset_class}","${a.institution || ''}",${a.quantity},${a.buy_price},${a.current_value},"${a.currency}"\n`;
    });

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="finquest-portfolio-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  }

  const jsonStr = JSON.stringify(data, null, 2);
  return new NextResponse(jsonStr, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="finquest-export-${new Date().toISOString().split('T')[0]}.json"`,
    },
  });
}
