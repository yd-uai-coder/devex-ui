import { describe, expect, it } from "vitest";
import { toProjectMode } from "../projects";

describe("toProjectMode", () => {
  it("simple・detailed はそのモードにし、無い・不正な値は null にする", () => {
    expect(toProjectMode("detailed")).toBe("detailed");
    expect(toProjectMode("simple")).toBe("simple");
    expect(toProjectMode(undefined)).toBeNull();
    expect(toProjectMode(["detailed"])).toBeNull();
    expect(toProjectMode("unknown")).toBeNull();
  });
});
