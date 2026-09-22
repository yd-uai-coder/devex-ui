"use client";

import { Menu as MenuIcon, X } from "lucide-react";
import { Button } from "tamagui";
import { useMenuStore } from "@/components/layout/menu-store";

export function MenuToggleButton() {
  const isOpen = useMenuStore((state) => state.isOpen);
  const toggle = useMenuStore((state) => state.toggle);

  return (
    <Button
      circular
      size="$3"
      onPress={toggle}
      aria-label={isOpen ? "メニューを閉じる" : "メニューを開く"}
      icon={isOpen ? <X size={20} /> : <MenuIcon size={20} />}
    />
  );
}
