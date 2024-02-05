import { availableMarketplaces } from "./constants";
import { IMarketplace, IProduct, IProductExtended } from "./types";
import { v4 as uuidv4 } from "uuid";

export class Marketplace {
  _marketplace: IMarketplace;

  constructor(
    name: (typeof availableMarketplaces)[number],
    link: string | undefined
  ) {
    this._marketplace = {
      name,
      link,
    };
  }
  get() {
    return this._marketplace;
  }
}

export class ProductExtended {
  _product: IProductExtended;

  // if no marketplaces are passed, then we assume that all marketplaces should be added
  constructor({
    id = "",
    name = "",
    isEdited = false,
    marketplaces,
  }: {
    id?: string;
    name?: string;
    isEdited?: boolean;
    marketplaces?: Marketplace[];
  }) {
    this._product = {
      intrinsicId: uuidv4(),
      id,
      name,
      isEdited,
      marketplaces: marketplaces
        ? marketplaces.map((mp) => {
            return {
              name: mp.get().name,
              link: mp.get().link,
            };
          })
        : availableMarketplaces.map((mp) => {
            return {
              name: mp,
              link: "",
            };
          }),
    };
  }
  get() {
    return this._product;
  }
}

export function addIsEditedProperty(
  products: IProduct[],
  isEdited: boolean = false
): IProductExtended[] {
  const shallowCopy = [...products];
  return shallowCopy.map((product) => {
    return { ...product, isEdited };
  });
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

    console.log(url.href);

    let [name, link, price]: [
      name: string | null,
      link: string | null,
      price: string | null
    ] = [null, null, null];

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
      name = nameElement.textContent;

      const linkElement = resultsContainer.querySelector(
        this._productLinkSelector
      );
      if (!linkElement) {
        throw new Error("could not find the product link");
      }
      link = "https://www.ozon.ru" + linkElement.textContent;

      const priceElement = resultsContainer.querySelector(
        this._productPriceSelector
      );
      if (!priceElement) {
        throw new Error("could not find the product price");
      }
      price = priceElement.textContent;
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
