'use client';

import { useEffect, useRef, useState } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  HistogramData,
  ColorType,
  CrosshairMode,
  CandlestickSeries,
  HistogramSeries,
} from 'lightweight-charts';

interface ChartDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CandlestickChartProps {
  symbol: string;
  isOverseas?: boolean;
  exchange?: 'NAS' | 'NYS' | 'AMS';
}

type PeriodType = 'D' | 'W' | 'M';

const periodOptions = [
  { label: '일봉', value: 'D' as PeriodType },
  { label: '주봉', value: 'W' as PeriodType },
  { label: '월봉', value: 'M' as PeriodType },
];

const countOptions = [
  { label: '1개월', value: 20 },
  { label: '3개월', value: 60 },
  { label: '6개월', value: 120 },
  { label: '1년', value: 250 },
  { label: '전체', value: 500 },
];

export default function CandlestickChart({ symbol, isOverseas = false, exchange }: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const candlestickSeriesRef = useRef<ISeriesApi<any> | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const volumeSeriesRef = useRef<ISeriesApi<any> | null>(null);

  const [period, setPeriod] = useState<PeriodType>('D');
  const [count, setCount] = useState(60);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const container = chartContainerRef.current;

    // Clear previous chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chartOptions = {
      layout: {
        background: { type: ColorType.Solid, color: isDarkMode ? '#1a1a2e' : '#ffffff' },
        textColor: isDarkMode ? '#d1d5db' : '#374151',
      },
      grid: {
        vertLines: { color: isDarkMode ? '#2d2d44' : '#e5e7eb' },
        horzLines: { color: isDarkMode ? '#2d2d44' : '#e5e7eb' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: isDarkMode ? '#2d2d44' : '#e5e7eb',
      },
      timeScale: {
        borderColor: isDarkMode ? '#2d2d44' : '#e5e7eb',
        timeVisible: true,
        secondsVisible: false,
      },
      width: container.clientWidth,
      height: 400,
    };

    const chart = createChart(container, chartOptions);
    chartRef.current = chart;

    // Candlestick series (v5 API)
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });
    candlestickSeriesRef.current = candlestickSeries;

    // Volume series (v5 API)
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#6b7280',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });
    volumeSeriesRef.current = volumeSeries;

    // Handle resize
    const handleResize = () => {
      if (chartRef.current && container) {
        chartRef.current.applyOptions({ width: container.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [isDarkMode]);

  // Fetch and update data
  useEffect(() => {
    const fetchData = async () => {
      if (!candlestickSeriesRef.current || !volumeSeriesRef.current) return;

      setLoading(true);
      setError(null);

      try {
        const apiPeriod = isOverseas
          ? (period === 'D' ? '0' : period === 'W' ? '1' : '2')
          : period;

        const url = isOverseas
          ? `/api/kis/overseas/stock/chart?symbol=${symbol}&period=${apiPeriod}&count=${count}${exchange ? `&exchange=${exchange}` : ''}`
          : `/api/kis/stock/chart?symbol=${symbol}&period=${period}&count=${count}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Failed to fetch chart data');
        }

        const result = await response.json();
        const data: ChartDataPoint[] = result.data || [];

        if (data.length === 0) {
          setError('차트 데이터가 없습니다');
          return;
        }

        // Convert to chart format and sort by time
        const candleData: CandlestickData<string>[] = data
          .map(item => ({
            time: item.time,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
          }))
          .sort((a, b) => a.time.localeCompare(b.time));

        const volumeData: HistogramData<string>[] = data
          .map(item => ({
            time: item.time,
            value: item.volume,
            color: item.close >= item.open ? '#22c55e80' : '#ef444480',
          }))
          .sort((a, b) => a.time.localeCompare(b.time));

        candlestickSeriesRef.current.setData(candleData);
        volumeSeriesRef.current.setData(volumeData);

        // Fit content
        if (chartRef.current) {
          chartRef.current.timeScale().fitContent();
        }
      } catch (err) {
        console.error('Chart data fetch error:', err);
        setError('차트 데이터를 불러오는데 실패했습니다');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol, period, count, isOverseas, exchange]);

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* Period selector */}
        <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          {periodOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                period === opt.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Count selector */}
        <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          {countOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setCount(opt.value)}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                count === opt.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart container */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-10">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-600 dark:text-gray-400">차트 로딩 중...</span>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-10">
            <span className="text-red-500">{error}</span>
          </div>
        )}

        <div
          ref={chartContainerRef}
          className="w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
        />
      </div>
    </div>
  );
}
