export default async function handler(req, res) {
  const symbolsParam = req.query.symbols;
  if (!symbolsParam) {
    res.status(400).json({ error: 'missing symbols query param' });
    return;
  }
  const symbols = symbolsParam.split(',').map(s => s.trim()).filter(Boolean);
  const key = process.env.FINNHUB_API_KEY || 'd2nkql9r01qvm112fjogd2nkql9r01qvm112fjp0';
  const quotes = {};
  try {
    await Promise.all(symbols.map(async (sym) => {
      const [quoteRes, metricRes] = await Promise.all([
        fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(sym)}&token=${key}`),
        fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${encodeURIComponent(sym)}&metric=all&token=${key}`)
      ]);
      let q = null;
      if (quoteRes.ok) {
        const d = await quoteRes.json();
        if (d && typeof d.c === 'number' && d.c !== 0) {
          q = {
            price: d.c,
            change: d.d,
            changePercent: d.dp,
            dayLow: d.l,
            dayHigh: d.h,
            open: d.o,
            previousClose: d.pc,
            asOf: d.t ? d.t * 1000 : Date.now()
          };
        }
      }
      if (metricRes.ok) {
        const m = await metricRes.json();
        const metric = m && m.metric ? m.metric : null;
        if (metric) {
          q = q || {};
          if (metric.marketCapitalization != null) q.marketCap = metric.marketCapitalization * 1e6;
          if (metric['52WeekHigh'] != null) q.yearHigh = metric['52WeekHigh'];
          if (metric['52WeekLow'] != null) q.yearLow = metric['52WeekLow'];
          const pe = metric.peTTM != null ? metric.peTTM : metric.peAnnual;
          if (pe != null) q.pe = pe;
          if (metric.epsTTM != null) q.eps = metric.epsTTM;
          if (metric['10DayAverageTradingVolume'] != null) q.volume = metric['10DayAverageTradingVolume'] * 1e6;
          if (metric['3MonthAverageTradingVolume'] != null) q.avgVolume = metric['3MonthAverageTradingVolume'] * 1e6;
          if (metric.dividendIndicatedAnnual != null && q.price) q.divYield = metric.dividendIndicatedAnnual / q.price;
        }
      }
      if (q) quotes[sym] = q;
    }));
    res.status(200).json({ quotes });
  } catch (e) {
    res.status(502).json({ error: String(e && e.message ? e.message : e) });
  }
}
