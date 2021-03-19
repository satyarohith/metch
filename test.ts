import {
  assertEquals,
  assertThrowsAsync,
} from "https://deno.land/std@0.90.0/testing/asserts.ts";
import { mockFetch, unMockFetch } from "./mod.ts";

Deno.test("throws error when requests are not equal", async () => {
  const request = new Request("https://github.com/satyarohith", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      message: "i'm different",
    }),
  });

  mockFetch(request, new Response());
  assertThrowsAsync<Response>(() =>
    fetch("https://github.com/satyarohith", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        message: "i'm different too",
      }),
    })
  );
  unMockFetch();
});

Deno.test("mocks fetch() as expected", async () => {
  const request1 = new Request("https://example.com");
  const expectedResponse1 = new Response("<html> example.com </html>", {
    status: 200,
    headers: {
      "content-type": "text/html",
    },
  });

  const request2 = new Request("https://example.rest");
  const expectedResponse2 = new Response(
    JSON.stringify({ message: "example" }),
    {
      status: 200,
      headers: {
        "content-type": "text/html",
      },
    },
  );

  await mockFetch(request1, expectedResponse1.clone());
  await mockFetch(request2, expectedResponse2.clone());

  const response1 = await fetch(request1);
  const response2 = await fetch(request2);

  assertEquals(response1.status, expectedResponse1.status);
  assertEquals(await response1.text(), await expectedResponse1.text());
  assertEquals(
    response1.headers.get("content-type"),
    expectedResponse1.headers.get("content-type"),
  );

  assertEquals(response2.status, expectedResponse2.status);
  assertEquals(await response2.text(), await expectedResponse2.text());
  assertEquals(
    response2.headers.get("content-type"),
    expectedResponse2.headers.get("content-type"),
  );

  // Restore original fetch().
  unMockFetch();
});
