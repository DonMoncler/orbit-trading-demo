export default async function handler(req, res) {
  res.status(200).json({ bidPrice: null, askPrice: null, unavailable: true, reason: 'Extended-hours bid/ask data requires a paid market data plan; not available on the free tier.' });
}
