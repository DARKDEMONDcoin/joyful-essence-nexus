import { Actor } from 'apify';
import http from 'node:http';

await Actor.init();

const APIFY_TOKEN = process.env.APIFY_TOKEN;
const OR_BASE = 'https://openrouter.apify.actor/api/v1';
const PORT = Number(process.env.ACTOR_STANDBY_PORT || process.env.PORT || 4321);

if (!APIFY_TOKEN) {
    console.error('[bridge] APIFY_TOKEN is missing — the proxy will reject every call.');
}

function send(res, status, body, headers = {}) {
    res.writeHead(status, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, content-type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        ...headers,
    });
    res.end(typeof body === 'string' ? body : JSON.stringify(body));
}

async function readBody(req) {
    return await new Promise((resolve, reject) => {
        let buf = '';
        req.on('data', (c) => (buf += c));
        req.on('end', () => resolve(buf));
        req.on('error', reject);
    });
}

const server = http.createServer(async (req, res) => {
    try {
        if (req.method === 'OPTIONS') return send(res, 204, '');

        const url = new URL(req.url, `http://localhost:${PORT}`);
        if (url.pathname === '/' || url.pathname === '/health') {
            return send(res, 200, { ok: true, hasToken: Boolean(APIFY_TOKEN) });
        }

        // Forward anything under /api/v1/* to the official Apify OpenRouter proxy.
        if (!url.pathname.startsWith('/api/v1/')) {
            return send(res, 404, { error: 'not_found', path: url.pathname });
        }

        const targetUrl = `${OR_BASE}${url.pathname.slice('/api/v1'.length)}${url.search}`;
        const headers = {
            Authorization: `Bearer ${APIFY_TOKEN}`,
        };
        const init = { method: req.method, headers };
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            const body = await readBody(req);
            if (body) {
                init.body = body;
                headers['Content-Type'] = req.headers['content-type'] || 'application/json';
            }
        }

        const upstream = await fetch(targetUrl, init);
        const text = await upstream.text();
        return send(res, upstream.status, text, {
            'Content-Type': upstream.headers.get('content-type') || 'application/json',
        });
    } catch (err) {
        console.error('[bridge] error', err);
        return send(res, 500, { error: 'bridge_error', message: String(err?.message || err) });
    }
});

server.listen(PORT, () => {
    console.log(`[bridge] standby server listening on :${PORT}`);
});