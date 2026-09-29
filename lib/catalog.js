export const REGISTRIES = [
  { code: "EG", country: "Egypt", name: "GAFI", url: "https://www.gafi.gov.eg/", search: (q) => `https://www.google.com/search?q=${encodeURIComponent(q + " site:gafi.gov.eg")}` },
  { code: "EG", country: "Egypt", name: "Invest in Egypt / Investment Map", url: "https://www.investinegypt.gov.eg/", search: (q) => `https://www.google.com/search?q=${encodeURIComponent(q + " site:investinegypt.gov.eg")}` },
  { code: "EG", country: "Egypt", name: "Egyptian Commercial Registry", url: "https://www.itda.gov.eg/", search: (q) => `https://www.google.com/search?q=${encodeURIComponent(q + " السجل التجاري مصر")}` },
  { code: "EG", country: "Egypt", name: "Egyptian Tax Authority", url: "https://www.eta.gov.eg/", search: (q) => `https://www.google.com/search?q=${encodeURIComponent(q + " بطاقة ضريبية مصر")}` },
  { code: "EG", country: "Egypt", name: "Suez Canal Economic Zone", url: "https://sczone.eg/", search: (q) => `https://www.google.com/search?q=${encodeURIComponent(q + " site:sczone.eg")}` },
  { code: "GB", country: "United Kingdom", name: "Companies House", url: "https://find-and-update.company-information.service.gov.uk/", search: (q) => `https://find-and-update.company-information.service.gov.uk/search?q=${encodeURIComponent(q)}` },
  { code: "US", country: "United States", name: "SEC EDGAR", url: "https://www.sec.gov/edgar/search/", search: (q) => `https://efts.sec.gov/LATEST/search-index?q=${encodeURIComponent(q)}` },
  { code: "US-SOS", country: "United States", name: "OpenCorporates (all states)", url: "https://opencorporates.com/", search: (q) => `https://opencorporates.com/companies?q=${encodeURIComponent(q)}` },
  { code: "DE", country: "Germany", name: "Unternehmensregister", url: "https://www.unternehmensregister.de/", search: (q) => `https://www.unternehmensregister.de/ureg/` },
  { code: "FR", country: "France", name: "INSEE / recherche-entreprises", url: "https://annuaire-entreprises.data.gouv.fr/", search: (q) => `https://annuaire-entreprises.data.gouv.fr/rechercher?terme=${encodeURIComponent(q)}` },
  { code: "NL", country: "Netherlands", name: "KVK", url: "https://www.kvk.nl/", search: (q) => `https://www.kvk.nl/zoeken/?source=all&q=${encodeURIComponent(q)}` },
  { code: "BE", country: "Belgium", name: "KBO / CBE", url: "https://kbopub.economie.fgov.be/", search: (q) => `https://kbopub.economie.fgov.be/kbo-open-data/` },
  { code: "IT", country: "Italy", name: "Registro Imprese", url: "https://www.registroimprese.it/", search: (q) => `https://www.registroimprese.it/` },
  { code: "ES", country: "Spain", name: "Registro Mercantil", url: "https://www.registradores.org/", search: (q) => `https://www.registradores.org/` },
  { code: "PT", country: "Portugal", name: "Portal da Empresa", url: "https://www.portaldaempresa.pt/", search: (q) => `https://www.portaldaempresa.pt/` },
  { code: "IE", country: "Ireland", name: "CRO", url: "https://www.cro.ie/", search: (q) => `https://core.cro.ie/search` },
  { code: "CH", country: "Switzerland", name: "Zefix", url: "https://www.zefix.ch/", search: (q) => `https://www.zefix.ch/en/search/entity/welcome` },
  { code: "AT", country: "Austria", name: "Firmenbuch / Justiz", url: "https://www.justiz.gv.at/", search: (q) => `https://www.justizonline.gv.at/` },
  { code: "SE", country: "Sweden", name: "Bolagsverket", url: "https://www.bolagsverket.se/", search: (q) => `https://www.bolagsverket.se/` },
  { code: "NO", country: "Norway", name: "Brønnøysund", url: "https://www.brreg.no/", search: (q) => `https://virksomhet.brreg.no/nb/oppslag/enheter?q=${encodeURIComponent(q)}` },
  { code: "DK", country: "Denmark", name: "CVR / Virk", url: "https://datacvr.virk.dk/", search: (q) => `https://datacvr.virk.dk/data/visenhed?language=en-gb&soeg=${encodeURIComponent(q)}` },
  { code: "FI", country: "Finland", name: "PRH", url: "https://www.prh.fi/", search: (q) => `https://www.prh.fi/en/kaupparekisteri.html` },
  { code: "PL", country: "Poland", name: "KRS / eKRS", url: "https://ekrs.ms.gov.pl/", search: (q) => `https://ekrs.ms.gov.pl/` },
  { code: "CZ", country: "Czechia", name: "ARES / Justice", url: "https://ares.gov.cz/", search: (q) => `https://ares.gov.cz/strukturalni-ares` },
  { code: "AE", country: "UAE", name: "MoE / trade licence", url: "https://www.moec.gov.ae/", search: (q) => `https://www.google.com/search?q=${encodeURIComponent(q + " UAE trade license")}` },
  { code: "AE", country: "UAE", name: "ADGM Registration Authority", url: "https://www.adgm.com/", search: (q) => `https://www.google.com/search?q=${encodeURIComponent(q + " site:adgm.com")}` },
  { code: "AE", country: "UAE", name: "DIFC Public Register", url: "https://www.difc.ae/", search: (q) => `https://www.google.com/search?q=${encodeURIComponent(q + " DIFC register")}` },
  { code: "SA", country: "Saudi Arabia", name: "MC / Wathq", url: "https://mc.gov.sa/", search: (q) => `https://www.google.com/search?q=${encodeURIComponent(q + " commercial registration Saudi")}` },
  { code: "QA", country: "Qatar", name: "MOCI / QFC", url: "https://www.moci.gov.qa/", search: (q) => `https://www.google.com/search?q=${encodeURIComponent(q + " Qatar commercial registration")}` },
  { code: "KW", country: "Kuwait", name: "MOCI Kuwait", url: "https://www.moci.gov.kw/", search: (q) => `https://www.google.com/search?q=${encodeURIComponent(q + " Kuwait commercial license")}` },
  { code: "BH", country: "Bahrain", name: "Sijilat", url: "https://www.sijilat.bh/", search: (q) => `https://www.sijilat.bh/` },
  { code: "OM", country: "Oman", name: "InvestEasy", url: "https://www.business.gov.om/", search: (q) => `https://www.business.gov.om/` },
  { code: "TR", country: "Türkiye", name: "MERSIS / Ticaret Sicili", url: "https://mersis.ticaret.gov.tr/", search: (q) => `https://www.google.com/search?q=${encodeURIComponent(q + " MERSIS")}` },
  { code: "JO", country: "Jordan", name: "CCD Companies Control", url: "https://www.ccd.gov.jo/", search: (q) => `https://www.ccd.gov.jo/` },
  { code: "IN", country: "India", name: "MCA21", url: "https://www.mca.gov.in/", search: (q) => `https://www.mca.gov.in/` },
  { code: "CN", country: "China", name: "National Enterprise Credit", url: "https://www.gsxt.gov.cn/", search: (q) => `https://www.gsxt.gov.cn/` },
  { code: "HK", country: "Hong Kong", name: "CR / ICRIS", url: "https://www.icris.cr.gov.hk/", search: (q) => `https://www.icris.cr.gov.hk/` },
  { code: "SG", country: "Singapore", name: "ACRA BizFile", url: "https://www.bizfile.gov.sg/", search: (q) => `https://www.bizfile.gov.sg/` },
  { code: "MY", country: "Malaysia", name: "SSM", url: "https://www.ssm.com.my/", search: (q) => `https://www.ssm.com.my/` },
  { code: "AU", country: "Australia", name: "ABN Lookup", url: "https://abr.business.gov.au/", search: (q) => `https://abr.business.gov.au/Search/Results?SearchText=${encodeURIComponent(q)}` },
  { code: "NZ", country: "New Zealand", name: "Companies Office", url: "https://companies-register.companiesoffice.govt.nz/", search: (q) => `https://app.companiesoffice.govt.nz/companies/app/ui/pages/companies/search?q=${encodeURIComponent(q)}&type=entities` },
  { code: "CA", country: "Canada", name: "Corporations Canada", url: "https://ised-isde.canada.ca/site/corporations-canada/en", search: (q) => `https://ised-isde.canada.ca/cc/lgcy/fdrlCrpSrch.html` },
  { code: "MX", country: "Mexico", name: "SIGER / RPPC", url: "https://www.gob.mx/se", search: (q) => `https://www.google.com/search?q=${encodeURIComponent(q + " SIGER Mexico")}` },
  { code: "ZA", country: "South Africa", name: "CIPC", url: "https://www.cipc.co.za/", search: (q) => `https://www.cipc.co.za/` },
  { code: "NG", country: "Nigeria", name: "CAC", url: "https://www.cac.gov.ng/", search: (q) => `https://search.cac.gov.ng/` },
  { code: "KE", country: "Kenya", name: "BRS eCitizen", url: "https://brs.go.ke/", search: (q) => `https://brs.go.ke/` },
  { code: "MA", country: "Morocco", name: "OMPIC", url: "https://www.ompic.ma/", search: (q) => `https://www.ompic.ma/` },
  { code: "TN", country: "Tunisia", name: "RNE Tunisia", url: "https://www.registre-entreprises.tn/", search: (q) => `https://www.registre-entreprises.tn/` },
  { code: "DZ", country: "Algeria", name: "CNRC", url: "https://sidjilcom.cnrc.dz/", search: (q) => `https://sidjilcom.cnrc.dz/` },
  { code: "BR", country: "Brazil", name: "Receita Federal CNPJ", url: "https://solucoes.receita.fazenda.gov.br/Servicos/cnpjreva/Cnpjreva_Solicitacao.asp", search: (q) => `https://solucoes.receita.fazenda.gov.br/Servicos/cnpjreva/Cnpjreva_Solicitacao.asp` },
  { code: "JP", country: "Japan", name: "National Tax / Houjin", url: "https://www.houjin-bangou.nta.go.jp/", search: (q) => `https://www.houjin-bangou.nta.go.jp/` },
  { code: "KR", country: "South Korea", name: "DART", url: "https://dart.fss.or.kr/", search: (q) => `https://dart.fss.or.kr/` },
  { code: "RU", country: "Russia", name: "EGRUL", url: "https://egrul.nalog.ru/", search: (q) => `https://egrul.nalog.ru/` },
  { code: "GLOBAL", country: "Worldwide", name: "OpenCorporates", url: "https://opencorporates.com/", search: (q) => `https://opencorporates.com/companies?utf8=%E2%9C%93&q=${encodeURIComponent(q)}` },
  { code: "LEI", country: "Worldwide", name: "GLEIF LEI Search", url: "https://search.gleif.org/", search: (q) => `https://search.gleif.org/#/search/simple=1&q=${encodeURIComponent(q)}` },
];

