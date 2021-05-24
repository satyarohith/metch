import { createHash } from "https://deno.land/std@0.90.0/hash/mod.ts";

const store = new Map<string, Response>();
const originalFetch = globalThis.fetch;

/** Generates a string out of a `Request` object. */
export async function getRequestString(request: Request, options?: Options) {
  let bodyHash = "";
  request = request.clone();

  if (options?.body) {
    const hash = createHash("md5");
    hash.update(await request.arrayBuffer());
    bodyHash = hash.toString();
  }

  return (
    request.url +
    request.method +
    JSON.stringify(Object.fromEntries(request.headers.entries())) +
    bodyHash +
    request.redirect
  );
}
export interface Options {
  /** Whether or not to use the body of request while matching requests. */
  body: boolean;
}

/** Mock fetch() requests
 *
 * Returns the provided response when a fetch() call's request matche
 * the provided request object.
 *
 * @throws 'request not mocked' error if the request of fetch() isn't in the store.
 */
export async function mockFetch(
  request: Request,
  response: Response,
  options?: Options,
) {
  store.set(await getRequestString(request, options), response);

  globalThis.fetch = async function fetch(
    input: string | URL | Request,
    init?: RequestInit | undefined,
  ) {
    if (input instanceof URL) {
      input = input.toString();
    }
    const originalRequest = new Request(input, init);
    const requestString = await getRequestString(originalRequest, options);

    if (!store.has(requestString)) {
      console.warn(
        `metch: skipped ${originalRequest.method.toUpperCase()} ${originalRequest.url.toString()}`,
      );
      return originalFetch(originalRequest);
    }

    return store.get(requestString)!.clone();
  };
}

/** Restore original fetch(). */
export function unMockFetch() {
  globalThis.fetch = originalFetch;
}
