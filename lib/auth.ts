import { NextRequest } from "next/server";
import { verifyToken } from "./jwt";

export function requireAuth(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth) throw new Error("Unauthorized");

  const token = auth.split(" ")[1];
  return verifyToken(token);
}
