import { describe, expect, it } from "vitest";
import { sampleFormSchema, sampleFormSubmissionSchema } from "./sample-form-schema";

const VALID_VALUES = {
  user: "山田太郎",
  mail: "taro@example.com",
  password: "abcd1234",
  postCode: "1234567",
  phonNum: "09012345678",
  agree: true,
  animal: "dog",
  fruit: "apple",
  note: "",
};

describe("sampleFormSchema", () => {
  it("全項目が正しい場合はパースに成功する", () => {
    const result = sampleFormSchema.safeParse(VALID_VALUES);
    expect(result.success).toBe(true);
  });

  it("必須項目が未入力の場合はそれぞれエラーになる", () => {
    const result = sampleFormSchema.safeParse({
      ...VALID_VALUES,
      user: "",
      mail: "",
      password: "",
      postCode: "",
      phonNum: "",
      animal: "",
      fruit: "",
      agree: false,
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    const paths = result.error.issues.map((issue) => issue.path.join("."));
    expect(paths).toEqual(
      expect.arrayContaining([
        "user",
        "mail",
        "password",
        "postCode",
        "phonNum",
        "animal",
        "fruit",
        "agree",
      ]),
    );
  });

  it("noteは未入力でもエラーにならない(任意項目)", () => {
    const result = sampleFormSchema.safeParse({ ...VALID_VALUES, note: "" });
    expect(result.success).toBe(true);
  });

  it("名前が10文字を超えるとエラーになる", () => {
    const result = sampleFormSchema.safeParse({ ...VALID_VALUES, user: "あ".repeat(11) });
    expect(result.success).toBe(false);
  });

  it("名前に半角文字が含まれるとエラーになる", () => {
    const result = sampleFormSchema.safeParse({ ...VALID_VALUES, user: "yamada" });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues[0].message).toBe("名前は全角文字で入力してください");
  });

  it("その他に半角文字が含まれるとエラーになる", () => {
    const result = sampleFormSchema.safeParse({ ...VALID_VALUES, note: "memo" });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues[0].message).toBe("その他は全角文字で入力してください");
  });

  it("郵便番号がハイフン入り・7桁以外だとエラーになる", () => {
    expect(sampleFormSchema.safeParse({ ...VALID_VALUES, postCode: "123-4567" }).success).toBe(false);
    expect(sampleFormSchema.safeParse({ ...VALID_VALUES, postCode: "12345678" }).success).toBe(false);
    expect(sampleFormSchema.safeParse({ ...VALID_VALUES, postCode: "" }).success).toBe(false);
  });

  it("電話番号がハイフン入り・10〜11桁以外だとエラーになる", () => {
    expect(sampleFormSchema.safeParse({ ...VALID_VALUES, phonNum: "090-1234-5678" }).success).toBe(
      false,
    );
    expect(sampleFormSchema.safeParse({ ...VALID_VALUES, phonNum: "123456789" }).success).toBe(false);
    expect(sampleFormSchema.safeParse({ ...VALID_VALUES, phonNum: "" }).success).toBe(false);
  });

  it("メール形式が不正な場合はエラーになる", () => {
    const result = sampleFormSchema.safeParse({ ...VALID_VALUES, mail: "not-an-email" });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues[0].message).toBe("メールアドレスの形式が正しくありません");
  });

  it("パスワードが8文字未満だとエラーになる", () => {
    const result = sampleFormSchema.safeParse({ ...VALID_VALUES, password: "abc123" });
    expect(result.success).toBe(false);
  });

  it("パスワードが英字のみ・数字のみだとエラーになる", () => {
    expect(sampleFormSchema.safeParse({ ...VALID_VALUES, password: "abcdefgh" }).success).toBe(false);
    expect(sampleFormSchema.safeParse({ ...VALID_VALUES, password: "12345678" }).success).toBe(false);
  });

  it("その他が500文字を超えるとエラーになる", () => {
    const result = sampleFormSchema.safeParse({ ...VALID_VALUES, note: "あ".repeat(501) });
    expect(result.success).toBe(false);
  });

  it("同意チェックが無いとエラーになる", () => {
    const result = sampleFormSchema.safeParse({ ...VALID_VALUES, agree: false });
    expect(result.success).toBe(false);
  });

  it("user/mail/noteの前後の空白を除去する(trim)", () => {
    const result = sampleFormSchema.safeParse({
      ...VALID_VALUES,
      user: "  山田太郎  ",
      mail: "  taro@example.com ",
      note: "  メモ  ",
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.user).toBe("山田太郎");
    expect(result.data.mail).toBe("taro@example.com");
    expect(result.data.note).toBe("メモ");
  });

  it("passwordはtrimしない", () => {
    const result = sampleFormSchema.safeParse({ ...VALID_VALUES, password: "  abcd1234  " });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.password).toBe("  abcd1234  ");
  });
});

describe("sampleFormSubmissionSchema", () => {
  it("passwordを持たず、passwordLengthに変換される", () => {
    const submission = sampleFormSubmissionSchema.parse(VALID_VALUES);
    expect(submission).not.toHaveProperty("password");
    expect(submission.passwordLength).toBe(VALID_VALUES.password.length);
    expect(submission.user).toBe(VALID_VALUES.user);
  });

  it("不正な値はparseがthrowする", () => {
    expect(() => sampleFormSubmissionSchema.parse({ ...VALID_VALUES, mail: "" })).toThrow();
  });
});
