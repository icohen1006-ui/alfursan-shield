import { REGISTRIES, SANCTIONS_PLATFORMS, TRADE_PLATFORMS } from "../../lib/catalog";

export const metadata = { title: "Live sources — Fursan Shield" };

export default function SourcesPage() {
  return (
    <main>
      <div className="kicker">Connected platforms</div>
      <h1>Every room the desk can open.</h1>
      <p className="lede">
        Shield does not pretend one vendor owns the world’s registers. It wires official live systems AL FURSAN already
        needs for export: legal identity, sanctions, VAT, and food-safety directories.
      </p>

      <div className="section-title">Always-on APIs inside the product</div>
      <div className="grid">
        <div className="card"><h3>GLEIF</h3><p className="muted">Global LEI golden copy. Name search, record, renewal date and direct parent.</p></div>
        <div className="card"><h3>Wikidata</h3><p className="muted">Public entity graph used to spot official names and descriptions.</p></div>
        <div className="card"><h3>France INSEE</h3><p className="muted">Live SIREN search via recherche-entreprises.api.gouv.fr.</p></div>
        <div className="card"><h3>Norway Brreg</h3><p className="muted">Live Enhetsregisteret when the country filter is NO.</p></div>
        <div className="card"><h3>EU VIES</h3><p className="muted">Official VAT existence check for EU counterparties.</p></div>
        <div className="card"><h3>OpenSanctions</h3><p className="muted">Portal always linked. Inline hits if OPENSANCTIONS_API_KEY is set on the host.</p></div>
      </div>

      <div className="section-title">Sanctions & debarment — live official search</div>
      <table>
        <thead><tr><th>Platform</th><th>Owner</th><th>Status</th></tr></thead>
        <tbody>
          {SANCTIONS_PLATFORMS.map((s) => (
            <tr key={s.id}>
              <td><a href={s.url} target="_blank" rel="noreferrer">{s.name}</a></td>
              <td>{s.owner}</td>
              <td><span className="pill live">Live</span></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="section-title">Company registries</div>
      <table>
        <thead><tr><th>Register</th><th>Country</th><th></th></tr></thead>
        <tbody>
          {REGISTRIES.map((r) => (
            <tr key={r.code + r.name}>
              <td>{r.name}</td>
              <td>{r.country}</td>
              <td><a href={r.url} target="_blank" rel="noreferrer">Open</a></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="section-title">Food & trade fitness</div>
      <table>
        <thead><tr><th>Platform</th><th>Why it matters for fruit & vegetables</th></tr></thead>
        <tbody>
          {TRADE_PLATFORMS.map((t) => (
            <tr key={t.id}>
              <td><a href={t.url} target="_blank" rel="noreferrer">{t.name}</a></td>
              <td>{t.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
