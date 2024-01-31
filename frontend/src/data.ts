import { IProduct } from "./types";

const columns = [
  {name: "ID", uid: "id", sortable: true},
  {name: "Product Name", uid: "name", sortable: true},
  {name: "Marketplaces", uid: "marketplaces"},
  {name: "Actions", uid: "actions"},
];

export const sampleProducts: IProduct[] = [
  {
    id: 2,
    name: 'Test',
    isEdited: false,
    marketplaces: [
      {
        name: 'ozon',
        properties: new Set(['name', 'price'])
      },
      {
        name: 'wildberries',
        properties: new Set(['link', 'icon'])
      },
      {
        name: 'yandex',
        properties: new Set(['description'])
      }
    ]
  },
  {
    id: 1,
    name: 'Sample',
    isEdited: false,
    marketplaces: [
      {
        name: 'ozon',
        properties: new Set(['name', 'price'])
      },
      {
        name: 'wildberries',
        properties: new Set(['link', 'icon'])
      },
      {
        name: 'yandex',
        properties: new Set(['description'])
      }
    ]
  },
  {
    id: 3,
    name: 'Another',
    isEdited: false,
    marketplaces: [
      {
        name: 'ozon',
        properties: new Set(['name', 'price'])
      },
      {
        name: 'wildberries',
        properties: new Set(['link', 'icon'])
      },
      {
        name: 'yandex',
        properties: new Set(['description'])
      }
    ]
  },
]

export {columns};