export const SANCTIONS_PLATFORMS = [
  { id: "ofac", name: "OFAC Sanctions List Search", owner: "U.S. Treasury", live: true, url: "https://sanctionssearch.ofac.treas.gov/", search: (q) => `https://sanctionssearch.ofac.treas.gov/` },
  { id: "csl", name: "Consolidated Screening List", owner: "U.S. Trade.gov", live: true, url: "https://www.trade.gov/consolidated-screening-list", search: (q) => `https://www.trade.gov/data-visualization/csl-search` },
  { id: "ofsi", name: "UK OFSI Consolidated List", owner: "HM Treasury", live: true, url: "https://sanctionssearchapp.ofsi.hmtreasury.gov.uk/", search: (q) => `https://sanctionssearchapp.ofsi.hmtreasury.gov.uk/` },
  { id: "eu", name: "EU Sanctions Map / Financial Sanctions", owner: "European Commission", live: true, url: "https://www.sanctionsmap.eu/", search: (q) => `https://www.sanctionsmap.eu/` },
  { id: "un", name: "UN Security Council Consolidated List", owner: "United Nations", live: true, url: "https://www.un.org/securitycouncil/content/un-sc-consolidated-list", search: (q) => `https://scsanctions.un.org/consolidated/` },
  { id: "opensanctions", name: "OpenSanctions", owner: "OpenSanctions", live: true, url: "https://www.opensanctions.org/", search: (q) => `https://www.opensanctions.org/search/?q=${encodeURIComponent(q)}` },
  { id: "wb", name: "World Bank Debarred Firms", owner: "World Bank", live: true, url: "https://www.worldbank.org/en/projects-operations/procurement/debarred-firms", search: (q) => `https://www.worldbank.org/en/projects-operations/procurement/debarred-firms` },
  { id: "seco", name: "SECO Sanctions (Switzerland)", owner: "SECO", live: true, url: "https://www.sesam.search.admin.ch/", search: (q) => `https://www.sesam.search.admin.ch/sesam-search-web/pages/search.xhtml` },
];

