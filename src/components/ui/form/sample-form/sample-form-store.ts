import { create } from "zustand";
import { sampleFormSubmissionSchema } from "./sample-form-schema";
import type { SampleFormSubmission, SampleFormValues } from "./sample-form-schema";

export type { SampleFormSubmission, SampleFormValues };

type SampleFormStore = {
  submission: SampleFormSubmission | null;
  setSubmission: (values: SampleFormValues) => void;
};

export const useSampleFormStore = create<SampleFormStore>((set) => ({
  submission: null,
  // このストアはコンポーネントのライフサイクルを超えて値を保持し、
  // 別のコンポーネントからも購読され得るため、平文パスワードは保持しない
  // (sampleFormSubmissionSchemaのtransformで文字数のみに変換してから保存する)。
  setSubmission: (values) => set({ submission: sampleFormSubmissionSchema.parse(values) }),
}));
