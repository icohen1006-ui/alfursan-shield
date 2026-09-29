"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

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

export default function VerifyPage() {
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [vat, setVat] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [vatRes, setVatRes] = useState(null);
  const [error, setError] = useState("");

  async function run(e) {
    e?.preventDefault();
    setLoading(true);
    setError("");
    setVatRes(null);
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
      count: v.count,
      extra: v.configured === false ? "portal" : v.skipped ? "n/a" : String(v.count),
    }));
  }, [data]);

  return (
    <main>
      <div className="kicker">Live verification</div>
      <h1>Check any company on earth.</h1>
      <p className="lede">Type a legal name, trading name or identifier. Shield queries live public APIs and prepares official screening rooms for the same string.</p>

      <form className="searchbar" onSubmit={run}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. Metro AG, Carrefour, Fresh Direct LLC" />
        <select value={country} onChange={(e) => setCountry(e.target.value)}>
          <option value="">All countries</option>
          {["EG","GB","DE","FR","NL","IT","ES","US","AE","SA","TR","JO","IN","CN","SG","AU","CA","CH","NO","PL","ZA","BR"].map((c) => (
            <option key={c} value={c}>{c}</option>
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

          <div className="grid-2">
            <div>
              <div className="section-title">GLEIF legal entities</div>
              {data.companies.length === 0 ? (
                <div className="card muted">No LEI match. That is common for small traders. Use national registries on the right and still open a diligence file.</div>
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
                        <a className="btn secondary" href={c.gleifUrl} target="_blank" rel="noreferrer">GLEIF record</a>
                        <button className="gold" onClick={() => {
                          const id = saveCase({
                            name: c.name,
                            lei: c.lei,
                            country: c.country,
                            address: c.address,
                            status: c.status,
                            snapshot: c,
                          });
                          window.location.href = `/diligence?id=${id}`;
                        }}>Open DD file</button>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {data.national?.length > 0 && (
                <>
                  <div className="section-title">National live registers</div>
                  <div className="list">
                    {data.national.map((c, i) => (
                      <article className="row" key={`${c.source}-${i}`}>
                        <div>
                          <h3>{c.name}</h3>
                          <div className="muted">{c.source} · {c.address}</div>
                          <div className="chips">
                            <span className="pill live">{c.status || "live"}</span>
                            {c.siren && <span className="pill">SIREN {c.siren}</span>}
                            {c.orgnr && <span className="pill">ORG {c.orgnr}</span>}
                          </div>
                        </div>
                        <a className="btn secondary" href={c.url} target="_blank" rel="noreferrer">Registry</a>
                      </article>
                    ))}
                  </div>
                </>
              )}

              {data.encyclopedia?.length > 0 && (
                <>
                  <div className="section-title">Public knowledge graph</div>
                  <div className="list">
                    {data.encyclopedia.map((w) => (
                      <article className="row" key={w.id}>
                        <div>
                          <h3>{w.name}</h3>
                          <div className="muted">{w.description || "Wikidata entity"}</div>
                        </div>
                        <a className="btn secondary" href={w.url} target="_blank" rel="noreferrer">Open</a>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </div>

            <aside>
              <div className="section-title">Sanctions rooms</div>
              <div className="card">
                <p className="muted">Each link is the official live search for this name. Record a clear / possible / confirmed hit on the DD file.</p>
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

              <div className="section-title">Registries for this search</div>
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
                  const id = saveCase({ name: q, country, snapshot: { query: q } });
                  window.location.href = `/diligence?id=${id}`;
                }}>Save this name as a file</button>
              </div>
            </aside>
          </div>
        </>
      )}

      {!data && (
        <div className="card muted">
          Try <Link href="/verify">Metro</Link>, a supermarket group, or a local importer name. Add a country code to tighten the LEI filter.
        </div>
      )}
    </main>
  );
}