export const TRADE_PLATFORMS = [
  { id: "fda", name: "FDA Import / Facility Search", note: "U.S. food facility registration & import alerts", url: "https://www.accessdata.fda.gov/scripts/importrefusals/", search: (q) => `https://www.accessdata.fda.gov/scripts/importrefusals/` },
  { id: "feilist", name: "FDA FEI / DUNS lookup", note: "Registered food facilities", url: "https://www.accessdata.fda.gov/scripts/feiportal/", search: (q) => `https://www.accessdata.fda.gov/scripts/feiportal/` },
  { id: "rasff", name: "EU RASFF Window", note: "Food & feed safety alerts", url: "https://webgate.ec.europa.eu/rasff-window/screen/search", search: (q) => `https://webgate.ec.europa.eu/rasff-window/screen/search` },
  { id: "traces", name: "EU TRACES NT", note: "Phytosanitary / CHED documents", url: "https://webgate.ec.europa.eu/tracesnt/login", search: (q) => `https://webgate.ec.europa.eu/tracesnt/login` },
  { id: "defra", name: "UK IPAFFS", note: "UK import notifications for FNAO", url: "https://www.gov.uk/guidance/import-of-products-animals-food-and-feed-system", search: (q) => `https://www.gov.uk/guidance/import-of-products-animals-food-and-feed-system` },
  { id: "sfda", name: "Saudi SFDA", note: "Food facility & product listing", url: "https://www.sfda.gov.sa/", search: (q) => `https://www.sfda.gov.sa/` },
  { id: "nfsa", name: "Egypt NFSA", note: "National Food Safety Authority", url: "https://www.nfsa.gov.eg/", search: (q) => `https://www.nfsa.gov.eg/` },
  { id: "sedex", name: "SEDEX / SMETA", note: "Ethical trade audits common in produce", url: "https://www.sedex.com/", search: (q) => `https://www.sedex.com/` },
  { id: "globalgap", name: "GLOBALG.A.P.", note: "Farm certification", url: "https://database.globalgap.org/", search: (q) => `https://database.globalgap.org/globalgap/search/SearchMain.faces` },
  { id: "brcgs", name: "BRCGS Directory", note: "GFSI food safety sites", url: "https://www.brcgs.com/brcgs/food-safety/certified-companies/", search: (q) => `https://directory.brcgs.com/` },
  { id: "fssc", name: "FSSC 22000", note: "GFSI scheme used by processors", url: "https://www.fssc.com/", search: (q) => `https://www.fssc.com/` },
  { id: "lei", name: "GLEIF", note: "Legal Entity Identifier golden copy", url: "https://search.gleif.org/", search: (q) => `https://search.gleif.org/#/search/simple=1&q=${encodeURIComponent(q)}` },
];

