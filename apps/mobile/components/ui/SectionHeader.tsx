import React from "react";
import { SectionHeader as NovaSectionHeader } from "./nova";
import type { SectionHeaderProps } from "./Glass.types";

export function SectionHeader(props: SectionHeaderProps) {
  return <NovaSectionHeader {...props} />;
}
