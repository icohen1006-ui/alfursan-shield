import { checkVat } from "../../../lib/live";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const vat = (new URL(req.url).searchParams.get("vat") || "").replace(/\s+/g, "").toUpperCase();
  const country = vat.slice(0, 2);
  const number = vat.slice(2);
  if (!/^[A-Z]{2}[A-Z0-9]{8,12}$/.test(vat)) {
    return Response.json({ error: "Use an EU VAT number such as DE123456789 or NL123456789B01." }, { status: 400 });
  }
  const res = await checkVat(country, number);
  return Response.json({
    checkedAt: new Date().toISOString(),
    source: "EU VIES",
    live: res.ok,
    status: res.status,
    input: vat,
    result: res.data,
    error: res.error || null,
  });
}
