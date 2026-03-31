export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function uniqueSlug(title: string, existsFn: (slug: string) => Promise<boolean>): Promise<string> {
  const baseSlug = generateSlug(title);
  let slug = baseSlug;
  let counter = 1;
  while (await existsFn(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}
