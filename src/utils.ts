import { availableMarketplaces, availableProperties } from "./constants";
import { IMarketplace, IProduct, Property } from "./types";

export class Marketplace {
    #marketplace: IMarketplace

    // if no properties are passed, then we assume that all properties should be added
    constructor(name: typeof availableMarketplaces[number], properties?: Set<Property>) {
        this.#marketplace = {
            name,
            properties: properties ? properties : new Set(availableProperties)
        }
    }
    get() {
        return this.#marketplace;
    }
}

export class Product {
    product: IProduct

    // if no marketplaces are passed, then we assume that all marketplaces should be added
    constructor(id: string | number, name: string, marketplaces?: Marketplace[]) {
        this.product = {
            id,
            name,
            marketplaces: marketplaces ? marketplaces.map(mp => {
                return {
                    name: mp.get().name,
                    properties: mp.get().properties
                }
            }) : availableMarketplaces.map(mp => {
                return {
                    name: mp,
                    properties: new Set(availableProperties)
                }
            })
        };
    }
}