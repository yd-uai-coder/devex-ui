"use client";

import { useEffect,useState } from "react";
import {
  Button,
  Form,
  Spinner,
  AnimatePresence,
  YStack,
} from 'tamagui'
import type { ButtonProps } from 'tamagui'

type FormGeneralProps = {
  buttonName?: string
  buttonProps?: ButtonProps
  children?: React.ReactNode
  onBeforeSubmit?: () => boolean | Promise<boolean>
  onSubmitted?: () => void
  demoDelayMs?: number
}

export default function FormGeneral({
  buttonName = "送信",
  buttonProps,
  children,
  onBeforeSubmit,
  onSubmitted,
  demoDelayMs = 0,
}: FormGeneralProps){

  //
  const [status, setStatus] = useState<'off' | 'submitting' | 'submitted'>('off')

  return (
    <Form
      gap="$2"
      onSubmit={async () => {
        setStatus('submitting')
        const ok = onBeforeSubmit ? await onBeforeSubmit() : true
        if (!ok) {
          setStatus('off')
          return
        }
        if (demoDelayMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, demoDelayMs))
        }
        setStatus('off')
        onSubmitted?.()
      }}
      borderWidth={1}
      borderRadius="$4"
      padding="$6"
    >
      {children}
      <YStack gap="$4">
        <Form.Trigger asChild disabled={status !== 'off'}>
          <Button {...buttonProps}>{buttonName}</Button>
        </Form.Trigger>
        <YStack width="100%" height={40} justifyContent="center" alignItems="center">
          <AnimatePresence>
            {status === 'submitting' ? (
              <Spinner
                transition="medium"
                enterStyle={{ opacity: 0 }}
                alignSelf="center"
                key="spinner"
                width={8}
              />
            ) : null}
          </AnimatePresence>
        </YStack>
      </YStack>
    </Form>
  )
}