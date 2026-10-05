"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

function useCases() {
  const [cases, setCases] = useState([]);
  useEffect(() => {
    try {
      setCases(JSON.parse(localStorage.getItem("fursan_cases") || "[]"));
    } catch {}
  }, []);
  return cases;
}

export default function HomePage() {
  const cases = useCases();
  const open = cases.filter((c) => c.status !== "closed").length;
  const approved = cases.filter((c) => c.band?.startsWith("Approve")).length;

  const tiles = useMemo(() => [
    { n: String(open), l: "Open files" },
    { n: String(approved), l: "Approved counterparties" },
    { n: "8", l: "Live sanctions portals" },
    { n: "26+", l: "Registry gateways" },
  ], [open, approved]);

  return (
    <main>
      <section className="hero">
        <div>
          <div className="kicker">Trade compliance desk</div>
          <h1>Know the buyer before the container leaves Egypt.</h1>
          <p className="lede">
            Fursan Shield is the counterpart desk for AL FURSAN Ltd. Search any company on the live GLEIF golden copy,
            open official registries and sanctions lists in one pass, then complete a produce-trade due diligence file
            that a bank, insurer or customs broker can actually read.
          </p>
        </div>
        <div className="card">
          <div className="pill live">Live data layer on</div>
          <p className="muted" style={{ marginTop: 10 }}>
            GLEIF identity · France, Norway and US filings · Egypt LEI file · UK insolvency · French court proceedings · EU VAT · sanctions rooms.
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <Link className="btn" href="/verify">Start a check</Link>
            <Link className="btn secondary" href="/diligence">Open a file</Link>
          </div>
        </div>
      </section>

      <div className="grid">
        {tiles.map((t) => (
          <div className="stat" key={t.l}>
            <b>{t.n}</b>
            <span className="muted">{t.l}</span>
          </div>
        ))}
      </div>

      <div className="section-title">How the desk works</div>
      <div className="grid">
        <div className="card">
          <h3>1. Resolve the legal person</h3>
          <p className="muted">Name, country and identifiers go to GLEIF and national registers. You get legal name, status, address, LEI and parent where published.</p>
        </div>
        <div className="card">
          <h3>2. Screen the same hour</h3>
          <p className="muted">Sanctions rooms open on the name. UK insolvency notices, French collective proceedings and US opinions that name the company are flagged in the result, with the source link.</p>
        </div>
        <div className="card">
          <h3>3. File a decision</h3>
          <p className="muted">A 27-point questionnaire covers UBO, payment, GFSI, importer licences and RASFF-style food risk. Score, band and gaps stay on the file.</p>
        </div>
      </div>

      <div className="section-title">Recent files</div>
      {cases.length === 0 ? (
        <div className="card muted">No files yet. Run a verification, then save it as a due diligence case.</div>
      ) : (
        <div className="list">
          {cases.slice(0, 6).map((c) => (
            <div className="row" key={c.id}>
              <div>
                <h3>{c.name}</h3>
                <div className="muted">{c.country || "—"} · {c.lei || "No LEI"} · {new Date(c.updatedAt).toLocaleString()}</div>
              </div>
              <div className="pill">{c.band || c.status || "Draft"}</div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
