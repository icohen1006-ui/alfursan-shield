"use client";

import { useEffect, useMemo, useState } from "react";
import { DD_SECTIONS, scoreDueDiligence, jurisdictionRisk } from "../../lib/catalog";

function loadAll() {
  try { return JSON.parse(localStorage.getItem("fursan_cases") || "[]"); }
  catch { return []; }
}
function persist(all) {
  localStorage.setItem("fursan_cases", JSON.stringify(all));
}

export default function DiligencePage() {
  const [cases, setCases] = useState([]);
  const [activeId, setActiveId] = useState("");
  const [form, setForm] = useState({
    name: "", country: "", lei: "", role: "buyer", value: "", notes: "", answers: {},
  });

  useEffect(() => {
    const all = loadAll();
    setCases(all);
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      const found = all.find((c) => c.id === id);
      if (found) {
        setActiveId(id);
        setForm({
          name: found.name || "",
          country: found.country || "",
          lei: found.lei || "",
          role: found.role || "buyer",
          value: found.value || "",
          notes: found.notes || "",
          answers: found.answers || {},
        });
      }
    }
  }, []);

  const extras = useMemo(() => ({
    sanctionsHit: Object.entries(form.answers).some(([k, v]) => ["ofac", "uk_eu_un", "ownership_sanctions"].includes(k) && v === "no"),
    inactive: form.answers.status_active === "no",
    jurisdiction: jurisdictionRisk(form.country),
  }), [form]);

  const result = scoreDueDiligence(form.answers, extras);

  function upsert(partial) {
    const nextForm = { ...form, ...partial };
    setForm(nextForm);
    if (!activeId && !nextForm.name) return;
    const all = loadAll();
    const id = activeId || `AF-${Date.now()}`;
    const rec = {
      id,
      ...nextForm,
      score: result.score,
      band: result.band,
      status: "open",
      updatedAt: new Date().toISOString(),
      createdAt: all.find((c) => c.id === id)?.createdAt || new Date().toISOString(),
    };
    const idx = all.findIndex((c) => c.id === id);
    if (idx >= 0) all[idx] = { ...all[idx], ...rec };
    else all.unshift(rec);
    persist(all);
    setCases(all);
    setActiveId(id);
    const url = new URL(window.location.href);
    url.searchParams.set("id", id);
    window.history.replaceState({}, "", url);
  }

  function setAnswer(id, value) {
    const answers = { ...form.answers, [id]: value };
    setForm({ ...form, answers });
    upsert({ answers });
  }

  function printFile() {
    window.print();
  }

  return (
    <main>
      <div className="kicker">Case file</div>
      <h1>Due diligence workbook.</h1>
      <p className="lede">Built for AL FURSAN commercial, finance and quality teams. Complete the points, attach the live checks, then print a board-ready note.</p>

      <div className="grid-2">
        <div>
          <div className="card" style={{ display: "grid", gap: 8, marginBottom: 16 }}>
            <input value={form.name} onChange={(e) => upsert({ name: e.target.value })} placeholder="Counterparty legal name" />
            <div className="form-3">
              <input value={form.country} onChange={(e) => upsert({ country: e.target.value.toUpperCase() })} placeholder="ISO country" />
              <input value={form.lei} onChange={(e) => upsert({ lei: e.target.value.toUpperCase() })} placeholder="LEI" />
              <select value={form.role} onChange={(e) => upsert({ role: e.target.value })}>
                <option value="buyer">Buyer / importer</option>
                <option value="agent">Agent / broker</option>
                <option value="logistics">Logistics / cold store</option>
                <option value="supplier">Input supplier</option>
                <option value="bank">Bank / insurer</option>
              </select>
            </div>
            <input value={form.value} onChange={(e) => upsert({ value: e.target.value })} placeholder="Proposed annual value, Incoterm, destination" />
            <textarea rows={4} value={form.notes} onChange={(e) => upsert({ notes: e.target.value })} placeholder="Analyst notes, phone checks, documents received…" />
          </div>

          {DD_SECTIONS.map((section) => (
            <section key={section.id} style={{ marginBottom: 18 }}>
              <div className="section-title">{section.title}</div>
              <div className="checklist">
                {section.items.map((item) => (
                  <div className="check" key={item.id}>
                    <div>
                      <strong>{item.label}</strong>
                      <div className="muted">Weight {item.weight}</div>
                    </div>
                    <select value={form.answers[item.id] || ""} onChange={(e) => setAnswer(item.id, e.target.value)}>
                      <option value="">Open</option>
                      <option value="yes">Yes / clear</option>
                      <option value="partial">Partial evidence</option>
                      <option value="na">Not applicable</option>
                      <option value="no">No / fail</option>
                    </select>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside>
          <div className="card">
            <div className="score-ring" style={{ "--p": result.score }}>
              <span>{result.score}</span>
            </div>
            <p style={{ textAlign: "center", fontFamily: "Syne, sans-serif" }}>{result.band}</p>
            <p className="muted">Jurisdiction pressure for {form.country || "unknown"}: {extras.jurisdiction}/100. Sanctions fails cap the file at 15. Inactive entities cap at 35.</p>
            <button style={{ width: "100%", marginTop: 10 }} onClick={printFile}>Print / PDF file</button>
          </div>

          <div className="section-title">Open gaps</div>
          <div className="card">
            {result.gaps.length === 0 ? (
              <div className="muted">No open points.</div>
            ) : result.gaps.slice(0, 8).map((g) => (
              <div key={g.id} style={{ marginBottom: 8 }}>
                <strong>{g.label}</strong>
                <div className="muted">{g.section}</div>
              </div>
            ))}
          </div>

          <div className="section-title">Files on this browser</div>
          <div className="list">
            {cases.map((c) => (
              <button key={c.id} className="secondary" onClick={() => {
                setActiveId(c.id);
                setForm({
                  name: c.name || "",
                  country: c.country || "",
                  lei: c.lei || "",
                  role: c.role || "buyer",
                  value: c.value || "",
                  notes: c.notes || "",
                  answers: c.answers || {},
                });
                const url = new URL(window.location.href);
                url.searchParams.set("id", c.id);
                window.history.replaceState({}, "", url);
              }}>
                {c.name || c.id} · {c.score ?? "—"}
              </button>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
