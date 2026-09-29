# Fursan Shield

Internal counterpart verification and due diligence desk for **AL FURSAN Ltd**, the Egyptian fruit, vegetable and concentrate exporter.

## What it does

- Live legal-entity search on the **GLEIF LEI golden copy**
- Enrichment from **Wikidata**, **France INSEE** and **Norway Brønnøysund**
- **EU VIES** VAT validation
- One-click rooms into official **OFAC, US CSL, UK OFSI, EU, UN, SECO, World Bank** and **OpenSanctions**
- Deep links to 25+ national company registers and food-safety directories (FDA, RASFF, TRACES, GLOBALG.A.P., BRCGS, SEDEX, Egypt NFSA)
- 27-point produce-trade due diligence file with risk score, decision band and printable case note

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Optional live watchlist API

Set `OPENSANCTIONS_API_KEY` if you subscribe to OpenSanctions. Without it, Shield still opens the live OpenSanctions search portal for every query.

## Important

This desk is an investigator's cockpit. A "clear" score is not a legal opinion, a bank guarantee, or a substitute for licensed KYB vendors (Creditsafe, D&B, Trulioo, Kyckr) on high-value or regulated flows. Use the official portals and keep evidence on the file.
