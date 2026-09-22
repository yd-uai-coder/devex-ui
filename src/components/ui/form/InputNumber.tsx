"use client";

import InputSimpleText from "./InputSimpleText";
import type { InputSimpleTextProps } from "./InputSimpleText";

type InputNumberProps = InputSimpleTextProps & {
  min?: number;
  max?: number;
  step?: number;
};

export default function InputNumber({
  label = "数値",
  placeholder = "0",
  min,
  max,
  step,
  ...props
}: InputNumberProps) {
  return (
    <InputSimpleText
      label={label}
      placeholder={placeholder}
      type="number"
      inputMode="numeric"
      min={min}
      max={max}
      step={step}
      {...props}
    />
  );
}
