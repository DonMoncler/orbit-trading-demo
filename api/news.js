export default async function handler(req, res) {
  const symbol = String(req.query.symbol || '').trim().toUpperCase();
  if (!symbol) { res.status(400).json({ error: 'missing symbol' }); return; }
  const key = process.env.FINNHUB_API_KEY || 'd2nkql9r01qvm112fjogd2nkql9r01qvm112fjp0';
  const today = new Date();
  const to = today.toISOString().slice(0, 10);
  const from = new Date(today.getTime() - 14 * 24 * 3600 * 1000).toISOString().slice(0, 10);
  try {
    const r = await fetch(`https://finnhub.io/api/v1/company-news?symbol=${encodeURIComponent(symbol)}&from=${from}&to=${to}&token=${key}`);
    const items = r.ok ? await r.json() : [];
    const news = Array.isArray(items) ? items.slice(0, 8).map(item => ({ headline: item.headline || '', source: item.source || '', url: item.url || '', datetime: item.datetime || 0, summary: item.summary || '' })).filter(item => item.headline && item.url) : [];
    res.status(200).json({ symbol, news, fetchedAt: Date.now() });
  } catch (e) {
    res.status(502).json({ error: String(e && e.message ? e.message : e) });
  }
}
