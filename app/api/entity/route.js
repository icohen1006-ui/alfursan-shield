import { getCompaniesHouseFile, getLeiGraph, getSecProfile, searchFrance, searchNorway } from "../../../lib/live";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const p = new URL(req.url).searchParams;
  const lei = (p.get("lei") || "").trim().toUpperCase();
  const source = (p.get("source") || "").trim().toLowerCase();
  const id = (p.get("id") || "").trim();

  const out = { checkedAt: new Date().toISOString(), directors: [], psc: [], financials: [], filings: [], owners: [] };

  if (lei && /^[A-Z0-9]{20}$/.test(lei)) {
    const graph = await getLeiGraph(lei);
    out.gleif = graph;
    if (graph.ultimateParent) out.owners.push({ name: graph.ultimateParent.name, role: "Ultimate parent (GLEIF)", lei: graph.ultimateParent.lei, country: graph.ultimateParent.country });
    if (graph.parent) out.owners.push({ name: graph.parent.name, role: "Direct parent (GLEIF)", lei: graph.parent.lei, country: graph.parent.country });
    out.children = graph.children;
  }

  if (source === "fr" && id) {
    const fr = await searchFrance(id);
    const hit = fr.rows.find((r) => r.siren === id) || fr.rows[0];
    if (hit) {
      out.national = hit;
      out.directors = hit.directors || [];
      out.financials = hit.financials || [];
    }
  }

  if (source === "no" && id) {
    const no = await searchNorway(id);
    const hit = no.rows.find((r) => r.orgnr === id) || no.rows[0];
    if (hit) {
      out.national = hit;
      out.directors = hit.directors || [];
      if (hit.capital) out.financials.push({ year: "registered", capital: hit.capital, employees: hit.employees });
    }
  }

  if (source === "us" && id) {
    out.sec = await getSecProfile(id);
    const fin = out.sec.financials || {};
    const years = new Set([...(fin.revenue || []), ...(fin.assets || []), ...(fin.netIncome || [])].map((x) => x.year));
    out.financials = [...years].map((year) => ({
      year,
      revenue: fin.revenue?.find((x) => x.year === year)?.value,
      assets: fin.assets?.find((x) => x.year === year)?.value,
      netIncome: fin.netIncome?.find((x) => x.year === year)?.value,
      currency: "USD",
    }));
    out.filings = out.sec.filings || [];
    out.note = out.sec.ownersNote;
  }

  if ((source === "gb" || source === "uk") && id) {
    out.uk = await getCompaniesHouseFile(id);
    out.directors = out.uk.directors || [];
    out.psc = out.uk.psc || [];
    out.filings = out.uk.filings || [];
    out.national = out.uk.profile;
  }

  return Response.json(out);
}
