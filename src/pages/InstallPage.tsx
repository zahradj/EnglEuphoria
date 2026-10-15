import React, { useEffect, useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Share, Plus, Download, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePWA } from '@/hooks/usePWA';
import { Logo } from '@/components/Logo';
import AnimatedLogo from '@/components/ui/AnimatedLogo';

type Platform = 'ios' | 'android' | 'desktop';

const detectPlatform = (): Platform => {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/android/.test(ua)) return 'android';
  return 'desktop';
};

const InstallPage: React.FC = () => {
  const { t } = useTranslation();
  const [platform, setPlatform] = useState<Platform>('desktop');
  const { capabilities, installApp } = usePWA();

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  const handleNativeInstall = async () => {
    await installApp();
  };

  return (
    <div className="min-h-dvh bg-gradient-to-br from-background via-background to-primary/5 px-4 py-8">
      <div className="max-w-xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {t('st.inst.back', 'Back to Engleuphoria')}
        </Link>

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="xlarge" />
          </div>
          <div className="relative inline-flex p-6 rounded-3xl bg-gradient-to-br from-orange-500/20 via-purple-500/20 to-emerald-500/20 backdrop-blur-xl mb-6 ring-1 ring-border">
            <AnimatedLogo size="lg" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{t('st.inst.title', 'Download the App')}</h1>
          <p className="text-muted-foreground">
            {t('st.inst.desc', 'Add Engleuphoria to your home screen for the fastest, most app-like experience. Works offline for cached lessons. No app store required.')}
          </p>
        </div>

        {capabilities.isInstalled && (
          <Card className="mb-6 border-emerald-500/40 bg-emerald-500/5">
            <CardContent className="p-4 flex items-center gap-3">
              <Check className="w-5 h-5 text-emerald-600" />
              <p className="text-sm font-medium">{t('st.inst.installed', 'Engleuphoria is already installed on this device.')}</p>
            </CardContent>
          </Card>
        )}

        {capabilities.isInstallable && !capabilities.isInstalled && (
          <Card className="mb-6 border-primary/40 bg-primary/5">
            <CardContent className="p-5 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold mb-0.5">{t('st.inst.oneTap', 'One-tap install available')}</p>
                <p className="text-sm text-muted-foreground">{t('st.inst.direct', 'Your browser supports direct install.')}</p>
              </div>
              <Button onClick={handleNativeInstall} className="gap-2">
                <Download className="w-4 h-4" /> {t('st.inst.install', 'Install')}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* iOS instructions */}
        {(platform === 'ios' || platform === 'desktop') && (
          <Card className="mb-4">
            <CardContent className="p-5">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-foreground text-background text-xs font-bold">
                  iOS
                </span>
                iPhone & iPad (Safari)
              </h2>
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <span>
                    <Trans i18nKey="st.inst.ios1" defaults="Open <b>engleuphoria.com</b> in <b>Safari</b> (it will not work in in-app browsers like Instagram or Gmail)." components={{ b: <strong /> }} />
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <span className="flex items-center gap-1.5 flex-wrap">
                    <Trans i18nKey="st.inst.ios2" defaults="Tap the <icon/> <b>Share</b> button at the bottom of the screen." components={{ icon: <Share className="inline w-4 h-4" />, b: <strong /> }} />
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <span className="flex items-center gap-1.5 flex-wrap">
                    <Trans i18nKey="st.inst.ios3" defaults="Scroll and tap <icon/> <b>Add to Home Screen</b>, then confirm with <b>Add</b>." components={{ icon: <Plus className="inline w-4 h-4" />, b: <strong /> }} />
                  </span>
                </li>
              </ol>
            </CardContent>
          </Card>
        )}

        {/* Android instructions */}
        {(platform === 'android' || platform === 'desktop') && (
          <Card className="mb-4">
            <CardContent className="p-5">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold">
                  ▶
                </span>
                Android (Chrome)
              </h2>
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <span>
                    <Trans i18nKey="st.inst.and1" defaults="Open <b>engleuphoria.com</b> in <b>Chrome</b>." components={{ b: <strong /> }} />
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <span>
                    <Trans i18nKey="st.inst.and2" defaults="Tap the <b>⋮ menu</b> in the top corner." components={{ b: <strong /> }} />
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <span>
                    <Trans i18nKey="st.inst.and3" defaults="Tap <b>Install app</b> or <b>Add to Home screen</b>, then confirm." components={{ b: <strong /> }} />
                  </span>
                </li>
              </ol>
            </CardContent>
          </Card>
        )}

        <p className="text-xs text-center text-muted-foreground mt-6">
          {t('st.inst.footer', 'Once installed, launch Engleuphoria from your home screen — it will open full-screen, just like a native app.')}
        </p>
      </div>
    </div>
  );
};

export default InstallPage;
