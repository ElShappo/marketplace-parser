import { makeAutoObservable } from "mobx";
import { IProductExtended } from "../types";

class Products {
  products = [] as IProductExtended[];
  consturctor() {
    makeAutoObservable(this);
  }
  add(product: IProductExtended) {
    this.products.push(product);
  }

  // we can pass product (IProductExtended) or productId (string | number)
  delete(product: IProductExtended | string | number) {
    if (typeof product === "object") {
      this.products = this.products.filter(
        (pr) => pr.intrinsicId !== product.intrinsicId
      );
    } else {
      this.products = this.products.filter((pr) => pr.intrinsicId !== product);
    }
  }

  update(
    product: IProductExtended | string | number,
    newProduct: IProductExtended
  ) {
    let index;
    if (typeof product === "object") {
      index = this.products.findIndex(
        (pr) => pr.intrinsicId === product.intrinsicId
      );
    } else {
      index = this.products.findIndex((pr) => pr.intrinsicId === product);
    }
    this.products[index] = newProduct;
  }
}

export default new Products();
