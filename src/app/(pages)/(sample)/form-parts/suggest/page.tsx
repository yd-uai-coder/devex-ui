import keywordsData from "@/data/keywords.json";
import { SuggestDemo } from "./SuggestDemo";

// src/db/db:export-jsonで生成した静的スナップショット(DB/Turso不要で動作する)。
const suggestions = keywordsData.map((row) => row.name);

export default function SuggestPage() {
  return <SuggestDemo suggestions={suggestions} />;
}
