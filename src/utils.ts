import { availableMarketplaces } from "./constants";
import {
  IProductInMarketplace,
  IProduct,
  IProductRecord,
  MarketplaceName,
} from "./types";
import { v4 as uuidv4 } from "uuid";
import * as idb from "idb";

export class Marketplace {
  _marketplace: IProductInMarketplace;

  constructor({
    marketplaceName,
    productName = "",
    productLink = "",
    productPriceHistory = [],
  }: {
    marketplaceName: MarketplaceName;
    productName?: string;
    productLink?: string;
    productPriceHistory?: string[];
  }) {
    this._marketplace = {
      marketplaceName,
      result: {
        productName,
        productLink,
        productPriceHistory,
      },
    };
  }
  get() {
    return this._marketplace;
  }
}

export class ProductRecord {
  _product: IProductRecord;

  constructor({
    productId = "",
    searchedName = "",
    isEdited = false,
    marketplaces,
  }: {
    productId?: string;
    searchedName?: string;
    isEdited?: boolean;
    marketplaces?: Marketplace[];
  }) {
    this._product = {
      recordId: uuidv4(),
      productId,
      searchedName,
      isEdited,
      marketplaces: marketplaces
        ? marketplaces.map((mp) => mp.get())
        : availableMarketplaces.map((mp: MarketplaceName) =>
            new Marketplace({ marketplaceName: mp }).get()
          ),
    };
  }
  get() {
    return this._product;
  }
}

export function addIsEditedProperty(
  products: IProduct[],
  isEdited: boolean = false
): IProductRecord[] {
  const shallowCopy = [...products];
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  return shallowCopy.map((product) => {
    return { ...product, isEdited };
  });
}

function fullDomain(partialPath: string) {
  console.log(partialPath);
  const improvedPartialPath = partialPath.match(/product\/.+/);
  const marketplaceDomain = "https://www.ozon.ru/";
  return marketplaceDomain + improvedPartialPath;
}

class MarketplaceParser {
  _baseUrl: string; // url of the marketplace
  _resultsContainerSelector: string; // common selector for all the subsequent selectors
  _productNameSelector: string;
  _productLinkSelector: string;
  _productPriceSelector: string;
  _proxies: string[] | undefined;
  // _productDescriptionSelector: string;

  async initialize() {
    const promise = await fetch(
      "https://proxylist.geonode.com/api/proxy-list?protocols=https&limit=500&page=1&sort_by=lastChecked&sort_type=desc"
    );
    this._proxies = ((await promise.json()).data as []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (row: any) => "https://" + row.ip + ":" + row.port
    );
    console.log(this._proxies);
  }

  constructor({
    baseUrl,
    resultsContainerSelector,
    productNameSelector,
    productLinkSelector,
    productPriceSelector,
  }: // productDescriptionSelector,
  {
    baseUrl: string;
    resultsContainerSelector: string;
    productNameSelector: string;
    productLinkSelector: string;
    productPriceSelector: string;
    // productDescriptionSelector: string
  }) {
    this._baseUrl = baseUrl;
    this._resultsContainerSelector = resultsContainerSelector;
    this._productNameSelector = productNameSelector;
    this._productLinkSelector = productLinkSelector;
    this._productPriceSelector = productPriceSelector;
    // this._productDescriptionSelector = productDescriptionSelector;
  }
}

class OzonParser extends MarketplaceParser {
  constructor() {
    const url = new URL("https://www.ozon.ru/search/");
    url.searchParams.set("from_global", "true");
    url.searchParams.set("sorting", "price");
    url.searchParams.set("deny_category_prediction", "true");

    super({
      baseUrl: url.href,
      resultsContainerSelector: ".widget-search-result-container",
      productNameSelector: "div > div > div > div > a > div > span",
      productLinkSelector: "div > div > div > a",
      productPriceSelector: "div > div > div > div > div > div > span",
    });
  }
  async parseProduct(productName: string) {
    const url = new URL(this._baseUrl);
    url.searchParams.set("text", productName);
    const parser = new DOMParser();

    let [name, link, price]: [name: string, link: string, price: string] = [
      "",
      "",
      "",
    ];

    console.log(url.href);

    // const randomProxy =
    //   this._proxies?.[Math.floor(Math.random() * this._proxies?.length)];

    try {
      const res = await fetch("/api/proxy", {
        method: "POST",
        body: JSON.stringify({
          targetUrl: url.href,
          // proxyIp: randomProxy,
        }),
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
      });
      const text = await res.text();
      const htmlDocument = parser.parseFromString(text, "text/html");
      const resultsContainer = htmlDocument.querySelector(
        this._resultsContainerSelector
      );

      if (!resultsContainer) {
        throw new Error("could not find the results page");
      }
      const nameElement = resultsContainer.querySelector(
        this._productNameSelector
      );
      if (!nameElement) {
        throw new Error("could not find the product name");
      }
      name = nameElement.textContent || "";

      const linkElement = resultsContainer.querySelector(
        this._productLinkSelector
      ) as HTMLAnchorElement;
      if (!linkElement) {
        throw new Error("could not find the product link");
      }
      link = linkElement.href ? fullDomain(linkElement.href) : "";

      const priceElement = resultsContainer.querySelector(
        this._productPriceSelector
      );
      if (!priceElement) {
        throw new Error("could not find the product price");
      }
      price = priceElement.textContent || "";
    } catch (error) {
      console.error(error);
    }
    return {
      name,
      link,
      price,
    };
  }
}

