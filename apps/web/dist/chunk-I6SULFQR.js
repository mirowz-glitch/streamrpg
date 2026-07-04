// apps/web/src/lib/api.ts
var API_BASE = "";
async function request(path, init) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers ?? {}
    },
    ...init
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}
var api = {
  get: (path) => request(path),
  post: (path, body) => request(path, {
    method: "POST",
    body: body ? JSON.stringify(body) : void 0
  }),
  patch: (path, body) => request(path, {
    method: "PATCH",
    body: JSON.stringify(body)
  })
};
function getLoginUrl() {
  return api.get("/api/auth/login");
}

export {
  api,
  getLoginUrl
};
//# sourceMappingURL=chunk-I6SULFQR.js.map
