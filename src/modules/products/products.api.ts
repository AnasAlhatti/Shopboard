import { fetchJson } from '../../shared/api/client.ts';
import type { Product } from './catalog.ts';

export interface ApiProduct {
  readonly id: number | string;
  readonly title: string;
  readonly category_name: string;
  readonly price_cents: number;
  readonly in_stock: boolean;
}

interface ApiProductsResponse {
  readonly items: readonly ApiProduct[];
  readonly total: number;
}

function isApiProduct(value: unknown): value is ApiProduct {
  if (typeof value !== 'object' || value === null) return false;
  const id: unknown = Reflect.get(value, 'id');
  const title: unknown = Reflect.get(value, 'title');
  const categoryName: unknown = Reflect.get(value, 'category_name');
  const priceCents: unknown = Reflect.get(value, 'price_cents');
  const inStock: unknown = Reflect.get(value, 'in_stock');
  return (
    ((typeof id === 'number' && Number.isInteger(id)) ||
      (typeof id === 'string' && id.trim().length > 0)) &&
    typeof title === 'string' &&
    typeof categoryName === 'string' &&
    typeof priceCents === 'number' &&
    Number.isInteger(priceCents) &&
    typeof inStock === 'boolean'
  );
}

function isApiProductsResponse(value: unknown): value is ApiProductsResponse {
  if (typeof value !== 'object' || value === null) return false;
  const items: unknown = Reflect.get(value, 'items');
  const total: unknown = Reflect.get(value, 'total');
  return (
    Array.isArray(items) &&
    items.every(isApiProduct) &&
    typeof total === 'number' &&
    Number.isInteger(total) &&
    total >= items.length
  );
}

function toProduct(product: ApiProduct): Product {
  return {
    id: String(product.id),
    name: product.title,
    price: product.price_cents / 100,
    category: product.category_name,
    image: null,
    seller: null,
    inStock: product.in_stock,
  };
}

export async function getProducts(): Promise<readonly Product[]> {
  const response: unknown = await fetchJson<unknown>('/products');
  if (!isApiProductsResponse(response)) {
    throw new TypeError('The products response has an invalid format.');
  }
  return Object.freeze(response.items.map((product) => Object.freeze(toProduct(product))));
}
