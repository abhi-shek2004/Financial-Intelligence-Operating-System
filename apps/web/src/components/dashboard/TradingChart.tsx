import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries, HistogramSeries } from 'lightweight-charts';

interface OHLCVData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  value?: number; // volume
}

interface TradingChartProps {
  data: OHLCVData[];
}

export default function TradingChart({ data }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.04)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.04)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      rightPriceScale: {
        borderVisible: false,
      },
      crosshair: {
        horzLine: { color: 'rgba(59, 130, 246, 0.3)', style: 2 },
        vertLine: { color: 'rgba(59, 130, 246, 0.3)', style: 2 },
      },
    });

    // Candlestick series
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    candlestickSeries.setData(data as any);

    // Volume histogram series
    const volumeData = data
      .filter(d => d.value !== undefined)
      .map(d => ({
        time: d.time,
        value: d.value!,
        color: d.close >= d.open ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
      }));

    if (volumeData.length > 0) {
      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: 'volume' },
        priceScaleId: 'volume',
      });

      chart.priceScale('volume').applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
      });

      volumeSeries.setData(volumeData as any);
    }

    chart.timeScale().fitContent();

    // Resize observer for responsive charts
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        chart.applyOptions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [data]);

  return (
    <div className="w-full h-full relative">
      {data.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-blue-500/50 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Loading Market Data…</span>
          </div>
        </div>
      )}
      <div ref={chartContainerRef} className="w-full h-full absolute inset-0" />
    </div>
  );
}
