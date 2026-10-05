import { searchGleif, searchNational, searchOpenSanctions, searchWikidata } from "../../../lib/live";
import { screenLegal } from "../../../lib/legal";
import { REGISTRIES, SANCTIONS_PLATFORMS, TRADE_PLATFORMS, jurisdictionRisk } from "../../../lib/catalog";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const country = (searchParams.get("country") || "").trim().toUpperCase();
  if (q.length < 2) return Response.json({ error: "Enter at least 2 characters." }, { status: 400 });

  const [gleif, wiki, national, os, legal] = await Promise.all([
    searchGleif(q, country || undefined),
    searchWikidata(q),
    searchNational(q, country),
    searchOpenSanctions(q),
    screenLegal(q, country),
  ]);

  const livePortals = {
    registries: REGISTRIES.filter((r) => !country || r.code === country || r.code === "GLOBAL" || r.code === "LEI" || r.code.startsWith(country))
      .map((r) => ({ name: r.name, country: r.country, url: r.search(q), home: r.url })),
    sanctions: SANCTIONS_PLATFORMS.map((s) => ({ name: s.name, owner: s.owner, url: s.search(q), home: s.url })),
    trade: TRADE_PLATFORMS.map((s) => ({ name: s.name, note: s.note, url: s.search(q), home: s.url })),
  };

  return Response.json({
    query: q,
    country: country || null,
    checkedAt: new Date().toISOString(),
    jurisdictionHint: country ? jurisdictionRisk(country) : null,
    sources: {
      gleif: { live: gleif.ok, status: gleif.status, count: gleif.rows.length, error: gleif.error || null },
      wikidata: { live: wiki.ok, status: wiki.status, count: wiki.rows.length },
      opensanctions: { live: os.ok, configured: os.configured, count: (os.rows || []).length, portal: os.portal },
      ...legal.sources,
      ...national.sources,
    },
    companies: gleif.rows,
    national: national.rows,
    encyclopedia: wiki.rows,
    watchlistHits: os.rows || [],
    legal,
    livePortals,
    coverageNote: country === "EG"
      ? "Egypt is live: GLEIF for any Egyptian LEI, plus GAFI, commercial registry, tax card and NFSA rooms. Private companies without an LEI still need a current Mostakhrag extract for directors and owners."
      : country && !["FR", "NO", "US", "GB", "UK", "EG"].includes(country)
      ? "Identity is live via GLEIF for this country. Directors, PSC and accounts come from the official national register room on the right, plus any LEI parent/child graph."
      : null,
  });
}
