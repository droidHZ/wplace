import { constructMetadata } from '@/lib/metadata';
import { getUrlWithLocale } from '@/lib/urls/urls';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;

  return constructMetadata({
    title: 'Wplace Overlay Tool - Enhanced Canvas Experience',
    description: 'Advanced overlay tool for Wplace.live canvas. Get precise pixel placement guides, grids, and templates for better collaborative art.',
    canonicalUrl: getUrlWithLocale('/wplace-overlay', locale),
  });
}

interface WplaceOverlayPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function WplaceOverlayPage(props: WplaceOverlayPageProps) {
  const params = await props.params;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          Wplace Overlay Tool - Enhanced Canvas Experience
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Coming Soon...
        </p>
        <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"></div>
      </div>
    </div>
  );
}