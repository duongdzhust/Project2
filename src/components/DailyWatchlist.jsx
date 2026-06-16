import React from 'react'

/**
 * Component hiển thị danh sách các cổ phiếu đáng chú ý trong ngày.
 * 
 * @param {Object} props
 * @param {Function} props.onSelectTicker - Hàm callback khi click vào một mã cổ phiếu
 */
export default function DailyWatchlist({ onSelectTicker }) {
  // Mock dữ liệu 5 mã cổ phiếu tiêu biểu trong ngày theo PRD
  const watchlist = [
    {
      ticker: 'SSI',
      name: 'CTCP Chứng khoán SSI',
      recommendation: 'MUA MẠNH',
      score: 9,
      reason: 'Bứt phá nền tích lũy ngắn hạn với khối lượng giao dịch đột biến gấp 2.2 lần trung bình.',
      change: '+4.2%',
      price: '38,500đ'
    },
    {
      ticker: 'HPG',
      name: 'CTCP Tập đoàn Hòa Phát',
      recommendation: 'MUA',
      score: 7,
      reason: 'Giá vượt thuyết phục đường SMA20 với sự gia tăng mạnh mẽ từ lực mua khối ngoại.',
      change: '+2.1%',
      price: '29,300đ'
    },
    {
      ticker: 'FPT',
      name: 'CTCP FPT',
      recommendation: 'NẮM GIỮ',
      score: 5,
      reason: 'Duy trì xu hướng tăng trưởng trung hạn ổn định phía trên đường SMA50. RSI ở mức 58.',
      change: '+0.5%',
      price: '135,000đ'
    },
    {
      ticker: 'VCB',
      name: 'Ngân hàng TMCP Ngoại thương VN',
      recommendation: 'NẮM GIỮ',
      score: 4,
      reason: 'Đang tích lũy đi ngang quanh vùng đỉnh lịch sử. Dòng tiền tạm thời thận trọng.',
      change: '-0.3%',
      price: '92,100đ'
    },
    {
      ticker: 'MWG',
      name: 'CTCP Đầu tư Thế giới Di Động',
      recommendation: 'BÁN',
      score: 2,
      reason: 'Lực bán gia tăng mạnh mẽ, giá chính thức cắt xuống dưới đường hỗ trợ SMA20.',
      change: '-3.8%',
      price: '58,200đ'
    }
  ]

  const getRecommendationBadgeColor = (rec) => {
    switch (rec) {
      case 'MUA MẠNH':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
      case 'MUA':
        return 'bg-green-500/15 text-green-400 border-green-500/20'
      case 'NẮM GIỮ':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/20'
      case 'BÁN':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/20'
      default:
        return 'bg-slate-500/15 text-slate-400 border-slate-500/20'
    }
  }

  const getChangeColor = (change) => {
    return change.startsWith('+') ? 'text-emerald-400' : change.startsWith('-') ? 'text-rose-400' : 'text-slate-400'
  }

  return (
    <div className="w-full bg-[#0d1527] border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/60">
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Watchlist Tiêu Biểu Trong Ngày
          </h2>
          <p className="text-xs text-slate-400 mt-1">Được quét tự động bởi thuật toán Robo-Advisor cuối phiên</p>
        </div>
        <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded uppercase tracking-widest">
          AUTO SCREENER
        </span>
      </div>

      {/* List */}
      <div className="space-y-3">
        {watchlist.map((item) => (
          <div
            key={item.ticker}
            onClick={() => onSelectTicker(item.ticker)}
            className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-slate-900/40 border border-slate-800/50 hover:border-violet-500/40 hover:bg-slate-900/80 transition-all duration-300 cursor-pointer group"
          >
            {/* Left side: Ticker and Info */}
            <div className="flex items-center space-x-3 mb-2 md:mb-0">
              <div className="w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center font-bold text-white group-hover:border-violet-500/50 group-hover:text-violet-400 transition-colors duration-300">
                {item.ticker}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-200 group-hover:text-white transition-colors duration-300">{item.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${getRecommendationBadgeColor(item.recommendation)}`}>
                    {item.recommendation}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-1 md:line-clamp-none">{item.reason}</p>
              </div>
            </div>

            {/* Right side: Prices and Actions */}
            <div className="flex items-center justify-between md:justify-end md:space-x-6 border-t border-slate-800/40 pt-2 md:pt-0 md:border-none">
              <div className="text-left md:text-right">
                <span className="block text-sm font-semibold text-slate-300">{item.price}</span>
                <span className={`text-xs font-bold ${getChangeColor(item.change)}`}>{item.change}</span>
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-semibold">
                <span>Soi mã</span>
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
