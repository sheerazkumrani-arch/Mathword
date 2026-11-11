// One request from the browser -> many ESPN scoreboard calls made here, answered together and cached on Vercel's edge.
// Example: /api/scores?leagues=eng.1,esp.1&dates=20261110-20261112&limit=300
const { SLUG, DATES, getJson, send } = require("./_espn");
const BASE = "https://site.api.espn.com/apis/site/v2/sports/soccer/";

module.exports = async (req, res) => {
  const q = req.query || {};
  const leagues = String(q.leagues || "").split(",").filter(Boolean);
  const dates = String(q.dates || "");
  const limit = String(q.limit || "");
  if (!leagues.length || leagues.length > 60 || !leagues.every((s) => SLUG.test(s)) || !DATES.test(dates) || (limit && !/^\d{1,3}$/.test(limit))) {
    return send(res, 400, { error: "bad request" });
  }
  const out = {};
  let transient = 0;
  await Promise.all(
    leagues.map(async (slug) => {
      const url = BASE + slug + "/scoreboard?dates=" + dates + (limit ? "&limit=" + limit : "");
      const r = await getJson(url, 8000);
      if (r.data) out[slug] = r.data;
      else if (r.status >= 400 && r.status < 500) out[slug] = { events: [] }; // league not offered by ESPN: treat as empty
      else { out[slug] = null; transient++; } // timeout or ESPN error: browser may retry directly
    })
  );
  // Short cache while things are live; stale copy allowed for a minute so visitors never wait.
  send(res, 200, out, transient ? "public, s-maxage=5" : "public, s-maxage=20, stale-while-revalidate=60");
};
