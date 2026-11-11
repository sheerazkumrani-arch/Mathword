KickPulse update - what changed (nothing old was removed)

NEW
  api/scores.js, api/standings.js, api/summary.js   Vercel serverless routes with edge caching (20-60 s)
  assets/app.e2b39741.v2.min.js                      same app, now: league pages ask only for their own league;
                                                     home/other pages ask once (/api/scores) instead of ~100 times.
                                                     If /api ever fails it falls back to ESPN directly (old behaviour).
  assets/league-table.b5e8a2e2.v2.js                 table now loads via /api/standings (fallback: ESPN direct)
  assets/img/*.jpg                                   16 new 1200x630 keyword images (table, fixtures, results...)
  sitemap-images.xml, llms-full.txt                  image sitemap, full guide for AI assistants
CHANGED (additive only)
  every page: new script file names, figure/img with keyword alt text, ImageObject/WebPage JSON-LD,
              "quick facts and popular searches" text
  robots.txt  explicitly allows Google, Bing and AI crawlers + lists both sitemaps
  sitemap.xml only lastmod dates updated;  llms.txt two extra links
UNTOUCHED: all URLs, titles, descriptions, canonicals, og tags, old asset files, vercel.json, site-config.js

UPDATE 2 (keywords + content + polish)
  Every page got a new content block (class kp-more): keyword-focused heading and text, clubs people search for,
  kick-off time table for UK, Nigeria, Pakistan, India, Bangladesh, Malaysia, Philippines, USA/Canada, Australia,
  share tip, and extra FAQs (also added to the page's existing FAQPage JSON-LD).
  assets/kp-polish.*.css  small colour/hover/focus polish; only new classes + light hover states, no layout changes.
  Titles, descriptions, canonicals, URLs and old text are unchanged.
