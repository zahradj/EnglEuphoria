import React from "react";
import { Monitor } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface DesktopOnlyNoticeProps {
  toolName?: string;
  children?: React.ReactNode;
  /** If true, content is hidden entirely on mobile. If false (default), it's just preceded by a banner. */
  blockOnMobile?: boolean;
}

/**
 * Banner shown on phones for admin/creator tools that are best on desktop.
 */
export const DesktopOnlyNotice: React.FC<DesktopOnlyNoticeProps> = ({
  toolName = "This tool",
  children,
  blockOnMobile = false,
}) => {
  const isMobile = useIsMobile();

  if (!isMobile) return <>{children}</>;

  const banner = (
    <div className="m-4 rounded-xl border border-amber-300/50 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 p-4 flex gap-3 items-start shadow-sm">
      <div className="shrink-0 w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
        <Monitor className="w-5 h-5 text-amber-700 dark:text-amber-300" />
      </div>
      <div className="text-sm">
        <p className="font-semibold text-amber-900 dark:text-amber-100">
          Best experienced on desktop
        </p>
        <p className="text-amber-800/80 dark:text-amber-200/80 mt-1 leading-relaxed">
          {toolName} works best on a larger screen. Open Engleuphoria on your computer
          for the full editing experience.
        </p>
      </div>
    </div>
  );

  if (blockOnMobile) return banner;

  return (
    <>
      {banner}
      {children}
    </>
  );
};

export default DesktopOnlyNotice;
