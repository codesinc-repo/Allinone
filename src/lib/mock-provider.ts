// Mocks a payment aggregator. The SoW notes real integrations need provider
// approval — the demo returns deterministic statuses so flows are testable.

export type MockProviderResult = {
  status: "SUCCESS" | "PENDING" | "FAILED";
  providerRef: string;
  message: string;
};

export function submitMockTransaction(args: {
  type: string;
  amount: number;
  reference: string;
}): MockProviderResult {
  const seed = (args.reference + args.amount).length;
  const providerRef = `MOCK-${args.type.slice(0, 3)}-${Date.now().toString(36).toUpperCase()}`;

  if (args.amount <= 0) {
    return {
      status: "FAILED",
      providerRef,
      message: "Amount must be greater than zero.",
    };
  }
  if (/0000$/.test(args.reference)) {
    return {
      status: "FAILED",
      providerRef,
      message: "Mock provider rejected: invalid reference ending in 0000.",
    };
  }
  if (seed % 7 === 0) {
    return {
      status: "PENDING",
      providerRef,
      message: "Submitted; awaiting provider confirmation.",
    };
  }
  return {
    status: "SUCCESS",
    providerRef,
    message: "Transaction completed by mock provider.",
  };
}

export function fetchMockBill(args: {
  type: string;
  reference: string;
}): { amount: number; dueDate: string; billerName: string } | null {
  if (/^0+$/.test(args.reference)) return null;
  const base = args.reference
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const amount = 250 + (base % 20) * 125;
  const due = new Date();
  due.setDate(due.getDate() + 7 + (base % 14));
  return {
    amount,
    dueDate: due.toISOString().slice(0, 10),
    billerName:
      args.type === "ELECTRICITY"
        ? "State Electricity Board"
        : args.type === "LOAN"
          ? "Demo Lender Pvt Ltd"
          : "Demo Biller",
  };
}

export function lookupMockChallan(vehicleNumber: string):
  | { challanNumber: string; amount: number; description: string }[]
  | null {
  if (!/^[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{1,4}$/i.test(vehicleNumber.replace(/\s/g, ""))) {
    return null;
  }
  const seed = vehicleNumber.length;
  if (seed % 3 === 0) return [];
  const count = (seed % 2) + 1;
  return Array.from({ length: count }, (_, i) => ({
    challanNumber: `CH${Date.now().toString().slice(-6)}${i}`,
    amount: 300 + (seed % 5) * 200,
    description:
      i === 0 ? "Signal violation" : "Improper parking in no-parking zone",
  }));
}
