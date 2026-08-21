import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { DashboardShell } from "@/components/DashboardShell";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "STAFF") {
    redirect("/login");
  }

  return (
    <DashboardShell role="STAFF" name={session.user.name ?? "Staff"}>
      {children}
    </DashboardShell>
  );
}
