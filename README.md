# IG Graph API Proxy

Only needed if the dashboard hits a CORS error calling graph.facebook.com
directly from the browser. Otherwise, don't deploy this, the dashboard works
without it.

## Deploy

1. Push this folder to a GitHub repo (or a subfolder of an existing one).
2. Import it into Vercel (vercel.com > Add New > Project).
3. No environment variables or build settings needed, Vercel auto-detects
   the `api/graph.js` file as a serverless function.
4. Deploy. Your endpoint will be:
   `https://YOUR-PROJECT.vercel.app/api/graph`

## Switch the dashboard to use it

In `index.html`, find this line:

```js
const url = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/${path}`);
```

Replace with:

```js
const url = new URL(`https://YOUR-PROJECT.vercel.app/api/graph`);
url.searchParams.set('path', path);
```

That's the only change needed. Everything else (fields, access_token, etc.)
still gets passed the same way.

## Before going live

Edit `api/graph.js` and change:

```js
const ALLOWED_ORIGIN = '*';
```

to your actual dashboard domain, e.g. `https://your-dashboard.netlify.app`.
Leaving it as `*` means anyone who finds this proxy URL can use it and burn
your rate limit.
