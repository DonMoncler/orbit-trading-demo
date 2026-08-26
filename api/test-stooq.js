export default async function handler(req, res) {
  const symbols = (req.query.symbols || 'RZLV,OESX,DKS,NVDA').split(',');
  const key = 'd2nkql9r01qvm112fjogd2nkql9r01qvm112fjp0';
  const out = {};
  try {
    for (const sym of symbols) {
      const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(sym.trim())}&token=${key}`;
      const r = await fetch(url);
      const text = await r.text();
      out[sym] = { status: r.status, body: text };
    }
    res.status(200).json(out);
  } catch (e) {
    res.status(500).json({ error: String(e && e.message ? e.message : e) });
  }
}
