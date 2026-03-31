import { collection, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, query, where, orderBy, limit, startAfter, DocumentSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import type { BlogPost } from "@/types/blog";

const POSTS_PER_PAGE = 6;

export async function getPublishedPosts(page: number = 1, _lastDoc?: DocumentSnapshot) {
  try {
    const q = page === 1
      ? query(
          collection(db, "blog_posts"),
          where("status", "==", "published"),
          orderBy("publishedAt", "desc"),
          limit(POSTS_PER_PAGE)
        )
      : query(
          collection(db, "blog_posts"),
          where("status", "==", "published"),
          orderBy("publishedAt", "desc"),
          limit(POSTS_PER_PAGE)
        );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as BlogPost));
  } catch (error) {
    console.error("Error fetching published posts:", error);
    return [];
  }
}

export async function getPostBySlug(slug: string) {
  try {
    const q = query(
      collection(db, "blog_posts"),
      where("slug", "==", slug),
      where("status", "==", "published"),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() } as BlogPost;
  } catch (error) {
    console.error("Error fetching post by slug:", error);
    return null;
  }
}

export async function getAllPublishedSlugs() {
  const q = query(
    collection(db, "blog_posts"),
    where("status", "==", "published"),
    orderBy("publishedAt", "desc"),
    limit(1000)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ slug: d.data().slug, lastmod: d.data().publishedAt }));
}

export async function getAdminPosts() {
  const q = query(collection(db, "blog_posts"), orderBy("updatedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as BlogPost));
}

export async function getPostById(id: string) {
  const d = await getDoc(doc(db, "blog_posts", id));
  if (!d.exists()) return null;
  return { id: d.id, ...d.data() } as BlogPost;
}

export async function createPost(data: Omit<BlogPost, "id" | "createdAt" | "updatedAt">) {
  const now = new Date().toISOString();
  return addDoc(collection(db, "blog_posts"), { ...data, createdAt: now, updatedAt: now });
}

export async function updatePost(id: string, data: Partial<BlogPost>) {
  await updateDoc(doc(db, "blog_posts", id), { ...data, updatedAt: new Date().toISOString() });
}

export async function deletePost(id: string) {
  await deleteDoc(doc(db, "blog_posts", id));
}

export async function slugExists(slug: string, excludeId?: string) {
  const q = query(collection(db, "blog_posts"), where("slug", "==", slug));
  const snap = await getDocs(q);
  if (snap.empty) return false;
  if (excludeId && snap.docs[0].id === excludeId) return false;
  return true;
}
