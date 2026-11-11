// Shared helpers for the KickPulse API routes (files starting with _ are not public routes).
const SLUG = /^[a-z0-9._-]{1,40}$/;
const DATES = /^\d{8}(-\d{8})?$/;

async function getJson(url, ms) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms || 8000);
  try {
    const r = await fetch(url, { signal: ctl.signal, headers: { accept: "application/json" } });
    if (!r.ok) return { status: r.status, data: null };
    return { status: 200, data: await r.json() };
  } catch (e) {
    return { status: 0, data: null };
  } finally {
    clearTimeout(t);
  }
}

function send(res, code, body, cache) {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", cache || "no-store");
  res.end(JSON.stringify(body));
}

module.exports = { SLUG, DATES, getJson, send };
