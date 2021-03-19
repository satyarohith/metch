import { createHash } from "https://deno.land/std@0.90.0/hash/mod.ts";

const store = new Map<string, Response>();
const originalFetch = globalThis.fetch;

/** Generates a string out of a `Request` object. */
export async function getRequestString(request: Request) {
  request = request.clone();
  const hash = createHash("md5");
  hash.update(await request.arrayBuffer());

  return (
    request.url +
    request.method +
    JSON.stringify(Object.fromEntries(request.headers.entries())) +
    hash.toString() +
    request.cache +
    request.credentials +
    request.mode +
    request.redirect +
    request.destination +
    request.integrity +
    request.referrer +
    request.referrerPolicy
  );
}

/** Mock fetch() requests
 *
 * Returns the provided response when a fetch() call's request matche
 * the provided request object.
 *
 * @throws 'request not mocked' error if the request of fetch() isn't in the store.
 */
export async function mockFetch(request: Request, response: Response) {
  store.set(await getRequestString(request), response);

  globalThis.fetch = async function fetch(
    input: string | URL | Request,
    init?: RequestInit | undefined,
  ) {
    if (input instanceof URL) {
      input = input.toString();
    }
    const originalRequest = new Request(input, init);
    const requestString = await getRequestString(originalRequest);

    if (!store.has(requestString)) {
      throw Error("request not mocked");
    }

    return store.get(requestString)!.clone();
  };
}

/** Restore original fetch(). */
export function unMockFetch() {
  globalThis.fetch = originalFetch;
}
