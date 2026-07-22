import React from 'react';
import { AcademyHubProvider } from './HubGuard';
import ProfileAvatar from './ProfileAvatar';
import CoinBalance from './CoinBalance';

/**
 * <AcademyWorkspace /> — the parent shell for every Academy-hub student
 * surface. Provides:
 *   - AcademyHubProvider context (mascot guard short-circuits Pip)
 *   - Top bar with hub wordmark, ProfileAvatar, CoinBalance, optional XP slot
 *   - Optional split-pane body via <AcademyWorkspace.Static> / <Interactive>
 *   - Optional sticky footer for Prev/Next navigation
 */

interface AcademyWorkspaceProps {
  children?: React.ReactNode;
  xpSlot?: React.ReactNode;
  hideTopBar?: boolean;
  title?: string;
  subtitle?: string;
  topBarSlot?: React.ReactNode;
  footer?: React.ReactNode;
  /** `page` = scrollable, sticky static pane. `classroom` = fullscreen, non-sticky. */
  variant?: 'page' | 'classroom';
}

type StaticProps = { children: React.ReactNode; sticky?: boolean };
function Static({ children, sticky = true }: StaticProps) {
  return (
    <aside
      data-pane="static"
      className={
        'border-border bg-card/40 lg:border-r ' +
        (sticky ? 'lg:sticky lg:top-16 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto' : '')
      }
    >
      <div className="p-4 lg:p-6">{children}</div>
    </aside>
  );
}

function Interactive({ children }: { children: React.ReactNode }) {
  return (
    <section data-pane="interactive" className="min-h-[60vh]">
      <div className="p-4 lg:p-6">{children}</div>
    </section>
  );
}

function AcademyWorkspace({
  children,
  xpSlot,
  hideTopBar = false,
  title = 'Academy',
  subtitle,
  topBarSlot,
  footer,
  variant = 'page',
}: AcademyWorkspaceProps) {
  const childArray = React.Children.toArray(children);
  const staticPane = childArray.find(
    (c): c is React.ReactElement => React.isValidElement(c) && c.type === Static,
  );
  const interactivePane = childArray.find(
    (c): c is React.ReactElement => React.isValidElement(c) && c.type === Interactive,
  );
  const useSplit = Boolean(staticPane && interactivePane);
  const isClassroom = variant === 'classroom';

  return (
    <AcademyHubProvider>
      <div
        data-hub="academy"
        className={
          'academy-workspace bg-background text-foreground ' +
          (isClassroom ? 'flex min-h-dvh flex-col' : 'min-h-screen')
        }
      >
        {!hideTopBar && (
          <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
              <div className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600" aria-hidden="true" />
                <div className="leading-tight">
                  <div className="text-sm font-semibold tracking-tight">{title}</div>
                  {subtitle && (
                    <div className="text-[11px] text-muted-foreground">{subtitle}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {xpSlot}
                <CoinBalance />
                <ProfileAvatar size="md" />
              </div>
            </div>
            {topBarSlot && (
              <div className="mx-auto max-w-7xl px-4 pb-3 lg:px-6">{topBarSlot}</div>
            )}
          </header>
        )}

        {useSplit ? (
          <main
            data-app-main
            className={
              'mx-auto grid w-full max-w-7xl grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] ' +
              (isClassroom ? 'flex-1 overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+112px)]' : '')
            }
          >
            {staticPane && React.cloneElement(staticPane as React.ReactElement<StaticProps>, { sticky: !isClassroom })}
            {interactivePane}
          </main>
        ) : (
          <main
            data-app-main
            className={
              'mx-auto w-full max-w-7xl ' +
              (isClassroom ? 'flex-1 overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+112px)]' : '')
            }
          >
            {children}
          </main>
        )}

        {footer && (
          <footer className="sticky bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur">
            <div className="mx-auto max-w-7xl px-4 py-3 lg:px-6">{footer}</div>
          </footer>
        )}
      </div>
    </AcademyHubProvider>
  );
}

AcademyWorkspace.Static = Static;
AcademyWorkspace.Interactive = Interactive;

export default AcademyWorkspace;
