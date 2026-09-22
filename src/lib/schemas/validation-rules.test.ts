import { z } from "zod";
import { describe, expect, it } from "vitest";
import {
  applyRules,
  atLeastOneSelected,
  dateRangeValid,
  digitRequired,
  emailDomainRestriction,
  exactLength,
  fieldNotContained,
  fieldsMatch,
  fullWidthOnly,
  futureOnly,
  halfWidthAlnumSymbolOnly,
  halfWidthOnly,
  integerOnly,
  japanesePhoneFormat,
  lengthRange,
  maxLength,
  maxSelected,
  maxValue,
  minLength,
  minValue,
  noRepeatedChars,
  noWhitespaceOnly,
  nonZero,
  numberRangeValid,
  numericOnly,
  pastOnly,
  postalCode7Digits,
  postalCodeHyphenOptional,
  positiveOnly,
  requiredSelection,
  requiredText,
  requiredTrue,
  symbolRequired,
  todayOrEarlier,
  todayOrLater,
  uppercaseRequired,
  validBirthdate,
  validDateFormat,
  validEmail,
  valueRange,
} from "./validation-rules";

describe("requiredText", () => {
  const schema = applyRules(z.string(), requiredText("名前"));

  it("空文字はエラーになる", () => {
    const result = schema.safeParse("");
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues[0].message).toBe("名前を入力してください");
  });

  it("値があれば成功する", () => {
    expect(schema.safeParse("太郎").success).toBe(true);
  });
});

describe("requiredSelection", () => {
  const schema = applyRules(z.string(), requiredSelection("好きな動物"));

  it("空文字は「を選択してください」というメッセージになる", () => {
    const result = schema.safeParse("");
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues[0].message).toBe("好きな動物を選択してください");
  });
});

describe("maxLength", () => {
  const schema = applyRules(z.string(), maxLength("名前", 5));

  it("上限を超えるとエラーになる", () => {
    const result = schema.safeParse("123456");
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues[0].message).toBe("名前は5文字以内で入力してください");
  });

  it("上限以内なら成功する", () => {
    expect(schema.safeParse("12345").success).toBe(true);
  });

  it("空文字は無視する(必須チェックと二重にエラーを出さないため)", () => {
    expect(schema.safeParse("").success).toBe(true);
  });
});

describe("lengthRange", () => {
  const schema = applyRules(z.string(), lengthRange("パスワード", 8, 128));

  it("範囲外はエラーになる", () => {
    const result = schema.safeParse("abc");
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues[0].message).toBe("パスワードは8〜128文字で入力してください");
  });

  it("範囲内なら成功する", () => {
    expect(schema.safeParse("abcd1234").success).toBe(true);
  });

  it("空文字は無視する", () => {
    expect(schema.safeParse("").success).toBe(true);
  });
});

describe("requiredTrue", () => {
  const schema = requiredTrue("同意が必要です");

  it("falseはエラーになる", () => {
    const result = schema.safeParse(false);
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues[0].message).toBe("同意が必要です");
  });

  it("trueは成功する", () => {
    expect(schema.safeParse(true).success).toBe(true);
  });
});

describe("applyRules", () => {
  it("複数のルールを順に適用する(必須+文字数上限の組み合わせ)", () => {
    const schema = applyRules(z.string(), requiredText("名前"), maxLength("名前", 3));

    expect(schema.safeParse("").success).toBe(false);
    expect(schema.safeParse("1234").success).toBe(false);
    expect(schema.safeParse("123").success).toBe(true);
  });
});

describe("noWhitespaceOnly", () => {
  const schema = applyRules(z.string(), noWhitespaceOnly("名前"));

  it("空白のみはエラーになる", () => {
    expect(schema.safeParse("   ").success).toBe(false);
  });

  it("空文字は無視する", () => {
    expect(schema.safeParse("").success).toBe(true);
  });

  it("実質的な値があれば成功する", () => {
    expect(schema.safeParse(" 太郎 ").success).toBe(true);
  });
});

describe("halfWidthOnly / fullWidthOnly / halfWidthAlnumSymbolOnly", () => {
  it("halfWidthOnlyは全角文字を拒否する", () => {
    const schema = applyRules(z.string(), halfWidthOnly("値"));
    expect(schema.safeParse("abc123").success).toBe(true);
    expect(schema.safeParse("あいう").success).toBe(false);
  });

  it("fullWidthOnlyは半角文字を拒否する", () => {
    const schema = applyRules(z.string(), fullWidthOnly("値"));
    expect(schema.safeParse("あいう").success).toBe(true);
    expect(schema.safeParse("abc").success).toBe(false);
  });

  it("halfWidthAlnumSymbolOnlyは半角英数記号のみ許可する", () => {
    const schema = applyRules(z.string(), halfWidthAlnumSymbolOnly("値"));
    expect(schema.safeParse("abc-123").success).toBe(true);
    expect(schema.safeParse("あいう").success).toBe(false);
    expect(schema.safeParse("a b").success).toBe(false); // 空白は不可
  });
});

