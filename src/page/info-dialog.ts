import { icon } from '../shared/presentation.ts';
import { required } from './dom.ts';

const information = {
  About:
    'ShopBoard is a concept store for thoughtfully chosen goods for your home, workspace, and everyday life. This storefront is a design preview; products and prices are illustrative.',
  Contact:
    'Our customer support service is coming soon. This preview does not accept orders or support requests.',
  Shipping:
    'Shipping destinations, rates, and delivery estimates will be available when the shop launches. Orders are not available in this preview.',
  Returns:
    'Return details will be published before the shop opens. No purchases can be made in this preview.',
  FAQs: 'You can explore categories, search the collection, and try the shopping bag. Account registration, newsletter subscriptions, and checkout are not connected yet.',
  Privacy:
    'Account and newsletter forms do not send or save your details in this preview. Your shopping bag is saved only in this browser so you can return to it.',
  'Password reset':
    'Password recovery will be available when account access launches. No email has been sent.',
};

type InformationTitle = keyof typeof information;

export function createInfoDialog(infoDialog: HTMLDialogElement) {
  function bindInfoLinks(app: ParentNode): void {
    app.querySelectorAll<HTMLButtonElement>('[data-info]').forEach((button) =>
      button.addEventListener('click', () => {
        const title = button.dataset.info;
        if (!isInformationTitle(title)) return;
        infoDialog.innerHTML = `<div class="dialog-heading"><h2 id="info-title">${title}</h2><button class="icon-button" type="button" aria-label="Close">${icon('close')}</button></div><p class="info-copy">${information[title]}</p>`;
        required<HTMLButtonElement>(infoDialog, 'button').addEventListener('click', () =>
          infoDialog.close(),
        );
        infoDialog.showModal();
      }),
    );
  }
  return { bind: bindInfoLinks, close: () => infoDialog.close() };
}

function isInformationTitle(value: string | undefined): value is InformationTitle {
  return value !== undefined && Object.hasOwn(information, value);
}
