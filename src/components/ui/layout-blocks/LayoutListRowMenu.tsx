"use client";

import { MoreVertical } from "lucide-react";
import { Button, Menu } from "tamagui";

export type LayoutListRowMenuProps = {
  onEdit?: () => void;
  onDelete?: () => void;
};

// 行ごとの編集・削除メニューを表示する
export function LayoutListRowMenu({ onEdit, onDelete }: LayoutListRowMenuProps) {
  return (
    <Menu>
      <Menu.Trigger asChild>
        <Button backgroundColor="$gray5" chromeless marginRight="$2" circular size="$3" icon={MoreVertical} />
      </Menu.Trigger>
      <Menu.Portal zIndex={100_000}>
        {/* Sheet.Frame/Popover.Contentと同じ既知の理由(既定で背景がページ背景と同化する)で
            backgroundColorを明示している。 */}
        <Menu.Content backgroundColor="$color2" borderWidth={1} borderColor="$borderColor" elevation="$4">
          {/* 編集ハンドラがある場合のみ項目を表示 */}
          {onEdit ? (
            <Menu.Item onSelect={onEdit} key="edit">
              <Menu.ItemTitle>編集</Menu.ItemTitle>
            </Menu.Item>
          ) : null}
          {onEdit && onDelete ? <Menu.Separator /> : null}
          {/* 削除ハンドラがある場合のみ項目を表示 */}
          {onDelete ? (
            <Menu.Item onSelect={onDelete} key="delete" destructive>
              <Menu.ItemTitle>削除</Menu.ItemTitle>
            </Menu.Item>
          ) : null}
        </Menu.Content>
      </Menu.Portal>
    </Menu>
  );
}
