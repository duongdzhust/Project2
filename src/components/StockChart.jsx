import { useEffect, useRef } from 'react'
import { createChart, ColorType, CandlestickSeries, HistogramSeries, LineSeries } from 'lightweight-charts'
import { calculateSMA } from '../utils/analyzer'

/**
 * Component hiển thị Biểu đồ Kỹ thuật tương tác cho mã cổ phiếu.
 * Sử dụng thư viện lightweight-charts của TradingView (Tương thích API v5+).
 * 
 * @param {Object} props
 * @param {Array} props.data - Mảng dữ liệu lịch sử giá OHLCV
 * @param {string} props.ticker - Tên mã cổ phiếu đang xem
 */
export default function StockChart({ data, ticker }) {
  const chartContainerRef = useRef(null)

  useEffect(() => {
    if (!chartContainerRef.current || !data || data.length === 0) return

    // 1. Chuẩn hóa dữ liệu lịch sử giá
    const chartData = data.map(item => ({
      time: item.tradingDate ? item.tradingDate.substring(0, 10) : item.date,
      open: Number(item.open),
      high: Number(item.high),
      low: Number(item.low),
      close: Number(item.close)
    })).sort((a, b) => a.time.localeCompare(b.time))

    // 2. Tính toán đường MA20 và MA50
    const sma20Data = calculateSMA(chartData, 20)
    const sma50Data = calculateSMA(chartData, 50)

    // Format định dạng { time, value } cho line series
    const formattedSma20 = chartData.map((item, idx) => ({
      time: item.time,
      value: sma20Data[idx]
    })).filter(item => item.value !== null)

    const formattedSma50 = chartData.map((item, idx) => ({
      time: item.time,
      value: sma50Data[idx]
    })).filter(item => item.value !== null)

    // 3. Format dữ liệu Volume Histogram
    const volumeData = chartData.map(item => {
      const originalItem = data.find(d => (d.tradingDate ? d.tradingDate.substring(0, 10) : d.date) === item.time)
      const volume = originalItem ? Number(originalItem.volume) : 0
      const isUp = item.close >= item.open
      return {
        time: item.time,
        value: volume,
        // Cột màu xanh/đỏ mờ hơn cột nến để tăng tính thẩm mỹ
        color: isUp ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)'
      }
    })

    // 4. Khởi tạo biểu đồ Lightweight Chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0d1527' },
        textColor: '#94a3b8',
        fontSize: 12,
        fontFamily: 'Inter, sans-serif',
      },
      grid: {
        vertLines: { color: 'rgba(30, 41, 59, 0.3)' },
        horzLines: { color: 'rgba(30, 41, 59, 0.3)' },
      },
      crosshair: {
        mode: 1, // Magnet mode
        vertLine: {
          color: '#818cf8',
          width: 1,
          style: 3, // Net đứt
          labelBackgroundColor: '#6366f1',
        },
        horzLine: {
          color: '#818cf8',
          width: 1,
          style: 3, // Net đứt
          labelBackgroundColor: '#6366f1',
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(30, 41, 59, 0.6)',
        visible: true,
        autoScale: true,
      },
      timeScale: {
        borderColor: 'rgba(30, 41, 59, 0.6)',
        timeVisible: false,
        secondsVisible: false,
      },
      handleScale: {
        mouseWheel: true,
        pinch: true,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    })

    // 5. Thêm Candlestick Series (Biểu đồ hình nến) - API v5+
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    })
    candlestickSeries.setData(chartData)

    // 6. Thêm Volume Series (Biểu đồ khối lượng dạng cột) - API v5+
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // Chuyển thành overlay đè lên phần dưới
    })
    
    // Đẩy volume xuống 20% bên dưới đáy biểu đồ
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    })
    volumeSeries.setData(volumeData)

    // 7. Thêm đường MA20 Line Series - API v5+
    const ma20Series = chart.addSeries(LineSeries, {
      color: '#f59e0b', // Màu vàng hổ phách
      lineWidth: 2,
      title: 'MA20',
      crosshairMarkerVisible: false,
      lastValueVisible: false,
      priceLineVisible: false,
    })
    ma20Series.setData(formattedSma20)

    // 8. Thêm đường MA50 Line Series - API v5+
    const ma50Series = chart.addSeries(LineSeries, {
      color: '#06b6d4', // Màu Cyan dương sáng
      lineWidth: 2,
      title: 'MA50',
      crosshairMarkerVisible: false,
      lastValueVisible: false,
      priceLineVisible: false,
    })
    ma50Series.setData(formattedSma50)

    // Tự động căn chỉnh vừa vặn dữ liệu ban đầu
    chart.timeScale().fitContent()

    // 9. Cấu hình tự động co giãn kích thước theo container
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.resize(chartContainerRef.current.clientWidth, 400)
      }
    }
    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(chartContainerRef.current)

    // Cleanup khi component unmount
    return () => {
      resizeObserver.disconnect()
      chart.remove()
    }
  }, [data])

  return (
    <div className="w-full bg-[#0d1527] border border-slate-800/80 rounded-2xl p-4 shadow-xl relative overflow-hidden transition-all duration-300">
      {/* Legend Header */}
      <div className="flex flex-wrap justify-between items-center mb-4 pb-3 border-b border-slate-800/60 gap-3">
        <div className="flex items-center space-x-3">
          <span className="text-lg font-bold text-white tracking-wider bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700/60">
            {ticker.toUpperCase()}
          </span>
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Lịch sử giá & Khối lượng (1D)</span>
        </div>
        
        {/* Indicators labels */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-[#f59e0b] block rounded"></span>
            <span className="text-slate-300">MA20</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-[#06b6d4] block rounded"></span>
            <span className="text-slate-300">MA50</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3 bg-emerald-500/25 border border-emerald-500/40 block rounded-sm"></span>
            <span className="text-slate-300">Volume</span>
          </div>
        </div>
      </div>
      
      {/* Container vẽ biểu đồ */}
      <div ref={chartContainerRef} className="w-full h-[400px]" />
    </div>
  )
}
