import { RequireAuth } from "@/components/auth/RequireAuth";
import { detailTabOf } from "@/features/change-requests/changeRequestOps";
import { ChangeRequestDetailContent } from "@/features/change-requests/components/ChangeRequestDetailContent";

// 変更要求(CR)の詳細(SCR-010)。params の解決だけを Server Component で行い、番号を数にして渡す。
// ?tab= は開くタブ、?focus= は影響のタブの反映の前 → 後で目立たせる要素のキー(確認事項からのリンク)。
export default async function ChangeRequestDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; number: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id, number } = await params;
  const { tab, focus } = await searchParams;
  return (
    <RequireAuth>
      <ChangeRequestDetailContent
        projectId={id}
        number={Number(number)}
        initialTab={detailTabOf(typeof tab === "string" ? tab : undefined)}
        focusKey={typeof focus === "string" ? focus : null}
      />
    </RequireAuth>
  );
}
