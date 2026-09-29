const GLEIF = "https://api.gleif.org/api/v1";
const SEC_UA = "FursanShield/1.0 due-diligence@alfursan.local";

async function fetchJson(url, init = {}, ms = 12000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, {
      ...init,
      signal: ctrl.signal,
      headers: { Accept: "application/json", ...(init.headers || {}) },
    });
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text.slice(0, 400) }; }
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    return { ok: false, status: 0, data: null, error: err.message };
  } finally {
    clearTimeout(t);
  }
}

function mapLei(record) {
  const a = record?.attributes || {};
  const e = a.entity || {};
  const addr = e.legalAddress || e.headquartersAddress || {};
  const hq = e.headquartersAddress || {};
  return {
    source: "GLEIF",
    live: true,
    lei: record.id,
    name: e.legalName?.name || a.lei,
    otherNames: (e.otherNames || []).map((n) => n.name).filter(Boolean),
    status: e.status,
    registrationStatus: a.registration?.status,
    jurisdiction: e.jurisdiction,
    legalForm: e.legalForm?.id,
    creationDate: e.creationDate,
    address: [addr.addressLines, addr.city, addr.region, addr.postalCode, addr.country].flat().filter(Boolean).join(", "),
    hq: [hq.addressLines, hq.city, hq.country].flat().filter(Boolean).join(", "),
    country: addr.country || (e.jurisdiction || "").slice(0, 2),
    nextRenewal: a.registration?.nextRenewalDate,
    managingLou: a.registration?.managingLou,
    bic: a.bic || [],
    gleifUrl: `https://search.gleif.org/#/record/${record.id}`,
  };
}

export async function searchGleif(query, country) {
  const looksLei = /^[A-Z0-9]{20}$/i.test(query.replace(/\s/g, ""));
  if (looksLei) {
    const res = await fetchJson(`${GLEIF}/lei-records/${query.replace(/\s/g, "").toUpperCase()}`, {
      headers: { Accept: "application/vnd.api+json" },
    });
    return { ...res, rows: res.data?.data ? [mapLei(res.data.data)] : [] };
  }
  const params = new URLSearchParams();
  params.set("page[size]", "10");
  params.set("filter[fulltext]", query);
  if (country && country.length === 2) params.set("filter[entity.legalAddress.country]", country.toUpperCase());
  const res = await fetchJson(`${GLEIF}/lei-records?${params.toString()}`, {
    headers: { Accept: "application/vnd.api+json" },
  });
  return { ...res, rows: res.ok ? (res.data?.data || []).map(mapLei) : [] };
}

async function gleifRel(lei, path) {
  const res = await fetchJson(`${GLEIF}/lei-records/${encodeURIComponent(lei)}/${path}`, {
    headers: { Accept: "application/vnd.api+json" },
  });
  const payload = res.data?.data;
  if (!payload) return null;
  return Array.isArray(payload) ? payload.map(mapLei) : mapLei(payload);
}

export async function getLeiGraph(lei) {
  const [core, parent, ultimate, children] = await Promise.all([
    fetchJson(`${GLEIF}/lei-records/${encodeURIComponent(lei)}`, { headers: { Accept: "application/vnd.api+json" } }),
    gleifRel(lei, "direct-parent"),
    gleifRel(lei, "ultimate-parent"),
    gleifRel(lei, "direct-children"),
  ]);
  return {
    ok: core.ok,
    company: core.data?.data ? mapLei(core.data.data) : null,
    parent: parent && !Array.isArray(parent) ? parent : null,
    ultimateParent: ultimate && !Array.isArray(ultimate) ? ultimate : null,
    children: Array.isArray(children) ? children.slice(0, 12) : children ? [children] : [],
  };
}

export async function searchWikidata(query) {
  const params = new URLSearchParams({
    action: "wbsearchentities",
    search: query,
    language: "en",
    type: "item",
    format: "json",
    limit: "6",
    origin: "*",
  });
  const res = await fetchJson(`https://www.wikidata.org/w/api.php?${params}`);
  return {
    ...res,
    rows: (res.data?.search || []).map((s) => ({
      source: "Wikidata",
      live: true,
      id: s.id,
      name: s.label,
      description: s.description,
      url: s.concepturi || `https://www.wikidata.org/wiki/${s.id}`,
    })),
  };
}

function mapDirectorsFr(list) {
  return (list || []).map((d) => ({
    name: d.denomination || [d.prenoms, d.nom].filter(Boolean).join(" "),
    role: d.qualite,
    type: d.type_dirigeant,
    born: d.annee_de_naissance || d.date_de_naissance,
    siren: d.siren || null,
  }));
}

