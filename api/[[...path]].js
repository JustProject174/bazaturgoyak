/**
 * API Proxy — обход CORS при запросах к внешнему API.
 * Читает API_BASE_URL из env (Vercel: Project Settings → Environment Variables).
 * Запросы: /api/objects, /api/objects/123, /api/promotions и т.д.
 */
export default async function handler(req, res) {
  const base = (process.env.API_BASE_URL || 'https://api.justproject174.ru/api').replace(/\/+$/, '');
  // Путь и query из URL (req.url = "/api/objects?isActive=true")
  const urlPath = (req.url || '').split('?')[0];
  const path = urlPath.replace(/^\/api\/?/, '') || '';
  const qs = (req.url || '').includes('?') ? req.url.split('?')[1] : '';
  const targetUrl = path ? `${base}/${path}${qs ? '?' + qs : ''}` : `${base}${qs ? '?' + qs : ''}`;

  try {
    const headers = { 'Accept': 'application/json' };
    if (req.headers.authorization) headers['Authorization'] = req.headers.authorization;
    if (req.headers['content-type']) headers['Content-Type'] = req.headers['content-type'];

    const resp = await fetch(targetUrl, {
      method: req.method || 'GET',
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body || {}) : undefined,
    });

    const contentType = resp.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await resp.json()
      : await resp.text();

    res.status(resp.status);
    if (typeof data === 'string') res.send(data);
    else res.json(data);
  } catch (err) {
    console.error('[api proxy]', err);
    res.status(502).json({ error: 'Proxy error', message: err.message });
  }
}
