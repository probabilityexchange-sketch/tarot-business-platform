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
    duration: "50 Minutes",
    price: "$250",
    description:
      "A comprehensive psychological exploration. We use the tarot archetypes to dismantle current life narratives and rebuild them with agency and insight.",
    features: [
      "In-depth psychological mapping",
      "Video recording of the session",
      "Post-session integration PDF",
      "Private follow-up messaging",
    ],
  },
  {
    id: "shadow-reading",
    title: "Shadow Work Intensive",
    duration: "90 Minutes",
    price: "$450",
    description:
      "Our most intensive offering. Specifically designed for those in transition, using Jungian concepts and tarot to uncover the hidden parts of the self.",
    features: [
      "Jungian shadow work focus",
      "Extended archetypal analysis",
      "Guided reflective exercises",
      "Priority scheduling",
    ],
  },
];

export function getOfferingById(id: string) {
  return readingsOfferings.find((offering) => offering.id === id);
}

