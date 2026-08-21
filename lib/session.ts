import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireRole(roles: string[]) {
  const session = await getSession();
  if (!session?.user || !roles.includes(session.user.role)) {
    throw new Error("Not authorized");
  }
  return session;
}
