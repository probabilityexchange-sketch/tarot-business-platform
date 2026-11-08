export type GiftTier = {
  id: string;
  title: string;
  duration: string;
  price: string;
  priceCents: number;
  offeringId: string;
  description: string;
};

export const giftTiers: GiftTier[] = [
  {
    id: "gift-60",
    title: "The Narrative Deep-Dive — Gift",
    duration: "60 Minutes",
    price: "$250",
    priceCents: 25000,
    offeringId: "narrative-session",
    description:
      "A gifted reading credit: $250 toward any private online reading — the full price of a 60-minute session. The recipient chooses their own time.",
  },
  {
    id: "gift-90",
    title: "Shadow Work Intensive — Gift",
    duration: "90 Minutes",
    price: "$450",
    priceCents: 45000,
    offeringId: "shadow-reading",
    description:
      "A gifted reading credit: $450 toward any private online reading — the full price of any session. The recipient chooses their own time.",
  },
];

export function getGiftTierById(id: string) {
  return giftTiers.find((tier) => tier.id === id);
}
