export type Offering = {
  id: string;
  title: string;
  duration: string;
  price: string;
  description: string;
  features: string[];
};

export const readingsOfferings: Offering[] = [
  {
    id: "narrative-session",
    title: "The Narrative Deep-Dive",
    duration: "60 Minutes",
    price: "$250",
    description:
      "A private tarot reading to explore a question, a decision or the story you’re living. Make space for conversation and spiritual reflection.",
    features: [
      "60-minute private online session",
      "Tarot and conversation",
      "Space for your questions",
    ],
  },
  {
    id: "shadow-reading",
    title: "Shadow Work Intensive",
    duration: "90 Minutes",
    price: "$450",
    description:
      "An extended private reading with time to explore recurring patterns, transitions and the questions that deserve more attention.",
    features: [
      "90-minute private online session",
      "Time for deeper reflection",
      "Tarot and conversation",
    ],
  },
];

export function getOfferingById(id: string) {
  return readingsOfferings.find((offering) => offering.id === id);
}

