"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Drawer as VaulDrawer } from "vaul";
import { X } from "lucide-react";

/**
 * Premium mobile-friendly drawer (Apple Maps style).
 * Snap points, drag handle, scrim, portal-mounted for stacking.
 *
 * Usage:
 *   <Drawer open={open} onOpenChange={setOpen} title="Settings">
 *     {content}
 *   </Drawer>
 */
export interface DrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
  /** Snap points as fraction of viewport height. 1 = full. */
  snapPoints?: (number | string)[];
  /** Initial snap point index. */
  defaultSnap?: number;
  /** Show a drag handle bar at the top. */
  showHandle?: boolean;
  /** Direction the drawer comes from. */
  direction?: "bottom" | "right";
}

export function Drawer({
  open: controlledOpen,
  onOpenChange,
  title,
  description,
  children,
  snapPoints,
  defaultSnap = 0,
  showHandle = true,
  direction = "bottom",
}: DrawerProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = (v: boolean) => {
    if (!isControlled) setUncontrolledOpen(v);
    onOpenChange?.(v);
  };

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
    // setOpen is stable across renders; intentionally not in deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <VaulDrawer.Root
      open={open}
      onOpenChange={setOpen}
      direction={direction}
      snapPoints={snapPoints}
      activeSnapPoint={snapPoints ? snapPoints[defaultSnap] ?? snapPoints[0] ?? undefined : undefined}
      shouldScaleBackground
    >
      <VaulDrawer.Portal>
        <VaulDrawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        <VaulDrawer.Content
          className="z-50 fixed bottom-0 left-0 right-0 max-h-[96vh] rounded-t-2xl bg-rido-navy border-t border-white/10 shadow-2xl shadow-black/50 outline-none flex flex-col"
          aria-describedby={description ? undefined : undefined}
        >
          {showHandle ? (
            <div className="mx-auto w-12 h-1.5 rounded-full bg-white/20 my-3 shrink-0" aria-hidden="true" />
          ) : null}
          <div className="flex items-center justify-between px-6 pb-2 shrink-0">
            <div>
              {title ? (
                <VaulDrawer.Title className="text-lg font-bold text-white">{title}</VaulDrawer.Title>
              ) : null}
              {description ? (
                <VaulDrawer.Description className="text-sm text-muted mt-0.5">
                  {description}
                </VaulDrawer.Description>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-auto px-6 pb-6">{children}</div>
        </VaulDrawer.Content>
      </VaulDrawer.Portal>
    </VaulDrawer.Root>
  );
}
