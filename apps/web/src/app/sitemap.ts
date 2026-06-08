import { MetadataRoute } from 'next';
import { serverFetch } from '../lib/server-fetch';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tutaly.ng';

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/jobs`, lastModified: new Date(), changeFrequency: 'always', priority: 0.9 },
    { url: `${baseUrl}/reviews`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/salaries`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/free-job-posting`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/join-community`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ];

  try {
    // We would fetch active jobs, companies, shop items, legal pages here to populate the sitemap dynamically.
    // E.g.
    // const jobsRes = await serverFetch<any>('jobs?limit=1000');
    // const jobRoutes = jobsRes.data.map((job) => ({ url: `${baseUrl}/jobs/${job.id}`, lastModified: new Date(job.updatedAt) }));

    const legalPagesRes = await serverFetch<any[]>('legal-pages').catch(() => []);
    const legalRoutes: MetadataRoute.Sitemap = (legalPagesRes || []).map((page) => ({
      url: `${baseUrl}/legal/${page.slug}`,
      lastModified: new Date(page.updatedAt || new Date()),
      changeFrequency: 'monthly',
      priority: 0.3,
    }));

    return [...staticRoutes, ...legalRoutes];
  } catch (error) {
    console.warn('[Sitemap] Failed to fetch dynamic routes for sitemap', error);
    return staticRoutes;
  }
}
