// /api/standings?league=eng.1  -> ESPN league table, cached for 60 seconds.
const { SLUG, getJson, send } = require("./_espn");

module.exports = async (req, res) => {
  const slug = String((req.query || {}).league || "");
  if (!SLUG.test(slug)) return send(res, 400, { error: "bad request" });
  const r = await getJson("https://site.api.espn.com/apis/v2/sports/soccer/" + slug + "/standings", 9000);
  if (!r.data) return send(res, 502, { error: "upstream unavailable" }, "public, s-maxage=5");
  send(res, 200, r.data, "public, s-maxage=60, stale-while-revalidate=300");
};
