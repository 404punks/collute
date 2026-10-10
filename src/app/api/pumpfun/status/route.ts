import { pumpStatus, currentDataMode } from "@/lib/pumpfun/policy";
import { json } from "@/lib/http";

export async function GET() {
  return json(pumpStatus(currentDataMode()));
}