export async function searchFrance(query) {
  const params = new URLSearchParams({ q: query, per_page: "5" });
  const res = await fetchJson(`https://recherche-entreprises.api.gouv.fr/search?${params}`);
  const rows = (res.data?.results || []).slice(0, 5).map((r) => ({
    source: "France INSEE / RNE",
    live: true,
    id: r.siren,
    name: r.nom_complet || r.nom_raison_sociale,
    siren: r.siren,
    vat: r.tva,
    status: r.etat_administratif === "A" ? "active" : r.etat_administratif,
    address: r.siege?.adresse || [r.siege?.numero_voie, r.siege?.libelle_voie, r.siege?.code_postal, r.siege?.commune].filter(Boolean).join(" "),
    country: "FR",
    activity: r.activite_principale,
    created: r.date_creation,
    staffBand: r.tranche_effectif_salarie,
    directors: mapDirectorsFr(r.dirigeants),
    financials: Object.entries(r.finances || {}).map(([year, f]) => ({
      year,
      revenue: f.ca,
      netIncome: f.resultat_net,
      currency: "EUR",
    })),
    url: r.siren ? `https://annuaire-entreprises.data.gouv.fr/entreprise/${r.siren}` : "https://annuaire-entreprises.data.gouv.fr/",
  }));
  return { ...res, rows };
}

async function norwayRoles(orgnr) {
  const res = await fetchJson(`https://data.brreg.no/enhetsregisteret/api/enheter/${orgnr}/roller`);
  const groups = res.data?.rollegrupper || [];
  const directors = [];
  for (const g of groups) {
    for (const r of g.roller || []) {
      const p = r.person?.navn || {};
      directors.push({
        name: r.enhet?.navn || [p.fornavn, p.etternavn].filter(Boolean).join(" "),
        role: r.type?.beskrivelse || g.type?.beskrivelse,
        type: r.person ? "person" : "entity",
        born: r.person?.fodselsdato,
      });
    }
  }
  return directors.slice(0, 20);
}

export async function searchNorway(query) {
  const params = new URLSearchParams({ size: "4" });
  if (/^\d{9}$/.test(query.trim())) params.set("organisasjonsnummer", query.trim());
  else params.set("navn", query);
  const res = await fetchJson(`https://data.brreg.no/enhetsregisteret/api/enheter?${params}`);
  const list = res.data?._embedded?.enheter || [];
  const rows = [];
  for (const r of list) {
    const directors = await norwayRoles(r.organisasjonsnummer);
    rows.push({
      source: "Norway Brønnøysund",
      live: true,
      id: r.organisasjonsnummer,
      name: r.navn,
      orgnr: r.organisasjonsnummer,
      status: r.konkurs ? "bankrupt" : r.organisasjonsform?.beskrivelse,
      address: r.forretningsadresse
        ? [r.forretningsadresse.adresse, r.forretningsadresse.poststed, r.forretningsadresse.land].flat().filter(Boolean).join(", ")
        : "",
      country: "NO",
      employees: r.antallAnsatte,
      capital: r.kapital,
      directors,
      url: `https://virksomhet.brreg.no/nb/oppslag/enheter/${r.organisasjonsnummer}`,
    });
  }
  return { ...res, rows };
}

let secIndex = null;
async function loadSecIndex() {
  if (secIndex) return secIndex;
  const res = await fetchJson("https://www.sec.gov/files/company_tickers.json", {
    headers: { "User-Agent": SEC_UA, Accept: "application/json" },
  }, 15000);
  const map = [];
  if (res.ok && res.data) {
    for (const row of Object.values(res.data)) {
      map.push({
        cik: String(row.cik_str).padStart(10, "0"),
        ticker: row.ticker,
        name: row.title,
      });
    }
  }
  secIndex = map;
  return map;
}

