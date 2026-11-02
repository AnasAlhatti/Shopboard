import { icon, money, photo } from '../../shared/presentation.ts';
import type { CartItem, Cart, CartActions } from './cart.types.ts';
import { required } from '../../shared/dom.ts';

export function createCartDialog(cartDialog: HTMLDialogElement, actions: CartActions) {
  function renderCart(snapshot: Cart): void {
    const { items, count, subtotal } = snapshot;
    cartDialog.innerHTML = `<div class="dialog-heading"><div><p class="eyebrow">YOUR GOOD FINDS</p><h2 id="cart-title">Your shopping bag <span>(${count})</span></h2></div><button class="icon-button close-dialog" type="button" aria-label="Close shopping bag">${icon('close')}</button></div>
    ${items.length ? `<div class="cart-items">${items.map(cartItem).join('')}</div><div class="cart-total"><span>Subtotal</span><strong>${money(subtotal)}</strong></div><button type="button" class="text-button clear-cart">Clear shopping bag</button><p class="cart-note">This is a preview shop. Checkout and payment are not available yet.</p>` : `<div class="empty-bag">${icon('cart')}<h3>A little room for good things.</h3><p>Your bag is empty. Find something worth keeping.</p></div>`}
    <button type="button" class="button button-green continue-shopping">Continue exploring ${icon('arrow')}</button>`;
    required<HTMLButtonElement>(cartDialog, '.close-dialog').addEventListener('click', () =>
      cartDialog.close(),
    );
    required<HTMLButtonElement>(cartDialog, '.continue-shopping').addEventListener('click', () =>
      cartDialog.close(),
    );
    cartDialog.querySelectorAll<HTMLButtonElement>('[data-quantity]').forEach((button) =>
      button.addEventListener('click', () => {
        const id = button.dataset.quantity;
        const delta = Number(button.dataset.delta);
        if (!id) return;
        actions.changeCart(id, delta);
        const replacement = cartDialog.querySelector<HTMLButtonElement>(
          `[data-quantity="${id}"][data-delta="${button.dataset.delta}"]`,
        );
        (replacement ?? required<HTMLButtonElement>(cartDialog, '.close-dialog')).focus();
      }),
    );
    cartDialog.querySelectorAll<HTMLButtonElement>('[data-remove]').forEach((button) =>
      button.addEventListener('click', () => {
        const id = button.dataset.remove;
        if (!id) return;
        actions.removeFromCart(id);
        required<HTMLButtonElement>(cartDialog, '.close-dialog').focus();
      }),
    );
    cartDialog.querySelector<HTMLButtonElement>('.clear-cart')?.addEventListener('click', () => {
      actions.clearCart();
      required<HTMLButtonElement>(cartDialog, '.close-dialog').focus();
    });
  }
  return {
    render: renderCart,
    open(snapshot: Cart) {
      renderCart(snapshot);
      cartDialog.showModal();
    },
    close: () => cartDialog.close(),
  };
}

function cartItem(product: CartItem): string {
  return `<article class="cart-item"><div class="cart-image">${photo(...product.image)}</div><div class="cart-item-info"><h3>${product.name}</h3><p>${money(product.price)}</p><div class="quantity-controls"><button type="button" data-quantity="${product.id}" data-delta="-1" aria-label="Decrease ${product.name} quantity">−</button><span aria-label="Quantity">${product.quantity}</span><button type="button" data-quantity="${product.id}" data-delta="1" aria-label="Increase ${product.name} quantity" ${product.quantity >= 99 ? 'disabled' : ''}>+</button></div></div><button type="button" class="text-button remove-item" data-remove="${product.id}" aria-label="Remove ${product.name}">${icon('close')}</button></article>`;
}
