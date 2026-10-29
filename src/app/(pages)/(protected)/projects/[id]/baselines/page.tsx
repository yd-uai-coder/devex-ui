import { RequireAuth } from "@/components/auth/RequireAuth";
import { BaselinesPageContent } from "@/features/baselines/components/BaselinesPageContent";

// 合意済みの版(束)の一覧と作成(SCR-010)。他の動的ページと同じく、params の解決だけを Server Component で
// 行い、Tamagui を使う実体は Client Component に委ねる。?create=1 は作成のフォームを開いて始める
// (束が古いときの知らせからの案内)。
export default async function BaselinesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const { create } = await searchParams;
  return (
    <RequireAuth>
      <BaselinesPageContent projectId={id} initialCreate={create === "1"} />
    </RequireAuth>
  );
}
