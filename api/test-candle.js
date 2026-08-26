export default async function handler(req, res) {
  const key = process.env.FINNHUB_API_KEY || 'd2nkql9r01qvm112fjogd2nkql9r01qvm112fjp0';
  const now = Math.floor(Date.now()/1000);
  const from = now - 30*24*3600;
  try {
    const r = await fetch(`https://finnhub.io/api/v1/stock/candle?symbol=RZLV&resolution=D&from=${from}&to=${now}&token=${key}`);
    const text = await r.text();
    res.status(200).json({ status: r.status, body: text.slice(0, 500) });
  } catch (e) {
    res.status(500).json({ error: String(e && e.message ? e.message : e) });
  }
}
