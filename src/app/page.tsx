import React from "react";
import HomePageClient from "@/components/HomePageClient";
import { getAllPosts } from "@/lib/posts";

export default function HomePage() {
  const posts = getAllPosts();

  return <HomePageClient posts={posts} />;
}
