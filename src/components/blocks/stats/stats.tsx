import { HeaderSection } from '@/components/layout/header-section';
import { useTranslations } from 'next-intl';

export default function StatsSection() {
  const t = useTranslations('HomePage.stats');

  return (
    <section id="stats" className="px-4 py-16">
      <div className="mx-auto max-w-5xl px-6 space-y-8 md:space-y-16">
        <HeaderSection
          title="Wplace & Pixel Art by the Numbers"
          subtitle=""
          subtitleAs="h2"
          description="Join thousands of artists creating amazing pixel art for the world's largest collaborative canvas. Our converter powers the creative community on Wplace.live."
          descriptionAs="p"
        />

        <div className="grid gap-12 divide-y-0 *:text-center md:grid-cols-4 md:gap-2 md:divide-x">
          <div className="space-y-4">
            <div className="text-5xl font-bold text-primary">4 Trillion</div>
            <p className="text-muted-foreground">Total Pixels on Wplace.live</p>
            <div className="text-xs text-blue-600">
              Million times bigger than r/place
            </div>
          </div>
          <div className="space-y-4">
            <div className="text-5xl font-bold text-primary">64</div>
            <p className="text-muted-foreground">Official Color Palette</p>
            <div className="text-xs text-green-600">Free & Premium colors</div>
          </div>
          <div className="space-y-4">
            <div className="text-5xl font-bold text-primary">30s</div>
            <p className="text-muted-foreground">Pixel Placement Cooldown</p>
            <div className="text-xs text-orange-600">
              Same as original r/place
            </div>
          </div>
          <div className="space-y-4">
            <div className="text-5xl font-bold text-primary">1000+</div>
            <p className="text-muted-foreground">Images Converted Daily</p>
            <div className="text-xs text-purple-600">Growing community</div>
          </div>
        </div>
      </div>
    </section>
  );
}
