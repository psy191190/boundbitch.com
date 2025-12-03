// Cloudflare Worker: /api/mega-register
import { Mega } from 'mega';

export default {
  async fetch(request) {
    if (request.method !== 'POST') {
      return new Response('Only POST allowed', { status: 405 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ success: false, error: 'Invalid JSON' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { email, password } = body;
    if (!email || !password) {
      return new Response(JSON.stringify({ success: false, error: 'Missing email or password' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      // Generate a random throwaway email (Mega allows this)
      const fakeEmail = `${crypto.randomUUID().replace(/-/g, '')}@megasync-boundbitch.com`;

      const mega = new Mega({ keepalive: false });
      const user = await mega.register(fakeEmail, password, {
        name: email.split('@')[0]
      });

      // Immediate login after registration
      await mega.login(fakeEmail, password);
      const sid = mega.sid;
      const masterKey = Buffer.from(user.masterKey).toString('base64');

      return new Response(JSON.stringify({
        success: true,
        email: fakeEmail,
        password,
        masterKey,
        sid,
        directLogin: `https://mega.nz/login#${sid}`,
        quota: "50 GB (permanent)"
      }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });

    } catch (err) {
      return new Response(JSON.stringify({
        success: false,
        error: err.message || 'Mega registration failed'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};

// Required dependency — add this in the worker's package.json (step 2)
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});