import { z } from "zod";

// 複数のフォームスキーマで繰り返し登場する「必須」「文字数上限/範囲」「真偽値必須」といった
// 定型パターンを、フィールドラベル(+必要な数値)を渡すだけで組み立てられるようにする汎用関数群。
// フィールド固有の1回限りの判定ロジック(メール形式の正規表現マッチ等)は対象外とし、
// 呼び出し側でその場の`.refine()`として個別に書く方針(再利用性の無い抽象化を避けるため)。
//
// `/sample/validations`ページのデモ用に、ユーザー提供のスプレッドシート「バリデーションルール」
// シートに沿ったルール関数群も以下に追加している。デモページの目的は「不正な値を入力して確認
// ボタンを押すと失敗する」ことを見せることなので、各関数は「空文字は無視する」ガードを持ち
// (空欄チェックは別途requiredText等で行う想定)、値の形式そのものを検証する。

export function applyRules<T extends z.ZodTypeAny>(schema: T, ...rules: Array<(s: T) => T>): T {
  return rules.reduce((acc, rule) => rule(acc), schema);
}

/** 「{label}を入力してください」(テキスト系フィールドの必須チェック)。 */
export function requiredText(label: string) {
  return <T extends z.ZodString>(schema: T) => schema.min(1, `${label}を入力してください`) as T;
}

/** 「{label}を選択してください」(RadioGroup/Select等、選択系フィールドの必須チェック)。 */
export function requiredSelection(label: string) {
  return <T extends z.ZodString>(schema: T) => schema.min(1, `${label}を選択してください`) as T;
}

/**
 * 「{label}は{max}文字以内で入力してください」。
 * 空文字(=必須チェック側で既に検出されているはず)は無視することで、
 * 1フィールドにつき常に1つのエラーメッセージだけが立つようにしている。
 */
export function maxLength(label: string, max: number) {
  return <T extends z.ZodString>(schema: T) =>
    schema.refine(
      (v) => v.length === 0 || v.length <= max,
      `${label}は${max}文字以内で入力してください`,
    ) as T;
}

/** 「{label}は{min}〜{max}文字で入力してください」。空文字の扱いは`maxLength`と同じ。 */
export function lengthRange(label: string, min: number, max: number) {
  return <T extends z.ZodString>(schema: T) =>
    schema.refine(
      (v) => v.length === 0 || (v.length >= min && v.length <= max),
      `${label}は${min}〜${max}文字で入力してください`,
    ) as T;
}

/**
 * 真偽値が`true`であることを要求する(同意チェックボックス等)。
 * メッセージはフィールドごとに文言が大きく異なる(「〜への同意が必要です」等、
 * 「を入力してください」のようなテンプレートに乗らない)ため、呼び出し側から明示的に渡す。
 */
export function requiredTrue(message: string) {
  return z.boolean().refine((v) => v === true, message);
}

// ─────────────────────────────────────────────
// 必須チェック(追加分)
// ─────────────────────────────────────────────

/** 「{label}は空白のみでは入力できません」(空文字自体は許容。requiredTextと組み合わせて使う)。 */
export function noWhitespaceOnly(label: string) {
  return <T extends z.ZodString>(schema: T) =>
    schema.refine(
      (v) => v.length === 0 || v.trim().length > 0,
      `${label}は空白のみでは入力できません`,
    ) as T;
}

// ─────────────────────────────────────────────
// 文字種類
// ─────────────────────────────────────────────

const HALF_WIDTH_PATTERN = /^[\x20-\x7E]*$/;
const FULL_WIDTH_PATTERN = /^[^\x20-\x7E]*$/;
const HALF_WIDTH_ALNUM_SYMBOL_PATTERN = /^[!-~]*$/;

/** 半角文字(ASCII印字可能文字)のみを許可する。 */
export function halfWidthOnly(label: string) {
  return <T extends z.ZodString>(schema: T) =>
    schema.refine(
      (v) => v.length === 0 || HALF_WIDTH_PATTERN.test(v),
      `${label}は半角文字で入力してください`,
    ) as T;
}

/** 全角文字(ASCII印字可能文字を含まない)のみを許可する。 */
export function fullWidthOnly(label: string) {
  return <T extends z.ZodString>(schema: T) =>
    schema.refine(
      (v) => v.length === 0 || FULL_WIDTH_PATTERN.test(v),
      `${label}は全角文字で入力してください`,
    ) as T;
}

