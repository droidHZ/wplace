import { Button } from '@/components/ui/button';
import { LocaleLink } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function CallToActionSection() {
  const t = useTranslations('HomePage.calltoaction');

  return (
    <section className="py-24 w-full bg-muted">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-balance text-4xl font-semibold lg:text-5xl">
            {t('title')}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('description')}
          </p>

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <LocaleLink href="/#hero">
                <span>{t('primaryButton')}</span>
              </LocaleLink>
            </Button>

            <Button asChild size="lg" variant="outline" className="border-border text-foreground hover:bg-muted">
              <a href="https://wplace.live" target="_blank" rel="noopener noreferrer">
                <span>{t('secondaryButton')}</span>
              </a>
            </Button>
          </div>

          <div className="mt-8 flex justify-center items-center gap-6 text-sm text-muted-foreground">
            {(t.raw('features') as string[]).map((feature, index) => (
              <span key={index} className="flex items-center gap-1">
                {index === 0 && '✅'} {index === 1 && '🎯'} {index === 2 && '⚡'} {feature}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