describe("minLength / exactLength", () => {
  it("minLengthは下限未満をエラーにする", () => {
    const schema = applyRules(z.string(), minLength("値", 3));
    expect(schema.safeParse("ab").success).toBe(false);
    expect(schema.safeParse("abc").success).toBe(true);
  });

  it("exactLengthは指定文字数以外をエラーにする", () => {
    const schema = applyRules(z.string(), exactLength("値", 4));
    expect(schema.safeParse("abc").success).toBe(false);
    expect(schema.safeParse("abcd").success).toBe(true);
    expect(schema.safeParse("abcde").success).toBe(false);
  });
});

describe("数値系ルール", () => {
  it("numericOnlyは非数値をエラーにする", () => {
    const schema = applyRules(z.string(), numericOnly("値"));
    expect(schema.safeParse("abc").success).toBe(false);
    expect(schema.safeParse("12.5").success).toBe(true);
    expect(schema.safeParse("-12.5").success).toBe(true);
  });

  it("integerOnlyは小数をエラーにする", () => {
    const schema = applyRules(z.string(), integerOnly("値"));
    expect(schema.safeParse("12.5").success).toBe(false);
    expect(schema.safeParse("12").success).toBe(true);
  });

  it("positiveOnlyは0以下をエラーにする", () => {
    const schema = applyRules(z.string(), positiveOnly("値"));
    expect(schema.safeParse("0").success).toBe(false);
    expect(schema.safeParse("-1").success).toBe(false);
    expect(schema.safeParse("1").success).toBe(true);
  });

  it("nonZeroは0をエラーにする", () => {
    const schema = applyRules(z.string(), nonZero("値"));
    expect(schema.safeParse("0").success).toBe(false);
    expect(schema.safeParse("-1").success).toBe(true);
  });

  it("minValue/maxValue/valueRangeは範囲をチェックする", () => {
    expect(applyRules(z.string(), minValue("値", 10)).safeParse("9").success).toBe(false);
    expect(applyRules(z.string(), minValue("値", 10)).safeParse("10").success).toBe(true);
    expect(applyRules(z.string(), maxValue("値", 10)).safeParse("11").success).toBe(false);
    const rangeSchema = applyRules(z.string(), valueRange("値", 1, 10));
    expect(rangeSchema.safeParse("0").success).toBe(false);
    expect(rangeSchema.safeParse("5").success).toBe(true);
    expect(rangeSchema.safeParse("11").success).toBe(false);
  });
});

describe("validEmail / emailDomainRestriction", () => {
  it("validEmailは不正な形式をエラーにする", () => {
    const schema = applyRules(z.string(), validEmail("メール"));
    expect(schema.safeParse("not-an-email").success).toBe(false);
    expect(schema.safeParse("taro@example.com").success).toBe(true);
  });

  it("emailDomainRestrictionは許可外ドメインをエラーにする", () => {
    const schema = applyRules(z.string(), emailDomainRestriction("メール", ["example.com"]));
    expect(schema.safeParse("taro@other.com").success).toBe(false);
    expect(schema.safeParse("taro@example.com").success).toBe(true);
  });
});

describe("japanesePhoneFormat", () => {
  const schema = applyRules(z.string(), japanesePhoneFormat("電話番号"));

  it("ハイフン無しはエラーになる", () => {
    expect(schema.safeParse("09012345678").success).toBe(false);
  });

  it("日本形式なら成功する", () => {
    expect(schema.safeParse("090-1234-5678").success).toBe(true);
  });
});

describe("postalCode7Digits / postalCodeHyphenOptional", () => {
  it("postalCode7Digitsはハイフン付きをエラーにする", () => {
    const schema = applyRules(z.string(), postalCode7Digits("郵便番号"));
    expect(schema.safeParse("123-4567").success).toBe(false);
    expect(schema.safeParse("1234567").success).toBe(true);
  });

  it("postalCodeHyphenOptionalはどちらも許可する", () => {
    const schema = applyRules(z.string(), postalCodeHyphenOptional("郵便番号"));
    expect(schema.safeParse("123-4567").success).toBe(true);
    expect(schema.safeParse("1234567").success).toBe(true);
    expect(schema.safeParse("12345678").success).toBe(false);
  });
});

describe("validDateFormat", () => {
  const schema = applyRules(z.string(), validDateFormat("日付"));

  it("不正な形式はエラーになる", () => {
    expect(schema.safeParse("2024/01/01").success).toBe(false);
  });

  it("YYYY-MM-DD形式なら成功する", () => {
    expect(schema.safeParse("2024-01-01").success).toBe(true);
  });
});