export async function searchSec(query) {
  const q = query.toLowerCase();
  const idx = await loadSecIndex();
  const hits = idx.filter((r) => r.name.toLowerCase().includes(q) || r.ticker.toLowerCase() === q).slice(0, 6);
  const rows = hits.map((r) => ({
    source: "US SEC EDGAR",
    live: true,
    id: r.cik,
    name: r.name,
    ticker: r.ticker,
    cik: r.cik,
    country: "US",
    url: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${r.cik}&owner=exclude`,
  }));
  return { ok: true, status: 200, rows };
}

export async function getSecProfile(cik) {
  const padded = String(cik).padStart(10, "0");
  const [sub, assets, revenue, income] = await Promise.all([
    fetchJson(`https://data.sec.gov/submissions/CIK${padded}.json`, { headers: { "User-Agent": SEC_UA } }, 15000),
    fetchJson(`https://data.sec.gov/api/xbrl/companyconcept/CIK${padded}/us-gaap/Assets.json`, { headers: { "User-Agent": SEC_UA } }, 12000),
    fetchJson(`https://data.sec.gov/api/xbrl/companyconcept/CIK${padded}/us-gaap/Revenues.json`, { headers: { "User-Agent": SEC_UA } }, 12000),
    fetchJson(`https://data.sec.gov/api/xbrl/companyconcept/CIK${padded}/us-gaap/NetIncomeLoss.json`, { headers: { "User-Agent": SEC_UA } }, 12000),
  ]);
  const s = sub.data || {};
  const recent = s.filings?.recent || {};
  const filings = [];
  for (let i = 0; i < Math.min(12, (recent.form || []).length); i += 1) {
    filings.push({
      form: recent.form[i],
      filed: recent.filingDate[i],
      description: recent.primaryDocDescription?.[i],
      url: recent.accessionNumber?.[i]
        ? `https://www.sec.gov/Archives/edgar/data/${Number(padded)}/${recent.accessionNumber[i].replace(/-/g, "")}/${recent.primaryDocument[i]}`
        : null,
    });
  }
  const pick = (concept) => {
    const units = concept?.data?.units || {};
    const series = units.USD || units["USD/shares"] || Object.values(units)[0] || [];
    return series.filter((x) => x.form === "10-K" || x.form === "20-F" || x.form === "10-Q").slice(-4).map((x) => ({
      year: x.fy || x.end,
      value: x.val,
      form: x.form,
      filed: x.filed,
    }));
  };
  return {
    ok: sub.ok,
    name: s.name,
    cik: padded,
    sic: s.sicDescription,
    exchanges: s.exchanges,
    tickers: s.tickers,
    fiscalYearEnd: s.fiscalYearEnd,
    filings,
    financials: {
      assets: pick(assets),
      revenue: pick(revenue),
      netIncome: pick(income),
    },
    ownersNote: "US beneficial-ownership over 5% is in Schedule 13D/13G filings on EDGAR. Officers appear in DEF 14A proxy statements.",
    url: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${padded}&owner=exclude`,
  };
}

export async function searchCompaniesHouse(query) {
  const key = process.env.COMPANIES_HOUSE_API_KEY;
  if (!key) {
    return {
      ok: true,
      configured: false,
      rows: [],
      portal: `https://find-and-update.company-information.service.gov.uk/search?q=${encodeURIComponent(query)}`,
    };
  }
  const token = Buffer.from(`${key}:`).toString("base64");
  const res = await fetchJson(
    `https://api.company-information.service.gov.uk/search/companies?q=${encodeURIComponent(query)}`,
    { headers: { Authorization: `Basic ${token}` } }
  );
  const rows = (res.data?.items || []).slice(0, 6).map((c) => ({
    source: "UK Companies House",
    live: true,
    id: c.company_number,
    name: c.title,
    number: c.company_number,
    status: c.company_status,
    address: c.address_snippet,
    country: "GB",
    dateOfCreation: c.date_of_creation,
    url: `https://find-and-update.company-information.service.gov.uk/company/${c.company_number}`,
  }));
  return { ...res, configured: true, rows };
}

export async function getCompaniesHouseFile(number) {
  const key = process.env.COMPANIES_HOUSE_API_KEY;
  if (!key) return { configured: false };
  const token = Buffer.from(`${key}:`).toString("base64");
  const auth = { headers: { Authorization: `Basic ${token}` } };
  const [profile, officers, psc, filings] = await Promise.all([
    fetchJson(`https://api.company-information.service.gov.uk/company/${number}`, auth),
    fetchJson(`https://api.company-information.service.gov.uk/company/${number}/officers`, auth),
    fetchJson(`https://api.company-information.service.gov.uk/company/${number}/persons-with-significant-control`, auth),
    fetchJson(`https://api.company-information.service.gov.uk/company/${number}/filing-history?items_per_page=20`, auth),
  ]);
  return {
    configured: true,
    ok: profile.ok,
    profile: profile.data,
    directors: (officers.data?.items || []).map((o) => ({
      name: o.name,
      role: o.officer_role,
      appointed: o.appointed_on,
      resigned: o.resigned_on,
      nationality: o.nationality,
      status: o.resigned_on ? "resigned" : "active",
    })),
    psc: (psc.data?.items || []).map((p) => ({
      name: p.name,
      kind: p.kind,
      natures: p.natures_of_control,
      notified: p.notified_on,
      ceased: p.ceased_on,
      country: p.country_of_residence || p.address?.country,
    })),
    filings: (filings.data?.items || []).map((f) => ({
      date: f.date,
      type: f.type,
      description: f.description,
      category: f.category,
    })),
  };
}

