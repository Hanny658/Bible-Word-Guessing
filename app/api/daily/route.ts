import { getDailyPuzzle } from "@/lib/server/puzzle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(getDailyPuzzle(), {
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}
