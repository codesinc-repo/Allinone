import { prisma } from "@/lib/db";
import { PageHeading } from "@/components/Shell";
import { formatDate } from "@/lib/utils";
import { USER_ROLES } from "@/lib/constants";
import { revalidatePath } from "next/cache";

async function updateRole(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "USER");
  await prisma.user.update({ where: { id }, data: { role } });
  revalidatePath("/admin/users");
}

async function deleteUser(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/users");
}

export default async function AdminUsers({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const users = await prisma.user.findMany({
    where: sp.q
      ? { OR: [{ name: { contains: sp.q } }, { email: { contains: sp.q } }] }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { listings: true, transactions: true, requests: true } },
    },
  });

  return (
    <div className="space-y-5">
      <PageHeading title="Users" sub={`${users.length} accounts`} />
      <form action="/admin/users" className="card flex gap-2 p-3">
        <input name="q" defaultValue={sp.q ?? ""} className="input" placeholder="Search by name or email" />
        <button className="btn-primary">Search</button>
      </form>
      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Activity</th>
              <th className="p-3">Joined</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b last:border-0">
                <td className="p-3 font-medium">{u.name}</td>
                <td className="p-3 text-gray-600">{u.email}</td>
                <td className="p-3">
                  <form action={updateRole} className="flex gap-1">
                    <input type="hidden" name="id" value={u.id} />
                    <select name="role" defaultValue={u.role} className="input !py-1">
                      {USER_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <button className="btn-outline !px-2 !py-1 text-xs">Save</button>
                  </form>
                </td>
                <td className="p-3 text-xs text-gray-500">
                  {u._count.listings}L · {u._count.transactions}T · {u._count.requests}R
                </td>
                <td className="p-3 text-xs text-gray-500">{formatDate(u.createdAt)}</td>
                <td className="p-3">
                  <form action={deleteUser}>
                    <input type="hidden" name="id" value={u.id} />
                    <button className="btn-danger !px-2 !py-1 text-xs">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
