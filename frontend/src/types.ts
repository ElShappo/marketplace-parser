import { availableMarketplaces } from "./constants";

export type MarketplaceName = (typeof availableMarketplaces)[number];

export interface IProductInMarketplace {
  marketplaceName: MarketplaceName;
  result: {
    productName: string;
    productLink: string;
    productPriceHistory: string[];
  };
}

export interface IProductInMarketplaceExcel {
  marketplaceName: MarketplaceName;
  result: {
    productName: string;
    productLink: string;
    productPrice: string;
  };
}

export interface IProduct {
  productId: string;
  searchedName: string;
  marketplaces: IProductInMarketplace[];
}

export interface IProductExcel {
  productId: string;
  searchedName: string;
  marketplaces: IProductInMarketplaceExcel[];
}

export interface IProductRecord extends IProduct {
  recordId: string;
  isEdited: boolean;
}

export interface IProductRecordExcel extends IProductExcel {
  recordId: string;
  isEdited: boolean;
}
