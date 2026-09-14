import React from "react";
import { CardSurface, InteractiveSurface } from "./nova";
import type { GlassCardProps } from "./Glass.types";

export function GlassCard({ children, style, onPress }: GlassCardProps) {
  if (onPress) {
    return (
      <InteractiveSurface onPress={onPress} style={style}>
        {children}
      </InteractiveSurface>
    );
  }
  return <CardSurface style={style}>{children}</CardSurface>;
}
