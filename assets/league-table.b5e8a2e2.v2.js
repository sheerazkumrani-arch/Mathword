/* KickPulse: league introduction and live table.
   League pages: the introduction is already in the HTML, this file fills in the table.
   Home page: shows the same box when a league is picked in the Leagues list. */
(function () {
  "use strict";
  var API = "https://site.api.espn.com/apis/v2/sports/soccer/";
  var LEAGUES = {"eng.1": {"name": "Premier League", "table": true, "intro": ["The Premier League is the most-watched football league in the world, and this page is built for the moments when you just want the facts fast. Open it and you get Premier League live scores, the minute on the clock and the final result of every game, all in your own time zone.", "Below the match list you will find the current league table. It updates by itself, so if you checked a live football score ten minutes ago and a goal has gone in since, the points and the positions move with it. It is also an easy way to see which football matches today could change the race for the title or the fight to stay up."]}, "esp.1": {"name": "La Liga", "table": true, "intro": ["La Liga is where Real Madrid, Barcelona and Atletico Madrid play, and the games often kick off late in the evening. This page shows La Liga live scores with the minute, the status and the result, so you can see straight away whether a match is worth staying up for.", "The current La Liga table sits just below the matches and refreshes on its own. When you are looking for today's match score, you can check the result and the standings in one visit, and see how a single goal changes the top four or the bottom three."]}, "ita.1": {"name": "Serie A", "table": true, "intro": ["Serie A is the top division of Italian football, known for tight defending and tactical games. On this page you get Serie A live scores, results and fixtures in one short list, without having to open five different sites to follow a live football score from Italy.", "The league table is shown under the matches and updates automatically. Use it together with the football matches today list to see where each club stands, who is chasing the leaders and who is worried about relegation."]}, "ger.1": {"name": "Bundesliga", "table": true, "intro": ["The Bundesliga is Germany's top league, famous for full stadiums, quick attacking football and a Saturday late-afternoon slot that fans plan their weekend around. This page lists Bundesliga live scores and results, with every kick-off time converted to your own time zone.", "Under the match list there is a live Bundesliga table. It changes as results come in, so you can follow the standings while the games are still being played. If you only need today's match score for one club, type its name into the search box at the top."]}, "fra.1": {"name": "Ligue 1", "table": true, "intro": ["Ligue 1 is the top division of French football. This page brings together Ligue 1 live scores, results and upcoming fixtures, with the goals, cards and lineups a tap away for each match.", "The current Ligue 1 table is placed under the match list and refreshes by itself. It is a simple way to read the live football score and the standings side by side, and to see how the day's football matches today affect the top of the table."]}, "sau.1": {"name": "Saudi Pro League", "table": true, "intro": ["The Saudi Pro League has become one of the most talked-about competitions in Asia, with famous players and clubs such as Al Hilal, Al Nassr and Al Ittihad. This page shows Saudi Pro League live scores and results in your own time zone, which is handy for readers in Pakistan and the Gulf.", "The league table below the matches updates on its own, so you can check the live football score and the standings in the same place. It is a quick page to keep open when you want today's match score from an Asian league."]}, "usa.1": {"name": "MLS", "table": true, "intro": ["Major League Soccer covers clubs from the United States and Canada, so games are played across several time zones. This page shows MLS live scores, results and fixtures with the kick-off time already converted for your location.", "Because the league is split into an Eastern and a Western Conference, the live MLS table below is shown for each conference. It refreshes by itself, which makes it easy to follow soccer today and see how the playoff race is shaping up."]}, "uefa.champions": {"name": "Champions League", "table": true, "intro": ["The UEFA Champions League is the biggest club competition in Europe, and the big European nights are the ones people search for most. This page shows Champions League live scores, results and fixtures, with goals, cards and lineups for every match.", "The league phase table is shown below the matches and updates as the games finish. It helps you see which clubs are safe, which are fighting for a place in the knockout rounds, and how the football matches today affect the standings."]}, "uefa.europa": {"name": "Europa League", "table": true, "intro": ["The UEFA Europa League is Europe's second club competition and often brings plenty of surprises. This page lists Europa League live scores, results and fixtures, which is useful on a Thursday when several games are played at the same time.", "The league phase table sits under the match list and updates itself. You can read a live football score and then check what it means for the standings without leaving the page."]}, "uefa.europa.conf": {"name": "Conference League", "table": true, "intro": ["The UEFA Conference League gives clubs from smaller leagues a European stage. This page shows Conference League live scores, results and fixtures, and it is a good place to find football matches today that are not always in the spotlight.", "Below the matches you will find the current league phase table. It refreshes by itself, so the standings keep up with the results while the games are being played."]}, "uefa.nations": {"name": "UEFA Nations League", "table": true, "intro": ["The UEFA Nations League is played between national teams, and it fills the international breaks with real matches that count. This page shows Nations League live scores, results and fixtures in your own time zone.", "The group tables are shown below the match list and update as results come in, so you can see how each national team is doing and what the next round could bring."]}, "eng.fa": {"name": "FA Cup", "table": false, "intro": ["The FA Cup is England's oldest knockout competition, and it is famous for giant-killings and big days for small clubs. This page shows FA Cup live scores, results and fixtures, so you can follow a cup weekend when many football matches today are played at the same time.", "The FA Cup is a knockout cup, so there are no points and no league table. Instead you can follow each round from the match list above and open any game for goals, cards and lineups."]}};
  var REFRESH_MS = 60000;
  var box = document.getElementById("league-table");
  if (!box) return;

  var isHome = box.getAttribute("data-home") === "1";
  var current = isHome ? "" : (document.body.getAttribute("data-league") || "");
  var timer = null, busy = false, lastOk = 0;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function stat(entry, name) {
    var list = entry.stats || [];
    for (var i = 0; i < list.length; i++) if (list[i].name === name) return list[i];
    return null;
  }
  function num(entry, name) {
    var s = stat(entry, name);
    return s && s.value != null ? Number(s.value) : 0;
  }
  function shown(entry, name) {
    var s = stat(entry, name);
    if (!s) return "-";
    if (s.displayValue != null && s.displayValue !== "") return s.displayValue;
    return s.value != null ? String(s.value) : "-";
  }
  function time(ms) {
    return new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function groupsFrom(data) {
    var out = [];
    if (data && data.children && data.children.length) {
      data.children.forEach(function (c) {
        if (c.standings && c.standings.entries && c.standings.entries.length) {
          out.push({ name: data.children.length > 1 ? c.name : "", entries: c.standings.entries, season: c.standings.seasonDisplayName || "" });
        }
      });
    } else if (data && data.standings && data.standings.entries && data.standings.entries.length) {
      out.push({ name: "", entries: data.standings.entries, season: data.standings.seasonDisplayName || "" });
    }
    return out;
  }

  function sortEntries(entries) {
    return entries.slice().sort(function (a, b) {
      var ra = num(a, "rank"), rb = num(b, "rank");
      if (ra && rb && ra !== rb) return ra - rb;
      return num(b, "points") - num(a, "points") || num(b, "pointDifferential") - num(a, "pointDifferential");
    });
  }

  function tableHtml(group) {
    var rows = sortEntries(group.entries), notes = {}, html = "";
    if (group.name) html += '<h3 class="lt-g">' + esc(group.name) + "</h3>";
    html += '<div class="lt-wrap"><table class="lt-t"><thead><tr><th class="c">#</th><th>Team</th><th title="Played">P</th><th title="Won">W</th><th title="Drawn">D</th><th title="Lost">L</th><th class="gf" title="Goals for">GF</th><th class="gf" title="Goals against">GA</th><th title="Goal difference">GD</th><th title="Points">Pts</th></tr></thead><tbody>';
    rows.forEach(function (e, i) {
      var t = e.team || {}, logo = t.logos && t.logos[0] && t.logos[0].href || t.logo || "";
      var n = e.note || null, color = n && n.color ? n.color : "";
      if (n && n.description && color) notes[n.description] = color;
      var rank = num(e, "rank") || i + 1;
      html += "<tr" + (color ? ' style="box-shadow:inset 4px 0 0 ' + esc(color) + '"' : "") + ">" +
        '<td class="c">' + esc(rank) + "</td>" +
        '<td class="tn">' + (logo ? '<img class="crest sm" src="' + esc(logo) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">' : "") + "<span>" + esc(t.displayName || t.name || "Team") + "</span></td>" +
        "<td>" + esc(shown(e, "gamesPlayed")) + "</td><td>" + esc(shown(e, "wins")) + "</td><td>" + esc(shown(e, "ties")) + "</td><td>" + esc(shown(e, "losses")) + "</td>" +
        '<td class="gf">' + esc(shown(e, "pointsFor")) + '</td><td class="gf">' + esc(shown(e, "pointsAgainst")) + "</td>" +
        "<td>" + esc(shown(e, "pointDifferential")) + '</td><td class="pts">' + esc(shown(e, "points")) + "</td></tr>";
    });
    html += "</tbody></table></div>";
    var keys = Object.keys(notes);
    if (keys.length) {
      html += '<div class="lt-key">' + keys.map(function (k) {
        return '<span><i style="background:' + esc(notes[k]) + '"></i>' + esc(k) + "</span>";
      }).join("") + "</div>";
    }
    return html;
  }

  function setStatus(text) {
    var el = document.getElementById("ltUpd");
    if (el) el.textContent = text;
  }

  function load() {
    var info = LEAGUES[current];
    var target = document.getElementById("ltTable");
    if (!info || !target || !info.table) return;
    if (busy) return;
    busy = true;
    var slug = current;
    var ctl = new AbortController();
    var to = setTimeout(function () { ctl.abort(); }, 10000);
    fetch("/api/standings?league=" + encodeURIComponent(slug), { signal: ctl.signal })
      .then(function (r) { if (!r.ok) throw new Error("api"); return r; })
      .catch(function () { return fetch(API + slug + "/standings", { signal: ctl.signal }); })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (data) {
        if (slug !== current) return;
        var groups = groupsFrom(data);
        if (!groups.length) {
          target.innerHTML = '<p class="lt-msg">The league table is not available for this competition right now.</p>';
          setStatus("");
          return;
        }
        target.innerHTML = groups.map(tableHtml).join("");
        lastOk = Date.now();
        var season = groups[0].season ? groups[0].season + " season. " : "";
        setStatus(season + "Updated " + time(lastOk));
      })
      .catch(function () {
        if (slug !== current) return;
        if (!lastOk) target.innerHTML = '<p class="lt-msg">Could not load the table just now. We will try again automatically.</p>';
        else setStatus("Could not refresh. Showing the table from " + time(lastOk));
      })
      .then(function () { clearTimeout(to); busy = false; });
  }

  function schedule() {
    clearInterval(timer);
    timer = setInterval(function () { if (!document.hidden && current) load(); }, REFRESH_MS);
  }

  function show(slug) {
    var info = LEAGUES[slug];
    if (!info) { box.hidden = true; current = ""; clearInterval(timer); return; }
    current = slug; lastOk = 0; busy = false;
    if (isHome) {
      document.getElementById("ltTitle").textContent = info.name + " overview and live table";
      document.getElementById("ltIntro").innerHTML = info.intro.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");
    }
    box.hidden = false;
    var target = document.getElementById("ltTable");
    if (!info.table) {
      target.innerHTML = "";
      document.getElementById("ltHead").hidden = true;
      return;
    }
    document.getElementById("ltHead").hidden = false;
    target.innerHTML = '<div class="sk"></div>';
    setStatus("Loading...");
    load(); schedule();
  }

  if (isHome) {
    document.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("[data-lg]");
      if (b) show(b.getAttribute("data-lg"));
    });
  } else {
    show(current);
  }
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden && current && Date.now() - lastOk > REFRESH_MS) load();
  });
})();
