import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-900/60 ${
            error
              ? "border-rose-500 focus:ring-rose-500/20 focus:border-rose-500"
              : "border-slate-200 dark:border-slate-800"
          } ${className}`}
          {...props}
        />
        {error && (
          <span className="text-xs text-rose-500 dark:text-rose-400 font-medium">
            {error}
          </span>
        )}
        {!error && helperText && (
          <span className="text-xs text-slate-500 dark:text-slate-500 leading-normal">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