/** 半角英数字と半角記号(空白を除く)のみを許可する。 */
export function halfWidthAlnumSymbolOnly(label: string) {
  return <T extends z.ZodString>(schema: T) =>
    schema.refine(
      (v) => v.length === 0 || HALF_WIDTH_ALNUM_SYMBOL_PATTERN.test(v),
      `${label}は半角英数字と記号で入力してください`,
    ) as T;
}

// ─────────────────────────────────────────────
// 文字数(追加分)
// ─────────────────────────────────────────────

/** 「{label}は{min}文字以上で入力してください」。 */
export function minLength(label: string, min: number) {
  return <T extends z.ZodString>(schema: T) =>
    schema.refine(
      (v) => v.length === 0 || v.length >= min,
      `${label}は${min}文字以上で入力してください`,
    ) as T;
}

/** 「{label}は{length}文字で入力してください」(固定文字数)。 */
export function exactLength(label: string, length: number) {
  return <T extends z.ZodString>(schema: T) =>
    schema.refine(
      (v) => v.length === 0 || v.length === length,
      `${label}は${length}文字で入力してください`,
    ) as T;
}

// ─────────────────────────────────────────────
// 数値
// ─────────────────────────────────────────────
// ネイティブの type="number" 入力は不正な文字種をそもそも入力させてしまえないため、
// デモページ側ではプレーンテキスト入力(InputSimpleText)を使い、ここでは文字列に対して
// 数値としての妥当性を検証する。

const NUMERIC_PATTERN = /^-?\d+(\.\d+)?$/;
const INTEGER_PATTERN = /^-?\d+$/;

/** 数値(整数・小数、正負問わず)として解釈できることを要求する。 */
export function numericOnly(label: string) {
  return <T extends z.ZodString>(schema: T) =>
    schema.refine(
      (v) => v.length === 0 || NUMERIC_PATTERN.test(v),
      `${label}は数値で入力してください`,
    ) as T;
}

/** 整数であることを要求する。 */
export function integerOnly(label: string) {
  return <T extends z.ZodString>(schema: T) =>
    schema.refine(
      (v) => v.length === 0 || INTEGER_PATTERN.test(v),
      `${label}は整数で入力してください`,
    ) as T;
}

/** 正の数値であることを要求する。 */
export function positiveOnly(label: string) {
  return <T extends z.ZodString>(schema: T) =>
    schema.refine(
      (v) => v.length === 0 || (NUMERIC_PATTERN.test(v) && Number(v) > 0),
      `${label}は正の数値で入力してください`,
    ) as T;
}

/** 0以外の数値であることを要求する。 */
export function nonZero(label: string) {
  return <T extends z.ZodString>(schema: T) =>
    schema.refine(
      (v) => v.length === 0 || (NUMERIC_PATTERN.test(v) && Number(v) !== 0),
      `${label}は0以外の数値で入力してください`,
    ) as T;
}

/** 「{label}は{min}以上で入力してください」。 */
export function minValue(label: string, min: number) {
  return <T extends z.ZodString>(schema: T) =>
    schema.refine(
      (v) => v.length === 0 || (NUMERIC_PATTERN.test(v) && Number(v) >= min),
      `${label}は${min}以上で入力してください`,
    ) as T;
}

/** 「{label}は{max}以下で入力してください」。 */
export function maxValue(label: string, max: number) {
  return <T extends z.ZodString>(schema: T) =>
    schema.refine(
      (v) => v.length === 0 || (NUMERIC_PATTERN.test(v) && Number(v) <= max),
      `${label}は${max}以下で入力してください`,
    ) as T;
}

/** 「{label}は{min}〜{max}の範囲で入力してください」。 */
export function valueRange(label: string, min: number, max: number) {
  return <T extends z.ZodString>(schema: T) =>
    schema.refine(
      (v) => v.length === 0 || (NUMERIC_PATTERN.test(v) && Number(v) >= min && Number(v) <= max),
      `${label}は${min}〜${max}の範囲で入力してください`,
    ) as T;
}

// ─────────────────────────────────────────────
// メールアドレス
// ─────────────────────────────────────────────

// クライアント側の簡易チェックであり、正規のRFC5322準拠ではない。
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** メールアドレス形式(簡易チェック)であることを要求する。 */
export function validEmail(label: string) {
  return <T extends z.ZodString>(schema: T) =>
    schema.refine(
      (v) => v.length === 0 || EMAIL_PATTERN.test(v),
      `${label}の形式で入力してください`,
    ) as T;
}

