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
  title: "The Art of Discernment",
  price: "$39",
  priceCents: 3900,
  description:
    "A downloadable workbook of teaching pages and guided writing exercises for working through a question or a decision at your own pace.",
  features: [
    "Teaching pages and guided writing exercises, plus Kali’s personal essay",
    "Eight sections on intuition, fear, projection, relationships and inner authority",
    "A 15-day guided writing journal to put discernment into practice",
    "A 49-page PDF to read or print; use a notebook for your responses",
  ],
};

// Sales stay off until the owner approves the final PDF and sets
// WORKBOOK_SALES_ENABLED="true" in apphosting.yaml (BUILD + RUNTIME).
export function isWorkbookSaleEnabled(): boolean {
  return process.env.WORKBOOK_SALES_ENABLED === "true";
}
