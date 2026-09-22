"use client";

import {
  Button,
  XStack,
  Text,
} from 'tamagui'

type TokenItemProps = {
  tokens: string[];
  onRemove: (token: string) => void;
};


export default function TokenField({ tokens, onRemove }: TokenItemProps){
  return (
    <XStack
      alignItems="center"
      gap="$2"
      flexWrap="wrap"
    >
      {tokens.map((token) => (
        <XStack
          key={token}
          alignItems="center"
          gap="$1"
          paddingHorizontal="$2"
          paddingVertical="$1"
          borderRadius="$3"
          backgroundColor="$color4"
        >
          <Text>
            {token}
          </Text>
          <Button
            size="$1"
            circular
            chromeless
            onPress={() => onRemove(token)}
          >
            <Text>✕</Text>
          </Button>
        </XStack>
      ))}
    </XStack>
  );
}