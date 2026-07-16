// Vercel serverless function: proxies requests to graph.facebook.com so the
// browser dashboard never talks to Meta directly (avoids CORS blocks).
//
// Usage from the dashboard:
//   /api/graph?path=17841400000000000/media&fields=id,caption&access_token=...
//
// This forwards every query param except "path" straight through to
// https://graph.facebook.com/v21.0/{path}

const GRAPH_VERSION = 'v21.0';

// Restrict which origins can call this proxy. Replace with your dashboard's
// real domain before going live. "*" works for testing but allows any site
// to use your proxy (and burn your rate limit) if they find the URL.
const ALLOWED_ORIGIN = '*';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: { message: 'Only GET is supported' } });
    return;
  }

  const { path, ...params } = req.query;

  if (!path) {
    res.status(400).json({ error: { message: 'Missing required "path" query param' } });
    return;
  }

  const url = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, value);
  });

  try {
    const graphRes = await fetch(url.toString());
    const data = await graphRes.json();
    res.status(graphRes.status).json(data);
  } catch (e) {
    res.status(502).json({ error: { message: 'Proxy failed to reach graph.facebook.com', detail: e.message } });
  }
}
