import { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import rawData from "../../public/data/art-sample.json";
import { Exhibition } from "@/types/art";

export const dynamic = "force-static";

const SITE_URL = "https://nadriai.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const exhibitions: Exhibition[] = rawData as Exhibition[];

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/exhibitions/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/markets/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/libraries/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/ai-trip/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/intro/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/daangn/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/shorts/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/blog/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const exhibitionPages: MetadataRoute.Sitemap = exhibitions.map((exhibition) => ({
    url: `${SITE_URL}/events/${exhibition.id}/`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}/`,
    lastModified: post.date ? new Date(post.date) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...exhibitionPages, ...blogPages];
}
