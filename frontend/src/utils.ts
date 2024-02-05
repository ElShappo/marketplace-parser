import { availableMarketplaces } from "./constants";
import {
  IProductInMarketplace,
  IProduct,
  IProductRecord,
  MarketplaceName,
} from "./types";
import { v4 as uuidv4 } from "uuid";

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
  // _productDescriptionSelector: string;

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

export class OzonParser extends MarketplaceParser {
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

    try {
      const res = await fetch(url.href);
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
