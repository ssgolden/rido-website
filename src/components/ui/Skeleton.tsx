import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-white/5",
        className
      )}
    />
  );
}

export function ImageSkeleton({ className }: SkeletonProps) {
  return (
    <Skeleton className={cn("bg-gradient-to-br from-white/5 to-rido-magenta/10", className)} />
  );
}