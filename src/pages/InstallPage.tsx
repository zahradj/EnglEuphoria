import React, { useEffect, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Share, Plus, Download, ArrowLeft, Check, Smartphone, Monitor, Maximize2, WifiOff, Store, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePWA } from '@/hooks/usePWA';

/** The round colourful "e" logo, transparent background (no tile behind it). */
const MARK_SRC = '/brand/engleuphoria-logo-512.png';

type Platform = 'ios' | 'android' | 'desktop';

const detectPlatform = (): Platform => {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/android/.test(ua)) return 'android';
  return 'desktop';
};

const B = <strong className="font-semibold text-foreground" />;
const iconCls = 'inline h-4 w-4 align-text-bottom text-primary';

/** One numbered step: a number on the start side joined to the next step by a line, then the instruction. */
const Step: React.FC<{ n: number; last?: boolean; children: React.ReactNode }> = ({ n, last, children }) => {
  const { t } = useTranslation();
  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {!last && <span className="absolute start-[19px] top-10 bottom-0 w-px bg-border" aria-hidden />}
      <span
        className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground shadow-sm"
        aria-label={t('st.inst.stepN', { n, defaultValue: 'Step {{n}}' })}
      >
        {n}
      </span>
      <p className="pt-1.5 text-[15px] leading-relaxed text-muted-foreground">{children}</p>
    </li>
  );
};

