import { RequireAuth } from "@/components/auth/RequireAuth";
import { toProjectMode } from "@/features/dashboard/api/projects";
import { NewProjectPageContent } from "@/features/hearing/components/NewProjectPageContent";

// searchParams(Next.js 16 では Promise)を読むため、ページ自体は非同期の Server Component にし、
// Tamagui を使う実体は Client Component(NewProjectPageContent)へ切り出す(他の動的ページと同じ形)。
export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { mode } = await searchParams;
  return (
    <RequireAuth>
      <NewProjectPageContent mode={toProjectMode(mode)} />
    </RequireAuth>
  );
}
