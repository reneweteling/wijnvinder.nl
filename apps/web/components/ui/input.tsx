import { clsx } from "clsx";
import { forwardRef, type InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <input
          id={id}
          className={clsx(
            "flex h-10 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm transition-colors",
            "placeholder:text-text-light",
            "focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-error focus:ring-error",
            className,
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-sm text-error">{error}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
