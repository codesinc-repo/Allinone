import { prisma } from "@/lib/db";
import { PageHeading } from "@/components/Shell";
import { OPERATOR_TYPES } from "@/lib/constants";
import { revalidatePath } from "next/cache";

async function createOperator(formData: FormData) {
  "use server";
  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const type = String(formData.get("type") ?? "MOBILE");
  if (!name || !code) return;
  await prisma.operator.create({ data: { name, code, type, active: true } });
  revalidatePath("/admin/operators");
}

async function toggleActive(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  const o = await prisma.operator.findUnique({ where: { id } });
  if (!o) return;
  await prisma.operator.update({ where: { id }, data: { active: !o.active } });
  revalidatePath("/admin/operators");
}

async function deleteOperator(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  await prisma.operator.delete({ where: { id } });
  revalidatePath("/admin/operators");
}

export default async function AdminOperators() {
  const operators = await prisma.operator.findMany({ orderBy: [{ type: "asc" }, { name: "asc" }] });
  return (
    <div className="space-y-5">
      <PageHeading title="Operators / Billers" sub="Edit the list of operators users can pick from recharge forms." />
      <form action={createOperator} className="card grid gap-3 p-4 sm:grid-cols-4">
        <input name="name" required className="input" placeholder="Operator name" />
        <input name="code" required className="input" placeholder="Short code" />
        <select name="type" className="input" defaultValue="MOBILE">
          {OPERATOR_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button className="btn-primary">Add operator</button>
      </form>

      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="p-3">Name</th>
              <th className="p-3">Code</th>
              <th className="p-3">Type</th>
              <th className="p-3">Active</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {operators.map((o) => (
              <tr key={o.id} className="border-b last:border-0">
                <td className="p-3 font-medium">{o.name}</td>
                <td className="p-3 font-mono text-xs">{o.code}</td>
                <td className="p-3">{o.type}</td>
                <td className="p-3">
                  <form action={toggleActive}>
                    <input type="hidden" name="id" value={o.id} />
                    <button className={`badge ${o.active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-50"}`}>
                      {o.active ? "Active" : "Disabled"}
                    </button>
                  </form>
                </td>
                <td className="p-3">
                  <form action={deleteOperator}>
                    <input type="hidden" name="id" value={o.id} />
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
