import { z } from "zod";
import {
  applyRules,
  digitsOnlyPhone,
  fullWidthOnly,
  lengthRange,
  maxLength,
  postalCode7Digits,
  requiredSelection,
  requiredText,
  requiredTrue,
} from "@/lib/schemas/validation-rules";

const USER_MAX_LENGTH = 10
const MAIL_MAX_LENGTH = 254;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;
const NOTE_MAX_LENGTH = 500;

// クライアント側の簡易チェックであり、正規のRFC5322準拠ではない。
// このプロジェクトには実際に送信を受け取るバックエンドが無いためこれで足りるが、
// 実運用でサーバーを持つ場合は必ずサーバー側でも同等以上の検証を行うこと。
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 「必須」「文字数上限/範囲」「真偽値必須」といった複数フィールドで繰り返し登場するパターンは
// validation-rules.tsの汎用ルール関数(フィールドラベル+数値を渡すだけでチェック+メッセージを
// 組み立てる)に切り出している。メール形式の正規表現マッチ・パスワードの英数字混在チェックのような
// フィールド固有の1回限りの判定ロジックは、再利用性が無いため汎用化せずその場の`.refine()`のまま
// applyRules(...)の結果にチェーンする。
export const sampleFormSchema = z.object({
  user: applyRules(
    z.string().trim(),
    requiredText("名前"),
    maxLength("名前", USER_MAX_LENGTH),
    fullWidthOnly("名前"),
  ),

  mail: applyRules(
    z.string().trim(),
    requiredText("メールアドレス"),
    maxLength("メールアドレス", MAIL_MAX_LENGTH),
  ).refine((v) => v.length === 0 || EMAIL_PATTERN.test(v), "メールアドレスの形式が正しくありません"),

  password: applyRules(
    z.string(), // 意図的にtrimしない(先頭/末尾の空白も利用者が意図した文字である可能性があるため)
    requiredText("パスワード"),
    lengthRange("パスワード", PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH),
  ).refine(
    (v) =>
      v.length < PASSWORD_MIN_LENGTH ||
      v.length > PASSWORD_MAX_LENGTH ||
      (/[A-Za-z]/.test(v) && /\d/.test(v)),
    "パスワードは英字と数字を両方含めてください",
  ),

  postCode: applyRules(z.string().trim(), requiredText("郵便番号"), postalCode7Digits("郵便番号")),
  phonNum: applyRules(z.string().trim(), requiredText("電話番号"), digitsOnlyPhone("電話番号")),

  agree: requiredTrue("個人情報の取扱いへの同意が必要です"),

  animal: applyRules(z.string(), requiredSelection("好きな動物")),
  fruit: applyRules(z.string(), requiredSelection("好きな食べ物")),

  note: applyRules(z.string().trim(), maxLength("その他", NOTE_MAX_LENGTH), fullWidthOnly("その他")),
});

export type SampleFormValues = z.infer<typeof sampleFormSchema>;

// 確認用ストア(sample-form-store.ts)に渡す直前の変換。
// このストアはコンポーネントのライフサイクルを超えて値を保持し、別のコンポーネントからも
// 購読され得るため、平文パスワードは保持しない(文字数のみ保持し、確認画面ではマスク表示にのみ使う)。
export const sampleFormSubmissionSchema = sampleFormSchema.transform(({ password, ...rest }) => ({
  ...rest,
  passwordLength: password.length,
}));

export type SampleFormSubmission = z.infer<typeof sampleFormSubmissionSchema>;
