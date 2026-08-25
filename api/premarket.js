export default async function handler(req, res) {
  const apiKey = process.env.FMP_API_KEY;
  const symbol = req.query.symbol || 'NVDA';
  if (!apiKey) {
    res.status(500).json({ error: 'FMP_API_KEY not configured' });
    return;
  }
  const results = {};
  try {
    const preUrl = `https://financialmodelingprep.com/stable/aftermarket-quote?symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`;
    const preRes = await fetch(preUrl);
    results.aftermarket_quote = { status: preRes.status, body: await preRes.text() };
  } catch (e) {
    results.aftermarket_quote = { error: String(e) };
  }
  try {
    const intraUrl = `https://financialmodelingprep.com/stable/historical-chart/5min?symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`;
    const intraRes = await fetch(intraUrl);
    const intraBody = await intraRes.text();
    results.intraday_5min = { status: intraRes.status, body: intraBody.slice(0, 500) };
  } catch (e) {
    results.intraday_5min = { error: String(e) };
  }
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json(results);
}
