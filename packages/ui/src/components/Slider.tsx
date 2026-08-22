"use client";

import * as React from "react";
import { cn } from "../lib/utils";

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  showValue?: boolean;
  valueFormatter?: (val: number) => string;
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
      value,
      min = 0,
      max = 100,
      step = 1,
      onChange,
      showValue = false,
      valueFormatter,
      disabled,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);

    return (
      <div className={cn("relative flex w-full items-center gap-3", className)}>
        <div className="relative flex w-full touch-none select-none items-center">
          <input
            ref={ref}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange?.(Number(e.target.value))}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed z-10"
            {...props}
          />
          {/* Custom track */}
          <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary/80 border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 transition-all duration-75"
              style={{ width: `${percentage}%` }}
            />
          </div>
          {/* Thumb */}
          <div
            className="pointer-events-none absolute h-4 w-4 rounded-full border-2 border-white bg-background shadow-md shadow-black/40 transition-all -translate-x-1/2"
            style={{ left: `${percentage}%` }}
          />
        </div>
        {showValue && (
          <span className="min-w-[40px] text-right font-mono text-xs font-semibold text-muted-foreground">
            {valueFormatter ? valueFormatter(value) : value}
          </span>
        )}
      </div>
    );
  }
);
Slider.displayName = "Slider";
