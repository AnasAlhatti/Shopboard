const paths = {
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  user: '<circle cx="12" cy="7" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/>',
  cart: '<path d="M2 3h3l3 13h11l3-9H6"/><circle cx="9" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  leaf: '<path d="M20 3C9 2 2 9 5 16c7 4 15-2 15-13Z"/><path d="M3 22 16 8"/>',
  truck:
    '<path d="M2 5h12v13H2zM14 10h5l3 5v3h-8"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/>',
  shield: '<path d="m12 2 9 4v7c0 5-9 9-9 9S3 18 3 13V6z"/><path d="m8 12 3 3 5-6"/>',
  box: '<path d="m12 2 10 5v11l-10 5-10-5V7zM2 7l10 5 10-5M12 12v11M7 4l10 5v6"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
};

type IconName = keyof typeof paths;

export function icon(name: string): string {
  const path = isIconName(name) ? paths[name] : paths.arrow;
  return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}

export function photo(x: number, y: number, width: number, height: number, isLcp = false): string {
  return `<span class="photo" aria-hidden="true" style="--photo-width:${(1672 / width) * 100}%;--photo-height:${(941 / height) * 100}%;--photo-left:${(-x / width) * 100}%;--photo-top:${(-y / height) * 100}%"><img src="/shopboard-homepage-concept.webp" alt="" width="1672" height="941"${isLcp ? ' fetchpriority="high"' : ''} decoding="async" draggable="false"/></span>`;
}

export function money(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function isIconName(name: string): name is IconName {
  return Object.hasOwn(paths, name);
}
