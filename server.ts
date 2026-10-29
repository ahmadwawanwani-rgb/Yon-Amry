import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const getAppBaseUrl = (req: express.Request): string => {
    if (process.env.APP_URL && !process.env.APP_URL.includes('MY_APP_URL')) {
      return process.env.APP_URL.replace(/\/$/, '');
    }
    const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'http';
    const host = req.headers.host || `localhost:${PORT}`;
    return `${proto}://${host}`;
  };

  // 1. Construct Instagram OAuth Provider Authorization URL (3P Popup OAuth Skill)
  app.get('/api/auth/instagram/url', (req, res) => {
    const clientId = process.env.INSTAGRAM_CLIENT_ID?.trim();
    const baseUrl = getAppBaseUrl(req);
    const redirectUri = `${baseUrl}/auth/instagram/callback`;

    if (!clientId) {
      res.status(412).json({
        configured: false,
        redirectUri,
        message:
          'INSTAGRAM_CLIENT_ID belum dikonfigurasi pada Secrets proyek. Tambahkan INSTAGRAM_CLIENT_ID dan INSTAGRAM_CLIENT_SECRET dari Meta for Developers, atau aktifkan OIDC Instagram di Firebase Auth.',
      });
      return;
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'instagram_business_basic',
    });

    const authUrl = `https://www.instagram.com/oauth/authorize?${params.toString()}`;
    res.json({ configured: true, url: authUrl, redirectUri });
  });

  // 2. Instagram OAuth Callback Handler (handles trailing slash variations & posts message to opener)
  const instagramCallbackHandler: express.RequestHandler = async (req, res) => {
    const { code, error, error_description } = req.query;

    if (error || !code) {
      const errMsg = String(error_description || error || 'Otorisasi Instagram dibatalkan.');
      res.send(`<!doctype html>
<html lang="id">
  <head><meta charset="utf-8"><title>Login Instagram</title></head>
  <body style="font-family: sans-serif; padding: 2rem; text-align: center;">
    <script>
      if (window.opener) {
        window.opener.postMessage({ type: 'INSTAGRAM_OAUTH_ERROR', error: ${JSON.stringify(errMsg)} }, '*');
        window.close();
      } else {
        window.location.href = '/';
      }
    </script>
    <p>${errMsg}</p>
  </body>
</html>`);
      return;
    }

    const clientId = process.env.INSTAGRAM_CLIENT_ID?.trim() || '';
    const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET?.trim() || '';
    const baseUrl = getAppBaseUrl(req);
    const redirectUri = `${baseUrl}/auth/instagram/callback`;

    try {
      const formBody = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code: String(code),
      });

      const tokenResp = await fetch('https://api.instagram.com/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody.toString(),
      });

      const tokenData = (await tokenResp.json()) as {
        access_token?: string;
        user_id?: string | number;
        error_message?: string;
      };

      if (!tokenResp.ok || !tokenData.access_token) {
        throw new Error(tokenData.error_message || 'Gagal menukar kode otorisasi Instagram.');
      }

      // Fetch Instagram user profile username & name
      const profileResp = await fetch(
        `https://graph.instagram.com/me?fields=id,username,name&access_token=${encodeURIComponent(
          tokenData.access_token
        )}`
      );
      const profileData = (await profileResp.json()) as {
        id?: string;
        username?: string;
        name?: string;
      };

      const userPayload = {
        uid: `ig_${profileData.id || tokenData.user_id || 'user'}`,
        displayName: profileData.name || (profileData.username ? `@${profileData.username}` : 'Pengguna Instagram'),
        username: profileData.username || '',
        provider: 'instagram',
      };

      res.send(`<!doctype html>
<html lang="id">
  <head><meta charset="utf-8"><title>Login Instagram Berhasil</title></head>
  <body style="font-family: sans-serif; padding: 2rem; text-align: center;">
    <script>
      if (window.opener) {
        window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', provider: 'instagram', user: ${JSON.stringify(
          userPayload
        )} }, '*');
        window.close();
      } else {
        window.location.href = '/';
      }
    </script>
    <p>Autentikasi Instagram berhasil. Jendela ini akan tertutup otomatis...</p>
  </body>
</html>`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan saat verifikasi Instagram.';
      res.send(`<!doctype html>
<html lang="id">
  <head><meta charset="utf-8"><title>Login Instagram Gagal</title></head>
  <body style="font-family: sans-serif; padding: 2rem; text-align: center;">
    <script>
      if (window.opener) {
        window.opener.postMessage({ type: 'INSTAGRAM_OAUTH_ERROR', error: ${JSON.stringify(message)} }, '*');
        window.close();
      } else {
        window.location.href = '/';
      }
    </script>
    <p>${message}</p>
  </body>
</html>`);
    }
  };

  app.get(['/auth/instagram/callback', '/auth/instagram/callback/'], instagramCallbackHandler);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NusaTrip server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
