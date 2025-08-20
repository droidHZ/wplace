import CallToActionSection from '@/components/blocks/calltoaction/calltoaction';
import FaqSection from '@/components/blocks/faqs/faqs';
import FeaturesSection from '@/components/blocks/features/features';
import HeroSection from '@/components/blocks/hero/hero';
import HowToUseSection from '@/components/blocks/how-to-use/how-to-use';
import StatsSection from '@/components/blocks/stats/stats';
import TestimonialsSection from '@/components/blocks/testimonials/testimonials';
import { constructMetadata } from '@/lib/metadata';
import { getUrlWithLocale } from '@/lib/urls/urls';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

/**
 * https://next-intl.dev/docs/environments/actions-metadata-route-handlers#metadata-api
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return constructMetadata({
    title: 'Image to Pixel Art - Free Online Converter Tool',
    description:
      'Convert any image to stunning pixel art instantly. Free online tool with official Wplace.live color palette. Drag & drop upload, real-time preview.',
    canonicalUrl: getUrlWithLocale('/image-to-pixel', locale),
  });
}

interface ImageToPixelPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function ImageToPixelPage(props: ImageToPixelPageProps) {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations('HomePage');

  return (
    <>
      <div className="flex flex-col">
        {/* Main converter tool and hero section */}
        <div id="hero">
          <HeroSection />
        </div>

        {/* Key features of the pixel art converter */}
        <div id="features">
          <FeaturesSection />
        </div>

        {/* Step-by-step guide on how to use the converter */}
        <div id="how-to-use">
          <HowToUseSection />
        </div>

        {/* Statistics about Wplace and pixel art conversion */}
        {/* <div id="stats">
          <StatsSection />
        </div> */}

        {/* User testimonials and success stories */}
        <div id="testimonials">
          <TestimonialsSection />
        </div>

        {/* FAQ section for common questions */}
        <div id="faqs">
          <FaqSection />
        </div>

        {/* Final call to action */}
        <div id="call-to-action">
          <CallToActionSection />
        </div>
      </div>
    </>
  );
}
