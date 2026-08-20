import { cookies } from "next/headers";
import { SESSION_COOKIE } from "./config";

export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}
