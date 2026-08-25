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
    const symbolList = symbols.split(',').map(s => s.trim()).filter(Boolean);
    const fetches = symbolList.map(async (sym) => {
      const url = `https://financialmodelingprep.com/stable/quote?symbol=${encodeURIComponent(sym)}&apikey=${apiKey}`;
      const r = await fetch(url);
      if (!r.ok) return { sym, ok: false, status: r.status };
      const data = await r.json();
      const q = Array.isArray(data) ? data[0] : data;
      return { sym, ok: true, q };
    });
    const results = await Promise.all(fetches);
    const out = {};
    let upstreamError = null;
    for (const r of results) {
      if (!r.ok) { upstreamError = r.status; continue; }
      const q = r.q;
      if (!q) continue;
      out[r.sym] = {
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
    if (Object.keys(out).length === 0 && upstreamError) {
      res.status(502).json({ error: `upstream status ${upstreamError}` });
      return;
    }
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=60');
    res.status(200).json({ quotes: out });
  } catch (e) {
    res.status(500).json({ error: String(e && e.message ? e.message : e) });
  }
}
