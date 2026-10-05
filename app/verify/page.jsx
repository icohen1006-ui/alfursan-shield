"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { COUNTRIES } from "../../lib/catalog";

function saveCase(payload) {
  const id = payload.id || `AF-${Date.now()}`;
  const next = {
    id,
    status: "open",
    createdAt: payload.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    answers: {},
    notes: "",
    ...payload,
  };
  const all = JSON.parse(localStorage.getItem("fursan_cases") || "[]");
  const idx = all.findIndex((c) => c.id === id);
  if (idx >= 0) all[idx] = { ...all[idx], ...next };
  else all.unshift(next);
  localStorage.setItem("fursan_cases", JSON.stringify(all));
  return id;
}

function money(n, ccy) {
  if (n == null || n === "") return "—";
  const num = Number(n);
  if (Number.isNaN(num)) return String(n);
  return `${ccy || ""} ${num.toLocaleString()}`.trim();
}

export default function VerifyPage() {
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [vat, setVat] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [vatRes, setVatRes] = useState(null);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);

  async function run(e) {
    e?.preventDefault();
    setLoading(true);
    setError("");
    setVatRes(null);
    setFile(null);
    try {
      const url = `/api/search?q=${encodeURIComponent(q)}${country ? `&country=${country}` : ""}`;
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Search failed");
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function openFile(params) {
    setFileLoading(true);
    try {
      const qs = new URLSearchParams(params);
      const res = await fetch(`/api/entity?${qs.toString()}`);
      setFile(await res.json());
    } catch (err) {
      setFile({ error: err.message });
    } finally {
      setFileLoading(false);
    }
  }

  async function runVat(e) {
    e.preventDefault();
    const res = await fetch(`/api/vat?vat=${encodeURIComponent(vat)}`);
    setVatRes(await res.json());
  }

  const sourcePills = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.sources).map(([k, v]) => ({
      k,
      live: v.live,
      extra: v.configured === false ? "portal" : v.skipped ? "n/a" : String(v.count ?? "—"),
    }));
  }, [data]);

  return (
    <main>
      <div className="kicker">Live verification</div>
      <h1>Check any company on earth.</h1>
      <p className="lede">
        GLEIF covers every country that issued an LEI. France, Norway and US public filers return directors, owners and accounts in-line.
        UK Companies House officers, PSC and filings activate when a free API key is set. Every other jurisdiction opens its official register room.
      </p>

      <form className="searchbar" onSubmit={run}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Legal name, LEI, SIREN, org.nr or ticker" />
        <select value={country} onChange={(e) => setCountry(e.target.value)}>
          <option value="">All countries</option>
          {COUNTRIES.map(([code, name]) => (
            <option key={code} value={code}>{code} · {name}</option>
          ))}
        </select>
        <button disabled={loading || q.length < 2}>{loading ? "Checking…" : "Verify"}</button>
      </form>
      {error && <div className="pill bad">{error}</div>}

      {data && (
        <>
          <div className="chips" style={{ marginBottom: 16 }}>
            <span className="pill">{new Date(data.checkedAt).toLocaleString()}</span>
            {sourcePills.map((s) => (
              <span key={s.k} className={`pill ${s.live ? "live" : "warn"}`}>{s.k} · {s.extra}</span>
            ))}
          </div>
          {data.coverageNote && <div className="card muted" style={{ marginBottom: 16 }}>{data.coverageNote}</div>}

          {data.legal && (
            <div className={`card alert alert-${data.legal.level}`}>
              <div className="chips">
                <span className={`pill ${data.legal.level === "high" ? "bad" : data.legal.level === "review" ? "warn" : "live"}`}>
                  {data.legal.level === "high" ? "Legal notice" : data.legal.level === "review" ? "Review" : "No public hit"}
                </span>
              </div>
              <p style={{ marginBottom: 6 }}><strong>{data.legal.headline}</strong></p>
              <p className="muted">{data.legal.disclaimer}</p>
              {data.legal.hits?.length > 0 && (
                <div className="list" style={{ marginTop: 10 }}>
                  {data.legal.hits.slice(0, 8).map((h, i) => (
                    <a key={`${h.url}-${i}`} className="row" href={h.url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                      <div>
                        <h3>{h.title}</h3>
                        <div className="muted">{h.source}{h.date ? ` · ${h.date}` : ""}</div>
                        {h.detail && <div className="muted">{h.detail}</div>}
                      </div>
                      <span className={`pill ${h.severity === "high" ? "bad" : "warn"}`}>{h.severity}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid-2">
            <div>
              <div className="section-title">GLEIF legal entities — worldwide</div>
              {data.companies.length === 0 ? (
                <div className="card muted">No LEI match. Small private traders often have none. Use the national hits below and the official register rooms.</div>
              ) : (
                <div className="list">
                  {data.companies.map((c) => (
                    <article className="row" key={c.lei}>
                      <div>
                        <h3>{c.name}</h3>
                        <div className="muted">{c.address || "Address not published"}</div>
                        <div className="chips">
                          <span className="pill live">{c.status || "status n/a"}</span>
                          <span className="pill">{c.lei}</span>
                          <span className="pill">{c.jurisdiction || c.country}</span>
                        </div>
                      </div>
                      <div style={{ display: "grid", gap: 8 }}>
                        <button className="secondary" onClick={() => openFile({ lei: c.lei })}>Directors / parents</button>
                        <button className="gold" onClick={() => {
                          window.location.href = `/diligence?id=${saveCase({ name: c.name, lei: c.lei, country: c.country, address: c.address, status: c.status, snapshot: c })}`;
                        }}>Open DD file</button>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {data.national?.length > 0 && (
                <>
                  <div className="section-title">National registers — directors, PSC, accounts</div>
                  <div className="list">
                    {data.national.map((c, i) => (
                      <article className="card" key={`${c.source}-${c.id || i}`}>
                        <div className="row" style={{ boxShadow: "none", padding: 0, border: 0 }}>
                          <div>
                            <h3>{c.name}</h3>
                            <div className="muted">{c.source} · {c.address || c.ticker || ""}</div>
                            <div className="chips">
                              <span className="pill live">{c.status || "live"}</span>
                              {c.siren && <span className="pill">SIREN {c.siren}</span>}
                              {c.orgnr && <span className="pill">ORG {c.orgnr}</span>}
                              {c.ticker && <span className="pill">{c.ticker}</span>}
                              {c.number && <span className="pill">{c.number}</span>}
                            </div>
                          </div>
                          <div style={{ display: "grid", gap: 8 }}>
                            <button className="secondary" onClick={() => {
                              const source = c.siren ? "fr" : c.orgnr ? "no" : c.cik ? "us" : c.number ? "gb" : (c.country === "EG" || (c.source || "").includes("Egypt")) ? "eg" : "";
                              const id = c.siren || c.orgnr || c.cik || c.number || c.lei || c.id;
                              const params = {};
                              if (source && id) { params.source = source; params.id = id; }
                              if (c.lei) params.lei = c.lei;
                              openFile(params);
                            }}>Open file</button>
                            {c.url && <a className="btn secondary" href={c.url} target="_blank" rel="noreferrer">Registry</a>}
                          </div>
                        </div>
                        {c.directors?.length > 0 && (
                          <div style={{ marginTop: 10 }}>
                            <div className="muted">Directors / officers</div>
                            {c.directors.slice(0, 6).map((d, idx) => (
                              <div key={idx}>{d.name} · {d.role}</div>
                            ))}
                          </div>
                        )}
                        {c.egyptPack && (
                          <div style={{ marginTop: 10 }}>
                            <div className="muted">{c.egyptPack.registry}</div>
                            {c.egyptPack.identifiers.map((x) => <div key={x}>{x}</div>)}
                          </div>
                        )}
                        {c.note && <p className="muted">{c.note}</p>}
                      </article>
                    ))}
                  </div>
                </>
              )}

              {(file || fileLoading) && (
                <>
                  <div className="section-title">Company file — control, officers, statements</div>
                  <div className="card">
                    {fileLoading && <div className="muted">Loading live file…</div>}
                    {file?.error && <div className="pill bad">{file.error}</div>}
                    {file?.gleif?.company && (
                      <p><strong>{file.gleif.company.name}</strong> · LEI {file.gleif.company.lei} · {file.gleif.company.status}</p>
                    )}
                    {file?.owners?.length > 0 && (
                      <>
                        <div className="muted">Persons / entities with significant control (GLEIF parents)</div>
                        {file.owners.map((o) => <div key={o.lei || o.name}>{o.name} · {o.role}</div>)}
                      </>
                    )}
                    {file?.psc?.length > 0 && (
                      <>
                        <div className="muted" style={{ marginTop: 10 }}>UK PSC register</div>
                        {file.psc.map((o, i) => <div key={i}>{o.name} · {(o.natures || []).join(", ")}</div>)}
                      </>
                    )}
                    {file?.directors?.length > 0 && (
                      <>
                        <div className="muted" style={{ marginTop: 10 }}>Directors</div>
                        {file.directors.map((d, i) => <div key={i}>{d.name} · {d.role}{d.appointed ? ` · from ${d.appointed}` : ""}</div>)}
                      </>
                    )}
                    {file?.financials?.length > 0 && (
                      <>
                        <div className="muted" style={{ marginTop: 10 }}>Financial statements</div>
                        {file.financials.map((f, i) => (
                          <div key={i}>FY {f.year} · revenue {money(f.revenue, f.currency)} · assets {money(f.assets, f.currency)} · net {money(f.netIncome, f.currency)}</div>
                        ))}
                      </>
                    )}
                    {file?.filings?.length > 0 && (
                      <>
                        <div className="muted" style={{ marginTop: 10 }}>Filed accounts / disclosures</div>
                        {file.filings.slice(0, 8).map((f, i) => (
                          <div key={i}>{f.filed || f.date} · {f.form || f.type} · {f.description || ""}</div>
                        ))}
                      </>
                    )}
                    {file?.egyptPack && (
                      <>
                        <div className="muted" style={{ marginTop: 10 }}>Egypt KYB pack</div>
                        <div>{file.egyptPack.registry}</div>
                        {[...file.egyptPack.identifiers, ...file.egyptPack.control].map((x) => <div key={x}>{x}</div>)}
                      </>
                    )}
                    {file?.note && <p className="muted">{file.note}</p>}
                    {file?.uk && file.uk.configured === false && (
                      <p className="muted">Add COMPANIES_HOUSE_API_KEY on Vercel to pull UK officers, PSC and filing history automatically. The Companies House room still works without it.</p>
                    )}
                  </div>
                </>
              )}
            </div>

            <aside>
              <div className="section-title">Sanctions rooms</div>
              <div className="card">
                <p className="muted">Official live search for this name. Mark the DD file after each room.</p>
                <div className="list" style={{ marginTop: 10 }}>
                  {data.livePortals.sanctions.map((s) => (
                    <a key={s.name} href={s.url} target="_blank" rel="noreferrer" className="row" style={{ textDecoration: "none" }}>
                      <div>
                        <strong>{s.name}</strong>
                        <div className="muted">{s.owner}</div>
                      </div>
                      <span className="pill live">Live</span>
                    </a>
                  ))}
                </div>
              </div>

              {data.legal?.rooms?.length > 0 && (
                <>
                  <div className="section-title">Court and insolvency rooms</div>
                  <div className="card">
                    {data.legal.rooms.map((r) => (
                      <div key={r.name} style={{ marginBottom: 8 }}>
                        <a href={r.url} target="_blank" rel="noreferrer">{r.name}</a>
                        <div className="muted">{r.owner}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="section-title">National register rooms</div>
              <div className="card">
                {data.livePortals.registries.map((r) => (
                  <div key={r.name} style={{ marginBottom: 8 }}>
                    <a href={r.url} target="_blank" rel="noreferrer">{r.name}</a>
                    <div className="muted">{r.country}</div>
                  </div>
                ))}
              </div>

              <div className="section-title">EU VAT (VIES)</div>
              <form className="card" onSubmit={runVat}>
                <input value={vat} onChange={(e) => setVat(e.target.value)} placeholder="NL123456789B01" />
                <button style={{ marginTop: 8, width: "100%" }}>Validate VAT</button>
                {vatRes && (
                  <pre className="muted" style={{ whiteSpace: "pre-wrap", marginTop: 10 }}>
                    {JSON.stringify(vatRes.result || vatRes, null, 2).slice(0, 800)}
                  </pre>
                )}
              </form>

              <div style={{ marginTop: 12 }}>
                <button className="secondary" onClick={() => {
                  window.location.href = `/diligence?id=${saveCase({ name: q, country, snapshot: { query: q } })}`;
                }}>Save this name as a file</button>
              </div>
              <p className="muted"><Link href="/sources">See every connected platform</Link></p>
            </aside>
          </div>
        </>
      )}
    </main>
  );
}