/** 指定したドメインのいずれかであることを要求する。 */
export function emailDomainRestriction(label: string, allowedDomains: string[]) {
  return <T extends z.ZodString>(schema: T) =>
    schema.refine(
      (v) =>
        v.length === 0 ||
        allowedDomains.some((domain) => v.toLowerCase().endsWith(`@${domain.toLowerCase()}`)),
      `${label}は${allowedDomains.join("・")}のいずれかのドメインで入力してください`,
    ) as T;
}

// ─────────────────────────────────────────────
// 電話番号
// ─────────────────────────────────────────────

const PHONE_DIGITS_PATTERN = /^\d{10,11}$/;
const PHONE_HYPHEN_ALLOWED_PATTERN = /^(\d{10,11}|0\d{1,4}-\d{1,4}-\d{4})$/;
const JAPANESE_PHONE_PATTERN = /^0\d{1,4}-\d{1,4}-\d{4}$/;
const INTERNATIONAL_PHONE_PATTERN = /^\+\d{1,3}-?\d{1,14}$/;

/** ハイフン無しの数字のみ(10〜11桁)を要求する。 */
export function digitsOnlyPhone(label: string) {
  return <T extends z.ZodString>(schema: T) =>
    schema.refine(
      (v) => v.length === 0 || PHONE_DIGITS_PATTERN.test(v),
      `${label}はハイフンなしの数字10〜11桁で入力してください`,
    ) as T;
}

/** ハイフンありなしどちらの形式も許可する。 */
export function phoneHyphenAllowed(label: string) {
  return <T extends z.ZodString>(schema: T) =>
    schema.refine(
      (v) => v.length === 0 || PHONE_HYPHEN_ALLOWED_PATTERN.test(v),
      `${label}はハイフンありなしどちらの形式でも入力できます`,
    ) as T;
}

/** 日本の電話番号形式(0X-XXXX-XXXX)を要求する。 */
export function japanesePhoneFormat(label: string) {
  return <T extends z.ZodString>(schema: T) =>
    schema.refine(
      (v) => v.length === 0 || JAPANESE_PHONE_PATTERN.test(v),
      `${label}は日本の電話番号形式(0X-XXXX-XXXX)で入力してください`,
    ) as T;
}

/** 国際電話番号形式(+81...)を要求する。 */
export function internationalPhoneFormat(label: string) {
  return <T extends z.ZodString>(schema: T) =>
    schema.refine(
      (v) => v.length === 0 || INTERNATIONAL_PHONE_PATTERN.test(v),
      `${label}は国際電話番号形式(+81...)で入力してください`,
    ) as T;
}

// ─────────────────────────────────────────────
// 郵便番号
// ─────────────────────────────────────────────

const POSTAL_CODE_STRICT_PATTERN = /^\d{7}$/;
const POSTAL_CODE_HYPHEN_OPTIONAL_PATTERN = /^\d{3}-?\d{4}$/;

/** ハイフン無しの数字7桁のみを要求する。 */
export function postalCode7Digits(label: string) {
  return <T extends z.ZodString>(schema: T) =>
    schema.refine(
      (v) => v.length === 0 || POSTAL_CODE_STRICT_PATTERN.test(v),
      `${label}はハイフンなしの数字7桁で入力してください`,
    ) as T;
}

/**
 * ハイフンありなしどちらの形式も許可する(「ハイフンあり可」「ハイフンなし可」共通で使用)。
 */
export function postalCodeHyphenOptional(label: string) {
  return <T extends z.ZodString>(schema: T) =>
    schema.refine(
      (v) => v.length === 0 || POSTAL_CODE_HYPHEN_OPTIONAL_PATTERN.test(v),
      `${label}は「123-4567」「1234567」どちらの形式でも入力できます`,
    ) as T;
}

// ─────────────────────────────────────────────
// 日付(文字列としての形式チェック)
// ─────────────────────────────────────────────
// DatePickerではなくプレーンテキスト入力を使う想定(不正な形式の文字列を実際に
// 入力できないと、このルール自体を確認できないため)。

const DATE_FORMAT_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_FORMAT_PATTERN = /^\d{2}:\d{2}(:\d{2})?$/;
const DATETIME_FORMAT_PATTERN = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?$/;

/** "YYYY-MM-DD"形式であることを要求する。 */
export function validDateFormat(label: string) {
  return <T extends z.ZodString>(schema: T) =>
    schema.refine(
      (v) => v.length === 0 || DATE_FORMAT_PATTERN.test(v),
      `${label}は"YYYY-MM-DD"形式で入力してください`,
    ) as T;
}

