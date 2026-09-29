const GLEIF = "https://api.gleif.org/api/v1";

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
    try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
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
    country: addr.country || (e.jurisdiction || "").slice(0, 2),
    nextRenewal: a.registration?.nextRenewalDate,
    managingLou: a.registration?.managingLou,
    bic: a.bic || [],
    gleifUrl: `https://search.gleif.org/#/record/${record.id}`,
  };
}

export async function searchGleif(query, country) {
  const params = new URLSearchParams();
  params.set("page[size]", "8");
  params.set("filter[fulltext]", query);
  if (country && country.length === 2) {
    params.set("filter[entity.legalAddress.country]", country.toUpperCase());
  }
  const url = `${GLEIF}/lei-records?${params.toString()}`;
  const res = await fetchJson(url, { headers: { Accept: "application/vnd.api+json" } });
  const rows = res.ok ? (res.data?.data || []).map(mapLei) : [];
  return { ...res, rows, url };
}

export async function getLei(lei) {
  const res = await fetchJson(`${GLEIF}/lei-records/${encodeURIComponent(lei)}`, {
    headers: { Accept: "application/vnd.api+json" },
  });
  const record = res.data?.data;
  let parent = null;
  const parentRes = await fetchJson(`${GLEIF}/lei-records/${encodeURIComponent(lei)}/direct-parent`, {
    headers: { Accept: "application/vnd.api+json" },
  });
  if (parentRes.ok && parentRes.data?.data) parent = mapLei(parentRes.data.data);
  return {
    ok: res.ok,
    status: res.status,
    company: record ? mapLei(record) : null,
    parent,
    rawMeta: res.data?.meta || null,
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
  const rows = (res.data?.search || []).map((s) => ({
    source: "Wikidata",
    live: true,
    id: s.id,
    name: s.label,
    description: s.description,
    url: s.concepturi || `https://www.wikidata.org/wiki/${s.id}`,
  }));
  return { ...res, rows };
}

export async function searchFrance(query) {
  const params = new URLSearchParams({ q: query, per_page: "5" });
  const res = await fetchJson(`https://recherche-entreprises.api.gouv.fr/search?${params}`);
  const rows = (res.data?.results || []).slice(0, 5).map((r) => ({
    source: "France INSEE",
    live: true,
    name: r.nom_complet || r.nom_raison_sociale,
    siren: r.siren,
    status: r.etat_administratif,
    address: r.siege?.adresse || r.siege?.commune,
    country: "FR",
    activity: r.activite_principale,
    url: r.siren ? `https://annuaire-entreprises.data.gouv.fr/entreprise/${r.siren}` : "https://annuaire-entreprises.data.gouv.fr/",
  }));
  return { ...res, rows };
}

export async function searchNorway(query) {
  const params = new URLSearchParams({ navn: query, size: "5" });
  const res = await fetchJson(`https://data.brreg.no/enhetsregisteret/api/enheter?${params}`);
  const list = res.data?._embedded?.enheter || [];
  const rows = list.map((r) => ({
    source: "Norway Brreg",
    live: true,
    name: r.navn,
    orgnr: r.organisasjonsnummer,
    status: r.konkurs ? "bankrupt" : r.organisasjonsform?.beskrivelse,
    address: r.forretningsadresse ? [r.forretningsadresse.adresse, r.forretningsadresse.poststed, r.forretningsadresse.land].flat().filter(Boolean).join(", ") : "",
    country: "NO",
    url: `https://virksomhet.brreg.no/nb/oppslag/enheter/${r.organisasjonsnummer}`,
  }));
  return { ...res, rows };
}

export async function checkVat(countryCode, vatNumber) {
  const res = await fetchJson("https://ec.europa.eu/taxation_customs/vies/rest-api/check-vat-number", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ countryCode, vatNumber }),
  }, 15000);
  return res;
}

export async function searchOpenSanctions(query) {
  const key = process.env.OPENSANCTIONS_API_KEY;
  if (!key) {
    return {
      ok: true,
      configured: false,
      rows: [],
      portal: `https://www.opensanctions.org/search/?q=${encodeURIComponent(query)}`,
    };
  }
  const url = `https://api.opensanctions.org/search/default?q=${encodeURIComponent(query)}&limit=8`;
  const res = await fetchJson(url, { headers: { Authorization: `ApiKey ${key}` } });
  const rows = (res.data?.results || []).map((r) => ({
    id: r.id,
    name: r.caption || r.properties?.name?.[0],
    schema: r.schema,
    datasets: r.datasets,
    score: r.score,
    url: `https://www.opensanctions.org/entities/${r.id}/`,
  }));
  return { ...res, configured: true, rows };
}