export const COUNTRIES = [
  ["EG","Egypt"],["GB","United Kingdom"],["IE","Ireland"],["FR","France"],["DE","Germany"],["NL","Netherlands"],["BE","Belgium"],["IT","Italy"],["ES","Spain"],["PT","Portugal"],
  ["CH","Switzerland"],["AT","Austria"],["SE","Sweden"],["NO","Norway"],["DK","Denmark"],["FI","Finland"],["PL","Poland"],["CZ","Czechia"],["US","United States"],["CA","Canada"],
  ["MX","Mexico"],["BR","Brazil"],["AE","United Arab Emirates"],["SA","Saudi Arabia"],["QA","Qatar"],["KW","Kuwait"],["BH","Bahrain"],["OM","Oman"],["JO","Jordan"],["TR","Türkiye"],
  ["IN","India"],["CN","China"],["HK","Hong Kong"],["SG","Singapore"],["MY","Malaysia"],["AU","Australia"],["NZ","New Zealand"],["ZA","South Africa"],["NG","Nigeria"],["KE","Kenya"],
  ["MA","Morocco"],["TN","Tunisia"],["DZ","Algeria"],["JP","Japan"],["KR","South Korea"],["RU","Russia"],
];

export const COUNTRY_RISK = {
  EG: 35, JO: 32, SA: 28, AE: 22, QA: 20, KW: 24, BH: 24, OM: 26,
  TR: 38, GB: 12, DE: 10, FR: 12, NL: 10, IT: 16, ES: 16, IE: 12,
  CH: 8, US: 14, CA: 12, AU: 12, NZ: 10, SG: 10, JP: 12, KR: 16,
  IN: 42, CN: 48, RU: 82, IR: 90, SY: 92, KP: 98, BY: 78, VE: 80,
  LB: 62, IQ: 70, YE: 88, LY: 80, SD: 78, SS: 86, SO: 88,
  ZA: 40, NG: 58, KE: 44, MA: 34, TN: 36, DZ: 40,
  BR: 36, MX: 38, AR: 42, CL: 22, PE: 34,
  PL: 18, NO: 8, SE: 8, DK: 8, FI: 8, AT: 10, BE: 12,
};