/** "HH:mm"(秒任意)形式であることを要求する。 */
export function validTimeFormat(label: string) {
  return <T extends z.ZodString>(schema: T) =>
    schema.refine(
      (v) => v.length === 0 || TIME_FORMAT_PATTERN.test(v),
      `${label}は"HH:mm"形式で入力してください`,
    ) as T;
}

/** "YYYY-MM-DD HH:mm"(秒任意)形式であることを要求する。 */
export function validDateTimeFormat(label: string) {
  return <T extends z.ZodString>(schema: T) =>
    schema.refine(
      (v) => v.length === 0 || DATETIME_FORMAT_PATTERN.test(v),
      `${label}は"YYYY-MM-DD HH:mm"形式で入力してください`,
    ) as T;
}

// ─────────────────────────────────────────────
// 日付(実日付の比較)
// ─────────────────────────────────────────────
// DatePickerWithLabelが返す"YYYY-MM-DD"文字列(ゼロ埋め固定長)を対象にする。
// この形式は文字列としての大小比較がそのまま日付の前後比較として成立するため、
// Dateオブジェクトへの変換(タイムゾーンの落とし穴がある)を避けている。

function todayDateString(): string {
  const now = new Date();
  return formatDateString(now);
}

function yearsAgoDateString(years: number): string {
  const now = new Date();
  now.setFullYear(now.getFullYear() - years);
  return formatDateString(now);
}

function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** 今日以降の日付であることを要求する。 */
export function todayOrLater(label: string) {
  return <T extends z.ZodString>(schema: T) =>
    schema.refine(
      (v) => v.length === 0 || v >= todayDateString(),
      `${label}は今日以降の日付を選択してください`,
    ) as T;
}

/** 今日以前の日付であることを要求する。 */
export function todayOrEarlier(label: string) {
  return <T extends z.ZodString>(schema: T) =>
    schema.refine(
      (v) => v.length === 0 || v <= todayDateString(),
      `${label}は今日以前の日付を選択してください`,
    ) as T;
}

/** 今日より前の日付(過去のみ)であることを要求する。 */
export function pastOnly(label: string) {
  return <T extends z.ZodString>(schema: T) =>
    schema.refine(
      (v) => v.length === 0 || v < todayDateString(),
      `${label}は過去の日付を選択してください`,
    ) as T;
}

/** 今日より後の日付(未来のみ)であることを要求する。 */
export function futureOnly(label: string) {
  return <T extends z.ZodString>(schema: T) =>
    schema.refine(
      (v) => v.length === 0 || v > todayDateString(),
      `${label}は未来の日付を選択してください`,
    ) as T;
}

const BIRTHDATE_MAX_YEARS_AGO = 150;

/** 今日以前かつ150年以内の日付(生年月日として妥当な範囲)であることを要求する。 */
export function validBirthdate(label: string) {
  return <T extends z.ZodString>(schema: T) =>
    schema.refine(
      (v) =>
        v.length === 0 ||
        (v <= todayDateString() && v >= yearsAgoDateString(BIRTHDATE_MAX_YEARS_AGO)),
      `${label}は今日以前かつ${BIRTHDATE_MAX_YEARS_AGO}年以内の日付を選択してください`,
    ) as T;
}

// ─────────────────────────────────────────────
// パスワード(追加分)
// ─────────────────────────────────────────────

