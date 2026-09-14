import React from "react";
import type { TextInput } from "react-native";
import { Input } from "./nova";
import type { GlassInputProps } from "./Glass.types";

export const GlassInput = React.forwardRef<TextInput, GlassInputProps>(function GlassInput(
  props,
  ref,
) {
  return <Input ref={ref} {...props} />;
});
