export default async function handler(req, res) {
  const { symbols } = req.query;
  if (!symbols) {
    res.status(400).json({ error: 'missing symbols query param' });
    return;
  }
  try {
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}`;
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Accept': 'application/json'
      }
    });
    if (!r.ok) {
      res.status(502).json({ error: `upstream status ${r.status}` });
      return;
    }
    const data = await r.json();
    const results = (data && data.quoteResponse && data.quoteResponse.result) || [];
    const out = {};
    for (const q of results) {
      out[q.symbol] = {
        price: q.regularMarketPrice ?? null,
        open: q.regularMarketOpen ?? null,
        previousClose: q.regularMarketPreviousClose ?? null,
        dayLow: q.regularMarketDayLow ?? null,
        dayHigh: q.regularMarketDayHigh ?? null,
        yearLow: q.fiftyTwoWeekLow ?? null,
        yearHigh: q.fiftyTwoWeekHigh ?? null,
        volume: q.regularMarketVolume ?? null,
        avgVolume: q.averageDailyVolume10Day ?? q.averageDailyVolume3Month ?? null,
        marketCap: q.marketCap ?? null,
        pe: q.trailingPE ?? null,
        eps: q.epsTrailingTwelveMonths ?? null,
        divYield: q.trailingAnnualDividendYield ?? null,
        change: q.regularMarketChange ?? null,
        changePercent: q.regularMarketChangePercent ?? null,
        asOf: new Date().toISOString()
      };
    }
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=60');
    res.status(200).json({ quotes: out });
  } catch (e) {
    res.status(500).json({ error: String(e && e.message ? e.message : e) });
  }
}
