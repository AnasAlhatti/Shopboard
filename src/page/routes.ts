export type ParsedRoute =
  | { readonly type: 'home' }
  | { readonly type: 'products' }
  | { readonly type: 'category'; readonly categoryId: string }
  | { readonly type: 'auth'; readonly mode: 'login' | 'signup' }
  | { readonly type: 'unknown' };

export function parseRoute(hash: string): ParsedRoute {
  const route = hash.startsWith('#') ? hash.slice(1) : hash;
  if (route === '' || route === 'home') return { type: 'home' };
  if (route === 'products') return { type: 'products' };
  if (route === 'login' || route === 'signup') return { type: 'auth', mode: route };
  if (route.startsWith('category/')) {
    const categoryId = route.split('/')[1] ?? '';
    if (categoryId) return { type: 'category', categoryId };
  }
  return { type: 'unknown' };
}
