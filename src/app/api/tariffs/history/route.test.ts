import { describe, expect, test } from "vitest";

import { GET } from "./route";

describe("GET /api/tariffs/history", () => {
  test("returns 501 until historical registry revisions exist", async () => {
    const response = await GET(new Request("http://localhost/api/tariffs/history"));
    const data = await response.json();

    expect(response.status).toBe(501);
    expect(data).toMatchObject({
      error: "history_not_available"
    });
  });
});
