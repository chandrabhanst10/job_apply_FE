import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
  width?: string;
  height?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = "rectangular",
  width,
  height,
  className = "",
  style,
  ...props
}) => {
  const baseClass = "animate-pulse bg-slate-200 dark:bg-slate-800/80";
  
  const variantClasses = {
    rectangular: "rounded-xl",
    text: "rounded-md h-3.5 w-full my-1.5",
    circular: "rounded-full"
  };

  const customStyle: React.CSSProperties = {
    width,
    height,
    ...style
  };

  return (
    <div
      className={`${baseClass} ${variantClasses[variant]} ${className}`}
      style={customStyle}
      {...props}
    />
  );
};
