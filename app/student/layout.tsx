import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { DashboardShell } from "@/components/DashboardShell";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "STUDENT") {
    redirect("/login");
  }

  return (
    <DashboardShell role="STUDENT" name={session.user.name ?? "Student"}>
      {children}
    </DashboardShell>
  );
}
