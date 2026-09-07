// Cron job — dispara coleta automática no Touchline

module.exports = async function handler(req, res) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.authorization;
    if (auth !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: 'Não autorizado.' });
    }
  }

  const origin = process.env.TOUCHLINE_ORIGIN;
  const collectorKey = process.env.COLLECTOR_KEY;

  if (!origin || !collectorKey) {
    return res.status(500).json({ error: 'TOUCHLINE_ORIGIN e COLLECTOR_KEY precisam estar configurados.' });
  }

  const started = Date.now();

  try {
    const response = await fetch(`${origin}/api/jobs`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${collectorKey}` },
      signal: AbortSignal.timeout(210000),
    });

    if (!response.ok) {
      return res.status(502).json({ error: `Touchline respondeu HTTP ${response.status}`, ms: Date.now() - started });
    }

    const body = await response.json();
    return res.status(200).json({ ok: true, ms: Date.now() - started, results: body.results });
  } catch (e) {
    return res.status(500).json({
      error: e instanceof Error ? e.message : 'falha',
      ms: Date.now() - started,
    });
  }
};