class AsyncDB {
  #db: idb.IDBPDatabase<unknown> | undefined;
  #storeName = "products";

  async initialize() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    try {
      const db = await idb.openDB("store", 1, {
        upgrade(db) {
          db.createObjectStore(self.#storeName, { keyPath: "recordId" });
        },
      });
      this.#db = db;
    } catch (error) {
      console.error("could not open indexedDB");
      console.error(error);
    }
  }

  async get(record?: string | IProductRecord) {
    console.log("calling GET in indexedDB");
    let res: IProductRecord | IProductRecord[] | undefined;
    try {
      if (this.#db) {
        if (!record) {
          res = await this.#db.getAll(this.#storeName);
        } else {
          const id = typeof record === "string" ? record : record.recordId;
          res = await this.#db.get(this.#storeName, id);
        }
      } else {
        console.error(
          "cannot execute any operations because indexedDB was not opened correctly"
        );
      }
    } catch (error) {
      console.error("could not GET from indexedDB");
      console.error(error);
    }
    return res;
  }

  async delete(record?: string | IProductRecord) {
    console.log("calling DELETE in indexedDB");
    try {
      if (this.#db) {
        if (!record) {
          await this.#db.clear(this.#storeName);
        } else {
          const id = typeof record === "string" ? record : record.recordId;
          await this.#db.delete(this.#storeName, id);
        }
      } else {
        console.error(
          "cannot execute any operations because indexedDB was not opened correctly"
        );
      }
    } catch (error) {
      console.error("could not DELETE from indexedDB");
      console.error(error);
    }
  }

  async put(products: IProductRecord | IProductRecord[]) {
    console.log("calling PUT in indexedDB");
    try {
      if (this.#db) {
        const transaction = this.#db.transaction(this.#storeName, "readwrite");
        const store = transaction.objectStore(this.#storeName);

        if (Array.isArray(products)) {
          for (const product of products) {
            await store.put(product);
          }
        } else {
          await store.put(products);
        }

        await transaction.done;
      } else {
        console.error(
          "cannot execute any operations because indexedDB was not opened correctly"
        );
      }
    } catch (error) {
      console.error("could not PUT in indexedDB");
      console.error(error);
    }
  }
}

// class DB {
//   #db: IDBDatabase | undefined;
//   #storeName: string;

//   constructor() {
//     this.#storeName = "products";
//     const openRequest = indexedDB.open("store", 1);

//     openRequest.onerror = (error) => {
//       console.error("Could not open indexedDB");
//       console.error(error);
//     };

//     openRequest.onupgradeneeded = () => {
//       const db = openRequest.result;
//       db.createObjectStore(this.#storeName, { keyPath: "recordId" });
//       this.#db = db;
//     };

//     openRequest.onsuccess = () => {
//       console.log("indexedDB connection successfully established");
//       this.#db = openRequest.result;
//     };
//   }
//   get(record?: string | IProductRecord) {
//     let res: IProductRecord | IProductRecord[] | undefined;
//     let request:
//       | IDBRequest<IProductRecord | undefined>
//       | IDBRequest<IProductRecord[]>;
//     console.log(this.#db);
//     if (this.#db) {
//       const transaction = this.#db.transaction(this.#storeName, "readonly");
//       const store = transaction.objectStore(this.#storeName);

//       if (record) {
//         if (typeof record === "string") {
//           request = store.get(record) as IDBRequest<IProductRecord | undefined>;
//         } else {
//           request = store.get(record.recordId) as IDBRequest<
//             IProductRecord | undefined
//           >;
//         }
//       } else {
//         request = store.getAll() as IDBRequest<IProductRecord[]>;
//       }
//       request.onsuccess = () => {
//         console.log("get request successfull");
//         res = request.result;
//       };
//       request.onerror = () => {
//         console.error("get request was not successfull");
//       };
//     } else {
//       console.log(
//         "cannot execute any operations because indexedDB was not opened correctly"
//       );
//     }
//     return res;
//   }
//   delete(record?: string | IProductRecord) {
//     if (this.#db) {
//       const transaction = this.#db.transaction(this.#storeName, "readwrite");
//       const store = transaction.objectStore(this.#storeName);

//       if (record) {
//         if (typeof record === "string") {
//           store.delete(record);
//         } else {
//           store.delete(record.recordId);
//         }
//       } else {
//         store.clear();
//       }
//       transaction.oncomplete = () => {
//         console.log("transaction complete");
//       };
//       transaction.onerror = () => {
//         console.error("could not complete transaction");
//       };
//     } else {
//       console.error(
//         "cannot execute any operations because indexedDB was not opened correctly"
//       );
//     }
//   }
//   put(products: IProductRecord | IProductRecord[]) {
//     if (this.#db) {
//       const transaction = this.#db.transaction(this.#storeName, "readwrite");
//       const productsStore = transaction.objectStore(this.#storeName);

//       if (Array.isArray(products)) {
//         for (const product of products) {
//           productsStore.put(product);
//         }
//       } else {
//         productsStore.put(products);
//       }

//       transaction.oncomplete = () => {
//         console.log("transaction complete");
//       };
//       transaction.onerror = () => {
//         console.error("could not complete transaction");
//       };
//     } else {
//       console.error(
//         "cannot execute any operations because indexedDB was not opened correctly"
//       );
//     }
//   }
// }

export const ozonParser = new OzonParser();
export const db = new AsyncDB();
