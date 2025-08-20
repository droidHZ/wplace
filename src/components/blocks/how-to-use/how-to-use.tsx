'use client';

import { HeaderSection } from '@/components/layout/header-section';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Upload,
  Settings,
  Eye,
  Download,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function HowToUseSection() {
  const t = useTranslations('HomePage.howToUse');

  const steps = [
    {
      icon: Upload,
      stepKey: 'step1',
    },
    {
      icon: Settings,
      stepKey: 'step2',
    },
    {
      icon: Eye,
      stepKey: 'step3',
    },
    {
      icon: Download,
      stepKey: 'step4',
    },
    {
      icon: ExternalLink,
      stepKey: 'step5',
    },
  ];

  return (
    <section id="how-to-use" className="px-4 py-16 bg-gradient-to-b from-muted/30 to-background">
      <div className="mx-auto max-w-7xl">
        <HeaderSection
          title={t('title')}
          subtitle={t('subtitle')}
          subtitleAs="h2"
          description={t('description')}
          descriptionAs="p"
          titleClassName="uppercase tracking-wider text-gradient_indigo-purple font-semibold font-mono"
          subtitleClassName="text-balance text-3xl lg:text-4xl font-semibold text-foreground"
          descriptionClassName="text-balance text-lg text-muted-foreground max-w-3xl mx-auto"
        />

        <div className="mt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connection Arrow */}
                {index < steps.length - 1 && (
                  <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 text-muted-foreground hidden lg:block">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
                
                <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-sm mx-auto mb-4">
                      {t(`steps.${step.stepKey}.number`)}
                    </div>
                    <step.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {t(`steps.${step.stepKey}.title`)}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t(`steps.${step.stepKey}.description`)}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-primary text-primary-foreground rounded-2xl p-8">
            <h3 className="text-2xl font-semibold mb-4">
              {t('cta.title')}
            </h3>
            <p className="text-primary-foreground/80 mb-6 max-w-2xl mx-auto">
              {t('cta.description')}
            </p>
            <Button 
              size="lg" 
              variant="secondary" 
              className="bg-background text-foreground hover:bg-background/90"
              onClick={() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t('cta.button')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}