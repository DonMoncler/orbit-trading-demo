export default async function handler(req, res) {
  const symbol = String(req.query.symbol || '').trim().toUpperCase();
  if (!symbol) return res.status(400).json({ error: 'missing symbol' });
  const key = process.env.FINNHUB_API_KEY || 'd2nkql9r01qvm112fjogd2nkql9r01qvm112fjp0';
  try {
    const r = await fetch(`https://finnhub.io/api/v1/stock/peers?symbol=${encodeURIComponent(symbol)}&token=${key}`);
    const peers = r.ok ? await r.json() : [];
    res.status(200).json({ symbol, peers: Array.isArray(peers) ? peers.slice(0, 8) : [], source: 'Finnhub company peers', fetchedAt: Date.now() });
  } catch (e) {
    res.status(502).json({ error: String(e?.message || e) });
  }
}