function daysFromToday(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

describe("日付比較ルール", () => {
  it("todayOrLaterは過去日をエラーにする", () => {
    const schema = applyRules(z.string(), todayOrLater("日付"));
    expect(schema.safeParse(daysFromToday(-1)).success).toBe(false);
    expect(schema.safeParse(daysFromToday(0)).success).toBe(true);
  });

  it("todayOrEarlierは未来日をエラーにする", () => {
    const schema = applyRules(z.string(), todayOrEarlier("日付"));
    expect(schema.safeParse(daysFromToday(1)).success).toBe(false);
    expect(schema.safeParse(daysFromToday(0)).success).toBe(true);
  });

  it("pastOnlyは今日・未来日をエラーにする", () => {
    const schema = applyRules(z.string(), pastOnly("日付"));
    expect(schema.safeParse(daysFromToday(0)).success).toBe(false);
    expect(schema.safeParse(daysFromToday(-1)).success).toBe(true);
  });

  it("futureOnlyは今日・過去日をエラーにする", () => {
    const schema = applyRules(z.string(), futureOnly("日付"));
    expect(schema.safeParse(daysFromToday(0)).success).toBe(false);
    expect(schema.safeParse(daysFromToday(1)).success).toBe(true);
  });

  it("validBirthdateは未来日をエラーにする", () => {
    const schema = applyRules(z.string(), validBirthdate("生年月日"));
    expect(schema.safeParse(daysFromToday(1)).success).toBe(false);
    expect(schema.safeParse(daysFromToday(-1)).success).toBe(true);
  });
});

describe("パスワード文字種ルール", () => {
  it("uppercaseRequiredは大文字が無いとエラーになる", () => {
    const schema = applyRules(z.string(), uppercaseRequired("パスワード"));
    expect(schema.safeParse("abc").success).toBe(false);
    expect(schema.safeParse("Abc").success).toBe(true);
  });

  it("digitRequiredは数字が無いとエラーになる", () => {
    const schema = applyRules(z.string(), digitRequired("パスワード"));
    expect(schema.safeParse("abcdefg").success).toBe(false);
    expect(schema.safeParse("abc123").success).toBe(true);
  });

  it("symbolRequiredは記号が無いとエラーになる", () => {
    const schema = applyRules(z.string(), symbolRequired("パスワード"));
    expect(schema.safeParse("abc123").success).toBe(false);
    expect(schema.safeParse("abc123!").success).toBe(true);
  });

  it("noRepeatedCharsは同一文字3連続をエラーにする", () => {
    const schema = applyRules(z.string(), noRepeatedChars("パスワード"));
    expect(schema.safeParse("aaa123").success).toBe(false);
    expect(schema.safeParse("aa123").success).toBe(true);
  });
});

describe("atLeastOneSelected / maxSelected", () => {
  it("atLeastOneSelectedは空配列をエラーにする", () => {
    const schema = applyRules(z.array(z.string()), atLeastOneSelected("選択項目"));
    expect(schema.safeParse([]).success).toBe(false);
    expect(schema.safeParse(["a"]).success).toBe(true);
  });

  it("maxSelectedは上限を超える配列をエラーにする", () => {
    const schema = applyRules(z.array(z.string()), maxSelected("選択項目", 2));
    expect(schema.safeParse(["a", "b", "c"]).success).toBe(false);
    expect(schema.safeParse(["a", "b"]).success).toBe(true);
  });
});

describe("クロスフィールドルール", () => {
  it("fieldsMatchは値が異なるとエラーになる", () => {
    const schema = applyRules(
      z.object({ password: z.string(), confirm: z.string() }),
      fieldsMatch("password", "confirm", "一致しません"),
    );
    expect(schema.safeParse({ password: "abc", confirm: "xyz" }).success).toBe(false);
    expect(schema.safeParse({ password: "abc", confirm: "abc" }).success).toBe(true);
  });

  it("fieldNotContainedはcontainerがcontainedを含むとエラーになる", () => {
    const schema = applyRules(
      z.object({ password: z.string(), username: z.string() }),
      fieldNotContained("password", "username", "ユーザー名を含められません"),
    );
    expect(schema.safeParse({ password: "mytaro123", username: "taro" }).success).toBe(false);
    expect(schema.safeParse({ password: "abcdef123", username: "taro" }).success).toBe(true);
  });

  it("dateRangeValidは開始日が終了日より後だとエラーになる", () => {
    const schema = applyRules(
      z.object({ start: z.string(), end: z.string() }),
      dateRangeValid("start", "end", "開始日は終了日以前にしてください"),
    );
    expect(schema.safeParse({ start: "2024-05-10", end: "2024-05-01" }).success).toBe(false);
    expect(schema.safeParse({ start: "2024-05-01", end: "2024-05-10" }).success).toBe(true);
  });

  it("numberRangeValidは最低価格が最高価格より高いとエラーになる", () => {
    const schema = applyRules(
      z.object({ min: z.string(), max: z.string() }),
      numberRangeValid("min", "max", "最低価格は最高価格以下にしてください"),
    );
    expect(schema.safeParse({ min: "1000", max: "500" }).success).toBe(false);
    expect(schema.safeParse({ min: "500", max: "1000" }).success).toBe(true);
  });
});
