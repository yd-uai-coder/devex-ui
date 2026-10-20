import { RequireAuth } from "@/components/auth/RequireAuth";
import { DetailedDesignPageContent } from "@/features/detailed-design/components/DetailedDesignPageContent";
import { stageParam } from "@/features/detailed-design/labels";

// 詳細設計画面(SCR-008)。他の動的ページと同じく、params の解決だけを Server Component で行い、
// Tamagui を使う実体は Client Component に委ねる。`?stage=N` で開く段階を選べる(変更要求の画面から
// 段階の印を確かめに来るリンク)。
export default async function DetailedDesignPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const { stage } = await searchParams;
  return (
    <RequireAuth>
      <DetailedDesignPageContent projectId={id} initialStage={stageParam(stage)} />
    </RequireAuth>
  );
}
