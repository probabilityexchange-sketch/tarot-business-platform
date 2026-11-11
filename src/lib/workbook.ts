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
  price: "$49",
  priceCents: 4900,
  description:
    "A downloadable workbook of teaching pages and guided writing exercises for working through a question or a decision at your own pace.",
  features: [
    "Teaching pages and guided writing exercises, plus Kali’s personal essay",
    "Eight sections on intuition, fear, projection, relationships and inner authority",
    "A 15-day guided writing journal to put discernment into practice",
    "A 51-page PDF with a designed cover, clickable contents and space for writing",
  ],
};

// Sales stay off until the owner approves the final PDF and sets
// WORKBOOK_SALES_ENABLED="true" in apphosting.yaml (BUILD + RUNTIME).
export function isWorkbookSaleEnabled(): boolean {
  return process.env.WORKBOOK_SALES_ENABLED === "true";
}

// Honor verified Stripe purchases made at the previous $39 price.
// New Checkout Sessions always use workbookProduct.priceCents.
export function isValidWorkbookPurchaseAmount(amount: number | null): boolean {
  return amount === workbookProduct.priceCents || amount === 3900;
}
