import { UserPlus, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  createStaffAction,
  updateStaffAction,
  toggleStaffActiveAction,
} from "@/lib/actions";
import {
  PageHeader,
  SectionCard,
  TableCard,
  StatusBadge,
  MobileCardList,
  MobileCard,
  MobileCardRow,
  MobileCardEmpty,
  TableEmptyRow,
  buttonStyles,
  inputStyles,
  inputStylesSm,
} from "@/components/ui";
import { SmartForm, SubmitButton } from "@/components/SmartForm";
import { ActionButton } from "@/components/ActionButton";

export default async function StaffPage() {
  const staff = await prisma.user.findMany({
    where: { role: "STAFF" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Manage staff"
        description="Create staff accounts and control access."
      />

      <SectionCard title="Add new staff member" icon={UserPlus}>
        <SmartForm
          action={createStaffAction}
          successMessage="Staff member added."
          resetOnSuccess
          className="grid gap-3 sm:grid-cols-3"
        >
          <input
            name="name"
            required
            placeholder="Full name"
            className={inputStyles}
          />
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            className={inputStyles}
          />
          <input
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="Temporary password"
            className={inputStyles}
          />
          <SubmitButton
            pendingLabel="Adding staff member..."
            className={`${buttonStyles.primary} justify-self-start sm:col-span-3`}
          >
            <UserPlus size={16} />
            Add staff member
          </SubmitButton>
        </SmartForm>
      </SectionCard>

      <TableCard>
        {(() => {
          const rows = staff.map((member) => {
            const status = (
              <StatusBadge
                status={member.active ? "ACTIVE" : "DEACTIVATED"}
                label={member.active ? "Active" : "Deactivated"}
              />
            );

            const editForm = (
              <details>
                <summary className="cursor-pointer text-sm font-medium text-blue-400">
                  Edit
                </summary>
                <SmartForm
                  action={updateStaffAction}
                  successMessage="Staff member updated."
                  className="mt-2 flex max-w-xs flex-col gap-2"
                >
                  <input type="hidden" name="id" value={member.id} />
                  <input
                    name="name"
                    defaultValue={member.name}
                    className={inputStylesSm}
                  />
                  <input
                    name="email"
                    type="email"
                    defaultValue={member.email}
                    className={inputStylesSm}
                  />
                  <input
                    name="password"
                    type="password"
                    placeholder="Leave blank to keep password"
                    className={inputStylesSm}
                  />
                  <SubmitButton
                    pendingLabel="Saving..."
                    className={`${buttonStyles.darkSm} self-start`}
                  >
                    Save changes
                  </SubmitButton>
                </SmartForm>
              </details>
            );

            const toggleAction = (
              <ActionButton
                action={toggleStaffActiveAction.bind(
                  null,
                  member.id,
                  !member.active
                )}
                successMessage={
                  member.active
                    ? "Staff member deactivated."
                    : "Staff member reactivated."
                }
                pendingLabel={member.active ? "Deactivating..." : "Reactivating..."}
                className={member.active ? buttonStyles.destructiveSm : buttonStyles.successSm}
              >
                {member.active ? "Deactivate" : "Reactivate"}
              </ActionButton>
            );

            return {
              key: member.id,
              tr: (
                <tr key={member.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 font-medium text-slate-100">
                    {member.name}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{member.email}</td>
                  <td className="px-4 py-3">{status}</td>
                  <td className="px-4 py-3">{editForm}</td>
                  <td className="px-4 py-3 text-right">{toggleAction}</td>
                </tr>
              ),
              card: (
                <MobileCard key={member.id}>
                  <div>
                    <p className="font-medium text-slate-100">{member.name}</p>
                    <p className="text-xs text-slate-400">{member.email}</p>
                  </div>
                  <MobileCardRow label="Status">{status}</MobileCardRow>
                  <div className="border-t border-white/10 pt-2">{editForm}</div>
                  <div className="flex justify-end pt-1">{toggleAction}</div>
                </MobileCard>
              ),
            };
          });

          return (
            <>
              <div className="hidden sm:block">
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="bg-white/[0.03] text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Update</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {rows.map((row) => row.tr)}
                    {staff.length === 0 && (
                      <TableEmptyRow colSpan={5}>
                        No staff members yet.
                      </TableEmptyRow>
                    )}
                  </tbody>
                </table>
              </div>
              <MobileCardList>
                {rows.map((row) => row.card)}
                {staff.length === 0 && (
                  <MobileCardEmpty>
                    <Users size={20} className="mx-auto mb-2 text-slate-500" />
                    No staff members yet.
                  </MobileCardEmpty>
                )}
              </MobileCardList>
            </>
          );
        })()}
      </TableCard>
    </div>
  );
}
