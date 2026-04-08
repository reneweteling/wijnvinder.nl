"use client";

import { clsx } from "clsx";
import { forwardRef, type InputHTMLAttributes } from "react";

export interface SliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  displayValue?: string;
}

const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, displayValue, id, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {(label || displayValue) && (
          <div className="flex items-center justify-between">
            {label && (
              <label
                htmlFor={id}
                className="text-sm font-medium text-foreground"
              >
                {label}
              </label>
            )}
            {displayValue && (
              <span className="text-sm font-medium text-burgundy">
                {displayValue}
              </span>
            )}
          </div>
        )}
        <input
          id={id}
          type="range"
          className={clsx("w-full", className)}
          ref={ref}
          {...props}
        />
      </div>
    );
  },
);
Slider.displayName = "Slider";

export { Slider };
