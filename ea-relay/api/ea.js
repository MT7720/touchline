// Vercel Node.js Serverless — TLS fingerprint do Node.js (mais compatível com EA)
// Edge Runtime deu 403 na EA, Node.js Serverless pode funcionar

const ALLOWED_PATHS = [
  'clubs/matches',
  'clubs/info',
  'members/stats',
  'members/career/stats',
  'clubs/overallStats',
  'clubs/seasonalStats',
  'allTimeLeaderboard/search',
];

const CHROME_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7',
  'Accept-Encoding': 'gzip, deflate, br',
  Referer: 'https://www.ea.com/',
  Origin: 'https://www.ea.com',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-site',
  'Sec-Ch-Ua':
    '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
};

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Auth
  const relayKey = process.env.RELAY_KEY;
  if (relayKey) {
    const auth = req.headers.authorization;
    if (auth !== `Bearer ${relayKey}`) {
      return res.status(401).json({ error: 'Não autorizado.' });
    }
  }

  const { path, ...params } = req.query;
  if (!path || !ALLOWED_PATHS.includes(path)) {
    return res.status(400).json({ error: `Path inválido: ${path}` });
  }

  // Monta URL da EA
  const eaUrl = new URL(`https://proclubs.ea.com/api/fc/${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (Array.isArray(v)) eaUrl.searchParams.set(k, v[0]);
    else eaUrl.searchParams.set(k, v);
  }

  try {
    const eaResponse = await fetch(eaUrl.toString(), {
      headers: CHROME_HEADERS,
      signal: AbortSignal.timeout(20000),
    });

    const body = await eaResponse.text();

    res.setHeader('X-EA-Status', String(eaResponse.status));
    res.setHeader('X-Relay', 'vercel-node');
    if (eaResponse.headers.get('retry-after')) {
      res.setHeader('X-EA-Retry-After', eaResponse.headers.get('retry-after'));
    }

    return res.status(eaResponse.status).send(body);
  } catch (e) {
    return res.status(502).json({
      error: `Relay falhou: ${e instanceof Error ? e.message : 'erro desconhecido'}`,
      relay: 'vercel-node',
    });
  }
};
