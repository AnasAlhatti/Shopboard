import { icon, money, photo } from '../shared/presentation.ts';
import type { Product } from '../data/catalog-data.ts';

export function homeProductCard(product: Product): string {
  return `<article class="product-card" data-product-card="${product.id}"><div class="product-image" role="img" aria-label="${product.name}">${photo(...product.image)}</div><div class="product-details"><div><h3>${product.name}</h3><p class="price">${money(product.price)}</p></div><button class="add-to-cart" type="button" data-product="${product.id}" aria-label="Add ${product.name} to bag">${icon('cart')}</button></div></article>`;
}

export function productCard(product: Product): string {
  return `<article class="product-card" data-product-card="${product.id}"><div class="product-image" role="img" aria-label="${product.name}">${photo(...product.image)}</div><div class="product-details"><div><h2>${product.name}</h2><p class="price">${money(product.price)}</p></div><button class="add-to-cart" type="button" data-product="${product.id}" aria-label="Add ${product.name} to bag">${icon('cart')}</button></div></article>`;
}
