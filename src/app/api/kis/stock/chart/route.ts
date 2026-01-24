import { NextRequest, NextResponse } from 'next/server';
import { getKoreanDailyChart } from '@/lib/kis-api';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol');
  const period = (searchParams.get('period') || 'D') as 'D' | 'W' | 'M';
  const count = parseInt(searchParams.get('count') || '100', 10);

  if (!symbol) {
    return NextResponse.json(
      { error: 'symbol parameter is required' },
      { status: 400 }
    );
  }

  try {
    const chartData = await getKoreanDailyChart(symbol, period, count);
    return NextResponse.json({ data: chartData });
  } catch (error) {
    console.error('Korean chart API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chart data' },
      { status: 500 }
    );
  }
}
