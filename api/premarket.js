export default async function handler(req, res) {
  const apiKey = process.env.FMP_API_KEY;
  const symbol = req.query.symbol;
  if (!symbol) {
    res.status(400).json({ error: 'missing symbol query param' });
    return;
  }
  if (!apiKey) {
    res.status(500).json({ error: 'FMP_API_KEY not configured' });
    return;
  }
  try {
    const url = `https://financialmodelingprep.com/stable/aftermarket-quote?symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`;
    const r = await fetch(url);
    if (!r.ok) {
      res.status(502).json({ error: `upstream status ${r.status}` });
      return;
    }
    const data = await r.json();
    const q = Array.isArray(data) ? data[0] : data;
    if (!q) {
      res.status(200).json({ bidPrice: null, askPrice: null });
      return;
    }
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30');
    res.status(200).json({
      symbol: q.symbol ?? symbol,
      bidPrice: q.bidPrice ?? null,
      bidSize: q.bidSize ?? null,
      askPrice: q.askPrice ?? null,
      askSize: q.askSize ?? null,
      volume: q.volume ?? null,
      timestamp: q.timestamp ?? null
    });
  } catch (e) {
    res.status(500).json({ error: String(e && e.message ? e.message : e) });
  }
}