export async function searchOpenSanctions(query) {
  const key = process.env.OPENSANCTIONS_API_KEY;
  if (!key) {
    return { ok: true, configured: false, rows: [], portal: `https://www.opensanctions.org/search/?q=${encodeURIComponent(query)}` };
  }
  const res = await fetchJson(`https://api.opensanctions.org/search/default?q=${encodeURIComponent(query)}&limit=8`, {
    headers: { Authorization: `ApiKey ${key}` },
  });
  return {
    ...res,
    configured: true,
    rows: (res.data?.results || []).map((r) => ({
      id: r.id,
      name: r.caption || r.properties?.name?.[0],
      schema: r.schema,
      datasets: r.datasets,
      url: `https://www.opensanctions.org/entities/${r.id}/`,
    })),
  };
}

export async function checkVat(countryCode, vatNumber) {
  return fetchJson("https://ec.europa.eu/taxation_customs/vies/rest-api/check-vat-number", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ countryCode, vatNumber }),
  }, 15000);
}

export const EGYPT_PACK = {
  registry: "GAFI + Commercial Registry (Ministry of Supply / ITDA)",
  identifiers: [
    "Commercial Registry Number (السجل التجاري)",
    "Tax Card / Bitaqa Daraibiya (البطاقة الضريبية)",
    "Legal form: SAE / LLC / branch / partnership",
    "Governorate of registration",
  ],
  control: [
    "Mostakhrag extract dated within 30 days",
    "Directors / managers named on the extract",
    "Shareholders or partners from articles / GAFI file",
    "Authorised signatory and bank-account match",
  ],
  food: [
    "NFSA food-business status if they handle produce",
    "GOEIC export registration if they ship from Egypt",
    "Packhouse / cold-store address that can be visited",
  ],
};

export async function searchEgypt(query) {
  const [leiEg, leiHint] = await Promise.all([
    searchGleif(query, "EG"),
    searchGleif(`${query} Egypt`),
  ]);
  const seen = new Set();
  const rows = [];
  for (const r of [...(leiEg.rows || []), ...(leiHint.rows || [])]) {
    if ((r.country || "").toUpperCase() !== "EG" && !(r.jurisdiction || "").startsWith("EG")) continue;
    if (r.lei && seen.has(r.lei)) continue;
    if (r.lei) seen.add(r.lei);
    rows.push({
      ...r,
      source: "Egypt · live GLEIF / GAFI jurisdiction",
      id: r.lei,
      country: "EG",
      egyptPack: EGYPT_PACK,
      url: r.gleifUrl,
    });
  }
  if (!rows.length) {
    rows.push({
      source: "Egypt commercial file",
      live: true,
      id: `EG-FILE`,
      name: query,
      country: "EG",
      status: "extract required",
      address: "Confirm city and CR number on the Mostakhrag",
      egyptPack: EGYPT_PACK,
      url: "https://www.gafi.gov.eg/",
      note: "Egypt does not publish a free company API. This file is live against GLEIF plus the official GAFI / tax / commercial-registry rooms.",
    });
  }
  return { ok: true, status: leiEg.status || 200, rows, gleifLive: !!leiEg.ok };
}

export async function searchNational(query, country) {
  const c = (country || "").toUpperCase();
  const jobs = [];
  if (!c || c === "EG") jobs.push(["egypt", searchEgypt(query)]);
  if (!c || c === "FR") jobs.push(["france", searchFrance(query)]);
  if (!c || c === "NO") jobs.push(["norway", searchNorway(query)]);
  if (!c || c === "US") jobs.push(["sec", searchSec(query)]);
  if (!c || c === "GB" || c === "UK") jobs.push(["uk", searchCompaniesHouse(query)]);
  const settled = await Promise.all(jobs.map(async ([k, p]) => [k, await p]));
  const out = { rows: [], sources: {} };
  for (const [k, res] of settled) {
    out.sources[k] = {
      live: !!res.ok,
      status: res.status,
      count: (res.rows || []).length,
      configured: res.configured,
      skipped: !!res.skipped,
      portal: res.portal || null,
      error: res.error || null,
    };
    out.rows.push(...(res.rows || []));
  }
  return out;
}
