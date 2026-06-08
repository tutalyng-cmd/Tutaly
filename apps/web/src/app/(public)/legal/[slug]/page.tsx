import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { serverFetch } from '@/lib/server-fetch';

interface LegalPage {
  title: string;
  slug: string;
  content: string;
  updatedAt: string;
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;

  try {
    const data = await serverFetch<LegalPage>(`legal/${slug}`, { cache: 'no-store' });
    return {
      title: data.title,
      description: `Read the ${data.title} for Tutaly.`,
    };
  } catch (error) {
    return {
      title: 'Legal',
    };
  }
}

export default async function LegalPageDynamic(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;

  let pageData: LegalPage | null = null;
  try {
    pageData = await serverFetch<LegalPage>(`legal/${slug}`, { cache: 'no-store' });
  } catch (error) {
    console.error(`Failed to load legal page: ${slug}`, error);
  }

  if (!pageData) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 sm:px-10 py-10 border-b border-gray-100 bg-gray-50/50 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{pageData.title}</h1>
          <p className="text-gray-500 text-sm">
            Last updated: {new Date(pageData.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="px-6 sm:px-10 py-10 prose prose-teal max-w-none dark:prose-invert">
          <div dangerouslySetInnerHTML={{ __html: pageData.content }} />
        </div>
      </div>
    </div>
  );
}
