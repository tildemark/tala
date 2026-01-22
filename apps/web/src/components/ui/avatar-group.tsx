'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type AnimationType = 'default' | 'flip' | 'reveal';

interface AvatarGroupContextValue {
  tooltipClassName?: string;
  animation?: 'default' | 'flip' | 'reveal';
}

const AvatarGroupContext = React.createContext<AvatarGroupContextValue | null>(null);

interface AvatarGroupProps {
  children: React.ReactNode;
  className?: string;
  tooltipClassName?: string;
  animation?: AnimationType;
}

interface AvatarGroupItemProps {
  children: React.ReactNode;
  className?: string;
  tooltipClassName?: string;
  animation?: AnimationType;
}

interface AvatarGroupTooltipProps {
  children: React.ReactNode;
  className?: string;
}

export function AvatarGroup({ children, className, tooltipClassName, animation = 'default' }: AvatarGroupProps) {
  const contextValue: AvatarGroupContextValue = {
    tooltipClassName,
    animation,
  };

  return (
    <AvatarGroupContext.Provider value={contextValue}>
      <div className={cn('flex -space-x-2.5', className)}>{children}</div>
    </AvatarGroupContext.Provider>
  );
}

export function AvatarGroupItem({
  children,
  className,
  tooltipClassName,
  animation: _itemAnimation, // unused in static version
}: AvatarGroupItemProps) {
  const context = React.useContext(AvatarGroupContext);
  const [hovered, setHovered] = React.useState<boolean>(false);

  const finalTooltipClassName = tooltipClassName || context?.tooltipClassName;

  // Extract tooltip from children
  const tooltipChild = React.Children.toArray(children).find(
    (child) => React.isValidElement(child) && child.type === AvatarGroupTooltip,
  );

  const otherChildren = React.Children.toArray(children).filter(
    (child) => !(React.isValidElement(child) && child.type === AvatarGroupTooltip),
  );

  const tooltipContent =
    tooltipChild && React.isValidElement(tooltipChild)
      ? (tooltipChild.props as AvatarGroupTooltipProps).children
      : null;

  return (
    <div
      className={cn('group relative', className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && tooltipContent && (
        <div
          className={cn(
            'absolute -top-16 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center justify-center rounded-md bg-black px-4 py-2 text-xs font-medium text-white shadow-xl',
            finalTooltipClassName,
          )}
        >
          <div
            className="absolute inset-x-10 -bottom-px z-30 h-px w-[20%] bg-gradient-to-r from-transparent via-emerald-500 dark:via-emerald-900 to-transparent"
          />
          <div
            className="absolute -bottom-px left-10 z-30 h-px w-[40%] bg-gradient-to-r from-transparent via-sky-500 dark:via-sky-900 to-transparent"
          />
          {tooltipContent}
        </div>
      )}

      <div
        className="relative cursor-pointer transition-all duration-200 hover:z-30 hover:scale-105 active:scale-95"
      >
        {otherChildren}
      </div>
    </div>
  );
}

export function AvatarGroupTooltip({ children, className }: AvatarGroupTooltipProps) {
  return (
    <div
      className={cn('hidden relative z-30', className)}
    >
      {children}
    </div>
  );
}
