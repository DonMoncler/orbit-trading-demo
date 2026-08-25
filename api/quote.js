export default async function handler(req, res) {
  const { symbols } = req.query;
  const apiKey = process.env.FMP_API_KEY;
  if (!symbols) {
    res.status(400).json({ error: 'missing symbols query param' });
    return;
  }
  if (!apiKey) {
    res.status(500).json({ error: 'FMP_API_KEY not configured' });
    return;
  }
  try {
    const url = `https://financialmodelingprep.com/api/v3/quote/${encodeURIComponent(symbols)}?apikey=${apiKey}`;
    const r = await fetch(url);
    if (!r.ok) {
      res.status(502).json({ error: `upstream status ${r.status}` });
      return;
    }
    const results = await r.json();
    if (!Array.isArray(results)) {
      res.status(502).json({ error: 'unexpected upstream response', raw: results });
      return;
    }
    const out = {};
    for (const q of results) {
      out[q.symbol] = {
        price: q.price ?? null,
        open: q.open ?? null,
        previousClose: q.previousClose ?? null,
        dayLow: q.dayLow ?? null,
        dayHigh: q.dayHigh ?? null,
        yearLow: q.yearLow ?? null,
        yearHigh: q.yearHigh ?? null,
        volume: q.volume ?? null,
        avgVolume: q.avgVolume ?? null,
        marketCap: q.marketCap ?? null,
        pe: q.pe ?? null,
        eps: q.eps ?? null,
        divYield: null,
        change: q.change ?? null,
        changePercent: q.changesPercentage ?? null,
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
