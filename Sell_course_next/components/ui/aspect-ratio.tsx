import React, { ComponentPropsWithoutRef, forwardRef } from "react";
import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";
const AspectRatio = forwardRef<
  React.ElementRef<typeof AspectRatioPrimitive.Root>,
  ComponentPropsWithoutRef<typeof AspectRatioPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AspectRatioPrimitive.Root ref={ref} className={className} {...props} />
));
AspectRatio.displayName = AspectRatioPrimitive.Root.displayName;
export { AspectRatio };
