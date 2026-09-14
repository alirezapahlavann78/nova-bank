import React from "react";
import { Button } from "./nova";
import type { PrimaryButtonProps } from "./Glass.types";

export function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
  style,
}: PrimaryButtonProps) {
  return (
    <Button
      variant="primary"
      label={label}
      onPress={onPress}
      loading={loading}
      disabled={disabled}
      style={style}
    />
  );
}
