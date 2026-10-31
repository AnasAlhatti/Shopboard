import { icon, money, photo } from '../shared/presentation.js';

export function createCartDialog(dialog, cart, onChange) {
  function open() {
    render();
    dialog.showModal();
  }

  function render() {
    const { items, count, subtotal } = cart.getSnapshot();
    dialog.innerHTML = `<div class="dialog-heading"><div><p class="eyebrow">YOUR GOOD FINDS</p><h2 id="cart-title">Your shopping bag <span>(${count})</span></h2></div><button class="icon-button close-dialog" type="button" aria-label="Close shopping bag">${icon('close')}</button></div>
      ${items.length ? `<div class="cart-items">${items.map(cartItem).join('')}</div><div class="cart-total"><span>Subtotal</span><strong>${money(subtotal)}</strong></div><button type="button" class="text-button clear-cart">Clear shopping bag</button><p class="cart-note">This is a preview shop. Checkout and payment are not available yet.</p>` : `<div class="empty-bag">${icon('cart')}<h3>A little room for good things.</h3><p>Your bag is empty. Find something worth keeping.</p></div>`}
      <button type="button" class="button button-green continue-shopping">Continue exploring ${icon('arrow')}</button>`;
    bindEvents();
  }

  function bindEvents() {
    dialog.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
    dialog.querySelector('.continue-shopping').addEventListener('click', () => dialog.close());
    dialog.querySelectorAll('[data-quantity]').forEach((button) =>
      button.addEventListener('click', () => {
        const id = button.dataset.quantity;
        cart.change(id, Number(button.dataset.delta));
        onChange();
        render();
        (
          dialog.querySelector(`[data-quantity="${id}"][data-delta="${button.dataset.delta}"]`) ||
          dialog.querySelector('.close-dialog')
        ).focus();
      }),
    );
    dialog.querySelectorAll('[data-remove]').forEach((button) =>
      button.addEventListener('click', () => {
        cart.remove(button.dataset.remove);
        onChange();
        render();
        dialog.querySelector('.close-dialog').focus();
      }),
    );
    dialog.querySelector('.clear-cart')?.addEventListener('click', () => {
      cart.clear();
      onChange();
      render();
      dialog.querySelector('.close-dialog').focus();
    });
  }

  return Object.freeze({ open });
}

function cartItem(product) {
  return `<article class="cart-item"><div class="cart-image">${photo(...product.image)}</div><div class="cart-item-info"><h3>${product.name}</h3><p>${money(product.price)}</p><div class="quantity-controls"><button type="button" data-quantity="${product.id}" data-delta="-1" aria-label="Decrease ${product.name} quantity">−</button><span aria-label="Quantity">${product.quantity}</span><button type="button" data-quantity="${product.id}" data-delta="1" aria-label="Increase ${product.name} quantity" ${product.quantity >= 99 ? 'disabled' : ''}>+</button></div></div><button type="button" class="text-button remove-item" data-remove="${product.id}" aria-label="Remove ${product.name}">${icon('close')}</button></article>`;
}
