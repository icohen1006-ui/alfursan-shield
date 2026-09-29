import { getLeiGraph } from "../../../lib/live";
import { jurisdictionRisk } from "../../../lib/catalog";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const lei = (new URL(req.url).searchParams.get("lei") || "").trim().toUpperCase();
  if (!/^[A-Z0-9]{20}$/.test(lei)) {
    return Response.json({ error: "Provide a valid 20-character LEI." }, { status: 400 });
  }
  const detail = await getLeiGraph(lei);
  if (!detail.ok || !detail.company) {
    return Response.json({ error: "LEI not found on GLEIF golden copy." }, { status: 404 });
  }
  return Response.json({
    checkedAt: new Date().toISOString(),
    ...detail,
    jurisdictionRisk: jurisdictionRisk(detail.company.country),
  });
}
