import React from "react";
import { Loader2 } from "lucide-react";

type FullPageLoaderProps = {
  message?: string;
  size?: number;
  fullScreen?: boolean;
  className?: string;
};

export default function FullPageLoader({
  message = "Loading...",
  size = 48,
  fullScreen = true,
  className = "",
}: FullPageLoaderProps) {
  const containerClasses = fullScreen
    ? "fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm"
    : "flex items-center justify-center";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`${containerClasses} ${className}`.trim()}
    >
      <div className="flex flex-col items-center gap-3">
        <Loader2
          size={size}
          className="animate-spin"
          aria-hidden
        />

        {message ? (
          <p className="text-sm text-gray-700 dark:text-gray-200">{message}</p>
        ) : null}
        <span className="sr-only">Loading</span>
      </div>
    </div>
  );
}