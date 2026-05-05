import { describe, expect, it } from "vitest";
import api from "./api";

describe("api client", () => {
  it("sets a base URL", () => {
    expect(api.defaults.baseURL).toBeTruthy();
  });
});
