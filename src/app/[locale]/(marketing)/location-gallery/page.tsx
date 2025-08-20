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
    title: 'Pixel Art Location Gallery - Explore Creations',
    description:
      'Discover amazing pixel art creations from different locations on Wplace.live. Browse, explore and get inspired by community artwork.',
    canonicalUrl: getUrlWithLocale('/location-gallery', locale),
  });
}

interface LocationGalleryPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function LocationGalleryPage(
  props: LocationGalleryPageProps
) {
  const params = await props.params;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          Pixel Art Location Gallery - Explore Creations
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Coming Soon...
        </p>
        <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"></div>
      </div>
    </div>
  );
}
