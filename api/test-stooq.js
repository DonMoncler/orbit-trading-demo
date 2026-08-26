export default async function handler(req, res) {
  const symbols = (req.query.symbols || 'rzlv,oesx,dks').split(',');
  const out = {};
  try {
    for (const sym of symbols) {
      const url = `https://stooq.com/q/l/?s=${encodeURIComponent(sym.trim())}.us&f=sd2t2ohlcv&h&e=csv`;
      const r = await fetch(url);
      const text = await r.text();
      out[sym] = { status: r.status, body: text };
    }
    res.status(200).json(out);
  } catch (e) {
    res.status(500).json({ error: String(e && e.message ? e.message : e) });
  }
}
