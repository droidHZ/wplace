'use client';

import Container from '@/components/layout/container';
import { Logo } from '@/components/layout/logo';
import { ModeSwitcherHorizontal } from '@/components/layout/mode-switcher-horizontal';
import { Routes } from '@/routes';
import { LocaleLink } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import type React from 'react';

export function Footer({ className }: React.HTMLAttributes<HTMLElement>) {
  const t = useTranslations();

  const toolLinks = [
    {
      title: 'Image to Pixel',
      href: Routes.ImageToPixel,
      description: 'Convert your images to pixel art'
    },
    {
      title: 'Name Pixel',
      href: Routes.NamePixel,
      description: 'Create pixel art from names'
    },
    {
      title: 'Location Gallery',
      href: Routes.LocationGallery,
      description: 'Browse pixel art by location'
    },
    {
      title: 'Wplace Overlay',
      href: Routes.WplaceOverlay,
      description: 'View overlay tools for pixel art'
    }
  ];

  return (
    <footer className={cn('border-t', className)}>
      <Container className="px-4">
        <div className="grid grid-cols-1 gap-8 py-16 md:grid-cols-3">
          <div className="flex flex-col items-start space-y-4">
            {/* logo and name */}
            <div className="items-center space-x-2 flex">
              <Logo />
              <span className="text-xl font-semibold">
                {t('Metadata.name')}
              </span>
            </div>

            {/* updated tagline for pixel art */}
            <p className="text-muted-foreground text-base">
              Your ultimate platform for creating, converting, and exploring pixel art. Transform images, create art from names, and discover amazing pixel creations from around the world.
            </p>
          </div>

          {/* tool links */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Tools & Features</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {toolLinks.map((tool) => (
                <div key={tool.title}>
                  <LocaleLink
                    href={tool.href}
                    className="block p-4 rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <h4 className="font-medium mb-1">{tool.title}</h4>
                    <p className="text-sm text-muted-foreground">{tool.description}</p>
                  </LocaleLink>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>

      <div className="border-t py-8">
        <Container className="px-4 flex items-center justify-between gap-x-4">
          <span className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} {t('Metadata.name')} All Rights
            Reserved.
          </span>

          <div className="flex items-center gap-x-4">
            {/* <ThemeSelector /> */}
            <ModeSwitcherHorizontal />
          </div>
        </Container>
      </div>
    </footer>
  );
}
