const UA = "FursanShield/1.0 legal-screen due-diligence@alfursan.local";

async function fetchJson(url, ms = 12000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: "application/json", "User-Agent": UA },
    });
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = null; }
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    return { ok: false, status: 0, data: null, error: err.message };
  } finally {
    clearTimeout(t);
  }
}

function strip(html) {
  return String(html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function words(query) {
  return query.toLowerCase().split(/[^a-z0-9\u0600-\u06ff]+/).filter((w) => w.length > 3);
}

function nameHits(query, text) {
  const blob = String(text || "").toLowerCase();
  const parts = words(query);
  if (!parts.length) return blob.includes(query.toLowerCase());
  const need = Math.min(parts.length, parts.length >= 2 ? 2 : 1);
  return parts.filter((w) => blob.includes(w)).length >= need;
}

function courtHits(query, caseName) {
  if (!nameHits(query, caseName)) return false;
  if (words(query).length >= 2) return true;
  return /\b(inc|incorporated|corp|corporation|ltd|limited|llc|plc|gmbh|company|asa|sae|s\.a\.e|s\.a|spa|b\.v|n\.v|co)\b/i.test(caseName || "");
}

async function gazette(query) {
  const url = `https://www.thegazette.co.uk/insolvency/notice/data.json?text=${encodeURIComponent(`"${query}"`)}&results-page-size=5`;
  const res = await fetchJson(url);
  const entries = res.data?.entry || [];
  const hits = (Array.isArray(entries) ? entries : [entries]).filter(Boolean).map((e) => {
    const links = Array.isArray(e.link) ? e.link : [e.link].filter(Boolean);
    const href = links.map((l) => l["@href"] || l.href).find((h) => h && String(h).includes("/notice/")) || links[0]?.["@href"];
    return {
      source: "UK Gazette — insolvency",
      severity: "high",
      title: strip(e.title).slice(0, 180) || "Insolvency notice",
      detail: strip(e.content).slice(0, 280),
      date: (e.published || e.updated || "").slice(0, 10),
      url: href?.startsWith("http") ? href : href ? `https://www.thegazette.co.uk${href}` : "https://www.thegazette.co.uk/insolvency",
    };
  }).filter((h) => nameHits(query, `${h.title} ${h.detail}`));
  return { key: "gazette", ok: res.ok, count: hits.length, hits, total: Number(res.data?.["f:total"] || hits.length) };
}

async function bodacc(query) {
  const params = new URLSearchParams({
    dataset: "annonces-commerciales",
    q: query,
    rows: "6",
    "refine.familleavis_lib": "Procédures collectives",
  });
  const res = await fetchJson(`https://bodacc-datadila.opendatasoft.com/api/records/1.0/search/?${params}`);
  const hits = (res.data?.records || []).map((r) => {
    const f = r.fields || {};
    return {
      source: "France BODACC — collective proceedings",
      severity: "high",
      title: `${f.typeavis_lib || "Commercial court notice"} — ${f.commercant || query}`,
      detail: [f.tribunal, f.ville, f.registre].filter(Boolean).join(" · "),
      date: f.dateparution || "",
      url: f.url_complete || "https://www.bodacc.fr/",
    };
  }).filter((h) => nameHits(query, `${h.title} ${h.detail}`));
  return { key: "bodacc", ok: res.ok, count: hits.length, hits };
}

async function usCourts(query) {
  const url = `https://www.courtlistener.com/api/rest/v4/search/?q=${encodeURIComponent(`"${query}"`)}&type=o&order_by=score%20desc&page_size=8`;
  const res = await fetchJson(url);
  const hits = (res.data?.results || []).filter((r) => courtHits(query, r.caseName || "")).slice(0, 5).map((r) => ({
    source: "US CourtListener opinion",
    severity: "review",
    title: r.caseName || "Opinion",
    detail: [r.court, r.dateFiled].filter(Boolean).join(" · "),
    date: r.dateFiled || "",
    url: r.absolute_url ? `https://www.courtlistener.com${r.absolute_url}` : "https://www.courtlistener.com/",
  }));
  return { key: "usCourts", ok: res.ok, count: hits.length, hits };
}

export function legalRooms(query) {
  const q = encodeURIComponent(query);
  return [
    { name: "UK Gazette insolvency", owner: "The Gazette", url: `https://www.thegazette.co.uk/insolvency/notice?text=${q}` },
    { name: "France BODACC", owner: "DILA", url: `https://www.bodacc.fr/pages/annonces-commerciales/?q.titre=${q}` },
    { name: "BAILII", owner: "British and Irish case law", url: `https://www.bailii.org/cgi-bin/sino_search_1.cgi?query=${q}&method=boolean&highlight=1&sort=rank` },
    { name: "US CourtListener", owner: "Free Law Project", url: `https://www.courtlistener.com/?q=${q}&type=o` },
    { name: "OFAC sanctions search", owner: "US Treasury", url: "https://sanctionssearch.ofac.treas.gov/" },
    { name: "UK OFSI", owner: "HM Treasury", url: "https://sanctionssearchapp.ofsi.hmtreasury.gov.uk/" },
    { name: "EU sanctions map", owner: "European Commission", url: "https://www.sanctionsmap.eu/" },
  ];
}

export async function screenLegal(query, country) {
  const c = (country || "").toUpperCase();
  const jobs = [];
  if (!c || c === "GB" || c === "UK") jobs.push(gazette(query));
  if (!c || c === "FR") jobs.push(bodacc(query));
  if (!c || c === "US") jobs.push(usCourts(query));
  const parts = await Promise.all(jobs);
  const hits = parts.flatMap((p) => p.hits || []);
  const high = hits.filter((h) => h.severity === "high").length;
  return {
    level: high ? "high" : hits.length ? "review" : "clear",
    headline: high
      ? "Legal notices found. Do not trade until a person reads the source."
      : hits.length
      ? "Possible court mentions. These are name matches, not a finding of liability."
      : "No UK insolvency notice, French collective proceeding, or close US opinion match on the live public feeds just checked.",
    disclaimer: "This is a screen of public registers, not a legal opinion and not a full world court search. Egypt, GCC and most private-company disputes are not in these feeds. Sanctions lists still have to be opened in the rooms on the right.",
    hits,
    sources: Object.fromEntries(parts.map((p) => [p.key, { live: p.ok, count: p.count }])),
    rooms: legalRooms(query),
  };
}
