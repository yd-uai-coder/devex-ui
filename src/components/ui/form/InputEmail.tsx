"use client";

import InputSimpleText from "./InputSimpleText";
import type { InputSimpleTextProps } from "./InputSimpleText";

export default function InputEmail({
  label = "メールアドレス",
  placeholder = "example@example.com",
  ...props
}: InputSimpleTextProps) {
  return (
    <InputSimpleText
      label={label}
      placeholder={placeholder}
      type="email"
      autoComplete="email"
      inputMode="email"
      {...props}
    />
  );
}
