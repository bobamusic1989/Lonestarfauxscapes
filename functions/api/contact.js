const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function jsonResponse(body, { status = 200, headers = {} } = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...headers,
    },
  });
}

function normalizeText(value, { maxLength }) {
  if (value === undefined || value === null) return '';
  const text = String(value).trim();
  return text.length > maxLength ? text.slice(0, maxLength) : text;
}

function parseAllowedOrigins(env) {
  const fallback = [
    'https://lonestarfauxscapes.com',
    'https://www.lonestarfauxscapes.com',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];

  const raw = typeof env.ALLOWED_ORIGINS === 'string' ? env.ALLOWED_ORIGINS : '';
  const list = raw
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  return list.length > 0 ? list : fallback;
}

function corsHeadersForRequest(request, allowedOrigins) {
  const origin = request.headers.get('Origin');
  if (!origin) return {};

  if (!allowedOrigins.includes(origin)) {
    return { __corsDenied: '1' };
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Vary': 'Origin',
  };
}

async function verifyTurnstile({ env, token, remoteip }) {
  if (!env.TURNSTILE_SECRET_KEY) return { ok: true };

  if (!token) {
    return { ok: false, status: 400, error: 'Missing Turnstile token' };
  }

  const body = new URLSearchParams({
    secret: env.TURNSTILE_SECRET_KEY,
    response: token,
  });

  if (remoteip) body.set('remoteip', remoteip);

  const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const verifyJson = await verifyResponse.json().catch(() => null);
  if (!verifyResponse.ok || !verifyJson?.success) {
    return { ok: false, status: 403, error: 'Failed Turnstile verification' };
  }

  return { ok: true };
}

export function onRequestOptions({ request, env }) {
  const allowedOrigins = parseAllowedOrigins(env);
  const cors = corsHeadersForRequest(request, allowedOrigins);

  if (cors.__corsDenied) {
    return new Response(null, { status: 403 });
  }

  return new Response(null, {
    status: 204,
    headers: {
      ...cors,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function onRequestPost({ request, env }) {
  const allowedOrigins = parseAllowedOrigins(env);
  const cors = corsHeadersForRequest(request, allowedOrigins);
  if (cors.__corsDenied) {
    return jsonResponse({ error: 'Origin not allowed' }, { status: 403 });
  }

  const resendKey = env.RESEND_API_KEY;
  const toEmail = env.TO_EMAIL;

  if (!resendKey || !toEmail) {
    return jsonResponse(
      { error: 'Server is not configured for email delivery' },
      { status: 500, headers: cors },
    );
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, { status: 400, headers: cors });
  }

  const honeypot = normalizeText(payload?.website, { maxLength: 200 });
  if (honeypot) {
    return jsonResponse({ success: true, message: 'Message received' }, { headers: cors });
  }

  const name = normalizeText(payload?.name, { maxLength: 80 });
  const email = normalizeText(payload?.email, { maxLength: 254 });
  const phone = normalizeText(payload?.phone, { maxLength: 40 });
  const service = normalizeText(payload?.service, { maxLength: 120 });
  const message = normalizeText(payload?.message, { maxLength: 5000 });
  const turnstileToken = normalizeText(payload?.turnstileToken, { maxLength: 2048 });

  if (!name || !email || !message) {
    return jsonResponse({ error: 'Missing required fields' }, { status: 400, headers: cors });
  }

  if (!EMAIL_REGEX.test(email)) {
    return jsonResponse({ error: 'Invalid email address' }, { status: 400, headers: cors });
  }

  const remoteIp = request.headers.get('CF-Connecting-IP') || '';
  const turnstile = await verifyTurnstile({ env, token: turnstileToken, remoteip: remoteIp });
  if (!turnstile.ok) {
    return jsonResponse({ error: turnstile.error }, { status: turnstile.status, headers: cors });
  }

  const submittedAt = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' });
  const userAgent = request.headers.get('User-Agent') || 'Unknown';
  const referer = request.headers.get('Referer') || 'Unknown';

  const emailBody = `
New contact form submission from Lone Star Faux Scapes website:

Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Service Interest: ${service || 'Not specified'}

Message:
${message}

---
Submitted at: ${submittedAt} (Central Time)
IP: ${remoteIp || 'Unknown'}
User-Agent: ${userAgent}
Referer: ${referer}
  `.trim();

  const fromEmail = env.FROM_EMAIL || 'onboarding@resend.dev';
  const fromName = env.FROM_NAME || 'Lone Star Faux Scapes';

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${fromName} <${fromEmail}>`,
      to: toEmail,
      subject: `[LONESTAR FAUXSCAPES CONTACT] New inquiry from ${name}`,
      text: emailBody,
      reply_to: email,
    }),
  });

  if (!resendResponse.ok) {
    const vendorError = await resendResponse.text().catch(() => '(no details)');
    console.error('Resend error:', vendorError);
    return jsonResponse(
      { error: 'Failed to send email' },
      {
        status: 502,
        headers: cors,
      },
    );
  }

  return jsonResponse({ success: true, message: 'Message sent successfully!' }, { headers: cors });
}

