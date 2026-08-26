export default async function handler(req, res) {
  const symbol = req.query.symbol || 'RZLV';
  const key = process.env.FINNHUB_API_KEY || 'd2nkql9r01qvm112fjogd2nkql9r01qvm112fjp0';
  try {
    const r = await fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${encodeURIComponent(symbol)}&metric=all&token=${key}`);
    const text = await r.text();
    res.status(200).json({ status: r.status, body: text });
  } catch (e) {
    res.status(500).json({ error: String(e && e.message ? e.message : e) });
  }
}
