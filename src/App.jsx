import { useState, useEffect } from 'react'
import { fetchStockData } from './services/api'
import { calculateStockScore } from './utils/analyzer'
import StockChart from './components/StockChart'
import DailyWatchlist from './components/DailyWatchlist'

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  
  // States lưu trữ kết quả phân tích
  const [activeTicker, setActiveTicker] = useState('')
  const [stockData, setStockData] = useState(null)
  const [analysis, setAnalysis] = useState(null)

  // Tự động phân tích mã SSI khi ứng dụng khởi chạy lần đầu tiên
  useEffect(() => {
    handleAnalyze('SSI')
  }, [])

  const handleAnalyze = async (tickerToAnalyze) => {
    const cleanTicker = tickerToAnalyze.trim().toUpperCase()
    if (!cleanTicker) return

    setIsSearching(true)
    setErrorMsg('')
    
    try {
      const data = await fetchStockData(cleanTicker)
      
      if (!data) {
        setErrorMsg(`Không tìm thấy mã chứng khoán "${cleanTicker}" hoặc lỗi kết nối. Vui lòng kiểm tra lại (ví dụ: HPG, SSI, FPT).`)
        setStockData(null)
        setAnalysis(null)
        setActiveTicker('')
      } else {
        const result = calculateStockScore(data)
        setStockData(data)
        setAnalysis(result)
        setActiveTicker(cleanTicker)
        setSearchQuery(cleanTicker)
      }
    } catch (err) {
      console.error(err)
      setErrorMsg('Đã xảy ra lỗi hệ thống trong quá trình lấy và phân tích dữ liệu.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    handleAnalyze(searchQuery)
  }

  // Lựa chọn màu sắc nổi bật cho Khuyến nghị
  const getRecommendationStyle = (rec) => {
    switch (rec) {
      case 'MUA MẠNH':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/35',
          text: 'text-emerald-400',
          glow: 'shadow-emerald-500/5',
          badge: 'bg-emerald-500'
        }
      case 'MUA':
        return {
          bg: 'bg-green-500/10 border-green-500/25',
          text: 'text-green-400',
          glow: 'shadow-green-500/5',
          badge: 'bg-green-500'
        }
      case 'NẮM GIỮ':
        return {
          bg: 'bg-amber-500/10 border-amber-500/25',
          text: 'text-amber-400',
          glow: 'shadow-amber-500/5',
          badge: 'bg-amber-500'
        }
      case 'BÁN':
        return {
          bg: 'bg-rose-500/10 border-rose-500/35',
          text: 'text-rose-400',
          glow: 'shadow-rose-500/5',
          badge: 'bg-rose-500'
        }
      default:
        return {
          bg: 'bg-slate-800/50 border-slate-700',
          text: 'text-slate-400',
          glow: '',
          badge: 'bg-slate-500'
        }
    }
  }

  // Lập trình phòng thủ: Luôn có một object mặc định để tránh crash khi render JSX đánh giá template strings
  const recStyle = analysis && analysis.recommendation
    ? getRecommendationStyle(analysis.recommendation)
    : { bg: 'bg-slate-800/50 border-slate-700', text: 'text-slate-400', glow: '', badge: 'bg-slate-500' }

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans transition-all duration-300">
      
      {/* Header */}
      <header className="border-b border-slate-800/60 bg-[#0d1527]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleAnalyze('SSI')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-violet-400 via-indigo-200 to-cyan-400 bg-clip-text text-transparent">
                VNStock SmartView
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                Robo-Advisor Live
              </span>
            </div>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex space-x-8 text-sm font-medium text-slate-400">
            <a href="#dashboard" className="hover:text-white transition-colors duration-200 py-2 border-b-2 border-violet-500 text-white">Phân Tích</a>
            <a href="#watchlist" className="hover:text-white transition-colors duration-200 py-2 border-b-2 border-transparent">Watchlist</a>
            <a href="#about" className="hover:text-white transition-colors duration-200 py-2 border-b-2 border-transparent">Về Thuật Toán</a>
          </nav>

          {/* Indicator */}
          <div className="flex items-center">
            <span className="px-3 py-1 text-xs font-semibold bg-violet-600/10 text-violet-400 rounded-full border border-violet-500/20 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
              Dark Mode Hệ Thống
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full space-y-8 relative">
        {/* Decorative background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute bottom-1/3 right-10 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />

        {/* Search Section */}
        <div className="w-full bg-[#0d1527]/40 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Hệ Thống Đánh Giá Xu Hướng Cổ Phiếu Tự Động
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Nhập mã cổ phiếu của 3 sàn HSX, HNX, UPCOM để kiểm tra tín hiệu kỹ thuật tức thời.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleFormSubmit} className="relative flex items-center">
              <div className="absolute left-4 text-slate-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <input
                type="text"
                placeholder="Nhập mã chứng khoán (VD: SSI, HPG, FPT, VND...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                className="w-full bg-slate-950/60 text-white pl-12 pr-32 py-3.5 rounded-xl border border-slate-700/30 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-base placeholder-slate-500 transition-all duration-300 uppercase font-semibold tracking-wider"
              />

              <button
                type="submit"
                disabled={isSearching}
                className="absolute right-2 px-6 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-lg text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all duration-200 focus:outline-none disabled:opacity-50 flex items-center space-x-2"
              >
                {isSearching ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Đang Quét...</span>
                  </>
                ) : (
                  <span>Phân Tích</span>
                )}
              </button>
            </form>
          </div>

          {/* Feedback error messages */}
          {errorMsg && (
            <div className="max-w-2xl mx-auto mt-4 p-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs sm:text-sm rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Dashboard Analysis Grid */}
        {analysis && stockData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard">
            
            {/* Left Column: Interactive Technical Chart */}
            <div className="lg:col-span-2 space-y-6">
              <StockChart data={stockData} ticker={activeTicker} />
            </div>

            {/* Right Column: AI Analysis Result & Indicators */}
            <div className="space-y-6">
              {/* Recommendation Card */}
              <div className={`border rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm ${recStyle.bg} ${recStyle.glow} transition-all duration-300`}>
                {/* Background decorative element */}
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-full filter blur-[40px] opacity-20 -mr-6 -mt-6 ${recStyle.badge}`} />

                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">KHUYẾN NGHỊ ROBO</span>
                  <span className="text-xs font-semibold text-slate-400">VNStock AI v1.0</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className={`w-3.5 h-3.5 rounded-full ${recStyle.badge} animate-pulse`} />
                    <span className={`text-3xl sm:text-4xl font-black tracking-wide ${recStyle.text}`}>
                      {analysis?.recommendation}
                    </span>
                  </div>
                  
                  {/* Score progress bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-300">
                      <span>Điểm số tín hiệu:</span>
                      <span className={recStyle.text}>{(analysis?.score || 0)} / 10 điểm</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-950/60 rounded-full overflow-hidden border border-slate-800/40">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${recStyle.badge}`}
                        style={{ width: `${(analysis?.score || 0) * 10}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Warning message if broken SMA20 */}
                {analysis?.isBrokenSma20 && (
                  <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs leading-relaxed flex items-start gap-2">
                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>
                      <strong>Cảnh báo gãy xu hướng:</strong> Giá hiện tại ({analysis?.indicators?.close?.toLocaleString()}) đã cắt xuống dưới SMA20 ({analysis?.indicators?.sma20?.toLocaleString()}). Kích hoạt tín hiệu <strong>BÁN</strong> phòng ngừa rủi ro.
                    </span>
                  </div>
                )}
              </div>

              {/* Technical Indicators Details */}
              <div className="bg-[#0d1527]/40 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800/60 pb-2">
                  Chi Tiết Chỉ Báo Kỹ Thuật
                </h3>

                <div className="space-y-3.5 text-xs sm:text-sm">
                  {/* Close Price */}
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-900/40">
                    <span className="text-slate-400">Giá đóng cửa (Close)</span>
                    <span className="font-bold text-white text-base">
                      {analysis?.indicators?.close?.toLocaleString()}đ
                    </span>
                  </div>

                  {/* SMA 20 */}
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-900/40">
                    <span className="text-slate-400">Đường trung bình ngắn hạn (SMA20)</span>
                    <span className="font-semibold text-amber-400">
                      {analysis?.indicators?.sma20 ? analysis.indicators.sma20.toLocaleString() : 'N/A'}đ
                    </span>
                  </div>

                  {/* SMA 50 */}
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-900/40">
                    <span className="text-slate-400">Đường trung bình trung hạn (SMA50)</span>
                    <span className="font-semibold text-cyan-400">
                      {analysis?.indicators?.sma50 ? analysis.indicators.sma50.toLocaleString() : 'N/A'}đ
                    </span>
                  </div>

                  {/* RSI */}
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-900/40">
                    <span className="text-slate-400">Chỉ số sức mạnh RSI(14)</span>
                    <div className="text-right">
                      <span className="font-semibold text-slate-200">
                        {analysis?.indicators?.rsi !== null && analysis?.indicators?.rsi !== undefined ? analysis.indicators.rsi : 'N/A'}
                      </span>
                      {analysis?.indicators?.rsi !== null && analysis?.indicators?.rsi !== undefined && (
                        <span className="text-[10px] text-slate-500 block">
                          (Phiên trước: {analysis?.indicators?.prevRsi})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Volume */}
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-slate-400">Khối lượng phiên hiện tại</span>
                    <div className="text-right">
                      <span className="font-semibold text-slate-200">
                        {analysis?.indicators?.volume?.toLocaleString()} cp
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        (TB 20 phiên: {analysis?.indicators?.volSma20 ? analysis.indicators.volSma20.toLocaleString() : 'N/A'} cp)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Checklist Criteria */}
              <div className="bg-[#0d1527]/40 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800/60 pb-2">
                  Checklist Tiêu Chí Thuật Toán
                </h3>

                <div className="space-y-3">
                  {/* Criteria 1: Trend */}
                  <div className="flex items-start space-x-3 text-xs sm:text-sm">
                    <div className="mt-0.5">
                      {analysis?.checklist?.trend ? (
                        <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 font-bold">✓</span>
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20 font-bold">✗</span>
                      )}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-200 block">Xu Hướng Giá (Trọng số 40% - 4đ)</span>
                      <span className="text-[11px] text-slate-400">Yêu cầu: Giá đóng cửa &gt; SMA20 &amp; SMA20 &gt; SMA50.</span>
                    </div>
                  </div>

                  {/* Criteria 2: Momentum */}
                  <div className="flex items-start space-x-3 text-xs sm:text-sm">
                    <div className="mt-0.5">
                      {analysis?.checklist?.momentum ? (
                        <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 font-bold">✓</span>
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20 font-bold">✗</span>
                      )}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-200 block">Động Lượng Tăng Giá (Trọng số 30% - 3đ)</span>
                      <span className="text-[11px] text-slate-400">Yêu cầu: RSI(14) trong khoảng 45 - 65 và đang hướng lên.</span>
                    </div>
                  </div>

                  {/* Criteria 3: Volume */}
                  <div className="flex items-start space-x-3 text-xs sm:text-sm">
                    <div className="mt-0.5">
                      {analysis?.checklist?.volume ? (
                        <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 font-bold">✓</span>
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20 font-bold">✗</span>
                      )}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-200 block">Dòng Tiền Đột Biến (Trọng số 30% - 3đ)</span>
                      <span className="text-[11px] text-slate-400">Yêu cầu: Khối lượng giao dịch hiện tại &gt; 1.5 lần trung bình 20 phiên.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Watchlist Section */}
        <div id="watchlist" className="w-full">
          <DailyWatchlist onSelectTicker={handleAnalyze} />
        </div>

        {/* Information Section */}
        <div id="about" className="w-full bg-[#0d1527]/30 border border-slate-800/60 rounded-2xl p-6 text-xs sm:text-sm text-slate-400 space-y-3">
          <h3 className="font-bold text-slate-200 text-sm">Về Mô Hình Thuật Toán VNStock SmartView</h3>
          <p>
            Hệ thống chấm điểm dựa trên phân tích kỹ thuật dòng tiền và xu hướng thị trường. Dữ liệu lịch sử giá được tải trực tiếp từ nguồn dữ liệu công khai của các công ty chứng khoán đối tác (TCBS).
          </p>
          <p>
            <strong>Lưu ý:</strong> Khuyến nghị mua bán của Robo-Advisor chỉ mang tính chất thống kê kỹ thuật, không chịu trách nhiệm cho các khoản thua lỗ trong thực tế giao dịch của nhà đầu tư. Hãy cân nhắc quản trị rủi ro cá nhân một cách chặt chẽ.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <p>© 2026 VNStock SmartView. Xây dựng cho cộng đồng nhà đầu tư Việt Nam.</p>
          <div className="flex space-x-4">
            <a href="#privacy" className="hover:underline">Điều khoản sử dụng</a>
            <a href="#disclaimer" className="hover:underline">Miễn trừ trách nhiệm</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
