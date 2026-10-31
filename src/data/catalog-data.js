export const products = Object.freeze(
  [
    { id: 'mug', name: 'Stoneware Mug', price: 18, category: 'home', image: [126, 549, 221, 121] },
    {
      id: 'planter',
      name: 'Ceramic Planter',
      price: 24,
      category: 'home',
      image: [368, 549, 220, 121],
    },
    {
      id: 'blanket',
      name: 'Linen Throw Blanket',
      price: 56,
      category: 'lifestyle',
      image: [607, 549, 219, 121],
    },
    {
      id: 'bottle',
      name: 'Everyday Water Bottle',
      price: 32,
      category: 'lifestyle',
      image: [847, 549, 218, 121],
    },
    {
      id: 'journal',
      name: 'Notebook Journal',
      price: 20,
      category: 'workspace',
      image: [1086, 549, 217, 121],
    },
    {
      id: 'tray',
      name: 'Oak Catchall Tray',
      price: 34,
      category: 'gifts',
      image: [1326, 549, 219, 121],
    },
  ].map(Object.freeze),
);

export const categories = Object.freeze(
  [
    { id: 'home', name: 'Home', image: [128, 390, 337, 98] },
    { id: 'lifestyle', name: 'Lifestyle', image: [489, 390, 336, 98] },
    { id: 'workspace', name: 'Workspace', image: [849, 390, 336, 98] },
    { id: 'gifts', name: 'Gifts', image: [1208, 390, 336, 98] },
  ].map(Object.freeze),
);
