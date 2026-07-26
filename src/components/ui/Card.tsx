import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverEffect = false,
  className = "",
  ...props
}) => {
  return (
    <div
      className={`bg-white/90 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 text-slate-900 dark:text-slate-100 ${
        hoverEffect
          ? "transition-all duration-300 hover:scale-[1.01] hover:border-slate-300 dark:hover:border-slate-700/60 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-indigo-950/10"
          : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = "", ...props }) => (
  <div className={`pb-4 mb-4 border-b border-slate-100 dark:border-slate-800/60 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className = "", ...props }) => (
  <h3 className={`text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ children, className = "", ...props }) => (
  <p className={`text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal ${className}`} {...props}>
    {children}
  </p>
);
