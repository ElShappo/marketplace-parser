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

export function deleteAndCreateNew(arr: IProductExtended[], productToDelete: IProductExtended): IProductExtended[] {
    console.log('ondelete and create new fired');
    return arr.filter(product => product.intrinsicId !== productToDelete.intrinsicId);
}

export function addAndCreateNew(arr: IProductExtended[], newProduct: IProductExtended): IProductExtended[] {
    console.log('onadd and create new fired');
    const arrShallowCopy = [...arr];
    const productClone = structuredClone(newProduct);
    arrShallowCopy.push(productClone);

    return arrShallowCopy;
}

export function updateAndCreateNew(arr: IProductExtended[], replacingProduct: IProductExtended): IProductExtended[] {
    console.log('onupdate and create new fired');
    const arrShallowCopy = [...arr];
    const productClone = structuredClone(replacingProduct);

    const index = arr.findIndex(product => String(product.intrinsicId) === String(replacingProduct.intrinsicId));
    arrShallowCopy[index] = productClone;

    return arrShallowCopy;
}

export function toggleIsEdited(arr: IProductExtended[], intrinsicId: string | number) {
    const replacingProduct = structuredClone(arr.find(pr => String(pr.intrinsicId) === String(intrinsicId))!);
    replacingProduct!.isEdited = !replacingProduct!.isEdited;
    return updateAndCreateNew(arr, replacingProduct);
}

export function changeIsEdited(arr: IProductExtended[], intrinsicId: string | number, newIsEditedVal: boolean) {
    const replacingProduct = structuredClone(arr.find(pr => String(pr.intrinsicId) === String(intrinsicId))!);
    replacingProduct!.isEdited = newIsEditedVal;
    return updateAndCreateNew(arr, replacingProduct);
}

export function changeId(arr: IProductExtended[], intrinsicId: string | number, newId: string | number) {
    const replacingProduct = structuredClone(arr.find(pr => String(pr.intrinsicId) === String(intrinsicId))!);
    replacingProduct!.id = newId;
    return updateAndCreateNew(arr, replacingProduct);
}

export function changeName(arr: IProductExtended[], intrinsicId: string | number, newName: string) {
    const replacingProduct = structuredClone(arr.find(pr => String(pr.intrinsicId) === String(intrinsicId))!);
    replacingProduct!.name = newName;
    return updateAndCreateNew(arr, replacingProduct);
}

