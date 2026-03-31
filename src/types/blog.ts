export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  coverImageUrl: string;
  status: "draft" | "published";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
