/**
 * Chuẩn hóa dữ liệu lịch sử giá OHLCV đầu vào.
 * Chấp nhận cả 2 định dạng:
 * 1. Mảng các Object: { date, open, close, high, low, volume }
 * 2. Mảng của mảng con (ví dụ từ TCBS API): [date, open, close, high, low, volume]
 */
const normalizeData = (data) => {
  if (!Array.isArray(data) || data.length === 0) return [];
  
  return data.map(item => {
    if (Array.isArray(item)) {
      // Định dạng mảng: [Ngày, Giá Mở, Giá Đóng, Cao nhất, Thấp nhất, Khối lượng]
      return {
        date: item[0],
        open: Number(item[1]),
        close: Number(item[2]),
        high: Number(item[3]),
        low: Number(item[4]),
        volume: Number(item[5])
      };
    } else if (typeof item === 'object') {
      return {
        date: item.date,
        open: Number(item.open),
        close: Number(item.close),
        high: Number(item.high || item.close),
        low: Number(item.low || item.close),
        volume: Number(item.volume)
      };
    }
    return null;
  }).filter(Boolean);
};

/**
 * Tính giá trị Đường trung bình động giản đơn (Simple Moving Average - SMA)
 */
export const calculateSMA = (data, period) => {
  const sma = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(null);
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j].close;
      }
      sma.push(sum / period);
    }
  }
  return sma;
};

/**
 * Tính giá trị Đường trung bình động khối lượng (Volume SMA)
 */
const calculateVolumeSMA = (data, period) => {
  const sma = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(null);
    } else {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j].volume;
      }
      sma.push(sum / period);
    }
  }
  return sma;
};

/**
 * Tính chỉ số sức mạnh tương đối RSI(14)
 * Sử dụng phương pháp làm mượt Wilder's Smoothing
 */
const calculateRSI = (data, period = 14) => {
  const rsi = new Array(data.length).fill(null);
  if (data.length <= period) return rsi;

  let gains = 0;
  let losses = 0;

  // 1. Tính Gain/Loss cho kỳ đầu tiên
  for (let i = 1; i <= period; i++) {
    const difference = data[i].close - data[i - 1].close;
    if (difference > 0) {
      gains += difference;
    } else {
      losses -= difference;
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;
  
  rsi[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

  // 2. Tính cho các kỳ tiếp theo bằng Wilder's Smoothing
  for (let i = period + 1; i < data.length; i++) {
    const difference = data[i].close - data[i - 1].close;
    const gain = difference > 0 ? difference : 0;
    const loss = difference < 0 ? -difference : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    rsi[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }

  return rsi;
};

/**
 * Thuật toán tính toán điểm số và đưa ra khuyến nghị cổ phiếu
 * Dựa trên 3 tiêu chí: Trend (40%), Momentum (30%), Volume (30%)
 * 
 * @param {Array} ohlcv - Mảng dữ liệu lịch sử giá OHLCV (tối thiểu 50-60 phiên để tính toán SMA50)
 * @returns {Object} - Điểm số, khuyến nghị và chi tiết các chỉ báo
 */
export function calculateStockScore(ohlcv) {
  const normalized = normalizeData(ohlcv);
  
  // Yêu cầu tối thiểu 50 phiên để tính SMA 50
  if (normalized.length < 50) {
    return {
      score: 0,
      recommendation: 'THEO DÕI',
      details: {
        error: 'Không đủ dữ liệu lịch sử giá (yêu cầu tối thiểu 50 phiên)'
      }
    };
  }

  const sma20 = calculateSMA(normalized, 20);
  const sma50 = calculateSMA(normalized, 50);
  const volSma20 = calculateVolumeSMA(normalized, 20);
  const rsi = calculateRSI(normalized, 14);

  const len = normalized.length;
  const currentIdx = len - 1;
  const prevIdx = len - 2;

  const currentPrice = normalized[currentIdx].close;
  const currentSma20 = sma20[currentIdx];
  const currentSma50 = sma50[currentIdx];
  const currentVolume = normalized[currentIdx].volume;
  const currentVolSma20 = volSma20[currentIdx];
  const currentRsi = rsi[currentIdx];
  const prevRsi = rsi[prevIdx];

  let score = 0;
  const checklist = {
    trend: false,
    momentum: false,
    volume: false
  };

  // 1. Trend (Trọng số 40% -> 4 điểm): Giá hiện tại > SMA 20 & SMA 20 > SMA 50
  if (currentPrice > currentSma20 && currentSma20 > currentSma50) {
    score += 4;
    checklist.trend = true;
  }

  // 2. Momentum (Trọng số 30% -> 3 điểm): RSI(14) nằm trong vùng 45 - 65 và đang hướng lên (RSI[t] > RSI[t-1])
  if (currentRsi !== null && prevRsi !== null) {
    if (currentRsi >= 45 && currentRsi <= 65 && currentRsi > prevRsi) {
      score += 3;
      checklist.momentum = true;
    }
  }

  // 3. Volume (Trọng số 30% -> 3 điểm): Khối lượng phiên hiện tại > 1.5 * Trung bình khối lượng 20 phiên
  if (currentVolSma20 && currentVolume > 1.5 * currentVolSma20) {
    score += 3;
    checklist.volume = true;
  }

  // Output Recommendation logic
  let recommendation = 'NẮM GIỮ';
  
  // Đặc biệt: Nếu gãy MA20 (Giá hiện tại < SMA20) -> BÁN (theo PRD)
  const isBrokenSma20 = currentPrice < currentSma20;

  if (isBrokenSma20) {
    recommendation = 'BÁN';
  } else {
    if (score >= 8) {
      recommendation = 'MUA MẠNH';
    } else if (score >= 6) {
      recommendation = 'MUA';
    } else if (score >= 4) {
      recommendation = 'NẮM GIỮ';
    } else {
      recommendation = 'BÁN';
    }
  }

  return {
    score,
    recommendation,
    indicators: {
      close: currentPrice,
      sma20: typeof currentSma20 === 'number' ? Number(currentSma20.toFixed(2)) : null,
      sma50: typeof currentSma50 === 'number' ? Number(currentSma50.toFixed(2)) : null,
      rsi: typeof currentRsi === 'number' ? Number(currentRsi.toFixed(2)) : null,
      prevRsi: typeof prevRsi === 'number' ? Number(prevRsi.toFixed(2)) : null,
      volume: currentVolume,
      volSma20: typeof currentVolSma20 === 'number' ? Number(currentVolSma20.toFixed(2)) : null
    },
    checklist,
    isBrokenSma20
  };
}