const SYMBOL_PATTERN = /[!"#$%&'()*+,\-./:;<=>?@[\]^_`{|}~]/;

/** 英字(大文字/小文字問わず)を1文字以上含むことを要求する。 */
export function letterRequired(label: string) {
  return <T extends z.ZodString>(schema: T) =>
    schema.refine((v) => v.length === 0 || /[A-Za-z]/.test(v), `${label}は英字を含めてください`) as T;
}

/** 大文字を1文字以上含むことを要求する。 */
export function uppercaseRequired(label: string) {
  return <T extends z.ZodString>(schema: T) =>
    schema.refine((v) => v.length === 0 || /[A-Z]/.test(v), `${label}は大文字を含めてください`) as T;
}

/** 小文字を1文字以上含むことを要求する。 */
export function lowercaseRequired(label: string) {
  return <T extends z.ZodString>(schema: T) =>
    schema.refine((v) => v.length === 0 || /[a-z]/.test(v), `${label}は小文字を含めてください`) as T;
}

/** 数字を1文字以上含むことを要求する。 */
export function digitRequired(label: string) {
  return <T extends z.ZodString>(schema: T) =>
    schema.refine((v) => v.length === 0 || /\d/.test(v), `${label}は数字を含めてください`) as T;
}

/** 記号を1文字以上含むことを要求する。 */
export function symbolRequired(label: string) {
  return <T extends z.ZodString>(schema: T) =>
    schema.refine(
      (v) => v.length === 0 || SYMBOL_PATTERN.test(v),
      `${label}は記号を含めてください`,
    ) as T;
}

/** 同じ文字を3回以上連続で使用することを禁止する。 */
export function noRepeatedChars(label: string) {
  return <T extends z.ZodString>(schema: T) =>
    schema.refine(
      (v) => v.length === 0 || !/(.)\1\1/.test(v),
      `${label}は同じ文字を3回以上連続で使用できません`,
    ) as T;
}

// ─────────────────────────────────────────────
// チェックボックス(複数選択、配列フィールド用)
// ─────────────────────────────────────────────

/** 1件以上の選択を要求する。 */
export function atLeastOneSelected(label: string) {
  return <T extends z.ZodArray<z.ZodTypeAny>>(schema: T) => schema.min(1, `${label}を1件以上選択してください`) as T;
}

/** 「{label}は{max}件以内で選択してください」。 */
export function maxSelected(label: string, max: number) {
  return <T extends z.ZodArray<z.ZodTypeAny>>(schema: T) =>
    schema.max(max, `${label}は${max}件以内で選択してください`) as T;
}

// ─────────────────────────────────────────────
// クロスフィールド(オブジェクトschema全体に対するルール)
// ─────────────────────────────────────────────
// applyRules()はz.ZodTypeAnyに対する汎用合成関数のため、z.object({...})に対しても
// そのまま使える。エラーは.refine()のpathオプションで特定フィールド(通常は
// 確認用/2つ目のフィールド)に紐付ける。

type CrossFieldPredicate<Keys extends string> = (data: Record<Keys, string>) => boolean;

/** 2つのフィールドの値が一致することを要求する(パスワード確認・メール確認等)。 */
export function fieldsMatch<Keys extends string>(fieldA: Keys, fieldB: Keys, message: string) {
  const predicate: CrossFieldPredicate<Keys> = (data) => data[fieldA] === data[fieldB];
  return <T extends z.ZodObject<Record<Keys, z.ZodString>>>(schema: T) =>
    schema.refine(predicate as (data: z.output<T>) => boolean, { message, path: [fieldB] }) as unknown as T;
}

/** containedFieldの値がcontainerFieldの値に含まれていないことを要求する(パスワードにユーザー名を含めない等)。 */
export function fieldNotContained<Keys extends string>(
  containerField: Keys,
  containedField: Keys,
  message: string,
) {
  const predicate: CrossFieldPredicate<Keys> = (data) => {
    const contained = data[containedField];
    const container = data[containerField];
    return contained.length === 0 || !container.toLowerCase().includes(contained.toLowerCase());
  };
  return <T extends z.ZodObject<Record<Keys, z.ZodString>>>(schema: T) =>
    schema.refine(predicate as (data: z.output<T>) => boolean, {
      message,
      path: [containerField],
    }) as unknown as T;
}

/** 開始日が終了日以前であることを要求する("YYYY-MM-DD"文字列同士の比較)。 */
export function dateRangeValid<Keys extends string>(startField: Keys, endField: Keys, message: string) {
  const predicate: CrossFieldPredicate<Keys> = (data) =>
    !data[startField] || !data[endField] || data[startField] <= data[endField];
  return <T extends z.ZodObject<Record<Keys, z.ZodString>>>(schema: T) =>
    schema.refine(predicate as (data: z.output<T>) => boolean, { message, path: [endField] }) as unknown as T;
}

/** 最小値が最大値以下であることを要求する(数値文字列同士の比較)。 */
export function numberRangeValid<Keys extends string>(minField: Keys, maxField: Keys, message: string) {
  const predicate: CrossFieldPredicate<Keys> = (data) => {
    const minValueNum = Number(data[minField]);
    const maxValueNum = Number(data[maxField]);
    if (Number.isNaN(minValueNum) || Number.isNaN(maxValueNum)) return true;
    return minValueNum <= maxValueNum;
  };
  return <T extends z.ZodObject<Record<Keys, z.ZodString>>>(schema: T) =>
    schema.refine(predicate as (data: z.output<T>) => boolean, { message, path: [maxField] }) as unknown as T;
}
