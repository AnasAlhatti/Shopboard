import { fetchJson } from '../../shared/api/client.ts';
import type { ImageCrop, Product } from './catalog.ts';

export interface ApiProduct {
  readonly id: string;
  readonly name: string;
  readonly price_cents: number;
  readonly category: string;
  readonly image: ImageCrop;
  readonly seller: string;
}

function isApiProduct(value: unknown): value is ApiProduct {
  if (typeof value !== 'object' || value === null) return false;
  const id: unknown = Reflect.get(value, 'id');
  const name: unknown = Reflect.get(value, 'name');
  const priceCents: unknown = Reflect.get(value, 'price_cents');
  const category: unknown = Reflect.get(value, 'category');
  const image: unknown = Reflect.get(value, 'image');
  const seller: unknown = Reflect.get(value, 'seller');
  return (
    typeof id === 'string' &&
    typeof name === 'string' &&
    typeof priceCents === 'number' &&
    Number.isInteger(priceCents) &&
    typeof category === 'string' &&
    Array.isArray(image) &&
    image.length === 4 &&
    image.every((coordinate) => typeof coordinate === 'number' && Number.isFinite(coordinate)) &&
    typeof seller === 'string'
  );
}

function toProduct(product: ApiProduct): Product {
  return {
    id: product.id,
    name: product.name,
    price: product.price_cents / 100,
    category: product.category,
    image: product.image,
    seller: product.seller,
  };
}

export async function getProducts(): Promise<readonly Product[]> {
  const response: unknown = await fetchJson<unknown>('/products.json');
  if (!Array.isArray(response) || !response.every(isApiProduct)) {
    throw new TypeError('The products response has an invalid format.');
  }
  return Object.freeze(response.map((product) => Object.freeze(toProduct(product))));
}