export function jurisdictionRisk(iso) {
  if (!iso) return 30;
  return COUNTRY_RISK[iso.toUpperCase()] ?? 40;
}

export const DD_SECTIONS = [
  {
    id: "identity",
    title: "Legal identity",
    items: [
      { id: "legal_name", label: "Exact legal name matches registry / LEI", weight: 8 },
      { id: "reg_number", label: "Company number / tax ID collected and verified", weight: 8 },
      { id: "status_active", label: "Entity is active (not dissolved / struck off)", weight: 10 },
      { id: "address", label: "Registered address confirmed", weight: 5 },
      { id: "lei", label: "LEI present or not required for this counterparty type", weight: 4 },
    ],
  },
  {
    id: "ownership",
    title: "Ownership & control",
    items: [
      { id: "ubo", label: "Ultimate beneficial owners identified (≥25%)", weight: 9 },
      { id: "directors", label: "Directors / authorised signatories confirmed", weight: 6 },
      { id: "structure", label: "Group structure understood (parent / affiliates)", weight: 6 },
      { id: "pep", label: "No unresolved PEP concern on owners or directors", weight: 8 },
    ],
  },
  {
    id: "sanctions",
    title: "Sanctions, watchlists & trade controls",
    items: [
      { id: "ofac", label: "OFAC / US CSL screened — no confirmed hit", weight: 12 },
      { id: "uk_eu_un", label: "UK OFSI, EU and UN lists screened — no confirmed hit", weight: 12 },
      { id: "debarment", label: "World Bank / procurement debarment checked", weight: 5 },
      { id: "ownership_sanctions", label: "No sanctioned parent or 50%+ owned affiliate", weight: 10 },
    ],
  },
  {
    id: "financial",
    title: "Financial standing & payment",
    items: [
      { id: "bank", label: "Bank details match legal name (no third-party account)", weight: 8 },
      { id: "credit", label: "Credit report or trade references reviewed", weight: 6 },
      { id: "accounts", label: "Latest accounts / financial statements reviewed", weight: 6 },
      { id: "terms", label: "Payment terms and LC / CAD structure agreed", weight: 5 },
      { id: "insolvency", label: "No open insolvency / winding-up flags", weight: 8 },
    ],
  },
  {
    id: "food",
    title: "Food, quality & import fitness",
    items: [
      { id: "importer", label: "Importer / food business registration in destination market", weight: 8 },
      { id: "gfsi", label: "GFSI or equivalent site certificate current (BRCGS / FSSC / IFS / SQF)", weight: 7 },
      { id: "specs", label: "Product specs, pesticide MRL and residue plan accepted", weight: 6 },
      { id: "trace", label: "Batch traceability and recall contact confirmed", weight: 6 },
      { id: "pack", label: "Packaging, labelling and Halal / Kosher claims evidenced if used", weight: 4 },
    ],
  },
  {
    id: "integrity",
    title: "Integrity, logistics & contract",
    items: [
      { id: "site", label: "Warehouse / office existence sense-checked", weight: 4 },
      { id: "contract", label: "Contract, Incoterms and governing law agreed", weight: 5 },
      { id: "media", label: "Adverse media reviewed (fraud, labour, contamination)", weight: 6 },
      { id: "conflict", label: "No conflict of interest with AL FURSAN staff", weight: 3 },
    ],
  },
];

export function scoreDueDiligence(answers, extras = {}) {
  let total = 0;
  let earned = 0;
  const gaps = [];
  for (const section of DD_SECTIONS) {
    for (const item of section.items) {
      total += item.weight;
      const val = answers[item.id];
      if (val === "yes") earned += item.weight;
      else if (val === "na") earned += item.weight * 0.7;
      else if (val === "partial") earned += item.weight * 0.4;
      else gaps.push({ section: section.title, ...item, value: val || "open" });
    }
  }
  let score = Math.round((earned / total) * 100);
  if (extras.sanctionsHit) score = Math.min(score, 15);
  if (extras.inactive) score = Math.min(score, 35);
  if (typeof extras.jurisdiction === "number") {
    score = Math.max(0, score - Math.round(extras.jurisdiction / 8));
  }
  let band = "Approve";
  if (score < 45) band = "Decline / escalate";
  else if (score < 70) band = "Conditional — extra controls";
  else if (score < 85) band = "Approve with monitoring";
  return { score, band, gaps, total, earned };
}
