export default async function handler(req, res) {
  const symbolsParam = req.query.symbols;
  if (!symbolsParam) {
    res.status(400).json({ error: 'missing symbols query param' });
    return;
  }
  const symbols = symbolsParam.split(',').map(s => s.trim()).filter(Boolean);
  const key = process.env.FINNHUB_API_KEY || 'd2nkql9r01qvm112fjogd2nkql9r01qvm112fjp0';
  const quotes = {};
  try {
    await Promise.all(symbols.map(async (sym) => {
      const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(sym)}&token=${key}`;
      const r = await fetch(url);
      if (!r.ok) return;
      const d = await r.json();
      if (d && typeof d.c === 'number' && d.c !== 0) {
        quotes[sym] = {
          price: d.c,
          change: d.d,
          changePercent: d.dp,
          dayLow: d.l,
          dayHigh: d.h,
          open: d.o,
          previousClose: d.pc,
          asOf: d.t ? d.t * 1000 : Date.now()
        };
      }
    }));
    res.status(200).json({ quotes });
  } catch (e) {
    res.status(502).json({ error: String(e && e.message ? e.message : e) });
  }
}
