export default async function handler(req, res) {
  const symbol = String(req.query.symbol || '').trim().toUpperCase();
  if (!symbol) { res.status(400).json({ error: 'missing symbol' }); return; }
  const key = process.env.FINNHUB_API_KEY || 'd2nkql9r01qvm112fjogd2nkql9r01qvm112fjp0';
  try {
    const r = await fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${key}`);
    const p = r.ok ? await r.json() : null;
    if (!p || !p.name) { res.status(200).json({ symbol, profile: null }); return; }
    res.status(200).json({ symbol, profile: { name: p.name || '', industry: p.finnhubIndustry || '', country: p.country || '', exchange: p.exchange || '', currency: p.currency || '', weburl: p.weburl || '', ipo: p.ipo || '' } });
  } catch (e) {
    res.status(502).json({ error: String(e && e.message ? e.message : e) });
  }
}
