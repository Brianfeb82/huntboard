import { Loader2 } from "lucide-react";

export function LoadingSpinner({ className = "" }: { className?: string }) {
  return <Loader2 className={`size-6 animate-spin ${className}`} />;
}

export function LoadingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <LoadingSpinner className="mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
