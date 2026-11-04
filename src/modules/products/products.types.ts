import type { Product } from './catalog.ts';

export type LoadState =
  | { readonly status: 'loading' }
  | { readonly status: 'error'; readonly message: string }
  | { readonly status: 'success'; readonly products: readonly Product[] };
