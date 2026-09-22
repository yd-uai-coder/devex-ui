"use client";

import { useState } from "react";
import { Card } from "tamagui";
import { useThemeSetting } from "@tamagui/next-theme";
import { Calendar, type CalendarSelection } from "@/components/ui/media/Calendar";
import { StyledButton } from "@/components/ui/primitives/StyledButton";
import { useBlueGreenGradientVivid } from "@/lib/theme-gradients";
import { useHasMounted } from "@/hooks/useHasMounted";

const INITIAL_SELECTION: CalendarSelection = { year: 2023, month: 8, day: 26 };

function toDateString({ year, month, day }: CalendarSelection) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function CalendarCard({ onConfirm }: { onConfirm?: (date: string) => void }) {
  const themeSetting = useThemeSetting();
  const mounted = useHasMounted();
  // See Header.tsx: force the light-mode default until after hydration.
  const gradient = useBlueGreenGradientVivid(
    mounted ? themeSetting.resolvedTheme : undefined
  );
  const [selection, setSelection] = useState<CalendarSelection | undefined>(INITIAL_SELECTION);

  return (
    <Card
      gap="$3"
      padding="$4"
      width={320}
      borderRadius="$6"
      style={{ backgroundImage: gradient }}>
      <Calendar
        initialYear={2023}
        initialMonth={8}
        initialSelectedDay={26}
        variant="onGradient"
        onSelectionChange={setSelection}
      />
      <StyledButton
        theme="orange"
        disabled={!selection}
        onPress={() => selection && onConfirm?.(toDateString(selection))}
      >
        Select Date
      </StyledButton>
    </Card>
  );
}
