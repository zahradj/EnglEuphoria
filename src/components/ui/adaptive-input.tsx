import * as React from "react";
import { cn } from "@/lib/utils";
import { useDeviceCapabilities } from "@/hooks/useDeviceCapabilities";

export interface AdaptiveInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  preventZoom?: boolean;
}

const AdaptiveInput = React.forwardRef<HTMLInputElement, AdaptiveInputProps>(
  ({ className, type, preventZoom = true, ...props }, ref) => {
    const { capabilities } = useDeviceCapabilities();

    // Prevent zoom on iOS devices when focusing inputs
    const inputProps = capabilities.isIOS && preventZoom 
      ? {
          ...props,
          style: {
            fontSize: '16px', // Prevents zoom on iOS
            ...props.style
          }
        }
      : props;

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          // Touch-friendly sizing on mobile
          capabilities.isMobile && "min-h-[44px]",
          className
        )}
        ref={ref}
        {...inputProps}
      />
    );
  }
);

AdaptiveInput.displayName = "AdaptiveInput";

export { AdaptiveInput };