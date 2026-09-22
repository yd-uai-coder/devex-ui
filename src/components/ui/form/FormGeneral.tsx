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
}

export default function FormGeneral({
  buttonName = "送信",
  buttonProps,
  children,
  onBeforeSubmit,
  onSubmitted,
}: FormGeneralProps){

  //
  const [status, setStatus] = useState<'off' | 'submitting' | 'submitted'>('off')
  //デモ用：送信ボタンから2秒間スピナーを表示する
  useEffect(() => {
    if (status === 'submitting') {
      const timer = setTimeout(() => {
        setStatus('off')
        onSubmitted?.()
      }, 2000)
      return () => {
        clearTimeout(timer)
      }
    }
  }, [status, onSubmitted])

  return (
    <Form
      gap="$2"
      onSubmit={async () => {
        if (onBeforeSubmit) {
          const ok = await onBeforeSubmit()
          if (!ok) return
        }
        setStatus('submitting')
      }}
      borderWidth={1}
      borderRadius="$4"
      padding="$6"
    >
      {children}
      <Form.Trigger asChild disabled={status !== 'off'}>
        <YStack  gap="$4">
          <Button {...buttonProps}>{buttonName}</Button>
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
      </Form.Trigger>
    </Form>
  )
}