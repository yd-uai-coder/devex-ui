"use client";

import { useId } from 'react'
import { Check as CheckIcon } from 'lucide-react'
import type { CheckboxProps, SizeTokens } from 'tamagui'
import { Checkbox, Label, Text, Theme, XStack, YStack } from 'tamagui'
import { STATUS_THEME } from './formStatus'
import type { FormStatus } from './formStatus'

export function CheckboxWithLabel({
  size,
  errorMessage,
  label = 'labelの値（文字列）が表示されます',
  labelWidth,
  disabled,
  status = 'default',
  id: idProp,
  width = 300,
  justifyContent="flex-start",
  ...checkboxProps
}: CheckboxProps & {
  errorMessage?: string
  label?: string
  labelWidth?: number | SizeTokens
  status?: FormStatus
  width?: number | SizeTokens
}) {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const effectiveStatus = disabled ? 'disabled' : errorMessage ? 'error' : status
  return (
    <Theme name={STATUS_THEME[effectiveStatus]}>
      <YStack width={width} marginBottom="$3">
        <XStack alignItems="center" gap="$2" justifyContent={justifyContent}>
          <Checkbox id={id} size={size} disabled={disabled} borderColor="$color7" {...checkboxProps}>
            <Checkbox.Indicator>
              <CheckIcon />
            </Checkbox.Indicator>
          </Checkbox>
          <Label size={size} htmlFor={id} width={labelWidth} opacity={disabled ? 0.5 : 1}>
            {label}
          </Label>
        </XStack>
        {errorMessage ? (
          <Text color="$color9" fontSize="$2" marginTop="$1">
            {errorMessage}
          </Text>
        ) : null}
      </YStack>
    </Theme>
  )
}