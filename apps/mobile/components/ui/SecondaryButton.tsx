import React from "react";
import { Button } from "./nova";
import type { SecondaryButtonProps } from "./Glass.types";

export function SecondaryButton({ label, onPress, style }: SecondaryButtonProps) {
  return <Button variant="secondary" label={label} onPress={onPress} style={style} />;
}
