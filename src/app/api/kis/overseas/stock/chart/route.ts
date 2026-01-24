import { NextRequest, NextResponse } from 'next/server';
import { getOverseasDailyChart } from '@/lib/kis-api';

// Exchange code mapping
function getExchangeCode(ticker: string): 'NAS' | 'NYS' | 'AMS' {
  // Common NASDAQ stocks
  const nasdaqStocks = ['AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'META', 'TSLA', 'NVDA', 'AMD', 'INTC', 'QCOM', 'AVGO', 'ADBE', 'NFLX', 'PYPL', 'CSCO', 'PEP', 'COST', 'CMCSA', 'TMUS'];

  if (nasdaqStocks.includes(ticker.toUpperCase())) {
    return 'NAS';
  }

  // Default to NYSE for others (can be improved with a more complete mapping)
  return 'NYS';
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol');
  const period = (searchParams.get('period') || '0') as '0' | '1' | '2';
  const count = parseInt(searchParams.get('count') || '100', 10);
  const exchange = searchParams.get('exchange') as 'NAS' | 'NYS' | 'AMS' | null;

  if (!symbol) {
    return NextResponse.json(
      { error: 'symbol parameter is required' },
      { status: 400 }
    );
  }

  try {
    const exchangeCode = exchange || getExchangeCode(symbol);
    const chartData = await getOverseasDailyChart(symbol, exchangeCode, period, count);
    return NextResponse.json({ data: chartData });
  } catch (error) {
    console.error('Overseas chart API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chart data' },
      { status: 500 }
    );
  }
}
