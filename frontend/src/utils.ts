import { availableMarketplaces } from "./constants";
import { IMarketplace, IProduct, IProductExtended } from "./types";
import { v4 as uuidv4 } from 'uuid';

export class Marketplace {
    #marketplace: IMarketplace

    constructor(name: typeof availableMarketplaces[number], link: string | undefined) {
        this.#marketplace = {
            name,
            link
        }
    }
    get() {
        return this.#marketplace;
    }
}

export class ProductExtended {
    #product: IProductExtended

    // if no marketplaces are passed, then we assume that all marketplaces should be added
    constructor({id = "", name = "", isEdited = false, marketplaces}: {id?: string, name?: string, isEdited?: boolean, marketplaces?: Marketplace[]}) {
        this.#product = {
            intrinsicId: uuidv4(),
            id,
            name,
            isEdited,
            marketplaces: marketplaces ? marketplaces.map(mp => {
                return {
                    name: mp.get().name,
                    link: mp.get().link
                }
            }) : availableMarketplaces.map(mp => {
                return {
                    name: mp,
                    link: ""
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



