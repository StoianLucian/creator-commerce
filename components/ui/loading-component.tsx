"use client";

import { Loader2 } from "lucide-react";

interface LoadingComponentProps {
  text?: string;
}

export const LoadingComponent: React.FC<LoadingComponentProps> = ({
  text = "Loading...",
}) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">{text}</p>
      </div>
    </div>
  );
};