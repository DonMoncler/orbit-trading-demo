export default async function handler(req, res) {
  const symbol = String(req.query.symbol || '').trim().toUpperCase();
  if (!symbol) return res.status(400).json({ error: 'missing symbol' });
  const key = process.env.FINNHUB_API_KEY || 'd2nkql9r01qvm112fjogd2nkql9r01qvm112fjp0';
  const today = new Date();
  const from = today.toISOString().slice(0, 10);
  const to = new Date(today.getTime() + 365 * 86400000).toISOString().slice(0, 10);
  try {
    const url = `https://finnhub.io/api/v1/calendar/earnings?from=${from}&to=${to}&symbol=${encodeURIComponent(symbol)}&token=${key}`;
    const r = await fetch(url);
    const data = r.ok ? await r.json() : {};
    const rows = Array.isArray(data.earningsCalendar) ? data.earningsCalendar : [];
    const next = rows.sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')))[0] || null;
    res.status(200).json({ symbol, next: next ? { date: next.date || null, hour: next.hour || null, epsEstimate: next.epsEstimate ?? null, revenueEstimate: next.revenueEstimate ?? null, quarter: next.quarter ?? null, year: next.year ?? null } : null, source: 'Finnhub earnings calendar', fetchedAt: Date.now() });
  } catch (e) {
    res.status(502).json({ error: String(e?.message || e) });
  }
}
