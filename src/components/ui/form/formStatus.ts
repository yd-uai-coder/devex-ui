export type FormStatus = "default" | "success" | "warning" | "error" | "disabled";

export const STATUS_THEME: Record<FormStatus, string | null> = {
  default: null,
  success: "green",
  warning: "yellow",
  error: "red",
  disabled: "gray",
};