const InstallPage: React.FC = () => {
  const { t } = useTranslation();
  const [platform, setPlatform] = useState<Platform>('desktop');
  const { capabilities, installApp } = usePWA();

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  const benefits = [
    { icon: <Maximize2 className="h-4 w-4" />, text: t('st.inst.b1', 'Opens full-screen, like a real app') },
    { icon: <WifiOff className="h-4 w-4" />, text: t('st.inst.b2', 'Saved lessons work offline') },
    { icon: <Store className="h-4 w-4" />, text: t('st.inst.b3', 'No app store needed') },
  ];

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background px-4 pb-16 pt-6">
      {/* soft brand glow behind the hero */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(60%_80%_at_50%_0%,hsl(var(--primary)/0.14),transparent_70%)]" />
      <div aria-hidden className="pointer-events-none absolute -top-24 start-[-80px] h-64 w-64 rounded-full bg-orange-400/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -top-20 end-[-80px] h-64 w-64 rounded-full bg-emerald-400/15 blur-3xl" />

      <div className="relative mx-auto max-w-2xl">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t('st.inst.back', 'Back to Engleuphoria')}
        </Link>

        {/* Hero */}
        <header className="text-center">
          <div className="mx-auto mb-5 flex w-fit flex-col items-center gap-2">
            {/* what it will look like on the home screen */}
            <img src={MARK_SRC} alt="Engleuphoria" width={112} height={112} className="h-28 w-28 drop-shadow-[0_12px_20px_hsl(var(--primary)/0.30)]" />
            <span className="text-xs font-medium text-muted-foreground">Engleuphoria</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{t('st.inst.title', 'Download the App')}</h1>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
            {t('st.inst.desc', 'Add Engleuphoria to your home screen for the fastest, most app-like experience. Works offline for cached lessons. No app store required.')}
          </p>
          <ul className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {benefits.map((b) => (
              <li key={b.text} className="inline-flex items-center gap-2 rounded-full border bg-card/80 px-3.5 py-1.5 text-sm text-foreground shadow-sm backdrop-blur">
                <span className="text-primary" aria-hidden>{b.icon}</span>
                {b.text}
              </li>
            ))}
          </ul>
        </header>

        {/* Status / one-tap install */}
        {capabilities.isInstalled && (
          <div className="mt-8 flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white"><Check className="h-5 w-5" /></span>
            <p className="text-sm font-medium">{t('st.inst.installed', 'Engleuphoria is already installed on this device.')}</p>
          </div>
        )}
        {capabilities.isInstallable && !capabilities.isInstalled && (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-primary/40 bg-primary/5 p-5">
            <div className="min-w-0">
              <p className="font-semibold">{t('st.inst.oneTap', 'One-tap install available')}</p>
              <p className="text-sm text-muted-foreground">{t('st.inst.direct', 'Your browser supports direct install.')}</p>
            </div>
            <Button size="lg" onClick={() => void installApp()} className="gap-2">
              <Download className="h-5 w-5" /> {t('st.inst.install', 'Install')}
            </Button>
          </div>
        )}

        {/* Steps for the visitor's own device */}
        <section className="mt-10" aria-label={t('st.inst.pick', 'Choose your device')}>
          <Tabs key={platform} defaultValue={platform}>
            <TabsList className="grid h-auto w-full grid-cols-3 gap-1 rounded-2xl bg-muted/70 p-1.5">
              <TabsTrigger value="ios" className="gap-2 rounded-xl py-2.5 data-[state=active]:shadow-sm">
                <Smartphone className="h-4 w-4" /> {t('st.inst.tabIos', 'iPhone & iPad')}
              </TabsTrigger>
              <TabsTrigger value="android" className="gap-2 rounded-xl py-2.5 data-[state=active]:shadow-sm">
                <Smartphone className="h-4 w-4" /> {t('st.inst.tabAndroid', 'Android')}
              </TabsTrigger>
              <TabsTrigger value="desktop" className="gap-2 rounded-xl py-2.5 data-[state=active]:shadow-sm">
                <Monitor className="h-4 w-4" /> {t('st.inst.tabDesktop', 'Computer')}
              </TabsTrigger>
            </TabsList>

            <div className="mt-5 rounded-3xl border bg-card p-6 shadow-sm md:p-8">
              <TabsContent value="ios" className="mt-0">
                <ol>
                  <Step n={1}>
                    <Trans i18nKey="st.inst.ios1" defaults="Open <b>engleuphoria.com</b> in <b>Safari</b> (it will not work in in-app browsers like Instagram or Gmail)." components={{ b: B }} />
                  </Step>
                  <Step n={2}>
                    <Trans i18nKey="st.inst.ios2" defaults="Tap the <icon/> <b>Share</b> button at the bottom of the screen." components={{ icon: <Share className={iconCls} />, b: B }} />
                  </Step>
                  <Step n={3} last>
                    <Trans i18nKey="st.inst.ios3" defaults="Scroll and tap <icon/> <b>Add to Home Screen</b>, then confirm with <b>Add</b>." components={{ icon: <Plus className={iconCls} />, b: B }} />
                  </Step>
                </ol>
              </TabsContent>

              <TabsContent value="android" className="mt-0">
                <ol>
                  <Step n={1}>
                    <Trans i18nKey="st.inst.and1" defaults="Open <b>engleuphoria.com</b> in <b>Chrome</b>." components={{ b: B }} />
                  </Step>
                  <Step n={2}>
                    <Trans i18nKey="st.inst.and2" defaults="Tap the <b>⋮ menu</b> in the top corner." components={{ b: B }} />
                  </Step>
                  <Step n={3} last>
                    <Trans i18nKey="st.inst.and3" defaults="Tap <b>Install app</b> or <b>Add to Home screen</b>, then confirm." components={{ b: B }} />
                  </Step>
                </ol>
              </TabsContent>

              <TabsContent value="desktop" className="mt-0">
                <ol>
                  <Step n={1}>
                    <Trans i18nKey="st.inst.desk1" defaults="Open <b>engleuphoria.com</b> in <b>Chrome</b> or <b>Edge</b>." components={{ b: B }} />
                  </Step>
                  <Step n={2}>
                    <Trans i18nKey="st.inst.desk2" defaults="Click the <icon/> <b>Install</b> icon at the end of the address bar, then confirm." components={{ icon: <Download className={iconCls} />, b: B }} />
                  </Step>
                  <Step n={3} last>
                    <Trans i18nKey="st.inst.desk3" defaults="Don't see it? Open the browser menu <icon/> and choose <b>Install Engleuphoria</b>." components={{ icon: <MoreVertical className={iconCls} />, b: B }} />
                  </Step>
                </ol>
              </TabsContent>
            </div>
          </Tabs>
        </section>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          {t('st.inst.footer', 'Once installed, launch Engleuphoria from your home screen — it will open full-screen, just like a native app.')}
        </p>
      </div>
    </div>
  );
};

export default InstallPage;
