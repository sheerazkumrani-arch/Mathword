// /api/summary?league=eng.1&event=123456  -> match details (timeline, stats, lineups), cached for 15 seconds.
const { SLUG, getJson, send } = require("./_espn");

module.exports = async (req, res) => {
  const q = req.query || {};
  const slug = String(q.league || "");
  const ev = String(q.event || "");
  if (!SLUG.test(slug) || !/^\d{1,12}$/.test(ev)) return send(res, 400, { error: "bad request" });
  const r = await getJson("https://site.api.espn.com/apis/site/v2/sports/soccer/" + slug + "/summary?event=" + ev, 9000);
  if (!r.data) return send(res, 502, { error: "upstream unavailable" }, "public, s-maxage=3");
  send(res, 200, r.data, "public, s-maxage=15, stale-while-revalidate=60");
};
