const WATCHLIST = ['RZLV','OESX','CRML','GENB','EXOD','RR','ABCL','MEI','PACB','CAPR','SLNH','FVN','SHMD','AIAI','BMNR','SPCX','GRRR','PLUG','DKS','NVDA','INTC','MRNA','AAPL','MSFT','TSLA','AMD','SOFI','PLTR','NIO','LCID','RIVN','MARA','RIOT','COIN','SMCI'];

export default async function handler(req, res) {
  const key = process.env.FINNHUB_API_KEY || 'd2nkql9r01qvm112fjogd2nkql9r01qvm112fjp0';
  const results = {};
  try {
    await Promise.all(WATCHLIST.map(async (sym) => {
      try {
        const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(sym)}&token=${key}`);
        if (!r.ok) return;
        const d = await r.json();
        if (d && typeof d.c === 'number' && d.c !== 0 && d.pc) {
          results[sym] = {
            price: d.c,
            change: d.d,
            changePercent: d.dp,
            previousClose: d.pc,
            open: d.o,
            dayLow: d.l,
            dayHigh: d.h,
            asOf: d.t ? d.t * 1000 : Date.now()
          };
        }
      } catch (e) {}
    }));
    res.status(200).json({ quotes: results, asOf: Date.now() });
  } catch (e) {
    res.status(502).json({ error: String(e && e.message ? e.message : e) });
  }
}
