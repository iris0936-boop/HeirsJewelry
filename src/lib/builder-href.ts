// Builds a ring-builder URL, dropping empty params. Safe to import from client components.
export function builderHref(path: string, params: { diamond?: string; setting?: string; metal?: string }) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
  const s = q.toString();
  return s ? `${path}?${s}` : path;
}
