# metch

A Deno module to mock `fetch()`.

```ts
import { mockFetch, unMockFetch } from "https://deno.land/x/metch/mod.ts";
import { assertEquals } from "https://deno.land/std@0.90.0/testing/asserts.ts";

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

  // Pass a request object and a response object which
  // will be used to respond to fetch().
  await mockFetch(request1, expectedResponse1.clone());

  // Call again to mock more requests.
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
```
