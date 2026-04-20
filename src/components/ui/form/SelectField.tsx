import { forwardRef, type SelectHTMLAttributes } from "react";
import {
  getFormControlClassName,
  mergeClassNames,
} from "./form-control-styles";

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  error?: boolean;
  wrapperClassName?: string;
};

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ className, error, wrapperClassName, children, ...props }, ref) => {
    return (
      <div className={mergeClassNames("relative", wrapperClassName)}>
        <select
          ref={ref}
          className={getFormControlClassName({
            error,
            className: mergeClassNames("appearance-none pr-9", className),
          })}
          {...props}
        >
          {children}
        </select>

        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400 dark:text-slate-500">
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.124l3.71-3.894a.75.75 0 111.08 1.04l-4.25 4.46a.75.75 0 01-1.08 0l-4.25-4.46a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </div>
    );
  },
);

SelectField.displayName = "SelectField";

export type { SelectFieldProps };
