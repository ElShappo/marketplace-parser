import { availableMarketplaces, availableProperties } from "./constants";
import { IMarketplace, IProduct, IProductExtended, Property } from "./types";
import { v4 as uuidv4 } from 'uuid';

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

export class ProductExtended {
    #product: IProductExtended

    // if no marketplaces are passed, then we assume that all marketplaces should be added
    constructor({id = "", name = "", isEdited = false, marketplaces}: {id?: string | number, name?: string, isEdited?: boolean, marketplaces?: Marketplace[]}) {
        this.#product = {
            intrinsicId: uuidv4(),
            id,
            name,
            isEdited,
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
    get() {
        return this.#product;
    }
}

export function addIsEditedProperty(products: IProduct[], isEdited: boolean = false): IProductExtended[] {
    const shallowCopy = [...products];
    return shallowCopy.map(product => {
        return {...product, isEdited}
    });
}



