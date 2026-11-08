export type WorkbookProduct = {
  id: string;
  title: string;
  price: string;
  priceCents: number;
  description: string;
  features: string[];
};

export const workbookProduct: WorkbookProduct = {
  id: "discernment-workbook",
  title: "Learning to Listen: A Discernment Workbook",
  price: "$39",
  priceCents: 3900,
  description:
    "A downloadable workbook of teaching pages and guided writing exercises for working through a question or a decision at your own pace.",
  features: [
    "Teaching pages and guided writing exercises",
    "The four lenses: fear, ego, desire and intuition",
    "A decision lab and a 30-day practice plan",
    "Fillable in compatible PDF readers, and printable",
  ],
};

// Sales stay off until the owner approves the final PDF and sets
// WORKBOOK_SALES_ENABLED="true" in apphosting.yaml (BUILD + RUNTIME).
export function isWorkbookSaleEnabled(): boolean {
  return process.env.WORKBOOK_SALES_ENABLED === "true";
}
